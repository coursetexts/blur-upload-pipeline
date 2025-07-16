import { OAuth2Client } from "google-auth-library";
import { youtube_v3 } from "@googleapis/youtube";
import axios from "axios";
import { Readable } from "stream";
import * as dotenv from "dotenv";
import { encrypt } from "./encryption";
import prisma from "./lib/prisma";
import puppeteer from "puppeteer";
import { execSync } from "child_process";

dotenv.config();

const baseUrl = process.env.NEXTAUTH_URL;

interface Video_Link {
  streamUrl: string;
  fileName: string;
}

interface Session {
  user: {
    name?: string;
    email?: string;
    image?: string;
  };
  accessToken?: string;
  expires?: string;
  refreshToken?: string;
}

/**
 * Searches for a single video on our YouTube channel
 *
 * @param {Session} session - The session credentials to authenticate the search.
 * @param {string} videoTitle - Title of the video
 * @returns - A promise that resolves to a list of search results, indicating whether a matching video was found for each title.
 */
export async function searchYouTubeVideos(
  session: Session,
  videoTitle: string
) {
  // Ensure you have the necessary OAuth credentials
  const oauth2Client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${baseUrl}/api/auth/callback/google`
  );

  // Set the credentials from the session
  oauth2Client.setCredentials({
    access_token: session.accessToken,
    refresh_token: session.refreshToken,
  });

  // Refresh the access token
  const { credentials } = await oauth2Client.refreshAccessToken();
  oauth2Client.setCredentials(credentials);
  // console.log("New credentials", credentials);

  const last = await prisma.tokens.findFirst({
    where: { expiresAt: { gt: new Date() } }, // Get non-expired token
  });

  if (!last) {
    throw new Error("No valid token found");
  }

  const encryptedAccessToken = await encrypt(credentials.access_token!);

  await prisma.tokens.update({
    where: { id: last.id }, // Make sure the user ID is available in the session
    data: {
      accessToken: encryptedAccessToken, // Update the access token in your DB
    },
  });

  // Create YouTube service
  const youtube = new youtube_v3.Youtube({ auth: oauth2Client });

  try {
    // Search for videos with the provided title
    const searchResponse = await youtube.search.list({
      part: ["snippet"],
      forMine: true, // Restrict results to your uploads
      q: videoTitle, // Search query
      maxResults: 1, // Limit the number of results
      type: ["video"], // required if forMine is set to true
    });

    const matchingVideos = searchResponse.data.items || [];
    console.log("Matching results...", matchingVideos);

    if (matchingVideos.length === 0) {
      return { exists: false, videos: [] };
    }

    const videos = matchingVideos
      .map((video) => {
        if (video.id?.videoId && video.snippet?.title) {
          return {
            id: video.id.videoId,
            title: video.snippet.title,
            description: video.snippet.description || null,
            url: `https://www.youtube.com/watch?v=${video.id.videoId}`,
          };
        }
        // Return a fallback in case required fields are missing
        return null;
      })
      .filter((video) => video !== null);

    return {
      exists: true,
      videos,
    };
  } catch (error) {
    console.error("Error checking video existence:", error);
    throw error;
  }
}

/**
 * Attempts to upload a video to YouTube with retry logic in case of failure.
 *
 * @param {Video_Link} videoDetails - The video name and url to upload.
 * @param {Session} session - The session containing authentication details for YouTube API.
 * @param {string} instructor - The course instructors name. For copyrighting.
 * @param {string} courseId - The course ID the video belongs to.
 * @param {number} [retries=3] - The number of retries if the upload fails (default is 3).
 * @returns {Promise<{ success: boolean; id: string; title: string; description: string; url: string }>} - A promise that resolves to the upload result with video details.
 */
export async function uploadWithRetry(
  videoDetails: Video_Link,
  session: Session,
  instructor: string,
  courseId: string,
  retries: number = 3
): Promise<{
  success: boolean;
  id: string;
  title: string;
  description: string;
  url: string;
}> {
  let attempt = 0;

  while (attempt < retries) {
    try {
      return await streamDownloadAndUploadToYoutube(
        session,
        videoDetails.streamUrl,
        videoDetails.fileName,
        `Class released with Professor ${instructor}'s full permission to share and distribute their materials for ${courseId}. This video is part of our ongoing effort to provide high-quality educational content to students, educators, and lifelong learners. You can access the rest of the class's materials at https://coursetexts.org/c/${courseId}. \n\n For more resources and lectures, visit our website: coursetexts.org.`
      );
    } catch (error) {
      console.error(
        `Attempt ${attempt + 1} failed for video: ${videoDetails.fileName}`
      );
      if (attempt + 1 >= retries) {
        // Instead of throwing, we return a failure object
        return {
          success: false,
          id: "",
          title: "",
          description: "",
          url: "",
        };
      }
      attempt++;
      await new Promise((resolve) => setTimeout(resolve, 30000 * attempt)); // Exponential backoff
    }
  }

  // This line is theoretically unreachable, but TypeScript needs it to know we won't return undefined
  throw new Error("This should never be reached");
}

/**
 * Downloads the video from the Panopto/Zoom URL and uploads it to YouTube using the provided session details.
 *
 * @param {Session} session - The session credentials to authenticate the YouTube upload.
 * @param {string} videoUrl - The URL of the video file to be uploaded (Panopto or Zoom).
 * @param {string} videoTitle - The title to give the video on YouTube.
 * @param {string} videoDescription - The description to give the video on YouTube.
 * @returns {Promise<{ success: boolean; id: string; title: string; description: string; url: string }>} - A promise that resolves to the upload result with video details.
 */
async function streamDownloadAndUploadToYoutube(
  session: Session,
  videoUrl: string,
  videoTitle: string,
  videoDescription: string
): Promise<{
  success: boolean;
  id: string;
  title: string;
  description: string;
  url: string;
}> {
  if (!videoUrl || !videoTitle || !videoDescription) {
    throw new Error(
      "Missing required fields: videoUrl, videoTitle, videoDescription"
    );
  }

  // Ensure you have the necessary OAuth credentials
  const oauth2Client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${baseUrl}/api/auth/callback/google`
  );

  // Set the credentials from the session
  oauth2Client.setCredentials({
    access_token: session.accessToken,
    refresh_token: session.refreshToken,
  });

  // Refresh the access token
  const { credentials } = await oauth2Client.refreshAccessToken();
  oauth2Client.setCredentials(credentials);

  const last = await prisma.tokens.findFirst({
    where: { expiresAt: { gt: new Date() } }, // Get non-expired token
  });

  const encryptedAccessToken = await encrypt(credentials.access_token!);

  if (last) {
    await prisma.tokens.update({
      where: { id: last.id },
      data: {
        accessToken: encryptedAccessToken,
      },
    });
  } else {
    throw new Error("Token not found for refresh");
  }

  console.log("Initialized YouTube client with access token");

  const youtube = new youtube_v3.Youtube({ auth: oauth2Client });

  try {
    console.log(`Downloading file from: ${videoUrl}`);

    // Handle Zoom links differently - need to extract the actual download URL
    let streamUrl = videoUrl;
    let referer = '';
    let cookieHeader = '';
    
    if (videoUrl.includes("zoom.us")) {
      console.log("Detected Zoom URL, extracting stream URL...");
      try {
        // For Zoom URLs, we need to use Puppeteer to extract the actual MP4 URL
        const extractedData = await extractZoomMp4Url(videoUrl);
        streamUrl = extractedData.mp4Url;
        referer = extractedData.referer;
        cookieHeader = extractedData.cookieHeader;
        
        console.log(`Extracted Zoom mp4 URL: ${streamUrl}`);
        console.log(`Using referer: ${referer}`);
        console.log(`Cookie header length: ${cookieHeader.length}`);

        if (!streamUrl) {
          throw new Error("Failed to extract MP4 URL from Zoom recording");
        }
      } catch (zoomError) {
        console.error("Error extracting Zoom MP4 URL:", zoomError);
        throw new Error(
          `Could not extract video from Zoom: ${zoomError.message}`
        );
      }
    }

    // Stream file from URL
    const videoResponse = await axios({
      method: "get",
      url: streamUrl,
      responseType: "stream", // Stream the response
      validateStatus: (status) => true,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Referer": referer || videoUrl,
        "Cookie": cookieHeader,
      },
    });

    // Log more details about the response
    console.log(`Video response status: ${videoResponse.status}`);
    if (videoResponse.status !== 200) {
      console.error(
        `Video download error response: ${JSON.stringify({
          status: videoResponse.status,
          statusText: videoResponse.statusText,
          headers: videoResponse.headers,
        })}`
      );
      throw new Error(
        `Failed to download video: ${videoResponse.status} ${videoResponse.statusText}`
      );
    }

    const videoStream = videoResponse.data as Readable;

    // After successful download (status 200), let's add more debugging for the upload
    console.log("Starting YouTube upload process...");
    console.log(
      "Using session with access token length:",
      session.accessToken.length
    );
    console.log("Session expires:", session.expires);

    // Log YouTube API initialization
    console.log("Initializing YouTube API client for upload...");

    // Before attempting the actual upload, validate the token with a simple API call
    try {
      // Log scopes from token info
      console.log("Checking token info...");
      const tokenInfo = await oauth2Client.getTokenInfo(session.accessToken);
      console.log("Token scopes:", tokenInfo.scopes);

      // Check if the upload scope is in the token scopes
      const hasUploadScope = tokenInfo.scopes?.includes(
        "https://www.googleapis.com/auth/youtube.upload"
      );
      console.log(
        `Token has YouTube upload scope: ${hasUploadScope ? "Yes" : "No"}`
      );

      if (!hasUploadScope) {
        console.error("Missing required YouTube upload scope!");
        throw new Error("OAuth token does not have YouTube upload permissions");
      }

      // Try a simple API call to check authorization
      console.log("Testing YouTube API authorization...");
      const channelResponse = await youtube.channels.list({
        part: ["snippet"],
        mine: true,
      });

      console.log(
        "YouTube API authorization successful. Channel ID:",
        channelResponse.data.items && channelResponse.data.items[0]
          ? channelResponse.data.items[0].id
          : "Unknown"
      );
    } catch (authError) {
      console.error(
        "YouTube API authorization test failed:",
        authError.message
      );
      if (authError.response) {
        console.error("API error details:", {
          status: authError.response.status,
          data: authError.response.data,
        });
      }
      throw new Error(`YouTube API authorization failed: ${authError.message}`);
    }

    // Continue with the actual upload process...
    console.log("Proceeding with video upload...");

    // Upload the video to YouTube
    const youtubeResponse = await youtube.videos.insert({
      part: ["snippet,status"],
      requestBody: {
        snippet: {
          title: videoTitle,
          description: videoDescription,
          categoryId: "22", // Example: category for "People & Blogs"
        },
        status: {
          privacyStatus: "unlisted", // Options: public, private, unlisted
        },
      },
      media: {
        body: videoStream, // Provide a readable stream for the video file
      },
    });

    console.log(
      `Video uploaded successfully: https://www.youtube.com/watch?v=${youtubeResponse.data.id}`
    );

    if (youtubeResponse.data?.id && youtubeResponse.data.snippet?.title) {
      return {
        success: true,
        id: youtubeResponse.data.id,
        title: youtubeResponse.data.snippet.title,
        description: youtubeResponse.data.snippet.description!,
        url: `https://www.youtube.com/watch?v=${youtubeResponse.data.id}`,
      };
    } else {
      // If the required fields are not present, return a failure response
      throw new Error("Incomplete response from YouTube");
    }
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error("Axios error details:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        headers: error.response?.headers,
        data: error.response?.data,
      });
    } else if (error instanceof Error) {
      console.error("Error during video download or upload:", error.message);
    } else {
      console.error("Download or upload failed with unknown error:", error);
    }
  }

  // This line ensures TypeScript knows that this function will always return something:
  throw new Error("This should never be reached");
}

/**
 * Extracts the MP4 stream URL from a Zoom recording page.
 *
 * @param {string} zoomUrl - The URL of the Zoom recording page.
 * @returns {Promise<{mp4Url: string, pageTitle: string, cookieHeader: string, referer: string}>} - A promise that resolves to the MP4 video URL.
 */
async function extractZoomMp4Url(zoomUrl: string): Promise<{mp4Url: string, pageTitle: string, cookieHeader: string, referer: string}> {
  console.log(`[⏳] Extracting MP4 URL from Zoom recording: ${zoomUrl}`);
  console.log(`[📊] Memory at start:`, process.memoryUsage());

  // Launch Puppeteer in headful mode with higher timeout
  const browser = await puppeteer.launch({
    headless: true, // Set to true for production
    timeout: 0, // Disable navigation timeout
    args: ["--start-maximized"], // Maximize window (better emulation)
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

    // Extract the title from the page
    let pageTitle = "";
    try {
      // Wait for the title element to be available
      await page.waitForSelector(".r-title .topic, h1.r-title span.topic", {
        timeout: 5000,
      });

      // Extract the title text
      pageTitle = await page.evaluate(() => {
        const titleElement = document.querySelector(
          ".r-title .topic, h1.r-title span.topic"
        );
        if (titleElement) {
          return (titleElement as HTMLElement).textContent.trim();
        }
        return "";
      });

      if (pageTitle) {
        console.log("[📝] Found recording title:", pageTitle);
      } else {
        console.warn("[⚠️] Could not extract recording title");
      }
    } catch (titleError) {
      console.warn("[⚠️] Error extracting title:", titleError.message);
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
    return {mp4Url, pageTitle, cookieHeader, referer};
  } catch (err) {
    console.error("[❌] Error during extraction:", err.message);
    await browser.close();
    console.log(`[📊] Memory after browser close (error case):`, process.memoryUsage());
    throw err;
  }
}
