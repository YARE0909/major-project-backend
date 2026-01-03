import { mockRoutes } from "../utils/mockTransportData";

/**
 * Very small utility that returns mock routes that start from `from` and end at `to`.
 * This is presentation/demo oriented.
 */
export const getRoutesBetween = (from: string, to: string) => {
  const s = from.toLowerCase();
  const d = to.toLowerCase();
  // return routes where source matches and destination matches
  const found = mockRoutes.filter(r => r.source.toLowerCase().includes(s) && r.destination.toLowerCase().includes(d));
  if (found.length > 0) return found;
  // else try where source matches OR destination matches
  return mockRoutes.filter(r => r.source.toLowerCase().includes(s) || r.destination.toLowerCase().includes(d));
};
