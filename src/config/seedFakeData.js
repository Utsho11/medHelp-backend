import bcrypt from "bcrypt";
import pool from "./db.js";
import { generateId } from "../utils/generateId.js";

export const seedFakeData = async () => {
  try {
    console.log("🌱 Starting realistic fake data seeding for MedHelp TiDB Cloud...");

    const defaultPassword = await bcrypt.hash("Password@123", 12);

    // 1. Seed Trainers
    console.log("👨‍⚕️ Seeding Certified Medical Trainers...");
    const trainer1Id = generateId();
    const trainer2Id = generateId();
    const trainer3Id = generateId();
    const trainer4Id = generateId();

    await pool.query(
      `INSERT IGNORE INTO trainers (id, fullname, age, qualifications, bloodType, address, email, phoneNo) VALUES
       (?, 'Dr. Emily Watson, MD', 38, 'Emergency Medicine Specialist, ACLS & BLS Master Instructor', 'O+', 'Dhaka Medical College & Hospital', 'emily.watson@medhelp.org', '+8801711000101'),
       (?, 'Dr. Rafiqul Islam, MBBS', 42, 'Senior Trauma Surgeon, Red Cross Disaster Response Lead', 'A+', 'Kurmitola General Hospital', 'rafiqul.islam@medhelp.org', '+8801711000102'),
       (?, 'Sarah Jenkins, RN, EMT-P', 34, 'Chief Paramedic, Pediatric Life Support Specialist', 'B+', 'Apollo Emergency Center', 'sarah.jenkins@medhelp.org', '+8801711000103'),
       (?, 'Captain Tariq Ahmed', 45, 'Search & Rescue Paramedic, Wilderness Emergency Responder', 'AB+', 'Civil Defense Training Academy', 'tariq.ahmed@medhelp.org', '+8801711000104');`,
      [trainer1Id, trainer2Id, trainer3Id, trainer4Id]
    );

    // 2. Seed Volunteers (Responders)
    console.log("🚑 Seeding Volunteer First-Responders...");
    const vol1Id = generateId();
    const vol2Id = generateId();
    const vol3Id = generateId();
    const vol4Id = generateId();

    await pool.query(
      `INSERT IGNORE INTO users (id, firstName, lastName, email, age, gender, phone, address, role, password) VALUES
       (?, 'Alex', 'Carter', 'volunteer1@medhelp.com', 26, 'Male', '+8801811223344', 'Gulshan-2, Dhaka', 'volunteer', ?),
       (?, 'Nusrat', 'Jahan', 'volunteer2@medhelp.com', 24, 'Female', '+8801811223355', 'Dhanmondi 27, Dhaka', 'volunteer', ?),
       (?, 'Tanvir', 'Hasan', 'volunteer3@medhelp.com', 29, 'Male', '+8801811223366', 'Banani, Dhaka', 'volunteer', ?),
       (?, 'Zubair', 'Rahman', 'volunteer4@medhelp.com', 28, 'Male', '+8801811223377', 'Uttara Sector 7, Dhaka', 'volunteer', ?);`,
      [vol1Id, defaultPassword, vol2Id, defaultPassword, vol3Id, defaultPassword, vol4Id, defaultPassword]
    );

    // Set Volunteer Availabilities with GPS Coordinates around Dhaka
    await pool.query(
      `INSERT INTO volunteer_availability (volunteer_id, is_available, latitude, longitude) VALUES
       (?, 'available', 23.7925, 90.4078),
       (?, 'available', 23.7465, 90.3760),
       (?, 'inService', 23.7937, 90.4066),
       (?, 'notAvailable', 23.8759, 90.3795)
       ON DUPLICATE KEY UPDATE is_available=VALUES(is_available), latitude=VALUES(latitude), longitude=VALUES(longitude);`,
      [vol1Id, vol2Id, vol3Id, vol4Id]
    );

    // 3. Seed Patients
    console.log("🩹 Seeding Community Patients...");
    const pat1Id = generateId();
    const pat2Id = generateId();
    const pat3Id = generateId();

    await pool.query(
      `INSERT IGNORE INTO users (id, firstName, lastName, email, age, gender, phone, address, role, password) VALUES
       (?, 'Rahim', 'Uddin', 'patient1@medhelp.com', 52, 'Male', '+8801911445566', 'Mohakhali DOHS, Dhaka', 'patient', ?),
       (?, 'Farhana', 'Akter', 'patient2@medhelp.com', 31, 'Female', '+8801911445577', 'Mirpur 10, Dhaka', 'patient', ?),
       (?, 'Kamal', 'Hossain', 'patient3@medhelp.com', 64, 'Male', '+8801911445588', 'Badda, Dhaka', 'patient', ?);`,
      [pat1Id, defaultPassword, pat2Id, defaultPassword, pat3Id, defaultPassword]
    );

    // 4. Seed Courses
    console.log("📚 Seeding Training Courses...");
    const course1Id = generateId();
    const course2Id = generateId();
    const course3Id = generateId();
    const course4Id = generateId();

    await pool.query(
      `INSERT IGNORE INTO courses (id, courseName, trainer, startDate, duration) VALUES
       (?, 'Advanced Basic Life Support (BLS) & CPR Certification', ?, '2026-09-01', 3),
       (?, 'Emergency Trauma Care & Severe Bleeding Control', ?, '2026-09-15', 4),
       (?, 'Pediatric First Response & Choking Intervention', ?, '2026-10-01', 2),
       (?, 'Wilderness Search & Disaster Mass Casualty Management', ?, '2026-10-15', 6);`,
      [course1Id, trainer1Id, course2Id, trainer2Id, course3Id, trainer3Id, course4Id, trainer4Id]
    );

    // 5. Seed Enrollments
    console.log("📜 Seeding Course Enrollments & Certificates...");
    const enroll1Id = generateId();
    const enroll2Id = generateId();
    const enroll3Id = generateId();

    await pool.query(
      `INSERT IGNORE INTO enrollments (id, course_id, student_id, enrollment_date) VALUES
       (?, ?, ?, '2026-06-15 10:30:00'),
       (?, ?, ?, '2026-07-01 14:20:00'),
       (?, ?, ?, '2026-07-20 09:00:00');`,
      [enroll1Id, course1Id, vol1Id, enroll2Id, course2Id, vol2Id, enroll3Id, course3Id, vol1Id]
    );

    // 6. Seed Helps (Emergency Dispatches)
    console.log("🚨 Seeding Emergency Dispatches (Pending, Assigned, Completed)...");
    const help1Id = generateId();
    const help2Id = generateId();
    const help3Id = generateId();
    const help4Id = generateId();

    await pool.query(
      `INSERT IGNORE INTO helps (id, patient_id, latitude, longitude, status, volunteer_id, created_at, updated_at) VALUES
       (?, ?, 23.7772, 90.3995, 'pending', NULL, DATE_SUB(NOW(), INTERVAL 5 MINUTE), NOW()),
       (?, ?, 23.7808, 90.4192, 'pending', NULL, DATE_SUB(NOW(), INTERVAL 12 MINUTE), NOW()),
       (?, ?, 23.7925, 90.4078, 'assigned', ?, DATE_SUB(NOW(), INTERVAL 20 MINUTE), NOW()),
       (?, ?, 23.7465, 90.3760, 'completed', ?, DATE_SUB(NOW(), INTERVAL 3 HOUR), DATE_SUB(NOW(), INTERVAL 2 HOUR));`,
      [help1Id, pat1Id, help2Id, pat2Id, help3Id, pat3Id, vol3Id, help4Id, pat1Id, vol1Id]
    );

    console.log("\n=======================================================");
    console.log("🎉 FAKE DATA SEEDED SUCCESSFULLY INTO TIDB CLOUD!");
    console.log("=======================================================");
    console.log("🔑 Demo Credentials (Password for all: Password@123):");
    console.log("👑 Admin:      admin@medhelp.com (Admin@123456)");
    console.log("🚑 Volunteer:  volunteer1@medhelp.com (Password@123)");
    console.log("🚑 Volunteer:  volunteer2@medhelp.com (Password@123)");
    console.log("🩹 Patient:    patient1@medhelp.com (Password@123)");
    console.log("🩹 Patient:    patient2@medhelp.com (Password@123)");
    console.log("=======================================================\n");
  } catch (error) {
    console.error("❌ Error seeding fake data:", error.message);
  }
};

seedFakeData().then(() => process.exit(0));
