import { z } from "zod";

const createCourseValidationSchema = z.object({
  body: z.object({
    courseName: z.string().min(1, "Course name is required"),
    trainer: z.string().min(1, "Trainer ID is required"),
    startDate: z.string().min(1, "Start date is required"),
    duration: z.number().int().positive("Duration must be a positive number of months/days"),
  }),
});

const updateCourseValidationSchema = z.object({
  body: z.object({
    courseName: z.string().optional(),
    trainer: z.string().optional(),
    startDate: z.string().optional(),
    duration: z.number().int().positive().optional(),
  }),
});

const createEnrollmentValidationSchema = z.object({
  body: z.object({
    courseId: z.string().min(1, "Course ID is required"),
  }),
});

export const CourseValidation = {
  createCourseValidationSchema,
  updateCourseValidationSchema,
  createEnrollmentValidationSchema,
};
