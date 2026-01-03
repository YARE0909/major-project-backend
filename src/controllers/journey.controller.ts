import type { Request, Response } from "express";
import * as JourneyService from "../services/journey.service";
import type { AuthRequest } from "../middlewares/auth.middleware";

export const planJourney = async (req: AuthRequest, res: Response) => {
  try {
    const { source, destination } = req.body;
    if (!source || !destination) return res.status(400).json({ error: "source and destination required" });
    const routes = await JourneyService.planJourney(source, destination);
    res.json({ routes });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to plan journey" });
  }
};

export const bookJourney = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { selectedRoute } = req.body;
    if (!selectedRoute) return res.status(400).json({ error: "selectedRoute required" });

    const bookingResult = await JourneyService.bookJourney(userId, selectedRoute);
    res.json(bookingResult);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to book journey" });
  }
};

export const getJourney = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id;
    const journey = await JourneyService.getJourneyById(id!);
    if (!journey) return res.status(404).json({ error: "Journey not found" });
    res.json({ journey });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to fetch journey" });
  }
};

export const replanJourney = async (req: AuthRequest, res: Response) => {
  try {
    const { journeyId, failedLegOrder } = req.body;
    if (!journeyId || typeof failedLegOrder !== "number") return res.status(400).json({ error: "journeyId and failedLegOrder required" });

    const updated = await JourneyService.replanJourney(journeyId, failedLegOrder);
    res.json({ journey: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Replan failed" });
  }
};
