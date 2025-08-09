import OpenAI from "openai";

// Ensure your OpenAI API Key is correctly set in environment variables
if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY environment variable not set.");
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
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

async function renameFilesForNotionOpenAI(files: FileData[]) {
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
    console.log("Sending request to OpenAI model...");
    const response = await openai.chat.completions.create({
      model: "gpt-4.1",
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 1000
    });

    if (!response.choices || response.choices.length === 0) {
      throw new Error("No response received from OpenAI model.");
    }

    const text = response.choices[0].message.content;
    console.log("OpenAI response:", text);
    
    // Parse the JSON response - handle markdown code blocks
    try {
      // Extract JSON from markdown code blocks if present
      let jsonText = text || '';
      if (text && text.includes('```json')) {
        const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          jsonText = jsonMatch[1].trim();
        }
      } else if (text && text.includes('```')) {
        // Handle generic code blocks
        const jsonMatch = text.match(/```\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          jsonText = jsonMatch[1].trim();
        }
      }
      
      const renamedFiles = JSON.parse(jsonText);
      return renamedFiles;
    } catch (parseError) {
      console.error("Failed to parse OpenAI response as JSON:", parseError);
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
      console.error("Error calling OpenAI API:", error.message);
      console.error(error.stack);
    } else {
      console.error("Unknown error calling OpenAI API:", error);
    }
    throw new Error("Failed to get rename files for Notion result from OpenAI");
  }
}

async function renameVideosForNotionOpenAI(videos: VideoData[]) {
  const videoList = videos.map(video => `${video.title} (${video.url})`).join('\n');
  
  const prompt = `
  Rename the following video titles to readable names according to the lecture content, date, and topic. These are lecture videos from universities like Harvard and MIT. Use the internet to name the videos appropriately.

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
    console.log("Sending video rename request to OpenAI model...");
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 1000
    });

    if (!response.choices || response.choices.length === 0) {
      throw new Error("No response received from OpenAI model.");
    }

    const text = response.choices[0].message.content;
    console.log("OpenAI video rename response:", text);
    
    // Parse the JSON response - handle markdown code blocks
    try {
      // Extract JSON from markdown code blocks if present
      let jsonText = text || '';
      if (text && text.includes('```json')) {
        const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          jsonText = jsonMatch[1].trim();
        }
      } else if (text && text.includes('```')) {
        // Handle generic code blocks
        const jsonMatch = text.match(/```\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          jsonText = jsonMatch[1].trim();
        }
      }
      
      const renamedVideos = JSON.parse(jsonText);
      return renamedVideos;
    } catch (parseError) {
      console.error("Failed to parse OpenAI video rename response as JSON:", parseError);
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
      console.error("Error calling OpenAI API for video rename:", error.message);
      console.error(error.stack);
    } else {
      console.error("Unknown error calling OpenAI API for video rename:", error);
    }
    throw new Error("Failed to get rename videos for Notion result from OpenAI");
  }
}

export { renameFilesForNotionOpenAI, renameVideosForNotionOpenAI };
export type { FileData, VideoData };