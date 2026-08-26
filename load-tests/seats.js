import http from "k6/http";
import { check, sleep } from "k6";
import { getConfig, randomItem } from "./helpers.js";

const config = getConfig();
const sessionIds = (__ENV.SESSION_IDS || config.sessionId).split(",").filter(Boolean);

export const options = {
  vus: config.vus,
  duration: config.duration,
  summaryTrendStats: ["avg", "min", "med", "max", "p(90)", "p(95)", "p(99)"],
  thresholds: {
    http_req_failed: ["rate<0.05"],
  },
};

export default function () {
  const sessionId = randomItem(sessionIds);
  const response = http.get(`${config.baseUrl}/sessions/${sessionId}/seats`);
  check(response, {
    "status 200": (res) => res.status === 200,
    "retorna assentos": (res) => {
      try {
        return Array.isArray(res.json().seats);
      } catch {
        return false;
      }
    },
  });
  sleep(0.1);
}
