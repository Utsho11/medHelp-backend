import status from "http-status";
import catchAsync from "../utils/catchAsync.js";
import sendResponse from "../utils/sendResponse.js";
import db from "../config/db.js";
import { loginUser } from "../models/user.model.js";

export const loginUserController = catchAsync(async (req, res) => {
  const result = await loginUser(req.body);
  sendResponse(res, {
    statusCode: status.OK,
    message: "Login successful",
    data: result,
  });
});

export const getDashboardStats = catchAsync(async (req, res) => {
  const query = `
    SELECT 
      (SELECT COUNT(*) FROM users) AS totalUsers,
      (SELECT COUNT(*) FROM users WHERE role = 'patient') AS totalPatients,
      (SELECT COUNT(*) FROM users WHERE role = 'volunteer') AS totalVolunteers,
      (SELECT COUNT(*) FROM trainers) AS totalTrainers,
      (SELECT COUNT(*) FROM users WHERE isBlocked = false) AS activeUsers,
      (SELECT COUNT(*) FROM users WHERE isBlocked = true) AS blockedUsers,
      (SELECT COUNT(*) FROM courses) AS totalCourses,
      (SELECT COUNT(*) FROM helps WHERE status = 'completed') AS totalHelps,
      (SELECT COUNT(*) FROM volunteer_availability WHERE is_available = 'available') AS totalActiveVolunteers
  `;

  const [result] = await db.execute(query);

  sendResponse(res, {
    statusCode: status.OK,
    message: "Dashboard statistics retrieved successfully",
    data: result[0],
  });
});
