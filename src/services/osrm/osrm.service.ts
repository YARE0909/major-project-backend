export async function getRoadRoute(
  from: { lat: number; lon: number },
  to: { lat: number; lon: number }
) {
  const url = `https://router.project-osrm.org/route/v1/driving/${from.lon},${from.lat};${to.lon},${to.lat}?overview=false`;

  const res = await fetch(url);
  const data = await res.json();

  const route = data.routes[0];

  return {
    duration: Math.round(route.duration / 60), // mins
    distance: route.distance / 1000, // km
  };
}
