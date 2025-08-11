import axios from 'axios';
import * as dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import { renameFilesForNotion, renameVideosForNotion, groupByWeek, FileData, VideoData } from './gemini';
import { renameFilesForNotionOpenAI, renameVideosForNotionOpenAI } from './openai';

dotenv.config();

// Helper function to determine which AI service to use
function getAIService() {
  const useOpenAI = process.env.USE_OPENAI === 'true';
  const hasOpenAIKey = process.env.OPENAI_API_KEY;
  const hasGeminiKey = process.env.GOOGLE_API_KEY;
  
  if (useOpenAI && hasOpenAIKey) {
    return 'openai';
  } else if (hasGeminiKey) {
    return 'gemini';
  }
  return 'none';
}

// Helper function to construct GCP URLs like the frontend does
function constructGCPFileURL(file: any): string {
  // Canvas files use s3_key (after processing) or key (frontend files) for GCP path
  const gcpKey = file.s3_key || file.key;
  if (!gcpKey) return file.url || '';
  
  const urlOverride = process.env.NEXT_PUBLIC_GCP_BUCKET_URL_OVERRIDE;
  const bucketURLOverwritten = urlOverride !== undefined && urlOverride !== "";
  
  // Import encodeGCPURI functionality inline since we can't import from lib/utils
  const encodeGCPURI = (filename: string) => {
    const encodings = {
      "+": "%2B",
      "!": "%21",
      '"': "%22",
      "#": "%23",
      $: "%24",
      "&": "%26",
      "'": "_", // changed for GCP
      "(": "%28",
      ")": "%29",
      "*": "%2A",
      ",": "%2C",
      ":": "%3A", // changed for GCP
      ";": "%3B",
      "=": "%3D",
      "?": "%3F",
      "@": "%40",
    };
    return encodeURI(filename)
      .replace(/(\+|!|"|#|\$|&|'|\(|\)|\*|\+|,|:|;|=|\?|@)/gim, function (match) {
        return encodings[match];
      });
  };

  const bucketFileURL = bucketURLOverwritten
    ? `${urlOverride}${encodeGCPURI(gcpKey)}`
    : `https://docs.coursetexts.org/${encodeGCPURI(gcpKey)}`;

  // Use the same fallback logic as frontend: file.url || bucketFileURL
  return file.url || bucketFileURL;
}

interface NotionPagePayload {
  parent: {
    page_id: string;
  };
  icon?: {
    emoji: string;
  };
  cover?: {
    external: {
      url: string;
    };
  };
  properties: {
    title: Array<{
      text: {
        content: string;
      };
    }>;
  };
  children?: Array<any>;
}

export async function createNotionPage(payload: NotionPagePayload) {
  try {
    const response = await axios.post('https://api.notion.com/v1/pages', payload, {
      headers: {
        'Authorization': `Bearer ${process.env.NOTION_TOKEN}`,
        'Content-Type': 'application/json',
        'Notion-Version': process.env.NOTION_VERSION
      }
    });

    console.log('Notion page created successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating Notion page:', error.message || error.status);
    throw error;
  }
}

// Function to create a comprehensive course page with videos
export async function createOrUpdateCourseNotionPage(courseCode: string) {
  const prisma = new PrismaClient();
  
  try {
    // Get course data with all relations
    const course = await prisma.course.findFirst({
      where: { courseCode },
      include: {
        subject: true,
        instructors: true,
        modules: {
          include: {
            files: true,
            assignments: {
              include: {
                files: true
              }
            }
          },
          orderBy: { position: 'asc' }
        },
        pages: true,
        videos: true
      }
    });

    if (!course) {
      throw new Error(`Course not found: ${courseCode}`);
    }

    // Create course title
    const courseTitle = `${course.title} (${course.courseCode})`;
    
    // Build content blocks
    const blocks: Array<any> = [];
    
    // Course overview section
    blocks.push({
      object: "block",
      type: "paragraph",
      paragraph: {
        rich_text: [
          {
            type: "text",
            text: {
              content: course.instructors?.[0]?.name || 'Instructor',
              link: course.instructors?.[0]?.email ? {
                url: `mailto:${course.instructors[0].email}`
              } : undefined
            },
            annotations: {
              color: "gray"
            }
          },
          {
            type: "text",
            text: {
              content: ` | ${course.semester} | Harvard University`
            },
            annotations: {
              color: "gray"
            }
          }
        ]
      }
    });

    // Course description
    if (course.description) {
      blocks.push({
        object: "block",
        type: "paragraph",
        paragraph: {
          rich_text: [
            {
              type: "text",
              text: {
                content: course.description
              }
            }
          ]
        }
      });
    }

    // Collect all files from all modules for week-based organization
    const allCourseFiles: any[] = [];
    const allAssignments: any[] = [];
    
    for (const module of course.modules) {
      // Add module files
      allCourseFiles.push(...module.files);
      
      // Add assignment files
      if (module.assignments) {
        module.assignments.forEach((assignment: any) => {
          if (assignment.files) {
            allAssignments.push(...assignment.files);
          }
        });
      }
    }
    
    // Filter main files (excluding assignments)
    const mainFiles = allCourseFiles.filter(file => 
      (file.type === "main" || file.type === "file" || file.type === "page" || file.type === "assignmentmain") &&
      !(file.type === "assignment" || file.type === "assignmentsupplementary")
    );
    
    // Use AI to rename files and videos if available (do this BEFORE grouping so grouping uses renamed titles)
    let renamedFiles: Record<string, string> = {};
    let renamedVideos: Record<string, string> = {};
    const aiService = getAIService();
    
    if (aiService !== 'none') {
      try {
        // Rename files
        if (mainFiles.length > 0) {
          const fileData: FileData[] = mainFiles.map(file => ({
            displayName: file.displayName,
            type: file.type,
            url: file.url
          }));
          
          if (aiService === 'openai') {
            renamedFiles = await renameFilesForNotionOpenAI(fileData);
          } else {
            renamedFiles = await renameFilesForNotion(fileData);
          }
        }
        
        // Rename videos
        if (course.videos && course.videos.length > 0) {
          console.log(`🤖 Using ${aiService.toUpperCase()} to rename ${course.videos.length} videos for course ${courseCode}`);
          const videoData: VideoData[] = course.videos.map((video: any) => ({
            title: video.title,
            url: video.url
          }));
          
          if (aiService === 'openai') {
            renamedVideos = await renameVideosForNotionOpenAI(videoData);
          } else {
            renamedVideos = await renameVideosForNotion(videoData);
          }
        }
      } catch (error) {
        console.warn(`⚠️ ${aiService.toUpperCase()} renaming failed, using original names:`, (error as any).message);
        // Fallback to original names
        mainFiles.forEach(file => {
          renamedFiles[file.displayName] = file.displayName.replace('.pdf', '');
        });
        course.videos?.forEach((video: any) => {
          renamedVideos[video.title] = video.title;
        });
      }
    } else {
      // No AI service available, use original names
      mainFiles.forEach(file => {
        renamedFiles[file.displayName] = file.displayName.replace('.pdf', '');
      });
      course.videos?.forEach((video: any) => {
        renamedVideos[video.title] = video.title;
      });
    }

    // Group content by weeks using renamed names for extraction
    const grouping = groupByWeek(mainFiles, course.videos || [], {
      fileNameMap: renamedFiles,
      videoTitleMap: renamedVideos
    });

    // Create week-based content sections
    if (grouping.weeks.length > 0) {
      grouping.weeks.forEach(weekGroup => {
        // Week heading
        blocks.push({
          object: "block",
          type: "heading_2",
          heading_2: {
            rich_text: [
              {
                type: "text",
                text: {
                  content: `Week ${weekGroup.weekNumber}`
                }
              }
            ]
          }
        });

        // Videos for this week
        weekGroup.videos.forEach((video: any) => {
          const displayTitle = renamedVideos[video.title] || video.title;
          blocks.push({
            object: "block",
            type: "bulleted_list_item",
            bulleted_list_item: {
              rich_text: [
                {
                  type: "text",
                  text: {
                    content: `📹 ${displayTitle}`,
                    link: {
                      url: video.url
                    }
                  }
                }
              ]
            }
          });
        });

        // Files for this week
        weekGroup.files.forEach((file: any) => {
          const displayName = renamedFiles[file.displayName] || file.displayName.replace('.pdf', '');
          blocks.push({
            object: "block",
            type: "bulleted_list_item",
            bulleted_list_item: {
              rich_text: [
                {
                  type: "text",
                  text: {
                    content: `📄 ${displayName}`,
                    link: {
                      url: constructGCPFileURL(file)
                    }
                  }
                }
              ]
            }
          });
        });
      });
    }

    // Supplementary (ungrouped) videos
    if (grouping.ungroupedVideos.length > 0) {
      blocks.push({
        object: "block",
        type: "heading_2",
        heading_2: {
          rich_text: [
            { type: "text", text: { content: "Supplementary Videos" } }
          ]
        }
      });

      grouping.ungroupedVideos.forEach((video: any) => {
        const displayTitle = renamedVideos[video.title] || video.title;
        blocks.push({
          object: "block",
          type: "bulleted_list_item",
          bulleted_list_item: {
            rich_text: [
              { type: "text", text: { content: `📹 ${displayTitle}`, link: { url: video.url } } }
            ]
          }
        });
      });
    }

    // Supplementary (ungrouped) files
    if (grouping.ungroupedFiles.length > 0) {
      blocks.push({
        object: "block",
        type: "heading_2",
        heading_2: {
          rich_text: [
            { type: "text", text: { content: "Supplementary Files" } }
          ]
        }
      });

      grouping.ungroupedFiles.forEach((file: any) => {
        const displayName = renamedFiles[file.displayName] || file.displayName.replace('.pdf', '');
        blocks.push({
          object: "block",
          type: "bulleted_list_item",
          bulleted_list_item: {
            rich_text: [
              { type: "text", text: { content: `📄 ${displayName}`, link: { url: constructGCPFileURL(file) } } }
            ]
          }
        });
      });
    }

    // Add assignments section at the end (existing logic)
    if (allAssignments.length > 0) {
      blocks.push({
        object: "block",
        type: "heading_2",
        heading_2: {
          rich_text: [
            {
              type: "text",
              text: {
                content: "Assignments"
              }
            }
          ]
        }
      });

      allAssignments.forEach((file: any) => {
        blocks.push({
          object: "block",
          type: "bulleted_list_item",
          bulleted_list_item: {
            rich_text: [
              {
                type: "text",
                text: {
                  content: `📋 ${file.displayName.replace('.pdf', '')}`,
                  link: {
                    url: constructGCPFileURL(file)
                  }
                }
              }
            ]
          }
        });
      });
    }

    // Create the Notion page
    const payload: NotionPagePayload = {
      parent: {
        page_id: process.env.NOTION_PARENT_PAGE_ID || ""
      },
      icon: {
        emoji: "📚"
      },
      properties: {
        title: [
          {
            text: {
              content: courseTitle
            }
          }
        ]
      },
      children: blocks
    };

    const notionPage = await createNotionPage(payload);
    console.log(`Notion page created/updated for ${courseCode}:`, notionPage.url);
    
    return notionPage;
  } catch (error) {
    console.error(`Error creating/updating Notion page for ${courseCode}:`, error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
} 