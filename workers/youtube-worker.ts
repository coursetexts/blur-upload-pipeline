import { PrismaClient } from "@prisma/client";
import { uploadWithRetry, searchYouTubeVideos } from "./youtube";
import { decrypt } from "./encryption";
import { parentPort } from "node:worker_threads";
import v8 from 'v8';
import * as dotenv from "dotenv";
import { createOrUpdateCourseNotionPage } from "./notion-page-builder";
import { scrapeProfessorImages, cleanupOldProfessorImages } from "./professor-image-scraper";
import { downloadVideo, cleanupOldVideos } from "./video-downloader";
import { FaceProcessingClient } from "./face-processing-client";
import fs from 'fs';
import path from 'path';

dotenv.config();

const prisma = new PrismaClient();

// Validate and parse interval from environment variable
function parseInterval(envVar: string | undefined, defaultHours: number): number {
  const DEFAULT_MS = defaultHours * 60 * 60 * 1000; // Convert hours to milliseconds
  
  if (!envVar) {
    return DEFAULT_MS;
  }

  // Try parsing the value
  const parsed = parseInt(envVar, 10);
  
  // Check if parsing failed or value is invalid
  if (
    isNaN(parsed) || // Not a number
    !isFinite(parsed) || // Infinity or -Infinity
    parsed <= 0 || // Negative or zero
    !Number.isInteger(parsed) // Not an integer
  ) {
    console.warn(`Invalid ${envVar} value: "${envVar}". Using default of ${defaultHours} hours.`);
    return DEFAULT_MS;
  }

  // Sanity check: Don't allow intervals shorter than 1 minute or longer than 24 hours
  const ONE_MINUTE = 60 * 1000;
  const MAX_INTERVAL = 24 * 60 * 60 * 1000;
  
  if (parsed < ONE_MINUTE) {
    console.warn(`${envVar} is too short (${parsed}ms). Setting to minimum of 1 minute.`);
    return ONE_MINUTE;
  }
  
  if (parsed > MAX_INTERVAL) {
    console.warn(`${envVar} is too long (${parsed}ms). Setting to maximum of 24 hours.`);
    return MAX_INTERVAL;
  }

  return parsed;
}

// Environment variables with validation
const JOB_PROCESSING_INTERVAL = parseInterval(process.env.JOB_PROCESSING_INTERVAL, 12);
const TOKEN_CLEANUP_INTERVAL = parseInterval(process.env.TOKEN_CLEANUP_INTERVAL, 12);

if (!parentPort) {
  throw new Error("Worker must run as part of a parent thread.");
}

// Add a function to log memory stats
function logMemoryUsage(stage: string) {
  const heapStats = v8.getHeapStatistics();
  console.log(`Memory Usage [${stage}]:`, {
    heapTotal: `${Math.round(heapStats.total_heap_size / 1024 / 1024)} MB`,
    heapUsed: `${Math.round(heapStats.used_heap_size / 1024 / 1024)} MB`,
    heapLimit: `${Math.round(heapStats.heap_size_limit / 1024 / 1024)} MB`,
    percentageUsed: `${Math.round((heapStats.used_heap_size / heapStats.heap_size_limit) * 100)}%`
  });
}

// Schedule the worker
// Listen for the parent thread to tell the worker to start
parentPort.on("message", async (message) => {
  logMemoryUsage('WORKER_MESSAGE_RECEIVED');
  if (message === "start") {
    console.log("Worker started processing jobs.");
    console.log(`Job processing interval: ${JOB_PROCESSING_INTERVAL}ms (${JOB_PROCESSING_INTERVAL / 1000 / 60 / 60} hours)`);
    console.log(`Token cleanup interval: ${TOKEN_CLEANUP_INTERVAL}ms (${TOKEN_CLEANUP_INTERVAL / 1000 / 60 / 60} hours)`);
    
    setInterval(processJobs, JOB_PROCESSING_INTERVAL);
    setInterval(cleanUpExpiredTokens, TOKEN_CLEANUP_INTERVAL);
  }
});

/**
 * Fetches a valid session from the database and decrypts its tokens.
 *
 * @returns {Promise<Object>} An object containing the decrypted access token, refresh token, user info, and expiration date.
 * @throws {Error} If no valid session is found in the database.
 */
async function getValidSession() {
  console.log("Fetching valid session...");
  const session = await prisma.tokens.findFirst({
    where: { expiresAt: { gt: new Date() } }, // Get non-expired token
  });

  if (!session) {
    throw new Error("No valid session found");
  }

  const decryptedAccessToken = await decrypt(session.accessToken);
  const decryptedRefreshToken = await decrypt(session.refreshToken);

  console.log("Session fetched and decrypted.", { decryptedAccessToken, decryptedRefreshToken });
  console.log("Session before return", session);
  
  const newSession = {
    accessToken: decryptedAccessToken,
    refreshToken: decryptedRefreshToken,
    user: {
      name: session.userName || "",
      image: session.userImage || "",
    },
    expires: session.expiresAt.toISOString(),
  }
  
  console.log("Session fetched and decrypted.", newSession);

  return newSession;
}

/**
 * Processes pending jobs from the database in batches, handling video upload or metadata updates.
 *
 * - Updates the job status as it progresses (e.g., PENDING -> IN_PROGRESS -> COMPLETED/FAILED).
 * - Handles uploading videos to YouTube or adding existing video details to the database.
 * - Ensures jobs are associated with valid courses.
 *
 * @returns {Promise<void>} No return value.
 */
async function processJobs() {
  logMemoryUsage('START_PROCESSING');
  
  // Check if we're in an upload limit pause period
  const uploadLimitSetting = await prisma.systemSetting.findUnique({
    where: { key: 'YOUTUBE_UPLOAD_LIMIT_UNTIL' }
  });
  
  if (uploadLimitSetting) {
    const pauseUntil = new Date(uploadLimitSetting.value);
    const now = new Date();
    
    if (pauseUntil > now) {
      const hoursRemaining = Math.ceil((pauseUntil.getTime() - now.getTime()) / (1000 * 60 * 60));
      console.log(`Upload limit reached. Paused for ${hoursRemaining} more hours until ${pauseUntil.toISOString()}`);
      return; // Skip processing until pause period expires
    } else {
      // Pause period has expired, remove the setting
      console.log('Upload limit pause period has expired. Resuming normal operation.');
      await prisma.systemSetting.delete({
        where: { key: 'YOUTUBE_UPLOAD_LIMIT_UNTIL' }
      });
    }
  }
  
  console.log("Polling for pending jobs...");
  // Poll for pending jobs
  const pendingJobs = await prisma.job.findMany({
    where: { status: "PENDING" },
    take: 3, // Reduced from 5 to 3 for better memory management
  });

  let session: {
    accessToken: string;
    refreshToken: string;
    user: {
      name: string;
      image: string;
    };
    expires: string;
  };
  try {
    session = await getValidSession();
    console.log(`Found ${pendingJobs.length} pending jobs.`);
  } catch (error) {
    console.error("Failed to get valid session:", error);
    console.log("No valid session found. Worker will try again on next interval.");
    return; // Exit the function early instead of crashing
  }

  for (const job of pendingJobs) {
    // Log before each job
    logMemoryUsage(`PRE_JOB_${job.id}`);
    
    try {
      // Force GC between jobs if memory usage is high
      const heapStats = v8.getHeapStatistics();
      if (heapStats.used_heap_size > 300 * 1024 * 1024) { // 300MB threshold
        console.warn("Memory usage high, attempting garbage collection...");
        if (global.gc) {
          global.gc();
          await new Promise(resolve => setTimeout(resolve, 500)); // Allow time for GC
        }
      }

      console.log(`Starting job ${job.id}...`);

      // Update job to IN_PROGRESS
      await prisma.job.update({
        where: { id: job.id },
        data: { status: "IN_PROGRESS" },
      });

      console.log(`Processing job: ${job.id}`);

      // Verify course existence
      const courseExists = await prisma.course.findFirst({
        where: { courseCode: job.courseId },
      });

      if (!courseExists) {
        console.error(
          `Job ${job.id} failed due to invalid courseCode: ${job.courseId}`
        );

        await prisma.job.update({
          where: { id: job.id },
          data: { status: "FAILED" },
        });
        continue; // Skip to the next job
      }

      // Initialize face processing client
      const faceProcessingClient = new FaceProcessingClient(
        process.env.FACE_PROCESSOR_URL || 'http://face-processor:5000'
      );

      // Wait for face processing service to be available
      const serviceReady = await faceProcessingClient.waitForService(60000, 5000);
      if (!serviceReady) {
        throw new Error('Face processing service is not available');
      }

      // Step 1: Search if video already exists on YouTube
      const searchResponse = await searchYouTubeVideos(session, job.fileName);

      console.log(
        `Search completed for job ${job.id}. Video exists: ${searchResponse.exists}`
      );

      // Add to db if already exists
      if (searchResponse.exists) {
        console.log(
          `Video for job ${job.id} already exists. Adding to database...`
        );
        await prisma.video.create({
          data: {
            title: searchResponse.videos[0].title!,
            description: searchResponse.videos[0].description!,
            url: searchResponse.videos[0].url,
            courseId: courseExists.id,
          },
        });

        await prisma.job.update({
          where: { id: job.id },
          data: {
            status: "COMPLETED",
          },
        });
        console.log(`Job ${job.id} completed: Video URL updated.`);
        continue;
      }

      // Step 2: Create shared directories for this job
      const sharedPaths = FaceProcessingClient.generateSharedPaths(
        job.id.toString(),
        job.fileName
      );

      console.log(`Creating job directory: ${sharedPaths.jobDir}`);
      fs.mkdirSync(sharedPaths.jobDir, { recursive: true });
      fs.mkdirSync(sharedPaths.targetPersonDir, { recursive: true });

      // Step 3: Scrape professor images
      console.log(`Scraping images for professor: ${job.instructor}`);
      const professorImageResult = await scrapeProfessorImages(
        job.instructor,
        sharedPaths.targetPersonDir,
        15 // Download up to 15 images
      );

      if (!professorImageResult.success || professorImageResult.imageCount === 0) {
        throw new Error(`Failed to scrape professor images: ${professorImageResult.errors.join(', ')}`);
      }

      console.log(`Successfully scraped ${professorImageResult.imageCount} professor images`);

      // Step 4: Download video
      console.log(`Downloading video: ${job.videoUrl}`);
      const downloadResult = await downloadVideo(
        job.videoUrl,
        job.fileName,
        path.dirname(sharedPaths.videoPath)
      );

      if (!downloadResult.success) {
        throw new Error(`Video download failed: ${downloadResult.error}`);
      }

      console.log(`Video downloaded successfully: ${downloadResult.localPath} (${Math.round(downloadResult.fileSize! / (1024 * 1024))} MB)`);

      // Step 5: Process video with face blurring
      console.log(`Processing video with selective face blurring...`);
      const processingResult = await faceProcessingClient.processVideo({
        job_id: job.id.toString(),
        video_path: downloadResult.localPath!,
        target_person_images_dir: sharedPaths.targetPersonDir,
        output_path: sharedPaths.outputPath,
        options: FaceProcessingClient.createDefaultOptions(false) // Set to true for debugging
      });

      if (!processingResult.success) {
        throw new Error(`Face processing failed: ${processingResult.error}`);
      }

      console.log(`Face processing completed successfully: ${processingResult.output_path}`);

      // Step 6: Upload processed video to YouTube
      console.log(`Uploading processed video to YouTube...`);
      
      // Create a stream from the processed video file
      const processedVideoStream = fs.createReadStream(processingResult.output_path!);
      
      // Use a modified upload function that accepts a local file stream
      const result = await uploadProcessedVideo(
        processedVideoStream,
        job.fileName,
        session,
        job.instructor,
        job.courseId
      );

      if (result && result.success) {
        // Step 7: Cleanup temporary files
        console.log(`Cleaning up temporary files for job ${job.id}...`);
        try {
          if (fs.existsSync(sharedPaths.jobDir)) {
            fs.rmSync(sharedPaths.jobDir, { recursive: true, force: true });
            console.log(`Cleaned up job directory: ${sharedPaths.jobDir}`);
          }
        } catch (cleanupError) {
          console.warn(`Failed to cleanup job directory: ${cleanupError instanceof Error ? cleanupError.message : String(cleanupError)}`);
        }

        // Force GC after successful upload as it's memory intensive
        if (global.gc) {
          global.gc();
        }
        
        // Add delay to allow memory cleanup
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Update job to COMPLETED
        console.log(`Job ${job.id} upload successful. Updating job status...`);
        await prisma.job.update({
          where: { id: job.id },
          data: {
            status: "COMPLETED",
          },
        });

        await prisma.video.create({
          data: {
            title: result.title,
            description: result.description,
            url: result.url,
            courseId: courseExists.id,
          },
        });

        console.log(`Job ${job.id} completed successfully.`);
      } else {
        // Cleanup on failure
        console.log(`Cleaning up temporary files after failure for job ${job.id}...`);
        try {
          if (fs.existsSync(sharedPaths.jobDir)) {
            fs.rmSync(sharedPaths.jobDir, { recursive: true, force: true });
          }
        } catch (cleanupError) {
          console.warn(`Failed to cleanup after failure: ${cleanupError instanceof Error ? cleanupError.message : String(cleanupError)}`);
        }
      }
    } catch (error: unknown) {
      let errorMessage = '';
      
      if (error instanceof Error) {
        errorMessage = error.message;
        console.error(`Job ${job.id} failed:`, errorMessage); 
      } else {
        errorMessage = String(error);
        console.error(`Job ${job.id} failed: Unknown error`, error);
      }
      
      // Check for YouTube upload limit error
      if (errorMessage.includes('exceeded the number of videos they may upload')) {
        console.warn('YouTube upload limit reached. Pausing job processing for 24 hours.');
        
        // Set a timestamp 24 hours from now
        const pauseUntil = new Date();
        pauseUntil.setHours(pauseUntil.getHours() + 24);
        
        // Store the timestamp in the database
        await prisma.systemSetting.upsert({
          where: { key: 'YOUTUBE_UPLOAD_LIMIT_UNTIL' },
          update: { value: pauseUntil.toISOString() },
          create: { 
            key: 'YOUTUBE_UPLOAD_LIMIT_UNTIL',
            value: pauseUntil.toISOString() 
          }
        });
        
        // Update job to PENDING so it will be retried after the pause
        await prisma.job.update({
          where: { id: job.id },
          data: { status: "PENDING" },
        });
        
        console.log(`Job ${job.id} returned to PENDING state. Will retry after ${pauseUntil.toISOString()}`);
        
        // Stop processing remaining jobs
        break;
      } else {
        // Handle other errors as before
      await prisma.job.update({
        where: { id: job.id },
        data: { status: "FAILED" },
      });
      console.log(`Job ${job.id} marked as FAILED.`);
      }
    }
    
    // Log after each job
    logMemoryUsage(`POST_JOB_${job.id}`);
  }
  
  // Final GC after batch
  if (global.gc) {
    global.gc();
  }
  
  // After processing all jobs, create/update Notion pages for any courses that had jobs
  if (pendingJobs.length > 0) {
    const processedCourses = new Set(pendingJobs.map(job => job.courseId));
    
    for (const courseId of processedCourses) {
      try {
        console.log(`Creating/updating Notion page for course: ${courseId}`);
        await createOrUpdateCourseNotionPage(courseId);
        console.log(`Notion page successfully created/updated for course: ${courseId}`);
      } catch (error) {
        console.error(`Error creating/updating Notion page for course ${courseId}:`, error);
      }
    }
  }
  
  logMemoryUsage('END_PROCESSING');
}

/**
 * Cleans up expired tokens from the database.
 *
 * - Deletes all tokens with expiration times earlier than the current date.
 *
 * @returns {Promise<void>} No return value.
 */
async function cleanUpExpiredTokens() {
  console.log("Cleaning up expired tokens...");
  const result = await prisma.tokens.deleteMany({
    where: {
      expiresAt: { lt: new Date() }, // Delete tokens that have already expired
    },
  });
  console.log(`Deleted ${result.count} expired tokens.`);
}

// Function to create/update Notion page for a course (can be called externally)
async function createNotionPageForCourse(courseCode: string) {
  try {
    console.log(`Creating Notion page for course: ${courseCode}`);
    const notionPage = await createOrUpdateCourseNotionPage(courseCode);
    console.log(`Notion page created successfully for ${courseCode}:`, notionPage.url);
    return notionPage;
  } catch (error) {
    console.error(`Error creating Notion page for course ${courseCode}:`, error);
    throw error;
  }
}

// Export worker functions for testing
/**
 * Upload a processed video file to YouTube
 */
async function uploadProcessedVideo(
  videoStream: fs.ReadStream,
  fileName: string,
  session: any,
  instructor: string,
  courseId: string
): Promise<{
  success: boolean;
  id: string;
  title: string;
  description: string;
  url: string;
}> {
  const { uploadWithRetry } = await import('./youtube');
  
  // Convert the file stream back to the format expected by uploadWithRetry
  // We'll modify this to work with local files instead of remote streams
  return await uploadWithRetry(
    { streamUrl: 'local-file', fileName: fileName },
    session,
    instructor,
    courseId
  );
}

export { processJobs, cleanUpExpiredTokens, getValidSession, createNotionPageForCourse };