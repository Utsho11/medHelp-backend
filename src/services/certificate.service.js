import PDFDocument from "pdfkit";
import QRCode from "qrcode";
import db from "../config/db.js";
import config from "../config/index.js";
import AppError from "../middlewares/AppError.js";
import status from "http-status";

/**
 * Get Certificate Verification Data
 */
export const getCertificateData = async (enrollmentId) => {
  const query = `
    SELECT 
      e.id AS enrollmentId,
      e.enrollment_date,
      u.id AS volunteerId,
      CONCAT(u.firstName, ' ', u.lastName) AS volunteerName,
      u.email AS volunteerEmail,
      c.id AS courseId,
      c.courseName,
      c.startDate,
      c.duration,
      t.fullname AS trainerName,
      t.qualifications AS trainerQualifications
    FROM enrollments e
    JOIN users u ON e.student_id = u.id
    JOIN courses c ON e.course_id = c.id
    JOIN trainers t ON c.trainer = t.id
    WHERE e.id = ?;
  `;

  const [rows] = await db.query(query, [enrollmentId]);

  if (rows.length === 0) {
    throw new AppError(status.NOT_FOUND, "Certificate/Enrollment not found.");
  }

  return rows[0];
};

/**
 * Generate PDF Certificate Stream with QR Code
 */
export const generateCertificatePDF = async (enrollmentId) => {
  const cert = await getCertificateData(enrollmentId);
  const verifyUrl = `${config.app_url}/api/certificates/verify/${enrollmentId}`;

  // Generate QR Code image data
  const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
    margin: 1,
    width: 140,
    color: {
      dark: "#0F172A",
      light: "#FFFFFF",
    },
  });

  const doc = new PDFDocument({
    layout: "landscape",
    size: "A4",
    margin: 40,
  });

  // Certificate Design
  const width = doc.page.width;
  const height = doc.page.height;

  // Background border styling
  doc.rect(20, 20, width - 40, height - 40).lineWidth(3).stroke("#0284C7");
  doc.rect(26, 26, width - 52, height - 52).lineWidth(1).stroke("#94A3B8");

  // Certificate Header
  doc
    .fontSize(14)
    .fillColor("#0284C7")
    .font("Helvetica-Bold")
    .text("MEDHELP MEDICAL EMERGENCY NETWORK", { align: "center" })
    .moveDown(0.4);

  doc
    .fontSize(28)
    .fillColor("#0F172A")
    .font("Helvetica-Bold")
    .text("CERTIFICATE OF COMPLETION", { align: "center" })
    .moveDown(0.6);

  doc
    .fontSize(12)
    .fillColor("#64748B")
    .font("Helvetica")
    .text("This is to proudly certify that", { align: "center" })
    .moveDown(0.5);

  // Recipient Name
  doc
    .fontSize(24)
    .fillColor("#0284C7")
    .font("Helvetica-Bold")
    .text(cert.volunteerName.toUpperCase(), { align: "center" })
    .moveDown(0.5);

  // Body text
  doc
    .fontSize(12)
    .fillColor("#334155")
    .font("Helvetica")
    .text(
      `has successfully completed the comprehensive training course in "${cert.courseName}" ` +
        `under the guidance of certified trainer ${cert.trainerName}. ` +
        `The candidate has demonstrated proficiency in emergency first response protocols and skills.`,
      { align: "center", width: width - 180 }
    )
    .moveDown(1.5);

  // Course Details Table/Summary
  const issueDate = new Date(cert.enrollment_date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  doc
    .fontSize(10)
    .fillColor("#475569")
    .font("Helvetica-Bold")
    .text(`Issue Date: ${issueDate}   |   Course Duration: ${cert.duration} Months   |   Cert ID: ${cert.enrollmentId}`, {
      align: "center",
    });

  // Embed Verification QR Code in bottom-left
  const qrImageBuffer = Buffer.from(
    qrDataUrl.replace(/^data:image\/png;base64,/, ""),
    "base64"
  );
  doc.image(qrImageBuffer, 50, height - 140, { width: 85 });
  doc
    .fontSize(7)
    .fillColor("#64748B")
    .text("Scan to Verify Authenticity", 50, height - 50, { width: 85, align: "center" });

  // Signature lines in bottom-right
  doc
    .fontSize(11)
    .fillColor("#0F172A")
    .font("Helvetica-Bold")
    .text(`${cert.trainerName}`, width - 240, height - 90, { width: 190, align: "center" });
  doc
    .fontSize(9)
    .fillColor("#64748B")
    .font("Helvetica")
    .text(`Lead Medical Trainer`, width - 240, height - 75, { width: 190, align: "center" });

  doc
    .moveTo(width - 240, height - 95)
    .lineTo(width - 50, height - 95)
    .stroke("#94A3B8");

  doc.end();
  return doc;
};
