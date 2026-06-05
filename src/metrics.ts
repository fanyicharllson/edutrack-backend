import { Registry, Counter, Histogram, Gauge, collectDefaultMetrics } from "prom-client";
import { Request, Response, NextFunction } from "express";

// Create a Registry which registers the metrics
export const register = new Registry();

// Add a default label which is added to all metrics
register.setDefaultLabels({
  app: "edutrack-api",
});

// Enable the collection of default metrics (CPU, memory, event loop lag, etc.)
collectDefaultMetrics({ register });

// Define custom metrics
const httpRequestDurationSeconds = new Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
  registers: [register],
});

const httpRequestsTotal = new Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status_code"],
  registers: [register],
});

const httpActiveRequests = new Gauge({
  name: "http_active_requests",
  help: "Number of active HTTP requests",
  registers: [register],
});

/**
 * Middleware to track request metrics
 */
export const metricsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Skip metrics for the /metrics and /health endpoints to avoid noise
  if (req.path === "/metrics" || req.path === "/health") {
    return next();
  }

  const start = process.hrtime();
  httpActiveRequests.inc();

  res.on("finish", () => {
    httpActiveRequests.dec();
    const diff = process.hrtime(start);
    const durationInSeconds = diff[0] + diff[1] / 1e9;

    // Extract route pattern if available (e.g. /api/v1/parent/transactions/:studentId)
    // Falls back to raw path if no route is matched yet
    const route = req.route ? req.route.path : req.path;

    httpRequestDurationSeconds
      .labels(req.method, route, res.statusCode.toString())
      .observe(durationInSeconds);

    httpRequestsTotal.labels(req.method, route, res.statusCode.toString()).inc();
  });

  next();
};