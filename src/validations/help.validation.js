import { z } from "zod";

const seekHelpValidationSchema = z.object({
  body: z.object({
    latitude: z.number().min(-90).max(90, "Latitude must be between -90 and 90"),
    longitude: z.number().min(-180).max(180, "Longitude must be between -180 and 180"),
    patient_id: z.string().min(1, "Patient ID is required"),
  }),
});

const updateHelpStatusValidationSchema = z.object({
  body: z.object({
    helpId: z.string().min(1, "Help ID is required"),
    volunteerId: z.string().optional(),
  }),
});

const completeHelpValidationSchema = z.object({
  body: z.object({
    helpId: z.string().min(1, "Help ID is required"),
    volunteerId: z.string().optional(),
  }),
});

export const HelpValidation = {
  seekHelpValidationSchema,
  updateHelpStatusValidationSchema,
  completeHelpValidationSchema,
};
