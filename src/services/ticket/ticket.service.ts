import { prisma } from "../../prismaClient";
import { generateTravelPass } from "./travelPass.service";

export const bookTicketsAndGeneratePasses = async (journeyId: string) => {
  const journey = await prisma.journey.findUnique({
    where: { id: journeyId },
    include: {
      legs: {
        include: {
          ticket: true,
          travelPass: true,
        },
      },
    },
  });

  if (!journey) throw new Error("Journey not found");

  for (const leg of journey.legs) {
    if (leg.ticket && leg.travelPass) continue;

    const ticket =
      leg.ticket ??
      (await prisma.ticket.create({
        data: {
          journeyLegId: leg.id,
          provider: "MOCK",
          status: "CONFIRMED",
        },
      }));

    let qrData = null;

    if (leg.mode !== "WALK") {
      qrData = await generateTravelPass(ticket.id, journeyId);
    }

    if (!leg.travelPass) {
      await prisma.legTravelPass.create({
        data: {
          journeyLegId: leg.id,
          qrData,
          validFrom: new Date(),
          validTill: new Date(Date.now() + 6 * 60 * 60 * 1000),
        },
      });
    }
  }
};
