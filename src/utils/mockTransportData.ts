/**
 * Minimal mock transport templates for first-review demo.
 * Each route is precomputed as an array of legs.
 *
 * In a real build you'd replace these with dynamic API integrations.
 */

export type MockLeg = {
  mode: "METRO" | "BUS" | "AUTO" | "CAB" | "TRAIN" | "WALK";
  source: string;
  destination: string;
  duration: number; // minutes
  cost: number; // INR
};

export type MockRoute = {
  id: string;
  name?: string;
  source: string;
  destination: string;
  legs: MockLeg[];
  totalTime: number;
  totalCost: number;
};

export const mockRoutes: MockRoute[] = [
  {
    id: "route-1",
    name: "Auto direct",
    source: "Anna Nagar",
    destination: "Chennai Airport",
    legs: [
      { mode: "AUTO", source: "Anna Nagar", destination: "Chennai Airport", duration: 45, cost: 400 }
    ],
    totalTime: 45,
    totalCost: 400
  },
  {
    id: "route-2",
    name: "Metro + Auto",
    source: "Anna Nagar",
    destination: "Chennai Airport",
    legs: [
      { mode: "METRO", source: "Anna Nagar", destination: "Central Station", duration: 25, cost: 30 },
      { mode: "AUTO", source: "Central Station", destination: "Chennai Airport", duration: 25, cost: 250 }
    ],
    totalTime: 50,
    totalCost: 280
  },
  {
    id: "route-3",
    name: "Bus + Metro",
    source: "Anna Nagar",
    destination: "Chennai Airport",
    legs: [
      { mode: "BUS", source: "Anna Nagar", destination: "Central Station", duration: 35, cost: 20 },
      { mode: "METRO", source: "Central Station", destination: "Airport Metro", duration: 20, cost: 40 },
      { mode: "WALK", source: "Airport Metro", destination: "Chennai Airport", duration: 10, cost: 0 }
    ],
    totalTime: 65,
    totalCost: 60
  },

  // Extra examples for different source/dest pairs
  {
    id: "route-4",
    name: "Local short",
    source: "T Nagar",
    destination: "Nungambakkam",
    legs: [
      { mode: "AUTO", source: "T Nagar", destination: "Nungambakkam", duration: 20, cost: 120 }
    ],
    totalTime: 20,
    totalCost: 120
  }
];
