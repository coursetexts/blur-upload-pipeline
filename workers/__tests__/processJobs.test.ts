import { log, error } from "console";


// Separate mock functions for different queries
const mockTokensFindFirst = jest.fn<any>();
const mockCourseFindFirst = jest.fn<any>();
const mockFindMany = jest.fn<any>();
const mockUpdate = jest.fn<any>();
const mockCreate = jest.fn<any>();

jest.mock("@prisma/client", () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    job: {
      findMany: mockFindMany,
      update: mockUpdate,
    },
    course: {
      findFirst: mockCourseFindFirst,
    },
    video: {
      create: mockCreate,
    },
    tokens: {
      findFirst: mockTokensFindFirst,
    },
  })),
}));

import { beforeEach, describe, expect, it, jest } from "@jest/globals";

// Mock worker_threads before importing the worker
jest.mock("node:worker_threads", () => ({
  parentPort: {
    on: jest.fn(),
  },
}));

// Mock dependencies
jest.mock("../youtube", () => ({
  uploadWithRetry: jest.fn(),
  searchYouTubeVideos: jest.fn(),
}));

// jest.mock("../encryption");
jest.mock("../encryption", () => ({
  decrypt: jest.fn(),
}));

import { getValidSession } from "../youtube-worker";
import { decrypt } from "../encryption";
import { processJobs } from "../youtube-worker";
import { uploadWithRetry, searchYouTubeVideos } from "../youtube";

describe("processJobs", () => {
  const mockJobs = [
    {
      id: 1,
      status: "PENDING",
      videoUrl: "https://example.com/video1",
      fileName: "test-video-1",
      courseId: "MATH101",
      instructor: "Dr. Smith",
    },
    {
      id: 2,
      status: "PENDING",
      videoUrl: "https://example.com/video2",
      fileName: "test-video-2",
      courseId: "MATH102",
      instructor: "Dr. Jones",
    },
  ];

  const mockCourse = {
    id: "course-123",
    courseCode: "MATH101",
  };

  const mockUploadResult = {
    success: true,
    url: "https://youtube.com/watch?v=123",
    title: "Test Video",
    description: "Test Description",
  };

  const mockDecryptedAccessToken = "decryptedAccessToken";
  const mockDecryptedRefreshToken = "decryptedRefreshToken";

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Set up token session mock
    mockTokensFindFirst.mockResolvedValue({
      id: 1,
      accessToken: "encryptedAccessToken",
      refreshToken: "encryptedRefreshToken",
      userName: "Test User",
      userimage: "https://example.com/image.png",
      expiresAt: new Date(Date.now() + 3600000), // 1 hour from now
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Set up course mock
    mockCourseFindFirst.mockResolvedValue(mockCourse);

    // Mock decrypt function
    (decrypt as jest.Mock).mockImplementation((token: string) => {
      if (token === "encryptedAccessToken") return mockDecryptedAccessToken;
      if (token === "encryptedRefreshToken") return mockDecryptedRefreshToken;
      return null;
    });

    mockFindMany.mockResolvedValue(mockJobs);
    mockUpdate.mockResolvedValue({});
    mockCreate.mockResolvedValue({});
    (uploadWithRetry as jest.Mock<any>).mockResolvedValue(mockUploadResult);
    (searchYouTubeVideos as jest.Mock<any>).mockResolvedValue({
      exists: false,
    });
  });

  it("should process pending jobs and update their status", async () => {
    log("Starting test for processing pending jobs");

    await processJobs();

    // Verify session was fetched correctly
    expect(mockTokensFindFirst).toHaveBeenCalledWith({
      where: { expiresAt: { gt: expect.any(Date) } },
    });
    expect(decrypt).toHaveBeenCalledWith("encryptedAccessToken");
    expect(decrypt).toHaveBeenCalledWith("encryptedRefreshToken");
    
    // Should fetch pending jobs
    expect(mockFindMany).toHaveBeenCalledWith({
      where: { status: "PENDING" },
      take: 5,
    });

    // Should update job to IN_PROGRESS
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: mockJobs[0].id },
      data: { status: "IN_PROGRESS" },
    });

    // Should check if course exists
    expect(mockCourseFindFirst).toHaveBeenCalledWith({
      where: { courseCode: mockJobs[0].courseId },
    });

    // Should create video entry
    expect(mockCreate).toHaveBeenCalledWith({
      data: {
        title: mockUploadResult.title,
        description: mockUploadResult.description,
        url: mockUploadResult.url,
        courseId: mockCourse.id,
      },
    });

    // Should update job to COMPLETED
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: mockJobs[0].id },
      data: {
        status: "COMPLETED",
        videoUrl: mockUploadResult.url,
      },
    });

    log("Test for processing pending jobs completed");
  });

  it("should handle existing videos", async () => {
    const existingVideo = {
      exists: true,
      videos: [
        {
          title: "Existing Video",
          description: "Existing Description",
          url: "https://youtube.com/watch?v=existing",
        },
      ],
    };

    (searchYouTubeVideos as jest.Mock<any>).mockResolvedValue(existingVideo);

    await processJobs();

    expect(mockCreate).toHaveBeenCalledWith({
      data: {
        title: existingVideo.videos[0].title,
        description: existingVideo.videos[0].description,
        url: existingVideo.videos[0].url,
        courseId: mockCourse.id,
      },
    });

    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: mockJobs[0].id },
      data: {
        status: "COMPLETED",
        videoUrl: existingVideo.videos[0].url,
      },
    });
  });

  it("should mark job as failed when course does not exist", async () => {
    mockCourseFindFirst.mockResolvedValue(null);

    await processJobs();

    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: mockJobs[0].id },
      data: { status: "FAILED" },
    });
  });

  it("should mark job as failed when upload fails", async () => {
    const error = new Error("Upload failed");
    (uploadWithRetry as jest.Mock<any>).mockRejectedValue(error);

    await processJobs();

    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: mockJobs[0].id },
      data: { status: "FAILED" },
    });
  });
});
