import http from "k6/http";
import { check, sleep } from "k6";
import { Rate } from "k6/metrics";
import { getConfig, randomItem, shuffle } from "./helpers.js";

const config = getConfig();
const conflicts = new Rate("reservation_conflicts");
const created = new Rate("reservation_created");

export const options = {
  vus: config.vus,
  duration: config.duration,
  summaryTrendStats: ["avg", "min", "med", "max", "p(90)", "p(95)", "p(99)"],
};

export default function () {
  const sessionId = config.sessionId;
  const userId = randomItem(config.userIds);
  const seatsResponse = http.get(`${config.baseUrl}/sessions/${sessionId}/seats`);

  check(seatsResponse, {
    "lista assentos 200": (res) => res.status === 200,
  });

  if (seatsResponse.status !== 200) {
    return;
  }

  const available = (seatsResponse.json().seats || []).filter((seat) => seat.status === "available");
  if (available.length === 0) {
    sleep(0.05);
    return;
  }

  const selected = shuffle(available).slice(0, Math.random() > 0.7 ? 2 : 1);
  const payload = JSON.stringify({ seatIds: selected.map((seat) => seat.id) });
  const response = http.post(`${config.baseUrl}/sessions/${sessionId}/reservations`, payload, {
    headers: {
      "Content-Type": "application/json",
      "x-user-id": userId,
    },
  });

  const ok = check(response, {
    "reserva 201 ou 409": (res) => res.status === 201 || res.status === 409,
  });

  created.add(response.status === 201);
  conflicts.add(response.status === 409);

  if (!ok) {
    console.error(`status inesperado ${response.status}: ${response.body}`);
  }

  sleep(0.05);
}
