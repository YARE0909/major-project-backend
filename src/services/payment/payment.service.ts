import { prisma } from "../../prismaClient";
import { MockPaymentProvider } from "./mockPayment.provider";
import { calculateJourneyBreakdown } from "./payment.pricing";

export const createPaymentService = async (journeyId: string) => {
  const journey = await prisma.journey.findUnique({
    where: { id: journeyId },
    include: { legs: true },
  });

  if (!journey) {
    throw new Error("Journey not found");
  }

  if (journey.status !== "PLANNED") {
    throw new Error("Journey already paid or invalid");
  }

  const breakdown = calculateJourneyBreakdown(journey);

  return prisma.payment.create({
    data: {
      journey: {
        connect: { id: journeyId },
      },
      amount: breakdown.total,
      provider: "MOCK",
      breakdown,
    },
  });
};

export const confirmPaymentService = async (paymentId: string) => {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
  });

  if (!payment) throw new Error("Payment not found");

  const provider = new MockPaymentProvider();
  const result = await provider.charge(payment.amount);

  if (!result.success) {
    await prisma.payment.update({
      where: { id: paymentId },
      data: { status: "FAILED" },
    });
    throw new Error("Payment failed");
  }

  await prisma.$transaction(async (tx) => {
    await tx.payment.update({
      where: { id: paymentId },
      data: {
        status: "SUCCESS",
        providerRef: result.providerRef,
      },
    });

    await tx.journey.update({
      where: { id: payment.journeyId },
      data: { status: "BOOKED" },
    });
  });

  return {
    success: true,
    journeyId: payment.journeyId,
  };
};
