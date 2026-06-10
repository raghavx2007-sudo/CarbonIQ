import { hashPassword, verifyPassword, signToken, verifyToken } from "../lib/security/auth";
import { registerSchema, loginSchema } from "../lib/validators/auth";

describe("Security & Validation Module", () => {
  describe("Password Hashing", () => {
    it("should hash a password and verify it correctly", async () => {
      const password = "SecurePassword123";
      const hash = await hashPassword(password);
      
      expect(hash).not.toBe(password);
      
      const isValid = await verifyPassword(password, hash);
      expect(isValid).toBe(true);
      
      const isInvalid = await verifyPassword("WrongPassword123", hash);
      expect(isInvalid).toBe(false);
    });
  });

  describe("JWT Tokens", () => {
    it("should sign and verify a JWT correctly", async () => {
      const payload = { userId: "user-123", email: "test@example.com" };
      const token = await signToken(payload);
      
      expect(typeof token).toBe("string");
      
      const decoded = await verifyToken(token);
      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.email).toBe(payload.email);
    });
    
    it("should fail to verify an invalid token", async () => {
      await expect(verifyToken("invalid.token.string")).rejects.toThrow("Invalid or expired token");
    });
  });

  describe("Zod Validation Schemas", () => {
    it("should validate correct registration data", () => {
      const validData = {
        email: "test@example.com",
        password: "Valid1Password",
      };
      const result = registerSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject weak passwords", () => {
      const weakData = {
        email: "test@example.com",
        password: "weak", // too short, no numbers, no uppercase
      };
      const result = registerSchema.safeParse(weakData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const errors = result.error.errors.map(e => e.message);
        expect(errors).toContain("Password must be at least 8 characters long");
      }
    });

    it("should validate correct login data", () => {
      const validData = {
        email: "test@example.com",
        password: "SomePassword", // Login doesn't enforce strength, just existence
      };
      const result = loginSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });
});
