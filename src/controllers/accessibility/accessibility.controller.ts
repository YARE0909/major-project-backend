// controllers/accessibility.controller.ts
import type { Response } from "express";
import type { AuthRequest } from "../../middlewares/auth.middleware";
import {
  getUserAccessibilityProfile,
  upsertUserAccessibilityProfile,
} from "../../services/userAccessibility/userAccessibility.service";

export const getAccessibilityController = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const profile = await getUserAccessibilityProfile(userId);
    res.json({ profile });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to fetch profile" });
  }
};

export const setAccessibilityController = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { wheelchair, blind, deaf, cognitive, fatigue } = req.body;

    const profile = await upsertUserAccessibilityProfile(userId, {
      wheelchair,
      blind,
      deaf,
      cognitive,
      fatigue,
    });

    res.json({ profile });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to save profile" });
  }
};