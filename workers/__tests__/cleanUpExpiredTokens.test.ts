const mockDeleteMany = jest.fn<any>();
jest.mock("@prisma/client", () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    tokens: {
      deleteMany: mockDeleteMany,
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

import { cleanUpExpiredTokens } from "../youtube-worker";

describe("cleanUpExpiredTokens", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should delete expired tokens", async () => {
    mockDeleteMany.mockResolvedValue({ count: 3 });

    await cleanUpExpiredTokens();

    expect(mockDeleteMany).toHaveBeenCalledWith({
      where: {
        expiresAt: { lt: expect.any(Date) },
      },
    });
  });
});