import status from "http-status";
import catchAsync from "../utils/catchAsync.js";
import sendResponse from "../utils/sendResponse.js";
import {
  generateCertificatePDF,
  getCertificateData,
} from "../services/certificate.service.js";

// Download PDF certificate
export const downloadCertificateController = catchAsync(async (req, res) => {
  const { enrollmentId } = req.params;
  const doc = await generateCertificatePDF(enrollmentId);

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `inline; filename=medhelp-certificate-${enrollmentId}.pdf`
  );

  doc.pipe(res);
});

// Public certificate verification endpoint (scanned via QR code)
export const verifyCertificateController = catchAsync(async (req, res) => {
  const { enrollmentId } = req.params;
  const certData = await getCertificateData(enrollmentId);

  sendResponse(res, {
    statusCode: status.OK,
    message: "Certificate is authentic and verified",
    data: {
      verified: true,
      recipientName: certData.volunteerName,
      courseName: certData.courseName,
      trainerName: certData.trainerName,
      completionDate: certData.enrollment_date,
      certificateId: certData.enrollmentId,
    },
  });
});
