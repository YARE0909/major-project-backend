import type { NextFunction, Request, Response } from "express";
import { verifyJwt } from "../utils/jwt";

export interface AuthRequest extends Request {
  userId?: string;
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: "Missing Authorization header" });
  const parts = auth.split(" ");
  if (parts.length !== 2) return res.status(401).json({ error: "Invalid Authorization header" });

  const token = parts[1];
  const decoded = verifyJwt(token!);
  if (!decoded || typeof decoded === "string") return res.status(401).json({ error: "Invalid or expired token" });

  // assuming payload had userId
  // @ts-ignore
  req.userId = (decoded as any).userId;
  next();
};
