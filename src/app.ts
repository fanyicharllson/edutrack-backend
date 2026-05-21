import express from "express";
import cors from "cors";
import helmet from "helmet";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { register as promRegister, collectDefaultMetrics } from "prom-client";
import authRoutes from "./modules/auth/routes";
import userRoutes from "./modules/users/routes";
import walletRoutes from "./modules/wallet/routes";
import txRoutes from "./modules/transactions/routes";
import { errorHandler } from "./middleware/errorHandler";
import { initializeNotificationListeners } from "./modules/notifications/listener";

const app = express();

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: false,
  })
);
app.use(cors());
app.use(express.json());

// Initialize notification listeners
initializeNotificationListeners();

// Prometheus metrics
collectDefaultMetrics();

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "EduTrack API",
      version: "1.0.0",
      description: "Student Finance Tracker API",
    },
    servers: [
      {
        url: "http://104.248.250.176:30080",
        description: "Production server",
      },
      {
        url: "http://localhost:3000",
        description: "Local development",
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: ["./src/modules/**/*.ts"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

app.get("/health", (req, res) => {
  res.json({ success: true, message: "EduTrack API is running" });
});

app.use("/api/docs", swaggerUi.serve);
app.get("/api/docs", swaggerUi.setup(swaggerSpec));

app.get("/metrics", (req, res) => {
  res.set("Content-Type", promRegister.contentType);
  res.end(promRegister.metrics());
});

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/parent", userRoutes);
app.use("/api/v1/parent", walletRoutes);
app.use("/api/v1/student", txRoutes);

app.use(errorHandler);

export default app;
