import express from "express";
import auth from "../middlewares/auth.js";
import validateRequest from "../middlewares/validateRequest.js";
import { UserValidation } from "../validations/user.validation.js";
import {
  createUserController,
  deleteUsersController,
  getUsersController,
  getVolunteerAvailabilityController,
  getVolunteerStatsByIdController,
  toggleUserStatusController,
  volunteerAvailabilityController,
} from "../controllers/user.controller.js";

const router = express.Router();

// Public registration
router.post(
  "/",
  validateRequest(UserValidation.createUserValidationSchema),
  createUserController
);

// Admin-only user management
router.get("/", auth("admin"), getUsersController);
router.patch("/toggleStatus/:id", auth("admin"), toggleUserStatusController);
router.delete("/delete/:id", auth("admin"), deleteUsersController);

// Volunteer-only endpoints
router.post(
  "/availability",
  auth("volunteer"),
  validateRequest(UserValidation.updateAvailabilitySchema),
  volunteerAvailabilityController
);
router.get(
  "/availability",
  auth("volunteer"),
  getVolunteerAvailabilityController
);
router.get(
  "/volunteer-stats",
  auth("volunteer"),
  getVolunteerStatsByIdController
);

export default router;
