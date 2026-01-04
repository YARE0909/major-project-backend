import { geocode } from "../services/geocode/geocode.service";

export default async function hydrateLegCoords(legs: any[]) {
  return Promise.all(
    legs.map(async (leg) => {
      const from = await geocode(leg.source);
      const to = await geocode(leg.destination);

      return {
        ...leg,
        fromCoords: from,
        toCoords: to,
      };
    })
  );
}
