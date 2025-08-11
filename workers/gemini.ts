import { GoogleGenerativeAI, Part } from "@google/generative-ai";

// Ensure your Google API Key is correctly set in environment variables
if (!process.env.GOOGLE_API_KEY) {
  throw new Error("GOOGLE_API_KEY environment variable not set.");
}
const genAi = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// Use a Gemini 1.5 model capable of direct PDF processing
const model = genAi.getGenerativeModel({
  model: "gemini-2.5-pro",
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
You are helping organize a university course offered by reputable university into weekly modules.

Rename the following lecture note files to a consistent, human-readable format:
- Always start with "Lecture N: " where N is the lecture number extracted from the filename if present.
- Check the internet for the course and use the course website to infer the lecture number if available.
- If you cannot infer a lecture number, try to infer from the date in the filename then assign the number if the date comes right after the one before then this is n+1.
- If you are able to check the file contents then infer the lecture number from the contents.
- If you cannot infer a lecture number or date, do NOT invent one; just use a clear descriptive title without a number.
- Keep it concise and professional.
- Reply ONLY with a JSON object mapping original filenames to new titles. Do not include any markdown fences.

Files:\n${fileList}

Example JSON (no markdown fences):
{
  "Neuro130_2023_Lecture3.pdf": "Lecture 3: Synaptic Transmission and Neurotransmitters",
  "sample_HW_assignment.pdf": "Homework: Pattern Recognition"
}`;

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
You are helping organize a university course offered by reputable university into weekly modules.

Rename the following lecture video titles to a consistent, human-readable format:
- Always start with "Lecture N: " where N is the lecture number extracted from the title if present.
- Check the internet for the course and use the course website to infer the lecture number if available.
- If you cannot infer a lecture number, try to infer from the date in the title then assign the number if the date comes right after the one before then this is n+1.
- If you are able to check the video contents then infer the lecture number from the contents.
- If you cannot infer a lecture number or date, do NOT invent one; just use a clear descriptive title without a number.
- Keep it concise and professional.
- Reply ONLY with a JSON object mapping original titles to new titles. Do not include any markdown fences.

Videos:\n${videoList}

Example JSON (no markdown fences):
{
  "neurobio - bebd1df9-956c-4c0e-8c72-aaca0158db47": "Lecture 1: Introduction to Neurobiology",
  "20191007_neurobio - 4888c9e8-2c6c-4927-a9f3-aadf015c9e43": "Lecture 3: Action Potentials"
}`;

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

// Helper function to extract week/lecture number from filename
function extractWeekNumber(filename: string): number | null {
  const name = (filename || "").toString();
  const lower = name.toLowerCase();

  // Treat introduction as Week 1
  if (/\b(intro|introduction|overview)\b/i.test(lower)) {
    return 1;
  }

  // Prefer explicit lecture/week tokens (lec, lecture, wk, week)
  const explicit = lower.match(/\b(?:lecture|lec|wk|week)\s*(?:#|:|\.|-)?\s*0?(\d{1,2})\b/);
  if (explicit) {
    const n = parseInt(explicit[1], 10);
    if (!Number.isNaN(n)) return n;
  }

  // 2) Look for patterns like "lecture0X" without space
  const compact = lower.match(/\b(?:lecture|lec)0?(\d{1,2})\b/);
  if (compact) {
    const n = parseInt(compact[1], 10);
    if (!Number.isNaN(n)) return n;
  }

  // Avoid dates and large numbers: do not fall back to arbitrary numbers
  return null;
}

// Helper function to group files and videos by week
type WeekGroupingResult = {
  weeks: Array<{
    weekNumber: number;
    files: any[];
    videos: any[];
  }>;
  ungroupedFiles: any[];
  ungroupedVideos: any[];
};

function groupByWeek(
  files: any[],
  videos: any[],
  opts?: { fileNameMap?: Record<string, string>; videoTitleMap?: Record<string, string> }
): WeekGroupingResult {
  const weekGroups: Map<number, { files: any[]; videos: any[] }> = new Map();

  const fileNameMap = opts?.fileNameMap || {};
  const videoTitleMap = opts?.videoTitleMap || {};

  const ungroupedFiles: any[] = [];
  const ungroupedVideos: any[] = [];

  // Group files by week using renamed name when available
  files.forEach((file) => {
    const displayName: string = fileNameMap[file.displayName] || file.displayName || "";
    const weekNum = extractWeekNumber(displayName);
    if (weekNum) {
      if (!weekGroups.has(weekNum)) {
        weekGroups.set(weekNum, { files: [], videos: [] });
      }
      weekGroups.get(weekNum)!.files.push(file);
    } else {
      ungroupedFiles.push(file);
    }
  });

  // Group videos by week using renamed title when available
  videos.forEach((video) => {
    const titleForGrouping: string = videoTitleMap[video.title] || video.title || "";
    const weekNum = extractWeekNumber(titleForGrouping);
    if (weekNum) {
      if (!weekGroups.has(weekNum)) {
        weekGroups.set(weekNum, { files: [], videos: [] });
      }
      weekGroups.get(weekNum)!.videos.push(video);
    } else {
      ungroupedVideos.push(video);
    }
  });

  const weeks = Array.from(weekGroups.entries())
    .map(([weekNumber, content]) => ({ weekNumber, ...content }))
    .sort((a, b) => a.weekNumber - b.weekNumber);

  return { weeks, ungroupedFiles, ungroupedVideos };
}

export { renameFilesForNotion, renameVideosForNotion, groupByWeek, extractWeekNumber };
export type { FileData, VideoData, WeekGroupingResult };
