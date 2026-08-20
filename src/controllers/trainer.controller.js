import status from "http-status";
import catchAsync from "../utils/catchAsync.js";
import sendResponse from "../utils/sendResponse.js";
import {
  createTrainer,
  deleteTrainerById,
  editTrainerById,
  getTrainers,
} from "../models/trainer.model.js";

export const createTrainerController = catchAsync(async (req, res) => {
  const result = await createTrainer(req.body);
  sendResponse(res, {
    statusCode: status.CREATED,
    message: "Trainer created successfully",
    data: result,
  });
});

export const getTrainerController = catchAsync(async (req, res) => {
  const result = await getTrainers();
  sendResponse(res, {
    statusCode: status.OK,
    message: "Trainers retrieved successfully",
    data: result,
  });
});

export const editTrainerController = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await editTrainerById(id, req.body);
  sendResponse(res, {
    statusCode: status.OK,
    message: "Trainer updated successfully",
    data: result,
  });
});

export const deleteTrainerController = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await deleteTrainerById(id);
  sendResponse(res, {
    statusCode: status.OK,
    message: "Trainer deleted successfully",
    data: result,
  });
});
