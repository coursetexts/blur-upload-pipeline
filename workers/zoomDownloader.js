const puppeteer = require("puppeteer");
const fs = require("fs");
const https = require("https");
const path = require("path");
const axios = require("axios");
const cheerio = require("cheerio");

const url = "https://sites.google.com/view/optdemocracy/schedule";

// Helper function to log memory usage and write to a json file
function logMemoryUsage(label) {
  const used = process.memoryUsage();
  const memoryData = {
    timestamp: new Date().toISOString(),
    label: label,
    rss: Math.round(used.rss / 1024 / 1024 * 100) / 100,
    heapTotal: Math.round(used.heapTotal / 1024 / 1024 * 100) / 100,
    heapUsed: Math.round(used.heapUsed / 1024 / 1024 * 100) / 100,
    external: Math.round(used.external / 1024 / 1024 * 100) / 100
  };
  
  // Log to console
  console.log('\n[📊] Memory Usage (' + label + '):');
  console.log(`  RSS: ${memoryData.rss} MB`);
  console.log(`  Heap Total: ${memoryData.heapTotal} MB`);
  console.log(`  Heap Used: ${memoryData.heapUsed} MB`);
  console.log(`  External: ${memoryData.external} MB`);
  
  // Append to memory log file
  const logFileName = `zoom-memory-${new Date().toISOString().split('T')[0]}.json`;
  
  try {
    // Check if file exists
    let memoryLog = [];
    if (fs.existsSync(logFileName)) {
      const fileContent = fs.readFileSync(logFileName, 'utf8');
      memoryLog = JSON.parse(fileContent);
    }
    
    // Append new data
    memoryLog.push(memoryData);
    
    // Write back to file
    fs.writeFileSync(logFileName, JSON.stringify(memoryLog, null, 2));
  } catch (error) {
    console.error(`[❌] Error writing memory stats to file: ${error.message}`);
  }
}

async function downloadZoomRecording(zoomUrl, outputFileName = null) {
  console.log("[🚀] Starting Zoom recording download process...");
  logMemoryUsage("Before recording extraction");

  // Step 1: Extract recording info using puppeteer
  const recordingInfo = await getZoomRecordingInfo(zoomUrl);

  if (!recordingInfo || !recordingInfo.mp4Url) {
    console.error("[❌] Failed to get video URL. Cannot download.");
    return false;
  }

  logMemoryUsage("After recording info extraction");

  // Step 2: Download the video using the extracted info
  const downloadSuccess = await downloadVideo(
    recordingInfo.mp4Url,
    recordingInfo.referer,
    recordingInfo.cookie,
    outputFileName
  );

  logMemoryUsage("After download completion");
  return downloadSuccess;
}

async function getZoomRecordingInfo(zoomUrl) {
  logMemoryUsage("Before browser launch");
  
  // Launch Puppeteer in headful mode with higher timeout
  const browser = await puppeteer.launch({
    headless: true, // Set to true for production
    timeout: 0, // Disable navigation timeout
    args: ["--start-maximized"], // Maximize window (better emulation)
  });

  logMemoryUsage("After browser launch");
  
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
    
    logMemoryUsage("After page navigation");

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
            button.click();
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
          return titleElement.textContent.trim();
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
            return el && (selector === "video" || el.offsetParent !== null); // Check if visible
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
              element.play();
              console.log("Direct video play method used");
            } else if (element.offsetParent !== null) {
              element.click();
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

    console.log("[✔️] Referer:", page.url());
    console.log("[✔️] Cookie length:", cookieHeader.length);

    // Close the browser after extraction
    await browser.close();
    
    logMemoryUsage("After browser close");

    // Return the extracted information
    return {
      mp4Url,
      referer: page.url(),
      cookie: cookieHeader,
      title: pageTitle,
    };
  } catch (err) {
    console.error("[❌] Error during extraction:", err.message);
    await browser.close();
    logMemoryUsage("After browser close (error case)");
    return null;
  }
}

async function downloadVideo(videoUrl, referer, cookie, outputFileName) {
  logMemoryUsage("Before video download");
  
  return new Promise((resolve, reject) => {
    // If no output filename provided, generate one based on the URL
    if (!outputFileName) {
      // Extract a filename from the URL or generate a timestamped one
      const urlParts = videoUrl.split("/");
      const fileName =
        urlParts[urlParts.length - 1].split("?")[0] ||
        `zoom_recording_${Date.now()}.mp4`;
      outputFileName = sanitizeFileName(fileName);
    }

    // Ensure the filename ends with .mp4
    if (!outputFileName.toLowerCase().endsWith(".mp4")) {
      outputFileName += ".mp4";
    }

    console.log("[⏳] Starting download of:", outputFileName);

    const options = {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Referer: referer,
        Cookie: cookie,
      },
    };

    const request = https.get(videoUrl, options, (response) => {
      // Check if we got a successful response
      if (response.statusCode === 200) {
        const contentLength = response.headers["content-length"];
        let downloadedBytes = 0;
        let lastPercentage = 0;

        // Create a write stream to save the file
        const fileStream = fs.createWriteStream(outputFileName);

        // Handle download progress
        response.on("data", (chunk) => {
          downloadedBytes += chunk.length;

          if (contentLength) {
            const percentage = Math.floor(
              (downloadedBytes / contentLength) * 100
            );

            // Only log when percentage changes by at least 10%
            if (percentage >= lastPercentage + 10) {
              console.log(`[⏳] Download progress: ${percentage}%`);
              lastPercentage = percentage;
              // Log memory during download (but not too frequently)
              logMemoryUsage(`Download progress ${percentage}%`);
            }
          }
        });

        // Pipe the response to the file
        response.pipe(fileStream);

        fileStream.on("finish", () => {
          fileStream.close();
          console.log(`[✅] Download complete: ${outputFileName}`);
          logMemoryUsage("After file download complete");
          resolve(true);
        });

        fileStream.on("error", (err) => {
          fs.unlink(outputFileName, () => {}); // Delete the file if there's an error
          console.error("[❌] Error saving file:", err.message);
          reject(err);
        });
      } else if (response.statusCode === 302 || response.statusCode === 301) {
        // Handle redirects
        console.log("[🔄] Following redirect...");
        downloadVideo(
          response.headers.location,
          referer,
          cookie,
          outputFileName
        )
          .then(resolve)
          .catch(reject);
      } else {
        console.error(
          `[❌] Request failed. Status code: ${response.statusCode}`
        );
        reject(new Error(`HTTP Error: ${response.statusCode}`));
      }
    });

    request.on("error", (err) => {
      console.error("[❌] Network error:", err.message);
      reject(err);
    });

    // Set a timeout for the request
    request.setTimeout(60000, () => {
      request.abort();
      reject(new Error("Request timeout"));
    });
  });
}

// Helper function to sanitize filenames
function sanitizeFileName(fileName) {
  // Remove invalid characters for filenames
  return fileName.replace(/[/\\?%*:|"<>]/g, "_");
}

// Update the scrapeAndDownloadZoomLinks function to handle Google redirect URLs
async function scrapeAndDownloadZoomLinks(siteUrl = url) {
  logMemoryUsage("Before scraping");
  
  try {
    console.log("[🔍] Scraping Google Site for Harvard Zoom links...");
    const { data } = await axios.get(siteUrl);
    const $ = cheerio.load(data);

    // Find all links containing harvard.zoom.us
    const harvardZoomLinks = [];
    $("a").each((index, element) => {
      const href = $(element).attr("href");
      if (href && href.includes("harvard.zoom.us")) {
        // Extract the actual Harvard Zoom URL from the Google redirect URL
        const cleanUrl = extractHarvardZoomUrl(href);

        harvardZoomLinks.push({
          url: cleanUrl,
          text: $(element).text().trim() || `Harvard_Recording_${index + 1}`,
        });
      }
    });

    // Remove duplicate URLs (sometimes Google Sites has the same link multiple times)
    const uniqueLinks = removeDuplicateLinks(harvardZoomLinks);

    console.log(`[✅] Found ${uniqueLinks.length} unique Harvard Zoom links:`);

    // If no links found
    if (uniqueLinks.length === 0) {
      console.log("[⚠️] No harvard.zoom.us links found on the page.");
      return;
    }

    // Display found links
    uniqueLinks.forEach((link, index) => {
      console.log(`[${index + 1}] ${link.text}: ${link.url}`);
    });

    // Download each Zoom recording
    console.log("[🚀] Starting download of all Zoom recordings...");

    for (let i = 0; i < uniqueLinks.length; i++) {
      const link = uniqueLinks[i];
      console.log(
        `\n[⏳] Processing link ${i + 1}/${uniqueLinks.length}: ${link.text}`
      );

      try {
        await downloadZoomRecording(link.url);
        console.log(`[✅] Successfully processed link ${i + 1}`);
        logMemoryUsage(`After processing link ${i + 1}`);
      } catch (error) {
        console.error(
          `[❌] Failed to download link ${i + 1}: ${error.message}`
        );
        // Continue with next link even if one fails
      }
    }

    console.log("[🎉] Finished processing all Zoom links!");
    logMemoryUsage("After all downloads complete");
  } catch (error) {
    console.error("[❌] Error during scraping:", error.message);
    throw error; // Re-throw to allow proper promise handling
  }
}

// Helper function to extract Harvard Zoom URL from Google redirect URL
function extractHarvardZoomUrl(googleRedirectUrl) {
  try {
    // If the URL doesn't contain the Google redirect pattern, return it as is
    if (!googleRedirectUrl.includes("google.com/url?q=")) {
      return googleRedirectUrl;
    }

    // Extract the URL from the 'q' parameter in the Google redirect URL
    const urlParams = new URL(googleRedirectUrl);
    const harvardZoomUrl = urlParams.searchParams.get("q");

    // Decode the URL (handle URL encoding like %3A, %2F, etc.)
    return harvardZoomUrl
      ? decodeURIComponent(harvardZoomUrl)
      : googleRedirectUrl;
  } catch (error) {
    console.warn(
      `[⚠️] Error extracting Zoom URL from: ${googleRedirectUrl}`,
      error.message
    );
    // If there's an error parsing the URL, return the original URL
    return googleRedirectUrl;
  }
}

// Helper function to remove duplicate links based on URL
function removeDuplicateLinks(links) {
  const uniqueUrls = new Map();

  for (const link of links) {
    // Use URL as the key to avoid duplicates
    if (!uniqueUrls.has(link.url)) {
      uniqueUrls.set(link.url, link);
    }
  }

  return Array.from(uniqueUrls.values());
}

// Refactored main method execution
if (require.main === module) {
  logMemoryUsage("Script start");
  
  // Check if we have a command for direct URL download or scraping
  const command = process.argv[2]?.toLowerCase();

  if (command === "scrape") {
    // Get the Google site URL to scrape (optional, defaults to the hardcoded URL)
    const googleSiteUrl = process.argv[3] || url;
    console.log(`[🔍] Scraping Google site: ${googleSiteUrl}`);

    scrapeAndDownloadZoomLinks(googleSiteUrl)
      .then(() => {
        console.log("[🎉] Scraping and downloading process completed!");
        logMemoryUsage("Script end - scraping complete");
      })
      .catch((err) => {
        console.error(
          "[💥] Error during scraping and downloading:",
          err.message
        );
        logMemoryUsage("Script end - scraping error");
      });
  } else {
    // Direct URL download mode
    const zoomLink =
      command ||
      "https://harvard.zoom.us/rec/play/Y7H_QafrI65OlQTeQRGKQSTMatw7JtdRgYPN_QxikUohWUIztByJAnp2p_vLhGHu037j3HM_HhLL8Ksv.7BDdOMKqv07iXrz5?accessLevel=meeting&canPlayFromShare=true&from=share_recording_detail&startTime=1612971127000&componentName=rec-play&originRequestUrl=https%3A%2F%2Fharvard.zoom.us%2Frec%2Fshare%2FIw0o9AFghqGSkNlr8c8FCXwjN92eGFEJrM9c9dVOCWDvixbOV7UeqI-KswhfH_3E._g251FLhi8RfXseB%3FstartTime%3D1612971127000";

    // Get optional output filename from command line
    const outputFileName = process.argv[3] || null;

    console.log(`[🔍] Downloading single Zoom recording: ${zoomLink}`);

    downloadZoomRecording(zoomLink, outputFileName)
      .then((success) => {
        if (success) {
          console.log("[🎉] Download process completed successfully!");
        } else {
          console.log("[🛑] Download process failed.");
        }
        logMemoryUsage("Script end - download complete");
      })
      .catch((err) => {
        console.error("[💥] Unhandled error:", err.message);
        logMemoryUsage("Script end - download error");
      });
  }
}

// Export functions for potential use as a module
module.exports = {
  scrapeAndDownloadZoomLinks,
  downloadZoomRecording,
  getZoomRecordingInfo,
  downloadVideo,
};
