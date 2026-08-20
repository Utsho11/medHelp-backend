import status from "http-status";
import catchAsync from "../utils/catchAsync.js";
import sendResponse from "../utils/sendResponse.js";
import {
  completeHelp,
  getHelpById,
  getHelpForVolunteer,
  getHelps,
  getPatientHelpHistory,
  getRunningServices,
  getServiceHistory,
  seekHelp,
  updateHelpStatus,
} from "../models/help.model.js";
import {
  notifyHelpAssigned,
  notifyHelpCompleted,
  notifyNewHelpRequest,
} from "../socket/socket.js";

export const seekHelpController = catchAsync(async (req, res) => {
  const { latitude, longitude, patient_id } = req.body;
  const targetPatientId = req.user ? req.user.id : patient_id;

  const result = await seekHelp({
    latitude,
    longitude,
    patient_id: targetPatientId,
  });

  // Real-time broadcast to all available volunteers
  notifyNewHelpRequest({
    helpId: result.id,
    patientId: targetPatientId,
    latitude,
    longitude,
    createdAt: new Date().toISOString(),
  });

  sendResponse(res, {
    statusCode: status.CREATED,
    message: "Emergency help request created and broadcast to nearby volunteers",
    data: result,
  });
});

export const getHelpForVolunteerController = catchAsync(async (req, res) => {
  const volunteerId = req.user.id;
  const result = await getHelpForVolunteer(volunteerId);

  sendResponse(res, {
    statusCode: status.OK,
    message: "Nearby help requests retrieved successfully",
    data: result,
  });
});

export const updateHelpStatusController = catchAsync(async (req, res) => {
  const { helpId } = req.body;
  const volunteer = req.user;

  const result = await updateHelpStatus(helpId, volunteer.id);

  // Real-time notification to emergency room and patient
  const helpDetails = await getHelpById(helpId);
  notifyHelpAssigned(helpId, {
    volunteer: {
      id: volunteer.id,
      name: volunteer.name,
      phone: volunteer.phone,
    },
    patientId: helpDetails.patient_id,
  });

  sendResponse(res, {
    statusCode: status.OK,
    message: result.message || "Help assigned successfully",
    data: result,
  });
});

export const completeHelpController = catchAsync(async (req, res) => {
  const { helpId } = req.body;
  const volunteerId = req.user.id;

  const helpDetails = await getHelpById(helpId);
  const result = await completeHelp(helpId, volunteerId);

  // Real-time notification that emergency is resolved
  notifyHelpCompleted(helpId, helpDetails.patient_id);

  sendResponse(res, {
    statusCode: status.OK,
    message: result.message || "Help marked as completed",
    data: result,
  });
});

export const getHelpByIdController = catchAsync(async (req, res) => {
  const { helpId } = req.params;
  const result = await getHelpById(helpId);

  sendResponse(res, {
    statusCode: status.OK,
    message: "Help details retrieved successfully",
    data: result,
  });
});

export const getRunningServicesController = catchAsync(async (req, res) => {
  const volunteerId = req.user.id;
  const result = await getRunningServices(volunteerId);

  sendResponse(res, {
    statusCode: status.OK,
    message: "Running services retrieved successfully",
    data: result,
  });
});

export const getServiceHistoryController = catchAsync(async (req, res) => {
  const volunteerId = req.user.id;
  const result = await getServiceHistory(volunteerId);

  sendResponse(res, {
    statusCode: status.OK,
    message: "Service history retrieved successfully",
    data: result,
  });
});

export const getPatientHelpHistoryController = catchAsync(async (req, res) => {
  const patientId = req.user.id;
  const result = await getPatientHelpHistory(patientId);

  sendResponse(res, {
    statusCode: status.OK,
    message: "Patient help history retrieved successfully",
    data: result,
  });
});

export const getAllHelpsController = catchAsync(async (req, res) => {
  const result = await getHelps();

  sendResponse(res, {
    statusCode: status.OK,
    message: "All help records retrieved successfully",
    data: result,
  });
});
