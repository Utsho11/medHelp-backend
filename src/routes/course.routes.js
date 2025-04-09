import express from "express";
import auth from "../middlewares/auth.js";
import {
  createCourseController,
  createEnrollmentController,
  deleteCourseController,
  getCourseController,
  getCourseEnrollmentInfoController,
  getCoursesByVolunteerController,
  updateCourseController,
} from "../controllers/course.controller.js";

const router = express.Router();

router.post("/", auth("admin"), createCourseController);
router.get("/", getCourseController);
router.put("/:id", auth("admin"), updateCourseController);
router.delete("/:id", auth("admin"), deleteCourseController);
router.post("/enrollments", auth("volunteer"), createEnrollmentController);
router.get(
  "/volunteer/enrollments",
  auth("volunteer"),
  getCoursesByVolunteerController
);
router.get(
  "/admin/enrollments",
  auth("admin"),
  getCourseEnrollmentInfoController
);

export default router;
