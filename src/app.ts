import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes";
import journeyRoutes from "./routes/journey.routes";

import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./swagger";

dotenv.config();

const app = express();
app.use(express.json());

// Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use("/auth", authRoutes);
app.use("/journey", journeyRoutes);

app.get("/", (_req, res) => {
  res.json({ message: "TravelNest Backend - Running" });
});

export default app;
