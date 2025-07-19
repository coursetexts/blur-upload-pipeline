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

    // Launch browser with more stealth
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--disable-blink-features=AutomationControlled',
        '--disable-features=VizDisplayCompositor'
      ]
    });

    const page = await browser.newPage();
    
    // More realistic browser setup
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    await page.setViewport({ width: 1920, height: 1080 });
    
    // Set extra headers
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
    });
    
    // Try the newer Google Images URL structure
    const searchQuery = `${professorName} professor`;
    // Use the new udm=2 parameter that Google redirected to
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}&udm=2`;
    
    console.log(`Searching: ${searchQuery}`);
    
    // Navigate to Google Images with the new URL
    await page.goto(searchUrl, { 
      waitUntil: 'networkidle2', 
      timeout: 30000 
    });
    
    // Wait for content to load
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Check what we actually got
    const pageInfo = await page.evaluate(() => ({
      title: document.title,
      url: window.location.href,
      isImagePage: window.location.href.includes('udm=2') || window.location.href.includes('tbm=isch'),
      hasImageResults: document.querySelector('[data-ved*="img"]') !== null || 
                      document.querySelector('.rg_i') !== null ||
                      document.querySelector('[role="img"]') !== null
    }));
    
    console.log(`Page info: ${pageInfo.title}`);
    console.log(`Is image page: ${pageInfo.isImagePage}`);
    
    if (!pageInfo.isImagePage) {
      // If we're still not on an image page, try the old method as fallback
      console.log('Trying fallback URL...');
      const fallbackUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}&source=lnms&tbm=isch`;
      await page.goto(fallbackUrl, { waitUntil: 'networkidle2', timeout: 30000 });
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    // Scroll to trigger more image loading
    await autoScroll(page);
    
    // Wait for dynamic content
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Extract image URLs with multiple methods
    const imageUrls = await page.evaluate(() => {
      const urls: string[] = [];
      
      // Method 1: Look for various image selectors used by Google
      const selectors = [
        'img[src*="http"]',
        '[data-src*="http"]',
        '[style*="background-image"]',
        'img[data-iml]',
        '.rg_i img',
        '[role="img"] img'
      ];
      
      selectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
          let src = '';
          
          if (element.tagName === 'IMG') {
            const img = element as HTMLImageElement;
            src = img.src || img.dataset?.src || '';
          } else {
            // Check for background images
            const style = (element as HTMLElement).style.backgroundImage;
            if (style && style.includes('url(')) {
              const match = style.match(/url\(['"]?([^'"]+)['"]?\)/);
              if (match) src = match[1];
            }
          }
          
          // Filter for actual image URLs
          if (src && 
              src.startsWith('http') && 
              !src.includes('gstatic.com') &&
              !src.includes('googlelogo') &&
              !src.includes('data:image') &&
              (src.includes('.jpg') || src.includes('.jpeg') || src.includes('.png') || src.includes('.webp') ||
               src.includes('images') || src.includes('photo') || src.includes('pic')) &&
              src.length > 50) {
            urls.push(src);
          }
        });
      });
      
      // Method 2: Look in onclick handlers and href attributes for image URLs
      const links = document.querySelectorAll('a[href*="imgurl"], a[href*="imgres"]');
      links.forEach(link => {
        const href = (link as HTMLAnchorElement).href;
        try {
          const url = new URL(href);
          const imgUrl = url.searchParams.get('imgurl');
          if (imgUrl && imgUrl.startsWith('http') && imgUrl.length > 50) {
            urls.push(decodeURIComponent(imgUrl));
          }
        } catch (e) {
          // Skip invalid URLs
        }
      });
      
      // Method 3: Check for JSON-LD or other structured data
      const scripts = document.querySelectorAll('script');
      scripts.forEach(script => {
        const content = script.textContent || '';
        // Look for URLs in script content
        const urlMatches = content.match(/https?:\/\/[^\s"'<>]+\.(jpg|jpeg|png|webp)/gi);
        if (urlMatches) {
          urlMatches.forEach(url => {
            if (url.length > 50 && !url.includes('gstatic.com')) {
              urls.push(url);
            }
          });
        }
      });
      
      return [...new Set(urls)]; // Remove duplicates
    });

    console.log(`Found ${imageUrls.length} potential image URLs`);
    
    if (imageUrls.length > 0) {
      console.log('Sample URLs:');
      imageUrls.slice(0, 3).forEach((url, i) => {
        console.log(`  ${i + 1}: ${url.substring(0, 80)}...`);
      });
    }
    
    // Download images
    const downloadPromises = imageUrls.slice(0, maxImages).map(async (url, index) => {
      try {
        console.log(`Downloading image ${index + 1}/${Math.min(maxImages, imageUrls.length)}: ${url.substring(0, 60)}...`);
        
        const response = await axios.get(url, {
          responseType: 'arraybuffer',
          timeout: 15000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Referer': 'https://www.google.com/',
            'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8'
          }
        });

        // Validate it's an image
        const contentType = response.headers['content-type'];
        if (!contentType || !contentType.startsWith('image/')) {
          throw new Error(`Not a valid image file (content-type: ${contentType})`);
        }
        
        // Check file size (skip tiny images)
        if (response.data.length < 1000) {
          throw new Error('Image too small (likely a placeholder)');
        }

        // Generate filename
        const extension = getImageExtension(contentType);
        const hash = crypto.createHash('md5').update(url).digest('hex').substring(0, 8);
        const filename = `professor_${index + 1}_${hash}.${extension}`;
        const filepath = path.join(outputDir, filename);

        // Save image
        fs.writeFileSync(filepath, response.data);
        
        console.log(`✅ Downloaded: ${filename} (${Math.round(response.data.length / 1024)}KB)`);
        return filepath;
        
      } catch (error) {
        console.warn(`❌ Failed to download image ${index + 1}: ${error.message}`);
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
      result.errors.push('No images could be downloaded - Google may be blocking scraping attempts');
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
  await page.evaluate(() => {
    return new Promise<void>((resolve) => {
      let totalHeight = 0;
      const distance = 100;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight || totalHeight > 1500) {
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