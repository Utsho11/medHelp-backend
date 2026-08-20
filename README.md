# 🏥 MedHelp Backend - Rapid First-Responder Emergency Network

[![CI / Test Suite](https://github.com/Utsho11/medHelp-backend/actions/workflows/ci.yml/badge.svg)](https://github.com/Utsho11/medHelp-backend/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org)
[![OpenAPI / Swagger](https://img.shields.io/badge/Swagger-OpenAPI%203.0-green.svg)](http://localhost:5000/api/docs)

**MedHelp Backend** is an enterprise medical emergency dispatch and first-responder coordination platform. It connects emergency callers with nearby certified volunteers in real-time using native MySQL spatial geospatial calculations (`ST_Distance_Sphere`), Socket.io WebSocket dispatch, and Google Gemini AI clinical symptom triage.

---

## 🌟 Key Features

* **⚡ Real-Time Emergency SOS Engine (Socket.IO):** Instant emergency broadcasting (`emergency:new_request`), dedicated room coordination (`emergency_<id>`), live volunteer GPS location stream, and in-app responder chat.
* **🤖 AI Clinical Symptom Triage (Google Gemini):** Evaluates patient emergencies, outputs structured Emergency Severity Index ratings (ESI Level 1–5), immediate first-aid instructions, and responder gear notes (with offline rule-based fallback).
* **🗺️ Native Database Geospatial Radius Queries:** Leverages MySQL 8.0 `ST_Distance_Sphere(point, point)` for sub-millisecond proximity matching within 10 km.
* **🔒 Enterprise Security & Clean MVC Architecture:**
  - Strict **Zod** schema validations on all routes (`auth`, `user`, `help`, `course`, `trainer`, `ai`).
  - Centralized `globalErrorHandler.js` and `notFoundHandler.js`.
  - Database transactions (`beginTransaction`, `FOR UPDATE` locking, `commit`) preventing race conditions during help claiming.
  - Hardened with **Helmet**, **express-rate-limit**, and dynamic **CORS**.
* **📜 Verifiable Course Certificates (PDFKit + QR Code):** Generates downloadable landscape A4 PDF certificates with embedded QR codes linking to the public `/api/certificates/verify/:id` endpoint.
* **📖 Interactive Swagger/OpenAPI Documentation:** Full interactive API explorer mounted at `/api/docs`.

---

## 🛠️ Tech Stack

* **Runtime:** Node.js (ES Modules)
* **Framework:** Express.js 4.x
* **Database:** MySQL 8.0 / TiDB Serverless (`mysql2`)
* **Real-Time:** Socket.IO
* **AI:** Google Gemini Flash (`@google/genai`)
* **Security:** Helmet, Express Rate Limit, Bcrypt, JsonWebToken
* **Validation:** Zod
* **PDF & QR:** PDFKit, QRCode
* **Testing:** Jest, Supertest

---

## 🚀 Quick Start

### 1. Clone & Install
```bash
git clone https://github.com/Utsho11/medHelp-backend.git
cd medHelp-backend
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and fill in your details:
```env
PORT=5000
NODE_ENV=development

# Cloud / Local MySQL Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=medhelp_db

# Admin Seed Account
ADMIN_EMAIL=admin@medhelp.com
ADMIN_PASSWORD=Admin@123456

# JWT Secret
ACCESS_TOKEN_SECRET=your_super_secret_jwt_access_key

# Google Gemini API Key (Free tier from https://aistudio.google.com/)
GEMINI_API_KEY=your_gemini_api_key
```

### 3. Run Development Server
```bash
# Run with nodemon
npm run dev

# Or standard start
npm start
```
* **API Documentation:** [http://localhost:5000/api/docs](http://localhost:5000/api/docs)
* **Health Check:** [http://localhost:5000/health](http://localhost:5000/health)

### 4. Run Automated Test Suite
```bash
npm test
```

---

## 📡 API Overview

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Sign in & receive JWT Token | Public |
| `POST` | `/api/users` | Register patient or volunteer | Public |
| `GET` | `/api/users` | List users by role | Admin |
| `POST` | `/api/help/post-for-help` | Trigger SOS broadcast | Public / Patient |
| `GET` | `/api/help/help-for-volunteer` | List nearby emergencies (&lt; 10 km) | Volunteer |
| `PUT` | `/api/help/update-help-status` | Claim emergency dispatch | Volunteer |
| `PUT` | `/api/help/complete-help` | Mark emergency resolved | Volunteer |
| `POST` | `/api/ai/triage` | AI symptom analysis & ESI rating | Public |
| `GET` | `/api/ai/first-aid-guide` | Instant first-aid protocol guide | Public |
| `GET` | `/api/courses` | Browse training courses | Public |
| `POST` | `/api/courses/enrollments` | Enroll in course | Volunteer |
| `GET` | `/api/certificates/download/:id` | Download verifiable PDF | Authenticated |
| `GET` | `/api/certificates/verify/:id` | Public QR Verification | Public |

---

## 📜 License
MIT License. Open-source first-responder telemedicine platform.
