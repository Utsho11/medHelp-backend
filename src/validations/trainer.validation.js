import { z } from "zod";

const createTrainerValidationSchema = z.object({
  body: z.object({
    fullname: z.string().min(1, "Full name is required"),
    age: z.number().int().min(19, "Age must be greater than 18"),
    qualifications: z.string().min(1, "Qualifications are required"),
    bloodType: z.string().min(1, "Blood type is required"),
    address: z.string().min(1, "Address is required"),
    email: z.string().email("Invalid email address"),
    phoneNo: z.string().min(6, "Valid phone number required"),
  }),
});

const editTrainerValidationSchema = z.object({
  body: z.object({
    fullname: z.string().optional(),
    age: z.number().int().min(19, "Age must be greater than 18").optional(),
    qualifications: z.string().optional(),
    bloodType: z.string().optional(),
    address: z.string().optional(),
    email: z.string().email("Invalid email address").optional(),
    phoneNo: z.string().min(6).optional(),
  }),
});

export const TrainerValidation = {
  createTrainerValidationSchema,
  editTrainerValidationSchema,
};
