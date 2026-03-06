// services/journey/journey.service.ts
import { prisma } from "../../prismaClient";
import { geocode } from "../geocode/geocode.service";
import { getRoadRoute } from "../osrm/osrm.service";
import hydrateLegCoords from "../../utils/hydrateLegCoords";

export type UserAccessibilityProfileShape = {
  wheelchair?: boolean;
  blind?: boolean;
  deaf?: boolean;
  cognitive?: boolean;
  fatigue?: boolean;
};

type RawLeg = {
  mode: string;
  fromCoords: { lat: number; lon: number; displayName?: string };
  toCoords: { lat: number; lon: number; displayName?: string };
  duration: number; // minutes
  cost: number;
  source: string;
  destination: string;
};

function clamp01(n: number) {
  if (n < 0) return 0;
  if (n > 1) return 1;
  return n;
}

/**
 * Heuristic base reliability risk per transport mode.
 * Lower = more reliable baseline.
 * These are starting points — replace with real GTFS/RT statistics later.
 */
const BASE_MODE_RISK: Record<string, number> = {
  WALK: 0.02,
  AUTO: 0.06,
  METRO: 0.03,
  BUS: 0.08,
  TRAIN: 0.04,
  CAB: 0.06,
};

/**
 * Compute an accessibility score for a single leg.
 * Returns score 0..100 and a list of textual issues found.
 *
 * IMPORTANT: this is intentionally conservative and explainable.
 * Replace heuristics with real OSM / station data when available.
 */
function computeLegAccessibilityScore(
  leg: RawLeg,
  profile: UserAccessibilityProfileShape | null
) {
  let score = 100;
  const issues: string[] = [];

  const dur = leg.duration ?? 0;
  const mode = (leg.mode || "WALK").toUpperCase();

  /* ---------------- BASE INFRASTRUCTURE HEURISTICS ---------------- */

  // Long walking is difficult for everyone
  if (mode === "WALK") {
    if (dur >= 20) {
      score -= 30;
      issues.push("very_long_walk");
    } else if (dur >= 10) {
      score -= 15;
      issues.push("long_walk");
    }
  }

  // Autos & cabs require stepping in/out
  if (mode === "AUTO" || mode === "CAB") {
    score -= 5;
    issues.push("vehicle_step_entry");
  }

  // Metro/train stations may require stairs
  if (mode === "METRO" || mode === "TRAIN") {
    score -= 8;
    issues.push("station_navigation_required");
  }

  // Very long legs reduce accessibility
  if (dur >= 40) {
    score -= 10;
    issues.push("very_long_leg");
  }

  /* ---------------- PROFILE-SPECIFIC HEURISTICS ---------------- */

  if (profile?.wheelchair) {
    if (mode === "WALK") {
      if (dur >= 20) {
        score -= 40;
        issues.push("long_walk_for_wheelchair");
      } else if (dur >= 10) {
        score -= 20;
        issues.push("moderate_walk_for_wheelchair");
      }
    }

    if (mode === "METRO" || mode === "TRAIN") {
      score -= 15;
      issues.push("elevator_uncertain");
    }
  }

  if (profile?.blind) {
    if (mode === "WALK" && dur >= 15) {
      score -= 15;
      issues.push("long_walk_for_lowvision");
    }

    score -= 5;
    issues.push("limited_audio_guidance");
  }

  if (profile?.deaf) {
    score -= 5;
    issues.push("visual_alerts_uncertain");
  }

  if (profile?.cognitive) {
    if (dur >= 10) {
      score -= 10;
      issues.push("complex_leg_duration");
    }
  }

  if (profile?.fatigue) {
    if (mode === "WALK") {
      if (dur >= 20) {
        score -= 40;
        issues.push("excessive_walking_for_fatigue");
      } else if (dur >= 10) {
        score -= 20;
        issues.push("long_walk_for_fatigue");
      }
    }
  }

  score = Math.max(0, Math.min(100, Math.round(score)));

  return { score, issues };
}

/**
 * Combine leg accessibility score and base mode risk to compute final leg failure probability ∈ [0,1].
 *
 * - baseModeRisk: baseline chance of failure for that mode (delays, cancellations)
 * - accessibilityPenalty: (1 - score/100) factor amplified
 *
 * Tunable weights:
 *  - weightAccessibility (how much accessibility reduces chance of success)
 */
function computeLegFailureProbability(
  leg: RawLeg,
  accessibilityScore: number
): number {
  const mode = (leg.mode || "WALK").toUpperCase();
  const baseModeRisk = BASE_MODE_RISK[mode] ?? 0.06;

  // accessibility factor between 0 (perfect) and 1 (impossible)
  const accessFactor = 1 - accessibilityScore / 100;

  // combine: base risk plus amplified accessibility factor (tunable)
  const weightAccessibility = 0.6;
  const rawRisk = baseModeRisk + accessFactor * weightAccessibility;

  // walking long legs should increase risk slightly (already reflected in accessibilityScore)
  const risk = clamp01(rawRisk);

  return risk;
}

/**
 * Public API: create journey from route (unchanged)
 */
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

/**
 * Main planning service: returns candidate routes enriched with accessibility and failureRisk.
 *
 * Accepts optional userAccessibilityProfile. If null, treat as all-false profile (general population).
 */
export const planJourneyService = async (
  source: string,
  destination: string,
  userAccessibilityProfile: UserAccessibilityProfileShape | null = null
) => {
  // 1️⃣ Geocode input locations
  const from = await geocode(source);
  const to = await geocode(destination);

  // 2️⃣ Get road distance + duration (OSRM)
  const auto = await getRoadRoute(from, to);

  const makeLeg = (
    mode: string,
    duration: number,
    cost: number,
    fromCoords = from,
    toCoords = to
  ) => ({
    mode,
    source,
    destination,
    fromCoords,
    toCoords,
    duration,
    cost,
  });

  const rawRoutes: {
    id: string;
    name: string;
    source: string;
    destination: string;
    legs: RawLeg[];
    totalTime: number;
    totalCost: number;
  }[] = [];

  // AUTO DIRECT
  rawRoutes.push({
    id: "auto-direct",
    name: "Auto direct",
    source,
    destination,
    legs: [
      makeLeg("AUTO", auto.duration, Math.round(auto.distance * 18)),
    ],
    totalTime: auto.duration,
    totalCost: Math.round(auto.distance * 18),
  });

  // WALK + AUTO (simple split)
  rawRoutes.push({
    id: "walk-auto",
    name: "Walk + Auto",
    source,
    destination,
    legs: [
      makeLeg("WALK", Math.round(auto.duration * 0.3), 0),
      makeLeg("AUTO", Math.round(auto.duration * 0.7), Math.round(auto.distance * 15)),
    ],
    totalTime: auto.duration,
    totalCost: Math.round(auto.distance * 15),
  });

  // METRO + AUTO (simulated)
  rawRoutes.push({
    id: "metro-auto",
    name: "Metro + Auto",
    source,
    destination,
    legs: [
      makeLeg("METRO", Math.round(auto.duration * 0.6), 50),
      makeLeg("AUTO", Math.round(auto.duration * 0.4), 150),
    ],
    totalTime: auto.duration,
    totalCost: 200,
  });

  // Now compute accessibility and failure risk per leg and per route
  const routes = [];

  for (const r of rawRoutes) {
    const legsWithMeta = [];
    const legFailureProbs: number[] = [];

    for (const leg of r.legs) {
      // compute accessibility
      const { score, issues } = computeLegAccessibilityScore(leg, userAccessibilityProfile);

      // compute leg failure probability
      const legFailure = computeLegFailureProbability(leg, score);

      legsWithMeta.push({
        ...leg,
        accessibility: {
          score,
          issues,
        },
        failureProbability: Number(legFailure.toFixed(4)),
      });

      legFailureProbs.push(legFailure);
    }

    // route failure probability = 1 - Π (1 - legFailure)
    let routeFailure = 1;
    let prod = 1;
    for (const p of legFailureProbs) prod *= 1 - p;
    routeFailure = 1 - prod;
    routeFailure = clamp01(routeFailure);

    routes.push({
      id: r.id,
      name: r.name,
      source: r.source,
      destination: r.destination,
      legs: legsWithMeta,
      totalTime: r.totalTime,
      totalCost: r.totalCost,
      failureProbability: Number(routeFailure.toFixed(4)),
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