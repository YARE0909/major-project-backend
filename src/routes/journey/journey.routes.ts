import { Router } from "express";
import {
  planJourneyController,
  getJourneyController,
  createJourneyController
} from "../../controllers/journey/journey.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";

const router = Router();


/** * @swagger
 * /journey/create:
 *   post:
 *     summary: Create a journey from a selected route
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
 *         description: Journey created successfully
 */ 
router.post("/create", authMiddleware, createJourneyController);

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
router.post("/plan", authMiddleware, planJourneyController);

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
router.get("/:id", authMiddleware, getJourneyController);

export default router;
