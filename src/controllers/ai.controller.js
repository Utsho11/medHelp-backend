import status from "http-status";
import catchAsync from "../utils/catchAsync.js";
import sendResponse from "../utils/sendResponse.js";
import {
  analyzeEmergencySymptoms,
  getFirstAidGuide,
} from "../services/ai.service.js";

export const triageSymptomsController = catchAsync(async (req, res) => {
  const { symptoms, patientAge, gender, isConscious, isBreathingNormally } = req.body;

  const assessment = await analyzeEmergencySymptoms({
    symptoms,
    patientAge,
    gender,
    isConscious,
    isBreathingNormally,
  });

  sendResponse(res, {
    statusCode: status.OK,
    message: "AI Emergency triage assessment generated successfully",
    data: assessment,
  });
});

export const getFirstAidGuideController = catchAsync(async (req, res) => {
  const { topic } = req.query;

  if (!topic) {
    return sendResponse(res, {
      statusCode: status.BAD_REQUEST,
      message: "Query parameter 'topic' is required (e.g. ?topic=choking)",
      data: null,
    });
  }

  const guide = await getFirstAidGuide(topic);

  sendResponse(res, {
    statusCode: status.OK,
    message: `First-aid protocol for ${topic} retrieved successfully`,
    data: guide,
  });
});
