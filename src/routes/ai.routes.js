import express from "express";
import validateRequest from "../middlewares/validateRequest.js";
import { AiValidation } from "../validations/ai.validation.js";
import {
  getFirstAidGuideController,
  triageSymptomsController,
} from "../controllers/ai.controller.js";

const router = express.Router();

// AI emergency symptom triage
router.post(
  "/triage",
  validateRequest(AiValidation.triageValidationSchema),
  triageSymptomsController
);

// AI first-aid guide search
router.get("/first-aid-guide", getFirstAidGuideController);

export default router;
