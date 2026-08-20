import { z } from "zod";

const createUserValidationSchema = z.object({
  body: z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email address"),
    age: z.number().int().nonnegative("Age must be a positive number"),
    gender: z.enum(["Male", "Female", "Other"]),
    phone: z.string().min(6, "Valid phone number required"),
    address: z.string().min(1, "Address is required"),
    role: z.enum(["patient", "admin", "volunteer"]),
    password: z.string().min(6, "Password must be at least 6 characters"),
    guest_id: z.string().optional(),
  }),
});

const updateAvailabilitySchema = z.object({
  body: z.object({
    isAvailable: z.enum(["available", "notAvailable", "inService"]),
    latitude: z.number().min(-90).max(90, "Latitude must be between -90 and 90"),
    longitude: z.number().min(-180).max(180, "Longitude must be between -180 and 180"),
  }),
});

export const UserValidation = {
  createUserValidationSchema,
  updateAvailabilitySchema,
};
