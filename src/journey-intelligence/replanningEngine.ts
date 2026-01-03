import { mockRoutes } from "../utils/mockTransportData";

/**
 * Very basic replanning: find mock routes where source of alt matches given source
 * and destination matches requested destination.
 */
export const findAlternatives = (from: string, to: string) => {
  const fromLower = from.toLowerCase();
  const toLower = to.toLowerCase();

  const alts = mockRoutes.filter(r => {
    return r.source.toLowerCase().includes(fromLower) && r.destination.toLowerCase().includes(toLower);
  });

  // fallback to any route with same destination
  if (alts.length === 0) {
    return mockRoutes.filter(r => r.destination.toLowerCase().includes(toLower));
  }
  return alts;
};
