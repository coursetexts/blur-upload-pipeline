import axios from 'axios';
import * as dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

dotenv.config();

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

    // Videos section (if any exist)
    if (course.videos && course.videos.length > 0) {
      blocks.push({
        object: "block",
        type: "heading_2",
        heading_2: {
          rich_text: [
            {
              type: "text",
              text: {
                content: "Videos"
              }
            }
          ]
        }
      });

      course.videos.forEach((video: any) => {
        blocks.push({
          object: "block",
          type: "bulleted_list_item",
          bulleted_list_item: {
            rich_text: [
              {
                type: "text",
                text: {
                  content: video.title,
                  link: {
                    url: video.url
                  }
                }
              }
            ]
          }
        });
      });
    }

    // Lecture Notes section
    blocks.push({
      object: "block",
      type: "heading_2",
      heading_2: {
        rich_text: [
          {
            type: "text",
            text: {
              content: "Lecture Notes"
            }
          }
        ]
      }
    });

    // Process modules (similar to frontend ModuleComponent)
    const sortedModules = course.modules.sort((a, b) => a.position - b.position);
    
    sortedModules.forEach((module: any) => {
      // Skip default module heading
      if (module.name !== "Default") {
        blocks.push({
          object: "block",
          type: "heading_3",
          heading_3: {
            rich_text: [
              {
                type: "text",
                text: {
                  content: module.name
                }
              }
            ]
          }
        });
      }

      // Process files similar to frontend Files component
      const allFiles = [...module.files];
      
      // Add assignment files
      if (module.assignments) {
        module.assignments.forEach((assignment: any) => {
          if (assignment.files) {
            allFiles.push(...assignment.files);
          }
        });
      }

      // Sort files by position
      const sortedFiles = allFiles.sort((a, b) => a.position - b.position);
      
      // Group files by type (similar to frontend logic)
      const mainFiles = sortedFiles.filter(file => 
        file.type === "main" || file.type === "file" || file.type === "page" || file.type === "assignmentmain"
      );
      const supplementaryFiles = sortedFiles.filter(file => 
        file.type === "supplementary" || file.type === "assignmentsupplementary"
      );
      const assignmentFiles = sortedFiles.filter(file => 
        file.type === "assignment"
      );

      // Add main files
      mainFiles.forEach((file: any) => {
        blocks.push({
          object: "block",
          type: "bulleted_list_item",
          bulleted_list_item: {
            rich_text: [
              {
                type: "text",
                text: {
                  content: file.displayName.replace('.pdf', ''),
                  link: {
                    url: constructGCPFileURL(file)
                  }
                }
              }
            ]
          }
        });
      });

      // Add supplementary files
      if (supplementaryFiles.length > 0) {
        blocks.push({
          object: "block",
          type: "paragraph",
          paragraph: {
            rich_text: [
              {
                type: "text",
                text: {
                  content: "Supplementary"
                },
                annotations: {
                  italic: true
                }
              }
            ]
          }
        });

        supplementaryFiles.forEach((file: any) => {
          blocks.push({
            object: "block",
            type: "bulleted_list_item",
            bulleted_list_item: {
              rich_text: [
                {
                  type: "text",
                  text: {
                    content: file.displayName.replace('.pdf', ''),
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

      // Add assignment files
      if (assignmentFiles.length > 0) {
        blocks.push({
          object: "block",
          type: "paragraph",
          paragraph: {
            rich_text: [
              {
                type: "text",
                text: {
                  content: "Assignments"
                },
                annotations: {
                  italic: true
                }
              }
            ]
          }
        });

        assignmentFiles.forEach((file: any) => {
          blocks.push({
            object: "block",
            type: "bulleted_list_item",
            bulleted_list_item: {
              rich_text: [
                {
                  type: "text",
                  text: {
                    content: file.displayName.replace('.pdf', ''),
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
    });

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