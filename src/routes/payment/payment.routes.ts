import express from "express";
import { startPaymentController, confirmPaymentController } from "../../controllers/payment/payment.controller";

const router = express.Router();

/**
 * @swagger
 * /payment/start:
 *   post:
 *     summary: Start a payment for a journey
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - journeyId
 *             properties:
 *               journeyId:
 *                 type: string
 *                 example: "journey_12345"
 *     responses:
 *       200:
 *         description: Payment initiated successfully
 */
router.post("/start", startPaymentController);

/**
 * @swagger
 * /payment/confirm:
 *   post:
 *     summary: Confirm a payment
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - paymentId
 *             properties:
 *               paymentId:
 *                 type: string
 *                 example: "payment_12345"
 *     responses:
 *       200:
 *         description: Payment confirmed successfully
 */
router.post("/confirm", confirmPaymentController);

export default router;
