import status from "http-status";
import catchAsync from "../utils/catchAsync.js";
import sendResponse from "../utils/sendResponse.js";
import {
  createCourse,
  createEnrollment,
  deleteCourse,
  getCourseEnrollmentInfo,
  getCourses,
  getCoursesByVolunteer,
  updateCourse,
} from "../models/course.model.js";

export const createCourseController = catchAsync(async (req, res) => {
  const result = await createCourse(req.body);
  sendResponse(res, {
    statusCode: status.CREATED,
    message: "Course created successfully",
    data: result,
  });
});

export const createEnrollmentController = catchAsync(async (req, res) => {
  const { courseId } = req.body;
  const studentId = req.user.id;

  const result = await createEnrollment({ courseId, studentId });
  sendResponse(res, {
    statusCode: status.CREATED,
    message: "Enrollment successful",
    data: result,
  });
});

export const getCourseController = catchAsync(async (req, res) => {
  const result = await getCourses();
  sendResponse(res, {
    statusCode: status.OK,
    message: "Courses retrieved successfully",
    data: result,
  });
});

export const updateCourseController = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await updateCourse(id, req.body);
  sendResponse(res, {
    statusCode: status.OK,
    message: "Course updated successfully",
    data: result,
  });
});

export const deleteCourseController = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await deleteCourse(id);
  sendResponse(res, {
    statusCode: status.OK,
    message: "Course deleted successfully",
    data: result,
  });
});

export const getCoursesByVolunteerController = catchAsync(async (req, res) => {
  const volunteerId = req.user.id;
  const result = await getCoursesByVolunteer(volunteerId);
  sendResponse(res, {
    statusCode: status.OK,
    message: "Volunteer enrolled courses retrieved successfully",
    data: result,
  });
});

export const getCourseEnrollmentInfoController = catchAsync(async (req, res) => {
  const result = await getCourseEnrollmentInfo();
  sendResponse(res, {
    statusCode: status.OK,
    message: "Course enrollment statistics retrieved successfully",
    data: result,
  });
});
