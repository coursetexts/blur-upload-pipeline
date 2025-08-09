import { createOrUpdateCourseNotionPage } from './notion-page-builder';
import * as dotenv from "dotenv";

// Load environment variables from existing .env file
dotenv.config();

async function testNotionPageBuilder() {
  try {
    console.log('🧪 Starting Notion page builder test...');
    
    // Check if required environment variables are set
    const requiredEnvVars = ['NOTION_TOKEN', 'NOTION_VERSION', 'NOTION_PARENT_PAGE_ID'];
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    // Check for AI service configuration
    const useOpenAI = process.env.USE_OPENAI === 'true';
    const hasOpenAIKey = process.env.OPENAI_API_KEY;
    const hasGeminiKey = process.env.GOOGLE_API_KEY;
    
    if (useOpenAI && hasOpenAIKey) {
      console.log('✅ OPENAI_API_KEY found - OpenAI file and video renaming enabled');
    } else if (hasGeminiKey) {
      console.log('✅ GOOGLE_API_KEY found - Gemini file and video renaming enabled');
    } else {
      console.log('⚠️ No AI API keys found - file and video renaming will use original names');
      console.log('   Set USE_OPENAI=true and OPENAI_API_KEY for OpenAI, or GOOGLE_API_KEY for Gemini');
    }
    
    if (missingVars.length > 0) {
      console.error('❌ Missing required environment variables:', missingVars);
      process.exit(1);
    }
    
    console.log('✅ Environment variables found');
    console.log('📝 NOTION_PARENT_PAGE_ID:', process.env.NOTION_PARENT_PAGE_ID);
    
    // Test with a specific course code - replace with your course code
    const courseCode = 'NEUROBIO 78454'; // Update this to match the exact courseCode in your database
    
    console.log(`🔍 Testing with course code: ${courseCode}`);
    
    const result = await createOrUpdateCourseNotionPage(courseCode);
    
    console.log('🎉 Success! Notion page created/updated:', result.url);
    console.log('📊 Page ID:', result.id);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Run the test
testNotionPageBuilder();