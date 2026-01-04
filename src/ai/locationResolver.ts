import { geocode } from "../services/geocode/geocode.service";
import { LocationSymbol } from "./types/RoutePlan";

export async function resolveLocation(
  symbol: LocationSymbol,
  source: string,
  destination: string
) {
  switch (symbol) {
    case "SOURCE":
      return geocode(source);

    case "DESTINATION":
      return geocode(destination);

    case "NEAREST_METRO":
      return geocode(source);

    case "NEAREST_RAILWAY_STATION":
      return geocode(source);

    default:
      throw new Error(`Unknown location symbol: ${symbol}`);
  }
}
