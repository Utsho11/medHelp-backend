import express from "express";
import {
  getDashboardStats,
  loginUserController,
} from "../controllers/auth.controller.js";
import { getVolunteerStatsByIdController } from "../controllers/user.controller.js";
import auth from "../middlewares/auth.js";
import validateRequest from "../middlewares/validateRequest.js";
import { AuthValidation } from "../validations/auth.validation.js";

const router = express.Router();

router.post(
  "/login",
  validateRequest(AuthValidation.loginValidationSchema),
  loginUserController
);
router.get("/dashboard-stats", auth("admin"), getDashboardStats);
router.get(
  "/volunteer-dashboard-stats",
  auth("volunteer"),
  getVolunteerStatsByIdController
);

export default router;
