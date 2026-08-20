import { z } from "zod";

const triageValidationSchema = z.object({
  body: z.object({
    symptoms: z.string().min(3, "Symptoms description is required"),
    patientAge: z.number().int().nonnegative().optional(),
    gender: z.enum(["Male", "Female", "Other"]).optional(),
    isConscious: z.boolean().optional(),
    isBreathingNormally: z.boolean().optional(),
  }),
});

export const AiValidation = {
  triageValidationSchema,
};
