import scores from "../mocks/scores.json";
import trips from "../mocks/trips.json";
import users from "../mocks/users.json";

// Simulate network delay
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export async function getFamilyMembers() {
  await delay(300);
  return users;
}

export async function getTeenTrips(teenId: string) {
  await delay(300);
  return trips.filter(t => t.userId === teenId);
}

export async function getTeenScore(teenId: string) {
  await delay(300);
  return scores.find(s => s.userId === teenId)?.score ?? 72;
}

export async function getTeenAlerts(teenId: string) {
  await delay(300);

  return [
    { id: 1, message: "Harsh braking detected last trip" },
    { id: 2, message: "Speed exceeded 120 km/h" },
  ];
}