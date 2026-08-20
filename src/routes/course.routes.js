import express from "express";
import auth from "../middlewares/auth.js";
import validateRequest from "../middlewares/validateRequest.js";
import { CourseValidation } from "../validations/course.validation.js";
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

router.post(
  "/",
  auth("admin"),
  validateRequest(CourseValidation.createCourseValidationSchema),
  createCourseController
);
router.get("/", getCourseController);
router.put(
  "/:id",
  auth("admin"),
  validateRequest(CourseValidation.updateCourseValidationSchema),
  updateCourseController
);
router.delete("/:id", auth("admin"), deleteCourseController);

router.post(
  "/enrollments",
  auth("volunteer"),
  validateRequest(CourseValidation.createEnrollmentValidationSchema),
  createEnrollmentController
);
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
