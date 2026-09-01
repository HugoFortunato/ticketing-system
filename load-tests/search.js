import http from "k6/http";
import { check, sleep } from "k6";
import { getConfig } from "./helpers.js";

const config = getConfig();
const url = `${config.baseUrl}/search?q=${encodeURIComponent(config.searchQuery)}`;

export const options = {
  vus: config.vus,
  duration: config.duration,
  summaryTrendStats: ["avg", "min", "med", "max", "p(90)", "p(95)", "p(99)"],
  thresholds: {
    http_req_failed: ["rate<0.05"],
  },
};

export default function () {
  const response = http.get(url);
  check(response, {
    "status 200": (res) => res.status === 200,
    "corpo ok": (res) => Array.isArray(res.json()) && res.json().length > 0,
  });
  sleep(0.1);
}
