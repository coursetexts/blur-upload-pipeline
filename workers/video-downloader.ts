import axios from 'axios';
import fs from 'fs';
import path from 'path';
import puppeteer, { Browser, Page } from 'puppeteer';

interface VideoDownloadResult {
  success: boolean;
  localPath?: string;
  originalUrl: string;
  fileName: string;
  fileSize?: number;
  error?: string;
}

interface ZoomExtractionResult {
  mp4Url: string;
  referer: string;
  cookieHeader: string;
}

/**
 * Downloads a video from a URL and saves it locally
 * 
 * @param videoUrl - URL of the video to download
 * @param fileName - Desired filename for the video
 * @param outputDir - Directory to save the video
 * @returns Promise with download result
 */
export async function downloadVideo(
  videoUrl: string,
  fileName: string,
  outputDir: string
): Promise<VideoDownloadResult> {
  const result: VideoDownloadResult = {
    success: false,
    originalUrl: videoUrl,
    fileName: fileName
  };

  try {
    console.log(`Starting video download: ${videoUrl}`);
    
    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Clean filename
    const cleanFileName = sanitizeFileName(fileName);
    const outputPath = path.join(outputDir, cleanFileName);

    // Handle different video sources
    let streamUrl = videoUrl;
    let referer = '';
    let cookieHeader = '';

    if (videoUrl.includes("zoom.us")) {
      console.log("Detected Zoom URL, extracting stream URL...");
      try {
        const extractedData = await extractZoomMp4Url(videoUrl);
        streamUrl = extractedData.mp4Url;
        referer = extractedData.referer;
        cookieHeader = extractedData.cookieHeader;
        
        console.log(`Extracted Zoom mp4 URL: ${streamUrl}`);
        
        if (!streamUrl) {
          throw new Error("Failed to extract MP4 URL from Zoom recording");
        }
      } catch (zoomError) {
        console.error("Error extracting Zoom MP4 URL:", zoomError);
        result.error = `Could not extract video from Zoom: ${zoomError.message}`;
        return result;
      }
    }

    // Download the video
    const response = await axios({
      method: "get",
      url: streamUrl,
      responseType: "stream",
      timeout: 60000, // 60 seconds timeout
      validateStatus: (status) => true, // Accept all status codes for debugging
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Referer": referer || videoUrl,
        "Cookie": cookieHeader,
      },
    });

    // Log more details about the response
    console.log(`Video response status: ${response.status}`);
    if (response.status !== 200) {
      console.error(
        `Video download error response: ${JSON.stringify({
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
        })}`
      );
      result.error = `Failed to download video: ${response.status} ${response.statusText}`;
      return result;
    }

    // Get file size from headers
    const contentLength = response.headers['content-length'];
    const fileSize = contentLength ? parseInt(contentLength, 10) : undefined;
    
    console.log(`Downloading video to: ${outputPath}`);
    if (fileSize) {
      console.log(`Expected file size: ${Math.round(fileSize / (1024 * 1024))} MB`);
    }

    // Create write stream and pipe the response
    const writer = fs.createWriteStream(outputPath);
    response.data.pipe(writer);

    // Track download progress
    let downloadedBytes = 0;
    response.data.on('data', (chunk: any) => {
      downloadedBytes += chunk.length;
      if (fileSize) {
        const progress = Math.round((downloadedBytes / fileSize) * 100);
        if (progress % 10 === 0) { // Log every 10%
          console.log(`Download progress: ${progress}%`);
        }
      }
    });

    // Wait for download to complete
    await new Promise<void>((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
      response.data.on('error', reject);
    });

    // Verify the file was created and has content
    const stats = fs.statSync(outputPath);
    if (stats.size === 0) {
      fs.unlinkSync(outputPath); // Remove empty file
      result.error = "Downloaded file is empty";
      return result;
    }

    result.success = true;
    result.localPath = outputPath;
    result.fileSize = stats.size;

    console.log(`Successfully downloaded video: ${outputPath} (${Math.round(stats.size / (1024 * 1024))} MB)`);

  } catch (error) {
    console.error(`Error downloading video from ${videoUrl}:`, error);
    result.error = error.message;
  }

  return result;
}

/**
 * Extracts the actual MP4 URL from a Zoom recording page
 * Uses the same robust implementation as youtube.ts
 */
async function extractZoomMp4Url(zoomUrl: string): Promise<ZoomExtractionResult> {
  console.log(`[⏳] Extracting MP4 URL from Zoom recording: ${zoomUrl}`);
  console.log(`[📊] Memory at start:`, process.memoryUsage());

  // Launch Puppeteer in headful mode with higher timeout
  const browser = await puppeteer.launch({
    headless: true, // Set to true for production
    timeout: 0, // Disable navigation timeout
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu',
      '--start-maximized'
    ]
  });

  console.log(`[📊] Memory after browser launch:`, process.memoryUsage());
  
  const page = await browser.newPage();

  // Simulate a real user agent
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
  );

  // Set up network monitoring early
  let mp4Url = "";
  page.on("response", async (response) => {
    const url = response.url();
    if (url.includes(".mp4")) {
      mp4Url = url;
      console.log("[✔️] MP4 URL detected:", mp4Url);
    }
  });

  try {
    console.log("[⏳] Navigating to:", zoomUrl);
    await page.goto(zoomUrl, { waitUntil: "load", timeout: 0 }); // Disable timeout
    
    console.log(`[📊] Memory after page navigation:`, process.memoryUsage());

    // Wait for the page to fully load with Zoom embed and cookie banner
    console.log("[⏳] Waiting for page to fully load (3 seconds)...");
    await new Promise((resolve) => setTimeout(resolve, 3000));
    console.log("[✓] Initial wait completed, proceeding with interactions...");

    // Handle "Accept Cookies" button (if present)
    try {
      console.log("[⏳] Checking for cookie banner...");

      // Check for different possible cookie accept button selectors
      const cookieSelectors = [
        "#accept-recommended-btn-handler", // OneTrust preference center
        "#onetrust-accept-btn-handler", // OneTrust banner
        "button[aria-label='Accept Cookies']", // Generic
        "button:contains('Accept Cookies')", // Text-based
        "button:contains('Accept All Cookies')", // Alternative text
      ];

      // Try to find any of the cookie accept buttons with a longer timeout
      await page.waitForFunction(
        (selectors) => {
          return selectors.some((selector) => document.querySelector(selector));
        },
        { timeout: 5000 },
        cookieSelectors
      );

      // Click the first found cookie accept button
      console.log("[🍪] Cookie banner detected. Accepting cookies...");
      await page.evaluate((selectors) => {
        for (const selector of selectors) {
          const button = document.querySelector(selector);
          if (button) {
            console.log("Found and clicking:", selector);
            (button as HTMLElement).click();
            return true;
          }
        }
        return false;
      }, cookieSelectors);

      // Wait a moment for the banner to disappear and page to settle
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("[✓] Cookies accepted.");
    } catch (cookieError) {
      console.warn(
        "[⚠️] No cookie banner detected or failed to click:",
        cookieError.message
      );
    }

    // Wait for and click on the video play button
    try {
      console.log("[⏳] Looking for video player elements...");

      // Add multiple possible play button selectors based on the screenshot
      const playButtonSelectors = [
        ".vjs-big-play-button",
        ".playbar__playButton",
        'button[aria-label="play"]',
        '[role="button"][aria-label="play"]',
        ".play-button",
        "button.play-control",
        'button[title="Play"]',
        'div[role="button"][title="Play"]',
        "button > span.play-icon",
        'svg[aria-label="play"]',
      ];

      // Try to wait for any play button to become visible
      console.log("[⏳] Waiting for play button to appear...");
      await page.waitForFunction(
        (selectors) => {
          return selectors.some((selector) => {
            const el = document.querySelector(selector);
            return el && (selector === "video" || (el as HTMLElement).offsetParent !== null); // Check if visible
          });
        },
        { timeout: 10000 },
        playButtonSelectors
      );

      // Click the first visible play button
      console.log("[▶️] Play button found. Clicking to start video...");
      const clicked = await page.evaluate((selectors) => {
        for (const selector of selectors) {
          const element = document.querySelector(selector);
          if (element) {
            if (selector === "video") {
              (element as HTMLVideoElement).play();
              console.log("Direct video play method used");
            } else if ((element as HTMLElement).offsetParent !== null) {
              (element as HTMLElement).click();
              console.log("Clicked play button:", selector);
            } else {
              continue; // Element not visible, try next
            }
            return true;
          }
        }
        return false;
      }, playButtonSelectors);

      if (!clicked) {
        console.log("[⚠️] Could not click any play button automatically");
      } else {
        console.log("[✓] Video playback initiated.");
      }
    } catch (playError) {
      console.warn(
        "[⚠️] Could not find or click play button:",
        playError.message
      );
    }

    // Capture cookies
    const cookies = await page.cookies();
    const cookieHeader = cookies.map((c) => `${c.name}=${c.value}`).join("; ");

    // Wait longer to ensure all requests are captured
    if (!mp4Url) {
      console.log("[⏳] Waiting to capture MP4 URL (5 seconds)...");
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }

    const referer = page.url();
    console.log("[✔️] Referer:", referer);
    console.log("[✔️] Cookie length:", cookieHeader.length);

    // Close the browser after extraction
    await browser.close();
    
    console.log(`[📊] Memory after browser close:`, process.memoryUsage());

    if (!mp4Url) {
      console.error("[❌] Failed to extract MP4 URL from Zoom recording");
      throw new Error("Failed to extract MP4 URL from Zoom recording");
    }

    console.log(`[✅] Successfully extracted MP4 URL: ${mp4Url}`);
    return {
      mp4Url,
      referer,
      cookieHeader
    };
  } catch (err) {
    console.error("[❌] Error during extraction:", err.message);
    await browser.close();
    console.log(`[📊] Memory after browser close (error case):`, process.memoryUsage());
    throw err;
  }
}

/**
 * Sanitizes filename for filesystem compatibility
 */
function sanitizeFileName(fileName: string): string {
  // Remove or replace invalid characters
  let sanitized = fileName
    .replace(/[<>:"/\\|?*]/g, '_')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_')
    .trim();
  
  // Ensure it has .mp4 extension
  if (!sanitized.toLowerCase().endsWith('.mp4')) {
    sanitized += '.mp4';
  }
  
  // Truncate if too long
  if (sanitized.length > 200) {
    const extension = path.extname(sanitized);
    const nameWithoutExt = sanitized.substring(0, sanitized.length - extension.length);
    sanitized = nameWithoutExt.substring(0, 200 - extension.length) + extension;
  }
  
  return sanitized;
}

/**
 * Clean up downloaded video files older than specified age
 */
export function cleanupOldVideos(baseDir: string, maxAge: number = 2 * 24 * 60 * 60 * 1000): void {
  try {
    if (!fs.existsSync(baseDir)) {
      return;
    }

    const items = fs.readdirSync(baseDir);
    const now = Date.now();

    items.forEach(item => {
      const itemPath = path.join(baseDir, item);
      const stats = fs.statSync(itemPath);
      
      if (stats.isFile() && (now - stats.mtime.getTime()) > maxAge) {
        console.log(`Cleaning up old video: ${item}`);
        fs.unlinkSync(itemPath);
      }
    });
  } catch (error) {
    console.warn('Error cleaning up old videos:', error);
  }
} 