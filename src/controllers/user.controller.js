import status from "http-status";
import catchAsync from "../utils/catchAsync.js";
import sendResponse from "../utils/sendResponse.js";
import {
  createUser,
  deleteUser,
  getUsers,
  getVolunteerAvailability,
  getVolunteerStatsById,
  toggleBlockStatus,
  updateVolunteerAvailability,
} from "../models/user.model.js";

// Create new user
export const createUserController = catchAsync(async (req, res) => {
  const result = await createUser(req.body);
  sendResponse(res, {
    statusCode: status.CREATED,
    message: "User created successfully",
    data: result,
  });
});

// Get all users by role
export const getUsersController = catchAsync(async (req, res) => {
  const { role } = req.query;
  const users = await getUsers(role);
  sendResponse(res, {
    statusCode: status.OK,
    message: "Users retrieved successfully",
    data: users,
  });
});

// Delete User
export const deleteUsersController = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await deleteUser(id);
  sendResponse(res, {
    statusCode: status.OK,
    message: "User deleted successfully",
    data: result,
  });
});

// Toggle Block Status
export const toggleUserStatusController = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await toggleBlockStatus(id);
  sendResponse(res, {
    statusCode: status.OK,
    message: `User status changed to ${result.isBlocked ? "blocked" : "active"}`,
    data: result,
  });
});

// Volunteer availability update
export const volunteerAvailabilityController = catchAsync(async (req, res) => {
  const { isAvailable, latitude, longitude } = req.body;
  const volunteerId = req.user.id;

  const result = await updateVolunteerAvailability(
    volunteerId,
    isAvailable,
    latitude,
    longitude
  );

  sendResponse(res, {
    statusCode: status.OK,
    message: "Availability updated successfully",
    data: result,
  });
});

// Get Volunteer availability
export const getVolunteerAvailabilityController = catchAsync(async (req, res) => {
  const volunteerId = req.user.id;
  const availability = await getVolunteerAvailability(volunteerId);

  sendResponse(res, {
    statusCode: status.OK,
    message: "Availability retrieved successfully",
    data: availability,
  });
});

// Get Volunteer statistics
export const getVolunteerStatsByIdController = catchAsync(async (req, res) => {
  const volunteerId = req.user.id;
  const stats = await getVolunteerStatsById(volunteerId);

  sendResponse(res, {
    statusCode: status.OK,
    message: "Volunteer stats retrieved successfully",
    data: stats,
  });
});
