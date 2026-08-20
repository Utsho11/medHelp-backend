import swaggerUi from "swagger-ui-express";

const swaggerDocument = {
  openapi: "3.0.0",
  info: {
    title: "MedHelp Emergency First-Responder API",
    version: "2.0.0",
    description:
      "Enterprise medical emergency dispatch, volunteer geospatial matching, AI symptom triage, and training certification system.",
    contact: {
      name: "MedHelp Support",
      email: "support@medhelp.com",
    },
  },
  servers: [
    {
      url: "http://localhost:5000",
      description: "Local Development Server",
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: "apiKey",
        in: "header",
        name: "authorization",
        description: "Enter your JWT token directly (e.g. `eyJhbGciOi...`)",
      },
    },
    schemas: {
      UserRegistration: {
        type: "object",
        required: ["firstName", "lastName", "email", "age", "gender", "phone", "address", "role", "password"],
        properties: {
          firstName: { type: "string", example: "John" },
          lastName: { type: "string", example: "Doe" },
          email: { type: "string", example: "john@example.com" },
          age: { type: "integer", example: 28 },
          gender: { type: "string", enum: ["Male", "Female", "Other"], example: "Male" },
          phone: { type: "string", example: "+1234567890" },
          address: { type: "string", example: "123 Main Street" },
          role: { type: "string", enum: ["patient", "volunteer", "admin"], example: "patient" },
          password: { type: "string", example: "Password123!" },
        },
      },
      LoginRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", example: "admin@medhelp.com" },
          password: { type: "string", example: "Admin@123456" },
        },
      },
      SeekHelpRequest: {
        type: "object",
        required: ["latitude", "longitude", "patient_id"],
        properties: {
          latitude: { type: "number", example: 23.8103 },
          longitude: { type: "number", example: 90.4125 },
          patient_id: { type: "string", example: "usr-uuid-here" },
        },
      },
      AITriageRequest: {
        type: "object",
        required: ["symptoms"],
        properties: {
          symptoms: { type: "string", example: "Patient has sudden chest tightness, radiating left arm pain, difficulty breathing" },
          patientAge: { type: "integer", example: 55 },
          gender: { type: "string", example: "Male" },
          isConscious: { type: "boolean", example: true },
          isBreathingNormally: { type: "boolean", example: false },
        },
      },
    },
  },
  paths: {
    "/health": {
      get: {
        summary: "API Health Check",
        tags: ["System"],
        responses: {
          200: { description: "Server is healthy and operational" },
        },
      },
    },
    "/api/auth/login": {
      post: {
        summary: "Authenticate user and get JWT token",
        tags: ["Authentication"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginRequest" },
            },
          },
        },
        responses: {
          200: { description: "Login successful with token" },
          401: { description: "Invalid credentials" },
          403: { description: "Account blocked" },
        },
      },
    },
    "/api/users": {
      post: {
        summary: "Register a new user (Patient / Volunteer)",
        tags: ["Users"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UserRegistration" },
            },
          },
        },
        responses: {
          201: { description: "User created successfully" },
          400: { description: "Validation error" },
        },
      },
      get: {
        summary: "Get users by role (Admin Only)",
        tags: ["Users"],
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "role",
            in: "query",
            required: true,
            schema: { type: "string", enum: ["patient", "volunteer", "admin"] },
          },
        ],
        responses: {
          200: { description: "List of users" },
          401: { description: "Unauthorized" },
        },
      },
    },
    "/api/help/post-for-help": {
      post: {
        summary: "Trigger emergency SOS help request",
        tags: ["Emergency Help"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SeekHelpRequest" },
            },
          },
        },
        responses: {
          201: { description: "Emergency broadcast to nearby active volunteers" },
        },
      },
    },
    "/api/help/help-for-volunteer": {
      get: {
        summary: "Get pending emergency requests near volunteer GPS (Within 10km)",
        tags: ["Emergency Help"],
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: "Nearby emergency list sorted by proximity" },
        },
      },
    },
    "/api/ai/triage": {
      post: {
        summary: "AI Emergency Symptom Triage (Google Gemini)",
        tags: ["AI Medical Assistant"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AITriageRequest" },
            },
          },
        },
        responses: {
          200: { description: "Severity index (ESI 1-5), immediate first-aid steps, responder notes" },
        },
      },
    },
    "/api/ai/first-aid-guide": {
      get: {
        summary: "Instant AI First-Aid Guide for emergencies (choking, burns, CPR, etc.)",
        tags: ["AI Medical Assistant"],
        parameters: [
          {
            name: "topic",
            in: "query",
            required: true,
            schema: { type: "string", example: "severe bleeding" },
          },
        ],
        responses: {
          200: { description: "Structured step-by-step first-aid protocol" },
        },
      },
    },
    "/api/certificates/download/{enrollmentId}": {
      get: {
        summary: "Download verifiable PDF course certificate",
        tags: ["Certificates"],
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "enrollmentId",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: { description: "PDF certificate stream" },
        },
      },
    },
    "/api/certificates/verify/{enrollmentId}": {
      get: {
        summary: "Verify authenticity of a course certificate via QR Code",
        tags: ["Certificates"],
        parameters: [
          {
            name: "enrollmentId",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: { description: "Verification details and status" },
        },
      },
    },
  },
};

export const swaggerSpec = swaggerDocument;
export const swaggerServe = swaggerUi.serve;
export const swaggerSetup = swaggerUi.setup(swaggerDocument, {
  customSiteTitle: "MedHelp API Documentation",
});
