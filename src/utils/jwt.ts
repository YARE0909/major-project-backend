import jwt from "jsonwebtoken";
import type { JwtPayload, Secret, SignOptions } from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET: Secret = process.env.JWT_SECRET || "change_this_secret";

export const signJwt = (
  payload: JwtPayload | object,
  expiresIn: SignOptions["expiresIn"] = "7d"
): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
};

export const verifyJwt = (token: string): JwtPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
};
