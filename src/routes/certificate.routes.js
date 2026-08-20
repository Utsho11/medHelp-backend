import express from "express";
import auth from "../middlewares/auth.js";
import {
  downloadCertificateController,
  verifyCertificateController,
} from "../controllers/certificate.controller.js";

const router = express.Router();

// Download PDF (accessible by volunteers, patients, admins)
router.get(
  "/download/:enrollmentId",
  auth("volunteer", "admin", "patient"),
  downloadCertificateController
);

// Public verification check (for scanning the QR code)
router.get("/verify/:enrollmentId", verifyCertificateController);

export default router;
