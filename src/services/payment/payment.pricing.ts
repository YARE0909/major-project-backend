export const calculateJourneyBreakdown = (journey: any) => {
  const legs = journey.legs.map((leg: any) => ({
    mode: leg.mode,
    from: leg.source,
    to: leg.destination,
    fare: leg.cost,
  }));

  const legsTotal = legs.reduce(
    (sum: number, l: any) => sum + (l.fare ?? 0),
    0
  );

  const platformFee = 20;
  const taxes = Math.round(legsTotal * 0.05); // 5% demo tax
  const total = legsTotal + platformFee + taxes;

  return {
    legs,
    platformFee,
    taxes,
    total,
  };
};
