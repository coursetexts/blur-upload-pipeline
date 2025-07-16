import puppeteer, { Browser, Page } from 'puppeteer';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

interface ProfessorImageResult {
  success: boolean;
  imageCount: number;
  imagePaths: string[];
  errors: string[];
}

/**
 * Scrapes Google Images for professor photos
 * 
 * @param professorName - Full name of the professor
 * @param outputDir - Directory to save images
 * @param maxImages - Maximum number of images to download (default: 15)
 * @returns Promise with scraping results
 */
export async function scrapeProfessorImages(
  professorName: string,
  outputDir: string,
  maxImages: number = 15
): Promise<ProfessorImageResult> {
  const result: ProfessorImageResult = {
    success: false,
    imageCount: 0,
    imagePaths: [],
    errors: []
  };

  let browser: Browser | null = null;

  try {
    console.log(`Starting image scraping for professor: ${professorName}`);
    
    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Launch browser
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
    
    // Set user agent to avoid detection
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    // Construct search query
    const searchQuery = `${professorName} professor university academic`;
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}&tbm=isch&tbs=itp:face,isz:m`;
    
    console.log(`Searching: ${searchQuery}`);
    
    // Navigate to Google Images
    await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Wait for images to load
    await page.waitForSelector('img[data-src], img[src]', { timeout: 10000 });
    
    // Scroll to load more images
    await autoScroll(page);
    
    // Extract image URLs
    const imageUrls = await page.evaluate(() => {
      const images = document.querySelectorAll('img');
      const urls: string[] = [];
      
      images.forEach((img) => {
        const src = (img as HTMLImageElement).src || (img as any).dataset?.src;
        if (src && 
            src.startsWith('http') && 
            !src.includes('gstatic.com') &&
            !src.includes('googleusercontent.com') &&
            !src.includes('data:image') &&
            src.includes('://')) {
          urls.push(src);
        }
      });
      
      return [...new Set(urls)]; // Remove duplicates
    });

    console.log(`Found ${imageUrls.length} potential image URLs`);
    
    // Download images
    const downloadPromises = imageUrls.slice(0, maxImages).map(async (url, index) => {
      try {
        const response = await axios.get(url, {
          responseType: 'arraybuffer',
          timeout: 10000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Referer': 'https://www.google.com/'
          }
        });

        // Validate it's an image
        const contentType = response.headers['content-type'];
        if (!contentType || !contentType.startsWith('image/')) {
          throw new Error('Not a valid image file');
        }

        // Generate filename
        const extension = getImageExtension(contentType);
        const hash = crypto.createHash('md5').update(url).digest('hex').substring(0, 8);
        const filename = `professor_${index + 1}_${hash}.${extension}`;
        const filepath = path.join(outputDir, filename);

        // Save image
        fs.writeFileSync(filepath, response.data);
        
        console.log(`Downloaded: ${filename} (${Math.round(response.data.length / 1024)}KB)`);
        return filepath;
        
      } catch (error) {
        console.warn(`Failed to download image ${index + 1}: ${error.message}`);
        result.errors.push(`Image ${index + 1}: ${error.message}`);
        return null;
      }
    });

    const downloadedPaths = await Promise.all(downloadPromises);
    const successfulPaths = downloadedPaths.filter(path => path !== null) as string[];

    result.success = successfulPaths.length > 0;
    result.imageCount = successfulPaths.length;
    result.imagePaths = successfulPaths;

    console.log(`Successfully downloaded ${successfulPaths.length} images for ${professorName}`);
    
    if (successfulPaths.length === 0) {
      result.errors.push('No images could be downloaded');
    }

  } catch (error) {
    console.error(`Error scraping images for ${professorName}:`, error);
    result.errors.push(error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }

  return result;
}

/**
 * Auto-scroll the page to load more images
 */
async function autoScroll(page: Page): Promise<void> {
  await page.evaluate(async () => {
    await new Promise<void>((resolve) => {
      let totalHeight = 0;
      const distance = 100;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight || totalHeight > 2000) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
}

/**
 * Get file extension from content type
 */
function getImageExtension(contentType: string): string {
  switch (contentType.toLowerCase()) {
    case 'image/jpeg':
    case 'image/jpg':
      return 'jpg';
    case 'image/png':
      return 'png';
    case 'image/gif':
      return 'gif';
    case 'image/webp':
      return 'webp';
    case 'image/bmp':
      return 'bmp';
    default:
      return 'jpg'; // Default fallback
  }
}

/**
 * Clean up old professor image directories
 */
export function cleanupOldProfessorImages(baseDir: string, maxAge: number = 24 * 60 * 60 * 1000): void {
  try {
    if (!fs.existsSync(baseDir)) {
      return;
    }

    const items = fs.readdirSync(baseDir);
    const now = Date.now();

    items.forEach(item => {
      const itemPath = path.join(baseDir, item);
      const stats = fs.statSync(itemPath);
      
      if (stats.isDirectory() && (now - stats.mtime.getTime()) > maxAge) {
        console.log(`Cleaning up old professor images: ${item}`);
        fs.rmSync(itemPath, { recursive: true, force: true });
      }
    });
  } catch (error) {
    console.warn('Error cleaning up old professor images:', error);
  }
} 