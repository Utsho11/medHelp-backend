import express from "express";
import {
  getDashboardStats,
  loginUserController,
} from "../controllers/auth.controller.js";
import { getVolunteerStatsByIdController } from "../controllers/user.controller.js";
import auth from "../middlewares/auth.js";

const router = express.Router();

router.post("/login", loginUserController);
router.get("/dashboard-stats", auth("admin"), getDashboardStats);
router.get(
  "/volunteer-dashboard-stats",
  auth("volunteer"),
  getVolunteerStatsByIdController
);

export default router;
