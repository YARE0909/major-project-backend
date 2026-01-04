import { prisma } from "../../prismaClient";
import { geocode } from "../geocode/geocode.service";
import { getRoadRoute } from "../osrm/osrm.service";
import hydrateLegCoords from "../../utils/hydrateLegCoords";
import { aiService } from "../../ai/AIService";
import { resolveLocation } from "../../ai/locationResolver";

export const createJourneyFromRouteService = async (
  userId: string,
  selectedRoute: any
) => {
  const { legs, totalCost, totalTime } = selectedRoute;

  const journey = await prisma.journey.create({
    data: {
      userId,
      status: "PLANNED",
      totalCost,
      totalTime,
      legs: {
        create: legs.map((leg: any, idx: number) => ({
          mode: leg.mode,
          source: leg.source,
          destination: leg.destination,
          duration: leg.duration,
          cost: leg.cost,
          order: idx + 1,
        })),
      },
    },
  });

  return journey;
};

export const planJourneyService = async (
  source: string,
  destination: string
) => {
  const aiPlan = await aiService.planRoutes({
    source,
    destination,
    availableModes: ["WALK", "AUTO", "METRO", "BUS", "TRAIN"],
  });

  if (!Array.isArray(aiPlan.routes)) {
    throw new Error("AI response malformed");
  }

  const routes = [];

  console.log("AI Plan:", JSON.stringify(aiPlan, null, 2));

  for (const aiRoute of aiPlan.routes) {
    const legs = [];

    for (const leg of aiRoute.legs) {
      const from = await resolveLocation(leg.from, source, destination);
      const to = await resolveLocation(leg.to, source, destination);

      let duration = 0;
      let cost = 0;

      if (leg.mode === "WALK") {
        duration = 5;
        cost = 0;
      } else {
        const road = await getRoadRoute(from, to);

        switch (leg.mode) {
          case "AUTO":
            duration = road.duration;
            cost = Math.round(road.distance * 18);
            break;

          case "METRO":
            duration = road.duration;
            cost = 50;
            break;

          case "BUS":
            duration = road.duration;
            cost = 30;
            break;

          case "TRAIN":
            duration = Math.max(15, Math.round(road.duration * 0.7));
            cost = 20;
            break;
        }
      }

      legs.push({
        mode: leg.mode,
        source: from.displayName,
        destination: to.displayName,
        fromCoords: from,
        toCoords: to,
        duration,
        cost,
      });
    }

    routes.push({
      id: crypto.randomUUID(),
      name: aiRoute.name,
      source,
      destination,
      legs,
      totalTime: legs.reduce((s, l) => s + l.duration, 0),
      totalCost: legs.reduce((s, l) => s + l.cost, 0),
    });
  }

  return routes;
};

export const getJourneyByIdService = async (journeyId: string) => {
  const journey = await prisma.journey.findUnique({
    where: { id: journeyId },
    include: {
      legs: {
        orderBy: { order: "asc" },
        include: {
          travelPass: true,
          ticket: true,
        },
      },
      booking: true,
    },
  });

  if (!journey) return null;

  const hydratedLegs = await hydrateLegCoords(journey.legs);

  return {
    ...journey,
    legs: hydratedLegs,
  };
};
