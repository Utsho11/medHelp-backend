import { ZodError } from "zod";
import config from "../config/index.js";
import AppError from "./AppError.js";

const globalErrorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";
  let errorSources = [];

  // Handle Zod Validation Errors
  if (err instanceof ZodError) {
    statusCode = 400;
    message = "Validation Error";
    errorSources = err.issues.map((issue) => ({
      path: issue.path[issue.path.length - 1],
      message: issue.message,
    }));
  }
  // Handle AppError
  else if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    errorSources = [
      {
        path: "",
        message: err.message,
      },
    ];
  }
  // Handle MySQL Duplicate Entry
  else if (err.code === "ER_DUP_ENTRY") {
    statusCode = 409;
    message = "Duplicate entry error: Resource already exists.";
    errorSources = [
      {
        path: "",
        message: err.sqlMessage || err.message,
      },
    ];
  }
  // Handle MySQL Foreign Key constraint fail
  else if (err.code === "ER_NO_REFERENCED_ROW_2") {
    statusCode = 400;
    message = "Invalid reference ID: Related entity does not exist.";
    errorSources = [
      {
        path: "",
        message: err.sqlMessage || err.message,
      },
    ];
  }
  // Generic standard Error
  else if (err instanceof Error) {
    message = err.message;
    errorSources = [
      {
        path: "",
        message: err.message,
      },
    ];
  }

  res.status(statusCode).json({
    success: false,
    message,
    errorSources,
    stack: config.env === "development" ? err.stack : undefined,
  });
};

export default globalErrorHandler;
