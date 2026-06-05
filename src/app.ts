import express from "express";
import cors from "cors";
import helmet from "helmet";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { register, metricsMiddleware } from "./metrics";
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
  }),
);
app.use(cors());
app.use(express.json());

// Initialize notification listeners
initializeNotificationListeners();

// Apply metrics middleware
app.use(metricsMiddleware);

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
        url: "http://165.227.149.115:30080",
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

const BASE_URL = "http://165.227.149.115:30080";

app.use("/api/docs", swaggerUi.serve);
app.get(
  "/api/docs",
  swaggerUi.setup(swaggerSpec, {
    customCssUrl: `${BASE_URL}/api/docs/swagger-ui.css`,
    customJs: [
      `${BASE_URL}/api/docs/swagger-ui-bundle.js`,
      `${BASE_URL}/api/docs/swagger-ui-standalone-preset.js`,
    ],
  }),
);

app.get("/metrics", async (req, res) => {
  res.set("Content-Type", register.contentType);
  const metrics = await register.metrics();
  res.end(metrics);
});

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/parent", userRoutes);
app.use("/api/v1/parent", walletRoutes);
app.use("/api/v1/student", txRoutes);

app.use(errorHandler);

export default app;
