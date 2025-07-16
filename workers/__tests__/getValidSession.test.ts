const mockFindFirst = jest.fn<any>();
jest.mock("@prisma/client", () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    tokens: {
      findFirst: mockFindFirst,
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

// jest.mock("../encryption");
jest.mock("../encryption", () => ({
  decrypt: jest.fn(),
}));

import { getValidSession } from "../youtube-worker";
import { decrypt } from "../encryption";

describe("getValidSession", () => {
  let prisma: any;

  const mockSession = {
    id: 1,
    accessToken: "encryptedAccessToken",
    refreshToken: "encryptedRefreshToken",
    userName: "Test User",
    userImage: "https://example.com/image.png",
    expiresAt: new Date(Date.now() + 3600000), // 1 hour from now
  };

  const mockDecryptedAccessToken = "decryptedAccessToken";
  const mockDecryptedRefreshToken = "decryptedRefreshToken";

  beforeEach(() => {
    jest.clearAllMocks();

    // Set up the mock response
    mockFindFirst.mockResolvedValue(mockSession);

    // Mock decrypt function
    (decrypt as jest.Mock).mockImplementation((token: string) => {
      if (token === "encryptedAccessToken") return mockDecryptedAccessToken;
      if (token === "encryptedRefreshToken") return mockDecryptedRefreshToken;
      return null;
    });
  });

  it("should fetch a valid session, decrypt tokens, and return session details", async () => {
    const session = await getValidSession();

    expect(session).toEqual({
      accessToken: mockDecryptedAccessToken,
      refreshToken: mockDecryptedRefreshToken,
      user: {
        name: mockSession.userName,
        image: mockSession.userImage,
      },
      expires: mockSession.expiresAt.toISOString(),
    });

    expect(mockFindFirst).toHaveBeenCalledTimes(1);
    expect(mockFindFirst).toHaveBeenCalledWith({
      where: { expiresAt: { gt: expect.any(Date) } },
    });
    expect(decrypt).toHaveBeenCalledWith("encryptedAccessToken");
    expect(decrypt).toHaveBeenCalledWith("encryptedRefreshToken");
  });

  it("should throw an error if no valid session is found", async () => {
    // Use the mockFindFirst reference to return null
    mockFindFirst.mockResolvedValue(null);


    await expect(getValidSession()).rejects.toThrow("No valid session found");

    expect(mockFindFirst).toHaveBeenCalledTimes(1);
    expect(decrypt).not.toHaveBeenCalled();
  });
});
