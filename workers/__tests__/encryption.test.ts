process.env.ENCRYPTION_KEY = 'test-encryption-key-12345';
process.env.ENCRYPTION_SALT = 'test-salt-12345';

import { describe, beforeAll, it, expect } from "@jest/globals";
import { encrypt, decrypt } from "../encryption";

describe("Encryption Utility", () => {
  it("should encrypt and decrypt a string successfully", async () => {
    const sampleText = "Hello, this is a test string!";

    const encrypted = await encrypt(sampleText);
    expect(encrypted).toBeTruthy();
    expect(typeof encrypted).toBe("string");
    expect(encrypted.includes(':')).toBe(true);

    const decrypted = await decrypt(encrypted);
    expect(decrypted).toEqual(sampleText);
    // expect(decrypted).toBe(sampleText);
  });

  it('should handle empty strings', async () => {
    const emptyText = '';
    
    const encrypted = await encrypt(emptyText);
    const decrypted = await decrypt(encrypted!);
    
    expect(decrypted).toBe(emptyText);
  });

  it('should handle special characters', async () => {
    const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?`~';
    
    const encrypted = await encrypt(specialChars);
    const decrypted = await decrypt(encrypted!);
    
    expect(decrypted).toBe(specialChars);
  });

  it('should generate different encrypted values for the same input', async () => {
    const text = 'Same text';
    
    const encrypted1 = await encrypt(text);
    const encrypted2 = await encrypt(text);
    
    expect(encrypted1).not.toBe(encrypted2);
  });

  it('should handle error cases', async () => {
    // Test invalid encrypted text format
    await expect(decrypt('invalid-format')).rejects.toThrow();
    
    // Test undefined input
    await expect(decrypt(undefined as any)).rejects.toThrow();
    
    // Test malformed encrypted text
    await expect(decrypt('abc:def')).rejects.toThrow();
  });
});
