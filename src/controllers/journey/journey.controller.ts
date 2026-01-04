import type { Response } from "express";
import type { AuthRequest } from "../../middlewares/auth.middleware";
import { createJourneyFromRouteService, getJourneyByIdService, planJourneyService } from "../../services/journey/journey.service";

export const createJourneyController = async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  const { selectedRoute } = req.body;

  if (!selectedRoute) {
    return res.status(400).json({ error: "selectedRoute required" });
  }

  const journey = await createJourneyFromRouteService(
    userId,
    selectedRoute
  );

  res.json({ journeyId: journey.id });
};

export const planJourneyController = async (req: AuthRequest, res: Response) => {
  try {
    const { source, destination } = req.body;
    if (!source || !destination)
      return res.status(400).json({ error: "source and destination required" });
    const routes = await planJourneyService(source, destination);
    res.json({ routes });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to plan journey" });
  }
};

export const getJourneyController = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id;
    const journey = await getJourneyByIdService(id!);
    if (!journey) return res.status(404).json({ error: "Journey not found" });
    res.json({ journey });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to fetch journey" });
  }
};