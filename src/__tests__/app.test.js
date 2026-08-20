import request from "supertest";
import app from "../app.js";

describe("MedHelp Backend API Suite", () => {
  // 1. Health check test
  it("GET /health - should return 200 OK with operational service status", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
    expect(res.body.service).toContain("MedHelp");
  });

  // 2. Swagger API docs test
  it("GET /api/docs/ - should serve Swagger OpenAPI documentation", async () => {
    const res = await request(app).get("/api/docs/");
    expect([200, 301, 302]).toContain(res.status);
  });

  // 3. Validation test on login with missing body
  it("POST /api/auth/login - should return 400 Validation Error for missing credentials", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Validation Error");
  });

  // 4. Validation test on user registration with bad email
  it("POST /api/users - should reject invalid email format", async () => {
    const res = await request(app)
      .post("/api/users")
      .send({
        firstName: "Test",
        lastName: "User",
        email: "not-an-email",
        age: 25,
        gender: "Male",
        phone: "1234567890",
        address: "Test Address",
        role: "patient",
        password: "pass",
      });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  // 5. AI Emergency Triage endpoint test
  it("POST /api/ai/triage - should evaluate emergency symptoms and return clinical assessment", async () => {
    const res = await request(app)
      .post("/api/ai/triage")
      .send({
        symptoms: "Patient collapsed, unresponsive, suspected cardiac arrest",
        patientAge: 50,
        gender: "Male",
        isConscious: false,
        isBreathingNormally: false,
      });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("severityLevel");
    expect(res.body.data).toHaveProperty("immediateFirstAidSteps");
    expect(Array.isArray(res.body.data.immediateFirstAidSteps)).toBe(true);
  });

  // 6. AI First Aid Guide endpoint test
  it("GET /api/ai/first-aid-guide - should return protocol for choking", async () => {
    const res = await request(app).get("/api/ai/first-aid-guide?topic=choking");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("topic");
  });

  // 7. Not Found route test
  it("GET /api/unknown-route - should return standard 404 JSON error", async () => {
    const res = await request(app).get("/api/non-existent-route-xyz");
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
