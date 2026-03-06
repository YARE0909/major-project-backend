import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { getAccessibilityController, setAccessibilityController } from "../../controllers/accessibility/accessibility.controller";

const router = Router();

router.get("/", authMiddleware, getAccessibilityController);
router.post("/", authMiddleware, setAccessibilityController);

export default router;