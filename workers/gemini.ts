import { GoogleGenerativeAI, Part } from "@google/generative-ai";

// Ensure your Google API Key is correctly set in environment variables
if (!process.env.GOOGLE_API_KEY) {
  throw new Error("GOOGLE_API_KEY environment variable not set.");
}
const genAi = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// Use a Gemini 1.5 model capable of direct PDF processing
const model = genAi.getGenerativeModel({
  model: "gemini-2.5-flash",
});

interface FileData {
  displayName: string;
  type: string;
  url?: string;
}

interface VideoData {
  title: string;
  url: string;
}

async function renameFilesForNotion(files: FileData[]) {
  const fileList = files.map(file => `${file.displayName} (${file.type})`).join('\n');
  
  const prompt = `
  Rename the following files to readable names according to the lecture, the date (in the series of lectures) and possibly the contents of the files.

  Current files:
  ${fileList}

  Please provide a JSON response with the original filename as key and the new readable name as value.
  Example format:
  {
    "Neuro130_2023_Lecture3.pdf": "Lecture 3: Visual Cortex Architecture",
    "sample_HW_assignment.pdf": "Homework Assignment: Pattern Recognition"
  }

  Make the names descriptive, professional, and easy to understand.
  `;

try {
  console.log("Sending request to Gemini model...");
  const result = await model.generateContent(prompt);
  const response = result.response;

  // Log the raw response text for debugging if needed
  // console.log("Gemini Raw Response:", JSON.stringify(response, null, 2));

  if (!response) {
    throw new Error("No response received from Gemini model.");
  }

  // Check for safety ratings or blocks
  if (response.promptFeedback?.blockReason) {
    console.error(
      `Request blocked due to: ${response.promptFeedback.blockReason}`
    );
    console.error(
      `Block reason details: ${response.promptFeedback.blockReasonMessage}`
    );
    throw new Error(
      `Content blocked by safety settings: ${response.promptFeedback.blockReason}`
    );
  }
  if (
    response.candidates?.[0]?.finishReason &&
    response.candidates[0].finishReason !== "STOP"
  ) {
    console.warn(
      `Gemini generation finished unexpectedly: ${response.candidates[0].finishReason}`
    );
    console.warn(`Finish message: ${response.candidates[0].finishMessage}`);
  }

  const text = response.text();
  console.log("Gemini response:", text);
  
  // Parse the JSON response - handle markdown code blocks
  try {
    // Extract JSON from markdown code blocks if present
    let jsonText = text;
    if (text.includes('```json')) {
      const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        jsonText = jsonMatch[1].trim();
      }
    } else if (text.includes('```')) {
      // Handle generic code blocks
      const jsonMatch = text.match(/```\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        jsonText = jsonMatch[1].trim();
      }
    }
    
    const renamedFiles = JSON.parse(jsonText);
    return renamedFiles;
  } catch (parseError) {
    console.error("Failed to parse Gemini response as JSON:", parseError);
    console.error("Raw response:", text);
    // Fallback: return original filenames
    const fallback = {};
    files.forEach(file => {
      fallback[file.displayName] = file.displayName.replace('.pdf', '');
    });
    return fallback;
  }
} catch (error) {
  if (error instanceof Error) {
    console.error("Error calling Gemini API:", error.message);
    console.error(error.stack);
    // Check for specific API errors if the SDK provides them
    // e.g., if (error.code === 'RATE_LIMIT_EXCEEDED') { ... }
  } else {
    console.error("Unknown error calling Gemini API:", error);
  }
    throw new Error("Failed to get rename files for Notion result from Gemini"); // Re-throw to be caught by the handler
  }
}

async function renameVideosForNotion(videos: VideoData[]) {
  const videoList = videos.map(video => `${video.title} (${video.url})`).join('\n');
  
  const prompt = `
  Rename the following video titles to readable names according to the lecture content, date, and topic. These are lecture videos.

  Current video titles:
  ${videoList}

  Please provide a JSON response with the original title as key and the new readable name as value.
  Example format:
  {
    "neurobio - bebd1df9-956c-4c0e-8c72-aaca0158db47": "Lecture 1: Introduction to Neurobiology",
    "20191007_neurobio - 4888c9e8-2c6c-4927-a9f3-aadf015c9e43": "Lecture 2: Neural Development",
    "2091119_neurobio_130 - 3b415ad0-149a-49c7-969b-ab0a00ee7ad9": "Lecture 3: Synaptic Transmission"
  }

  Make the names descriptive, professional, and easy to understand. Include lecture numbers when possible and focus on the main topic or content area.
  `;

try {
  console.log("Sending video rename request to Gemini model...");
  const result = await model.generateContent(prompt);
  const response = result.response;

  // Log the raw response text for debugging if needed
  // console.log("Gemini Raw Response:", JSON.stringify(response, null, 2));

  if (!response) {
    throw new Error("No response received from Gemini model.");
  }

  // Check for safety ratings or blocks
  if (response.promptFeedback?.blockReason) {
    console.error(
      `Request blocked due to: ${response.promptFeedback.blockReason}`
    );
    console.error(
      `Block reason details: ${response.promptFeedback.blockReasonMessage}`
    );
    throw new Error(
      `Content blocked by safety settings: ${response.promptFeedback.blockReason}`
    );
  }
  if (
    response.candidates?.[0]?.finishReason &&
    response.candidates[0].finishReason !== "STOP"
  ) {
    console.warn(
      `Gemini generation finished unexpectedly: ${response.candidates[0].finishReason}`
    );
    console.warn(`Finish message: ${response.candidates[0].finishMessage}`);
  }

  const text = response.text();
  console.log("Gemini video rename response:", text);
  
  // Parse the JSON response - handle markdown code blocks
  try {
    // Extract JSON from markdown code blocks if present
    let jsonText = text;
    if (text.includes('```json')) {
      const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        jsonText = jsonMatch[1].trim();
      }
    } else if (text.includes('```')) {
      // Handle generic code blocks
      const jsonMatch = text.match(/```\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        jsonText = jsonMatch[1].trim();
      }
    }
    
    const renamedVideos = JSON.parse(jsonText);
    return renamedVideos;
  } catch (parseError) {
    console.error("Failed to parse Gemini video rename response as JSON:", parseError);
    console.error("Raw response:", text);
    // Fallback: return original titles
    const fallback = {};
    videos.forEach(video => {
      fallback[video.title] = video.title;
    });
    return fallback;
  }
} catch (error) {
  if (error instanceof Error) {
    console.error("Error calling Gemini API for video rename:", error.message);
    console.error(error.stack);
    // Check for specific API errors if the SDK provides them
    // e.g., if (error.code === 'RATE_LIMIT_EXCEEDED') { ... }
  } else {
    console.error("Unknown error calling Gemini API for video rename:", error);
  }
    throw new Error("Failed to get rename videos for Notion result from Gemini"); // Re-throw to be caught by the handler
  }
}

export { renameFilesForNotion, renameVideosForNotion };
export type { FileData, VideoData };
