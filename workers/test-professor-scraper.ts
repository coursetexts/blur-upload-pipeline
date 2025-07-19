import { scrapeProfessorImages, cleanupOldProfessorImages } from './professor-image-scraper';
import path from 'path';
import fs from 'fs';
import os from 'os';

async function runTest() {
  console.log('🧪 Testing Professor Image Scraper...\n');

  // Create a temporary test directory
  const testDir = path.join(os.tmpdir(), 'professor-scraper-test', Date.now().toString());
  
  try {
    console.log(`📁 Test directory: ${testDir}`);
    
    // Test 1: Basic scraping functionality
    console.log('\n🔍 Test 1: Scraping images for "Albert Einstein"...');
    const result = await scrapeProfessorImages(
      'Albert Einstein',
      testDir,
      3 // Only download 3 images for testing
    );
    
    console.log('\n📊 Results:');
    console.log(`✅ Success: ${result.success}`);
    console.log(`📸 Images downloaded: ${result.imageCount}`);
    console.log(`📝 Errors: ${result.errors.length}`);
    
    if (result.errors.length > 0) {
      console.log('❌ Errors encountered:');
      result.errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error}`);
      });
    }
    
    if (result.imagePaths.length > 0) {
      console.log('\n📂 Downloaded files:');
      result.imagePaths.forEach((imagePath, index) => {
        const stats = fs.statSync(imagePath);
        const sizeKB = Math.round(stats.size / 1024);
        console.log(`   ${index + 1}. ${path.basename(imagePath)} (${sizeKB}KB)`);
      });
    }
    
    // Test 2: Test with non-existent professor (should handle gracefully)
    console.log('\n🔍 Test 2: Testing with unlikely professor name...');
    const result2 = await scrapeProfessorImages(
      'Zyxwvu Unlikely Professor Name 12345',
      path.join(testDir, 'unlikely'),
      2
    );
    
    console.log(`✅ Handled unlikely name gracefully: ${result2.imageCount} images found`);
    
    // Test 3: Test cleanup function
    console.log('\n🧹 Test 3: Testing cleanup function...');
    
    // Create a fake old directory
    const oldDir = path.join(testDir, 'old-test');
    fs.mkdirSync(oldDir, { recursive: true });
    fs.writeFileSync(path.join(oldDir, 'test.txt'), 'test');
    
    // Set the directory's modification time to 2 days ago
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
    fs.utimesSync(oldDir, twoDaysAgo, twoDaysAgo);
    
    console.log(`📁 Created old directory: ${oldDir}`);
    console.log(`🕐 Directory exists before cleanup: ${fs.existsSync(oldDir)}`);
    
    // Run cleanup (anything older than 1 day)
    cleanupOldProfessorImages(testDir, 24 * 60 * 60 * 1000);
    
    console.log(`🗑️  Directory exists after cleanup: ${fs.existsSync(oldDir)}`);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    // Cleanup test directory
    console.log('\n🧹 Cleaning up test directory...');
    try {
      fs.rmSync(testDir, { recursive: true, force: true });
      console.log('✅ Cleanup completed');
    } catch (error) {
      console.warn('⚠️  Could not clean up test directory:', error.message);
    }
  }
}

// Add a simple CLI interface
if (require.main === module) {
  const professorName = process.argv[2];
  const maxImages = parseInt(process.argv[3]) || 5;
  
  if (professorName) {
    console.log(`🔍 Custom test for: ${professorName} (max ${maxImages} images)`);
    
    const customTestDir = path.join(os.tmpdir(), 'professor-scraper-custom', Date.now().toString());
    
    scrapeProfessorImages(professorName, customTestDir, maxImages)
      .then(result => {
        console.log('\n📊 Results:');
        console.log(`✅ Success: ${result.success}`);
        console.log(`📸 Images downloaded: ${result.imageCount}`);
        console.log(`📁 Directory: ${customTestDir}`);
        
        if (result.errors.length > 0) {
          console.log('❌ Errors:');
          result.errors.forEach(error => console.log(`   ${error}`));
        }
      })
      .catch(console.error);
  } else {
    runTest();
  }
}

export { runTest }; 