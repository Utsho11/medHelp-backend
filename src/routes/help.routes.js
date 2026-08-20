import express from "express";
import auth from "../middlewares/auth.js";
import validateRequest from "../middlewares/validateRequest.js";
import { HelpValidation } from "../validations/help.validation.js";
import {
  completeHelpController,
  getAllHelpsController,
  getHelpByIdController,
  getHelpForVolunteerController,
  getPatientHelpHistoryController,
  getRunningServicesController,
  getServiceHistoryController,
  seekHelpController,
  updateHelpStatusController,
} from "../controllers/help.controller.js";

const router = express.Router();

// Seek emergency help
router.post(
  "/post-for-help",
  validateRequest(HelpValidation.seekHelpValidationSchema),
  seekHelpController
);

// Volunteer routes
router.get(
  "/get-running-services",
  auth("volunteer"),
  getRunningServicesController
);
router.get(
  "/help-for-volunteer",
  auth("volunteer"),
  getHelpForVolunteerController
);
router.put(
  "/update-help-status",
  auth("volunteer"),
  validateRequest(HelpValidation.updateHelpStatusValidationSchema),
  updateHelpStatusController
);
router.put(
  "/complete-help",
  auth("volunteer"),
  validateRequest(HelpValidation.completeHelpValidationSchema),
  completeHelpController
);
router.get("/services/history", auth("volunteer"), getServiceHistoryController);

// Patient routes
router.get(
  "/patient/history",
  auth("patient"),
  getPatientHelpHistoryController
);

// Admin routes
router.get("/admin/all-helps", auth("admin"), getAllHelpsController);

// Detail route
router.get("/:helpId", auth("volunteer", "admin", "patient"), getHelpByIdController);

export default router;
