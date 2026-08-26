export function getConfig() {
  return {
    baseUrl: __ENV.BASE_URL || "http://localhost:3000",
    sessionId: __ENV.SESSION_ID || "44444444-4444-4444-a444-444444444441",
    userIds: (__ENV.USER_IDS || [
      "11111111-1111-4111-a111-111111111111",
      "11111111-1111-4111-a111-111111111112",
      "11111111-1111-4111-a111-111111111113",
      "11111111-1111-4111-a111-111111111114",
      "11111111-1111-4111-a111-111111111115",
    ].join(",")).split(",").filter(Boolean),
    vus: Number(__ENV.VUS || 10),
    duration: __ENV.DURATION || "30s",
  };
}

export function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

export function shuffle(items) {
  const copy = items.slice();
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const current = copy[i];
    copy[i] = copy[j];
    copy[j] = current;
  }
  return copy;
}
