import { Router } from "express";
import {
  planJourney,
  bookJourney,
  getJourney,
  replanJourney
} from "../controllers/journey.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

/**
 * @swagger
 * /journey/plan:
 *   post:
 *     summary: Plan a multimodal journey
 *     tags: [Journey]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - source
 *               - destination
 *             properties:
 *               source:
 *                 type: string
 *                 example: Anna Nagar
 *               destination:
 *                 type: string
 *                 example: Chennai Airport
 *     responses:
 *       200:
 *         description: List of journey options
 */
router.post("/plan", authMiddleware, planJourney);

/**
 * @swagger
 * /journey/book:
 *   post:
 *     summary: Book a selected journey
 *     tags: [Journey]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               selectedRoute:
 *                 type: object
 *     responses:
 *       200:
 *         description: Journey booked successfully
 */
router.post("/book", authMiddleware, bookJourney);

/**
 * @swagger
 * /journey/{id}:
 *   get:
 *     summary: Get journey details
 *     tags: [Journey]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Journey details
 */
router.get("/:id", authMiddleware, getJourney);

/**
 * @swagger
 * /journey/replan:
 *   post:
 *     summary: Simulate journey replanning
 *     tags: [Journey]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               journeyId:
 *                 type: string
 *               failedLegOrder:
 *                 type: number
 *     responses:
 *       200:
 *         description: Journey replanned successfully
 */
router.post("/replan", authMiddleware, replanJourney);

export default router;
