import { jest } from "@jest/globals";

const prismaMock = {
  tokens: {
    findFirst: jest.fn(),
    deleteMany: jest.fn(),
  },
  job: {
    findMany: jest.fn(),
    update: jest.fn(),
  },
  course: {
    findUnique: jest.fn(),
  },
  video: {
    create: jest.fn(),
  },
};

const PrismaClient = jest.fn(() => prismaMock);

export { PrismaClient };
export default PrismaClient;
