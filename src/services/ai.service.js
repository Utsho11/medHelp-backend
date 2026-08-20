import { GoogleGenAI } from "@google/genai";
import config from "../config/index.js";

// Initialize Gemini Client if API key is available
const ai = config.gemini_api_key
  ? new GoogleGenAI({ apiKey: config.gemini_api_key })
  : null;

/**
 * Triage medical symptoms using Gemini Flash
 */
export const analyzeEmergencySymptoms = async ({
  symptoms,
  patientAge,
  gender,
  isConscious = true,
  isBreathingNormally = true,
}) => {
  // If Gemini API key is not configured, provide intelligent rules-based fallback
  if (!ai || !config.gemini_api_key) {
    return generateFallbackTriage({
      symptoms,
      isConscious,
      isBreathingNormally,
    });
  }

  try {
    const prompt = `
You are an Emergency Medical Triage AI assistant for a rapid first-responder network.
Analyze the following patient condition and provide a structured emergency triage assessment in JSON format.

Patient Information:
- Age: ${patientAge || "Unknown"}
- Gender: ${gender || "Unknown"}
- Conscious: ${isConscious ? "Yes" : "NO / UNCONSCIOUS"}
- Breathing Normally: ${isBreathingNormally ? "Yes" : "NO / DIFFICULTY BREATHING"}
- Reported Symptoms: "${symptoms}"

You must respond ONLY with valid JSON matching this exact structure:
{
  "severityLevel": <integer from 1 to 5, where 1 is Life-Threatening/Resuscitation and 5 is Minor/Non-urgent>,
  "severityLabel": "<Critical / Emergent / Urgent / Semi-Urgent / Non-Urgent>",
  "requiresAmbulance": <boolean>,
  "immediateFirstAidSteps": [
    "<Step 1 clear immediate instruction for caller/bystander>",
    "<Step 2 clear immediate instruction>"
  ],
  "responderNotes": [
    "<Note 1 for responding volunteer, e.g. CPR kit required, airway management>"
  ],
  "summary": "<Short 2-sentence clinical assessment>"
}
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.1,
      },
    });

    const parsed = JSON.parse(response.text);
    return parsed;
  } catch (error) {
    console.error("⚠️ Gemini API Error, using fallback triage:", error.message);
    return generateFallbackTriage({
      symptoms,
      isConscious,
      isBreathingNormally,
    });
  }
};

/**
 * Get instant first-aid guide for a topic
 */
export const getFirstAidGuide = async (topic) => {
  if (!ai || !config.gemini_api_key) {
    return {
      topic,
      steps: [
        "Ensure the area is safe for yourself and the patient.",
        "Check patient's responsiveness and airway/breathing.",
        "Call emergency services immediately if unresponsive or in severe distress.",
        "Keep the patient calm, comfortable, and warm.",
      ],
      warning: "Seek professional medical assistance immediately.",
    };
  }

  try {
    const prompt = `
Provide a direct, step-by-step first-aid protocol for: "${topic}".
Respond ONLY with JSON format:
{
  "topic": "${topic}",
  "doList": ["<Action 1>", "<Action 2>", "<Action 3>"],
  "doNotList": ["<Thing to avoid 1>", "<Thing to avoid 2>"],
  "emergencySigns": ["<Red flag sign 1>", "<Red flag sign 2>"],
  "warning": "<Safety disclaimer>"
}
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("⚠️ Gemini First Aid Guide Error:", error.message);
    return {
      topic,
      doList: [
        "Check responsiveness and breathing",
        "Keep patient still and calm",
        "Call emergency dispatch",
      ],
      doNotList: ["Do not give oral fluids if unconscious"],
      warning: "Always prioritize professional medical dispatch.",
    };
  }
};

// Fallback rule-based triage when Gemini Key is not set or offline
const generateFallbackTriage = ({ symptoms, isConscious, isBreathingNormally }) => {
  const text = (symptoms || "").toLowerCase();
  const isCritical =
    !isConscious ||
    !isBreathingNormally ||
    text.includes("chest pain") ||
    text.includes("heart attack") ||
    text.includes("stroke") ||
    text.includes("severe bleed") ||
    text.includes("collapse");

  return {
    severityLevel: isCritical ? 1 : 3,
    severityLabel: isCritical ? "Critical / Life-Threatening" : "Urgent / Needs Attention",
    requiresAmbulance: isCritical,
    immediateFirstAidSteps: isCritical
      ? [
          "Check airway and breathing immediately.",
          "If unresponsive and not breathing, begin CPR (30 compressions : 2 breaths).",
          "Do not leave the patient unattended.",
          "Keep caller calm and dispatch nearest AED/volunteer.",
        ]
      : [
          "Keep patient in a comfortable seated or lying position.",
          "Monitor breathing and pulse rate.",
          "Apply basic first aid or pressure to any wound.",
        ],
    responderNotes: isCritical
      ? ["Bring AED and First Responder trauma kit.", "Prepare for urgent transfer."]
      : ["Bring standard first-aid kit and vital signs monitor."],
    summary: `Patient reports: "${symptoms}". Severity assessed as ${isCritical ? "ESI-1 Critical" : "ESI-3 Urgent"}.`,
  };
};
