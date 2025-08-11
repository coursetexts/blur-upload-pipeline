import OpenAI from "openai";

// Ensure your OpenAI API Key is correctly set in environment variables
if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY environment variable not set.");
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const gptModel = "gpt-5";
const fallbackChatModel = process.env.OPENAI_FALLBACK_MODEL || "gpt-4.1";

interface FileData {
  displayName: string;
  type: string;
  url?: string;
}

interface VideoData {
  title: string;
  url: string;
}

// Helper: extract text from Responses API (GPT-5) shape
function extractTextFromResponses(resp: any): string | undefined {
  try {
    if (resp?.output && Array.isArray(resp.output)) {
      const messageOutput = (resp.output as any[]).find((item: any) => item.type === "message");
      if (messageOutput?.content && Array.isArray(messageOutput.content)) {
        const textContent = messageOutput.content.find((c: any) => c.type === "output_text");
        if (typeof textContent?.text === "string") return textContent.text as string;
        // Some SDKs: { type: 'text', text: '...' }
        const plainText = messageOutput.content.find((c: any) => c.type === "text" && typeof c.text === "string");
        if (plainText?.text) return plainText.text as string;
      }
    }
    if (typeof resp?.output_text === "string") return resp.output_text as string;
    if (resp?.content?.[0]?.text) return resp.content[0].text as string;
  } catch {}
  return undefined;
}

// Helper: extract text from Chat Completions shape
function extractTextFromChat(resp: any): string | undefined {
  try {
    const content = resp?.choices?.[0]?.message?.content;
    if (typeof content === "string") return content;
    if (Array.isArray(content)) {
      const firstText = content.find((p: any) => typeof p?.text === "string")?.text;
      if (firstText) return firstText;
    }
  } catch {}
  return undefined;
}

// Helper: parse JSON with code-fence tolerance
function parseJsonFromText(text: string, makeFallback: () => Record<string, string>): Record<string, string> {
  try {
    let jsonText = text || "";
    if (jsonText.includes("```json")) {
      const m = jsonText.match(/```json\s*([\s\S]*?)\s*```/);
      if (m) jsonText = m[1].trim();
    } else if (jsonText.includes("```")) {
      const m = jsonText.match(/```\s*([\s\S]*?)\s*```/);
      if (m) jsonText = m[1].trim();
    }
    return JSON.parse(jsonText);
  } catch (err) {
    console.error("Failed to parse model response as JSON:", err);
    console.error("Raw response:", text);
    return makeFallback();
  }
}

async function renameFilesForNotionOpenAI(files: FileData[]) {
  const fileList = files.map(file => `${file.displayName} (${file.type})`).join('\n');
  
  const prompt = `
You are helping organize a university course offered by a reputable university into weekly modules.

Rename the following lecture note files to a consistent, human-readable format:
- Always start with "Lecture N: " where N is the lecture number extracted from the filename if present.
- Check the internet for the course and use the official course website to infer the lecture number if available.
- If you cannot infer a lecture number, try to infer from a date in the filename; if the date clearly follows the previous one in sequence, assign number n+1.
- If you can access file contents, infer the lecture number from the contents.
- If you cannot reasonably infer a lecture number or date, do NOT invent one; use a clear descriptive title without a number.
- Keep titles concise and professional.
- Reply ONLY with a JSON object mapping original filenames to new titles. Do not include any markdown fences.

Files:\n${fileList}

Example JSON (no markdown fences):
{
  "Neuro130_2023_Lecture3.pdf": "Lecture 3: Synaptic Transmission and Neurotransmitters",
  "sample_HW_assignment.pdf": "Homework: Pattern Recognition"
}`;

  const makeFallback = () => {
    const map: Record<string, string> = {};
    files.forEach(f => { map[f.displayName] = f.displayName.replace('.pdf', ''); });
    return map;
  };

  try {
    console.log("Sending request to OpenAI Responses API (files)...");
    const response = await openai.responses.create({
      model: gptModel,
      input: prompt,
      max_output_tokens: 1000,
    });

    let text = extractTextFromResponses(response);

    // Fallback to Chat Completions if needed
    if (!text) {
      console.log(`No text from Responses API. Falling back to Chat Completions (${fallbackChatModel}) (files)...`);
      const chatResp = await openai.chat.completions.create({
        model: fallbackChatModel,
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1000,
        temperature: 0.3,
      });
      text = extractTextFromChat(chatResp);
    }

    if (!text) {
      throw new Error("No text output received from OpenAI APIs (files).");
    }

    console.log("OpenAI (files) response:", text);
    return parseJsonFromText(text, makeFallback);
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error calling OpenAI APIs (files):", error.message);
      console.error(error.stack);
    } else {
      console.error("Unknown error calling OpenAI APIs (files):", error);
    }
    return makeFallback();
  }
}

async function renameVideosForNotionOpenAI(videos: VideoData[]) {
  const videoList = videos.map(video => `${video.title} (${video.url})`).join('\n');
  
  const prompt = `
You are helping organize a university course offered by a reputable university into weekly modules.

Rename the following lecture video titles to a consistent, human-readable format:
- Always start with "Lecture N: " where N is the lecture number extracted from the title if present (e.g., "Lec 02" => N=2).
- Check the internet for the course and use the official course website to infer the lecture number if available.
- If you cannot infer a lecture number, try to infer from a date in the title; if the date clearly follows the previous one in sequence, assign number n+1.
- If you can access video contents, infer the lecture number from the contents.
- If you cannot reasonably infer a lecture number or date, do NOT invent one; use a clear descriptive title without a number.
- Keep titles concise and professional.
- Reply ONLY with a JSON object mapping original titles to new titles. Do not include any markdown fences.

Videos:\n${videoList}

Example JSON (no markdown fences):
{
  "neurobio - bebd1df9-956c-4c0e-8c72-aaca0158db47": "Lecture 1: Introduction to Neurobiology",
  "20191007_neurobio - 4888c9e8-2c6c-4927-a9f3-aadf015c9e43": "Lecture 3: Action Potentials"
}`;

  const makeFallback = () => {
    const map: Record<string, string> = {};
    videos.forEach(v => { map[v.title] = v.title; });
    return map;
  };

  try {
    console.log("Sending request to OpenAI Responses API (videos)...");
    const response = await openai.responses.create({
      model: gptModel,
      input: prompt,
      max_output_tokens: 1000,
    });

    let text = extractTextFromResponses(response);

    // Fallback to Chat Completions if needed
    if (!text) {
      console.log(`No text from Responses API. Falling back to Chat Completions (${fallbackChatModel}) (videos)...`);
      const chatResp = await openai.chat.completions.create({
        model: fallbackChatModel,
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1000,
        temperature: 0.3,
      });
      text = extractTextFromChat(chatResp);
    }

    if (!text) {
      throw new Error("No text output received from OpenAI APIs (videos).");
    }

    console.log("OpenAI video rename response:", text);
    return parseJsonFromText(text, makeFallback);
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error calling OpenAI APIs (videos):", error.message);
      console.error(error.stack);
    } else {
      console.error("Unknown error calling OpenAI APIs (videos):", error);
    }
    return makeFallback();
  }
}

export { renameFilesForNotionOpenAI, renameVideosForNotionOpenAI };
export type { FileData, VideoData };