import { prisma } from "../../prismaClient";
import { geocode } from "../geocode/geocode.service";
import { getRoadRoute } from "../osrm/osrm.service";
import hydrateLegCoords from "../../utils/hydrateLegCoords";

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

export const planJourneyService = async (source: string, destination: string) => {
  // 1️⃣ Geocode input locations
  const from = await geocode(source);
  const to = await geocode(destination);

  // 2️⃣ Get road distance + duration (OSRM)
  const auto = await getRoadRoute(from, to);

  const routes = [];

  // 🚕 AUTO DIRECT
  routes.push({
    id: "auto-direct",
    name: "Auto direct",
    source,
    destination,
    legs: [
      {
        mode: "AUTO",
        source,
        destination,
        fromCoords: from,
        toCoords: to,
        duration: auto.duration,
        cost: Math.round(auto.distance * 18),
      },
    ],
    totalTime: auto.duration,
    totalCost: Math.round(auto.distance * 18),
  });

  // 🚶 WALK + AUTO
  routes.push({
    id: "walk-auto",
    name: "Walk + Auto",
    source,
    destination,
    legs: [
      {
        mode: "WALK",
        source,
        destination,
        fromCoords: from,
        toCoords: to,
        duration: Math.round(auto.duration * 0.3),
        cost: 0,
      },
      {
        mode: "AUTO",
        source,
        destination,
        fromCoords: from,
        toCoords: to,
        duration: Math.round(auto.duration * 0.7),
        cost: Math.round(auto.distance * 15),
      },
    ],
    totalTime: auto.duration,
    totalCost: Math.round(auto.distance * 15),
  });

  // 🚇 METRO + AUTO (SIMULATED)
  routes.push({
    id: "metro-auto",
    name: "Metro + Auto",
    source,
    destination,
    legs: [
      {
        mode: "METRO",
        source,
        destination,
        fromCoords: from,
        toCoords: to,
        duration: Math.round(auto.duration * 0.6),
        cost: 50,
      },
      {
        mode: "AUTO",
        source,
        destination,
        fromCoords: from,
        toCoords: to,
        duration: Math.round(auto.duration * 0.4),
        cost: 150,
      },
    ],
    totalTime: auto.duration,
    totalCost: 200,
  });

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