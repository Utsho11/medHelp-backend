import express from "express";
import auth from "../middlewares/auth.js";
import validateRequest from "../middlewares/validateRequest.js";
import { TrainerValidation } from "../validations/trainer.validation.js";
import {
  createTrainerController,
  deleteTrainerController,
  editTrainerController,
  getTrainerController,
} from "../controllers/trainer.controller.js";

const router = express.Router();

router.post(
  "/",
  auth("admin"),
  validateRequest(TrainerValidation.createTrainerValidationSchema),
  createTrainerController
);
router.get("/", auth("admin", "volunteer"), getTrainerController);
router.put(
  "/:id",
  auth("admin"),
  validateRequest(TrainerValidation.editTrainerValidationSchema),
  editTrainerController
);
router.delete("/:id", auth("admin"), deleteTrainerController);

export default router;
