import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth/auth.routes";
import journeyRoutes from "./routes/journey/journey.routes";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./swagger";
import paymentRoutes from "./routes/payment/payment.routes";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);


app.use(express.json());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/auth", authRoutes);
app.use("/journey", journeyRoutes);
app.use("/payment", paymentRoutes);

app.get("/", (_req, res) => {
  res.json({ message: "TravelNest Backend - Running" });
});

export default app;
