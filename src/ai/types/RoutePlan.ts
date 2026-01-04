export type LocationSymbol =
  | "SOURCE"
  | "DESTINATION"
  | "NEAREST_METRO"
  | "NEAREST_RAILWAY_STATION";

export type AIRoutePlan = {
  routes: {
    name: string;
    legs: {
      mode: "WALK" | "AUTO" | "METRO" | "BUS" | "TRAIN";
      from: LocationSymbol;
      to: LocationSymbol;
    }[];
  }[];
};
