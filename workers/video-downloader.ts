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
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Referer": referer || videoUrl,
        "Cookie": cookieHeader,
      },
    });

    if (response.status !== 200) {
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
 * (Reused from existing youtube.ts logic)
 */
async function extractZoomMp4Url(zoomUrl: string): Promise<ZoomExtractionResult> {
  let browser: Browser | null = null;
  
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    });

    const page = await browser.newPage();
    
    // Set user agent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    // Navigate to Zoom URL
    await page.goto(zoomUrl, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Wait for video element or download link
    await page.waitForSelector('video, a[href*=".mp4"]', { timeout: 15000 });
    
    // Extract MP4 URL
    const extractedData = await page.evaluate(() => {
      // Try to find video element source
      const videoElement = document.querySelector('video') as HTMLVideoElement;
      if (videoElement && videoElement.src) {
        return {
          mp4Url: videoElement.src,
          referer: window.location.href,
          cookieHeader: document.cookie
        };
      }
      
      // Try to find download link
      const downloadLink = document.querySelector('a[href*=".mp4"]') as HTMLAnchorElement;
      if (downloadLink && downloadLink.href) {
        return {
          mp4Url: downloadLink.href,
          referer: window.location.href,
          cookieHeader: document.cookie
        };
      }
      
      // Look for any URL in scripts that contains .mp4
      const scripts = document.querySelectorAll('script');
      for (const script of scripts) {
        const content = script.textContent || '';
        const mp4Match = content.match(/https?:\/\/[^"'\s]+\.mp4[^"'\s]*/);
        if (mp4Match) {
          return {
            mp4Url: mp4Match[0],
            referer: window.location.href,
            cookieHeader: document.cookie
          };
        }
      }
      
      throw new Error('Could not find MP4 URL in Zoom page');
    });

    return extractedData;

  } finally {
    if (browser) {
      await browser.close();
    }
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