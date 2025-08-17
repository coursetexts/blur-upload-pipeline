import { GoogleGenerativeAI, Part } from "@google/generative-ai";
import axios from "axios";
import pdfParse from "pdf-parse";
import fs from "fs";
import path from "path";

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

let cachedSyllabusText: string | undefined;

async function tryExtractSyllabusText(files: FileData[]): Promise<string | undefined> {
  try {
    const syllabusCandidates = files
      .filter((f) => /syllabus/i.test(f.displayName))
      .sort((a, b) => {
        const score = (f: FileData) => (/(^|\W)file(\W|$)/i.test(f.type) ? 1 : 0);
        return score(b) - score(a);
      });

    if (syllabusCandidates.length === 0) return undefined;

    const target = syllabusCandidates.find((f) => !!f.url);
    if (!target || !target.url) return undefined;

    const response = await axios.get<ArrayBuffer>(target.url, { responseType: "arraybuffer" });
    const buffer = Buffer.from(response.data);
    const parsed = await pdfParse(buffer as any);
    const text = parsed?.text?.trim();
    if (text) {
      cachedSyllabusText = text;

      try {
        const logsDir = path.join(__dirname, "logs");
        if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });
        const outPath = path.join(logsDir, "syllabus-ocr.txt");
        await fs.promises.writeFile(outPath, text, "utf-8");
        console.log(`📄 (Gemini) Syllabus OCR saved to ${outPath} (${text.length} chars)`);
      } catch (ioErr) {
        console.warn("(Gemini) Failed to write syllabus OCR file:", (ioErr as any)?.message || ioErr);
      }

      const preview = text.slice(0, 400).replace(/\s+/g, " ");
      console.log(`📄 (Gemini) Syllabus OCR preview: "${preview}${text.length > 400 ? "…" : ""}"`);

      return text;
    }
  } catch (err) {
    console.warn("(Gemini) Syllabus OCR failed, continuing without syllabus context:", (err as any)?.message || err);
  }
  return undefined;
}

export function getCachedSyllabusTextGemini(): string | undefined {
  return cachedSyllabusText;
}

async function renameFilesForNotion(files: FileData[]) {
  const fileList = files
    .map((file) => `${file.displayName} (${file.type})${file.url ? ` -> ${file.url}` : ""}`)
    .join("\n");

  // Attempt OCR of syllabus to extract schedule/context
  let syllabusText = cachedSyllabusText;
  if (!syllabusText) {
    syllabusText = await tryExtractSyllabusText(files);
  }
  const syllabusSnippet = syllabusText
    ? syllabusText.length > 6000
      ? syllabusText.slice(0, 6000) + "\n...[truncated]"
      : syllabusText
    : undefined;
  
const prompt = `
You are helping organize a university course offered by reputable university into weekly modules.

${syllabusSnippet ? `Syllabus (OCR, excerpt):\n${syllabusSnippet}\n\n` : ""}Rename the following lecture note files to a consistent, human-readable format:
- Always start with "Lecture N: " where N is the lecture number extracted from the filename or inferred from the syllabus if present.
- Prefer the syllabus schedule (dates/titles/order) to determine N. If unambiguous, assign lecture numbers based on it.
- If you cannot infer a lecture number, use a clear descriptive title without a number.
- Keep it concise and professional.
- Reply ONLY with a JSON object mapping original filenames to new titles. Do not include any markdown fences.

Files:\n${fileList}

Example JSON (no markdown fences):
{
  "Neuro130_2023_Lecture3.pdf": "Lecture 3: Synaptic Transmission and Neurotransmitters",
  "sample_HW_assignment.pdf": "Homework: Pattern Recognition"
}`;

try {
  if (syllabusSnippet) {
    console.log(`📄 (Gemini) Using syllabus OCR excerpt (${syllabusSnippet.length} chars) in files prompt`);
  } else {
    console.log("📄 (Gemini) No syllabus OCR available for files prompt");
  }
  console.log("Sending request to Gemini model...");
  const result = await model.generateContent(prompt);
  const response = result.response;

  if (!response) {
    throw new Error("No response received from Gemini model.");
  }

  if (response.promptFeedback?.blockReason) {
    console.error(`Request blocked due to: ${response.promptFeedback.blockReason}`);
    console.error(`Block reason details: ${response.promptFeedback.blockReasonMessage}`);
    throw new Error(`Content blocked by safety settings: ${response.promptFeedback.blockReason}`);
  }
  if (response.candidates?.[0]?.finishReason && response.candidates[0].finishReason !== "STOP") {
    console.warn(`Gemini generation finished unexpectedly: ${response.candidates[0].finishReason}`);
    console.warn(`Finish message: ${response.candidates[0].finishMessage}`);
  }

  const text = response.text();
  console.log("Gemini response:\n", text);
  
  try {
    let jsonText = text;
    if (text.includes('```json')) {
      const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) jsonText = jsonMatch[1].trim();
    } else if (text.includes('```')) {
      const jsonMatch = text.match(/```\s*([\s\S]*?)\s*```/);
      if (jsonMatch) jsonText = jsonMatch[1].trim();
    }
    const renamedFiles = JSON.parse(jsonText);
    return renamedFiles;
  } catch (parseError) {
    console.error("Failed to parse Gemini response as JSON:", parseError);
    console.error("Raw response:", text);
    const fallback: Record<string, string> = {};
    files.forEach((file) => {
      fallback[file.displayName] = file.displayName.replace('.pdf', '');
    });
    return fallback;
  }
} catch (error) {
  if (error instanceof Error) {
    console.error("Error calling Gemini API:", error.message);
    console.error(error.stack);
  } else {
    console.error("Unknown error calling Gemini API:", error);
  }
  throw new Error("Failed to get rename files for Notion result from Gemini");
}
}

async function renameVideosForNotion(videos: VideoData[]) {
  const videoList = videos.map((video) => `${video.title} (${video.url})`).join("\n");

  const syllabusSnippet = cachedSyllabusText
    ? cachedSyllabusText.length > 6000
      ? cachedSyllabusText.slice(0, 6000) + "\n...[truncated]"
      : cachedSyllabusText
    : undefined;
  
  const prompt = `
You are helping organize a university course offered by reputable university into weekly modules.

${syllabusSnippet ? `Syllabus (OCR, excerpt):\n${syllabusSnippet}\n\n` : ""}Rename the following lecture video titles to a consistent, human-readable format:
- Always start with "Lecture N: " where N is the lecture number extracted from the title or inferred from the syllabus if present.
- Prefer the syllabus schedule (dates/titles/order) to determine N. If unambiguous, assign lecture numbers based on it.
- If you cannot infer a lecture number, use a clear descriptive title without a number.
- Keep it concise and professional.
- Reply ONLY with a JSON object mapping original titles to new titles. Do not include any markdown fences.

Videos:\n${videoList}

Example JSON (no markdown fences):
{
  "neurobio - bebd1df9-956c-4c0e-8c72-aaca0158db47": "Lecture 1: Introduction to Neurobiology",
  "20191007_neurobio - 4888c9e8-2c6c-4927-a9f3-aadf015c9e43": "Lecture 3: Action Potentials"
}`;

try {
  if (syllabusSnippet) {
    console.log(`📄 (Gemini) Using syllabus OCR excerpt (${syllabusSnippet.length} chars) in videos prompt`);
  } else {
    console.log("📄 (Gemini) No syllabus OCR available for videos prompt");
  }
  console.log("Sending video rename request to Gemini model...");
  const result = await model.generateContent(prompt);
  const response = result.response;

  if (!response) {
    throw new Error("No response received from Gemini model.");
  }

  if (response.promptFeedback?.blockReason) {
    console.error(`Request blocked due to: ${response.promptFeedback.blockReason}`);
    console.error(`Block reason details: ${response.promptFeedback.blockReasonMessage}`);
    throw new Error(`Content blocked by safety settings: ${response.promptFeedback.blockReason}`);
  }
  if (response.candidates?.[0]?.finishReason && response.candidates[0].finishReason !== "STOP") {
    console.warn(`Gemini generation finished unexpectedly: ${response.candidates[0].finishReason}`);
    console.warn(`Finish message: ${response.candidates[0].finishMessage}`);
  }

  const text = response.text();
  console.log("Gemini video rename response:\n", text);
  
  try {
    let jsonText = text;
    if (text.includes('```json')) {
      const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) jsonText = jsonMatch[1].trim();
    } else if (text.includes('```')) {
      const jsonMatch = text.match(/```\s*([\s\S]*?)\s*```/);
      if (jsonMatch) jsonText = jsonMatch[1].trim();
    }
    const renamedVideos = JSON.parse(jsonText);
    return renamedVideos;
  } catch (parseError) {
    console.error("Failed to parse Gemini video rename response as JSON:", parseError);
    console.error("Raw response:", text);
    const fallback: Record<string, string> = {};
    videos.forEach((video) => {
      fallback[video.title] = video.title;
    });
    return fallback;
  }
} catch (error) {
  if (error instanceof Error) {
    console.error("Error calling Gemini API for video rename:", error.message);
    console.error(error.stack);
  } else {
    console.error("Unknown error calling Gemini API for video rename:", error);
  }
  throw new Error("Failed to get rename videos for Notion result from Gemini");
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
