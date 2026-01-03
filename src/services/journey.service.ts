import { prisma } from "../prismaClient";
import { mockRoutes } from "../utils/mockTransportData";
import { generateTravelPass } from "./travelPass.service";
import { findAlternatives } from "../journey-intelligence/replanningEngine";

/**
 * Plan journey: returns 2-3 mock routes from mockRoutes that match source/destination
 */
export const planJourney = async (source: string, destination: string) => {
  // Very simple matching logic for demo:
  const matches = mockRoutes.filter(r => {
    const s = r.source.toLowerCase();
    const d = r.destination.toLowerCase();
    return (s.includes(source.toLowerCase()) && d.includes(destination.toLowerCase())) ||
           (s.includes(source.toLowerCase()) && d.includes(destination.toLowerCase())) ||
           (r.source.toLowerCase().includes(source.toLowerCase()) && r.destination.toLowerCase().includes(destination.toLowerCase()));
  });

  // If no exact matches, try fuzzy: include routes where source matches or destination matches
  if (matches.length === 0) {
    const fallback = mockRoutes.filter(r => {
      return r.source.toLowerCase().includes(source.toLowerCase()) || r.destination.toLowerCase().includes(destination.toLowerCase());
    });
    return fallback.slice(0, 3);
  }

  return matches.slice(0, 3);
};

/**
 * Book journey: creates Journey, JourneyLegs, Booking, TravelPass
 */
export const bookJourney = async (userId: string, selectedRoute: any) => {
  // selectedRoute must contain legs array, totalTime, totalCost, name etc
  const { legs, totalCost, totalTime } = selectedRoute;

  const result = await prisma.$transaction(async (tx: any) => {
    const journey = await tx.journey.create({
      data: {
        userId,
        status: "BOOKED",
        totalCost: totalCost ?? 0,
        totalTime: totalTime ?? 0
      }
    });

    // create legs
    for (let i = 0; i < legs.length; i++) {
      const leg = legs[i];
      await tx.journeyLeg.create({
        data: {
          journeyId: journey.id,
          mode: leg.mode,
          source: leg.source,
          destination: leg.destination,
          duration: leg.duration,
          cost: leg.cost,
          order: i + 1
        }
      });
    }

    const booking = await tx.booking.create({
      data: {
        journeyId: journey.id,
        status: "SUCCESS"
      }
    });

    // create travel pass
    const now = new Date();
    const validTill = new Date(now.getTime() + 1000 * 60 * 60 * 6); // 6 hours default
    const travelPass = await tx.travelPass.create({
      data: {
        journeyId: journey.id,
        validFrom: now,
        validTill
      }
    });

    // return ids to be used outside transaction
    return { journeyId: journey.id, bookingId: booking.id, travelPassId: travelPass.id };
  });

  // generate QR data and update travelPass record
  const qrData = await generateTravelPass(result.travelPassId, result.journeyId);
  await prisma.travelPass.update({
    where: { id: result.travelPassId },
    data: { qrData }
  });

  // return full journey
  const journey = await prisma.journey.findUnique({
    where: { id: result.journeyId },
    include: { legs: true, booking: true, travelPass: true }
  });

  return journey;
};

export const getJourneyById = async (journeyId: string) => {
  return prisma.journey.findUnique({
    where: { id: journeyId },
    include: {
      legs: { orderBy: { order: "asc" } },
      booking: true,
      travelPass: true
    }
  });
};

/**
 * Simulated replanning:
 * - failedLegOrder indicates the leg index (1-based) that failed
 * - we will recompute alternative legs from the failed leg's source to journey destination
 */
export const replanJourney = async (journeyId: string, failedLegOrder: number) => {
  const journey = await prisma.journey.findUnique({
    where: { id: journeyId },
    include: { legs: true, travelPass: true }
  });

  if (!journey) throw new Error("Journey not found");

  // find failed leg
  const failedLeg = journey.legs.find((l: any) => l.order === failedLegOrder);
  if (!failedLeg) throw new Error("Failed leg not found in journey");

  const remainingLegs = journey.legs.filter((l: any) => l.order > failedLegOrder);

  // Use replanning engine to find alternatives from failedLeg.source to final destination
  const destination = journey.legs[journey.legs.length - 1]!.destination;
  const alternatives = findAlternatives(failedLeg.source, destination);

  if (!alternatives || alternatives.length === 0) throw new Error("No alternatives found");

  // For simplicity pick first alt route
  const alt: any = alternatives[0];

  // update DB: delete remaining legs then create new legs
  await prisma.$transaction(async (tx: any) => {
    // delete remaining legs
    for (const leg of remainingLegs) {
      await tx.journeyLeg.delete({ where: { id: leg.id } });
    }

    // append new legs from alt
    let orderBase = failedLegOrder; // replace the failed leg onwards
    for (let i = 0; i < alt.legs.length; i++) {
      const leg = alt.legs[i];
      await tx.journeyLeg.create({
        data: {
          journeyId,
          mode: leg.mode,
          source: leg.source,
          destination: leg.destination,
          duration: leg.duration,
          cost: leg.cost,
          order: orderBase + i + 1
        }
      });
    }

    // adjust journey totals -- naive sums
    const newLegs = await tx.journeyLeg.findMany({ where: { journeyId } });
    const totalCost = newLegs.reduce((s: any, l: any) => s + l.cost, 0);
    const totalTime = newLegs.reduce((s: any, l: any) => s + l.duration, 0);
    await tx.journey.update({
      where: { id: journeyId },
      data: { totalCost, totalTime }
    });
  });

  return getJourneyById(journeyId);
};
