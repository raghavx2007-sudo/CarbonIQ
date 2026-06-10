import * as bcrypt from "bcrypt";
import { SignJWT, jwtVerify } from "jose";

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is not set");
  }
  return new TextEncoder().encode(secret);
};

export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12; // High cost for security
  return await bcrypt.hash(password, saltRounds);
};

export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return await bcrypt.compare(password, hash);
};

export interface JwtPayload {
  userId: string;
  email: string;
  [key: string]: unknown;
}

export const signToken = async (payload: JwtPayload, expiresIn: string = "24h"): Promise<string> => {
  return new SignJWT(payload as any)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(getJwtSecret());
};

export const verifyToken = async (token: string): Promise<JwtPayload> => {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    return payload as unknown as JwtPayload;
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
};
