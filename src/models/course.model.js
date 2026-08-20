import db from "../config/db.js";
import { generateId } from "../utils/generateId.js";
import AppError from "../middlewares/AppError.js";
import status from "http-status";

export const createCourse = async ({ courseName, trainer, startDate, duration }) => {
  const query = `
    INSERT INTO courses (
      id, courseName, trainer, startDate, duration
    ) VALUES (?, ?, ?, ?, ?);
  `;

  const courseId = generateId();
  const [result] = await db.execute(query, [
    courseId,
    courseName,
    trainer,
    startDate,
    duration,
  ]);

  return { id: courseId, affectedRows: result.affectedRows };
};

export const createEnrollment = async ({ courseId, studentId }) => {
  const query = `
    INSERT INTO enrollments (
      id, course_id, student_id
    ) VALUES (?, ?, ?);
  `;

  const id = generateId();
  const [result] = await db.execute(query, [id, courseId, studentId]);

  return { id, affectedRows: result.affectedRows };
};

export const getCourses = async () => {
  const query = `
    SELECT 
      courses.id AS courseId, 
      courses.courseName, 
      courses.startDate, 
      courses.duration, 
      trainers.id AS trainerId, 
      trainers.fullname AS trainerName, 
      trainers.email AS trainerEmail
    FROM courses
    JOIN trainers ON courses.trainer = trainers.id
    ORDER BY courses.created_at DESC;
  `;

  const [rows] = await db.execute(query);
  return rows;
};

// Update course by ID
export const updateCourse = async (id, updateData) => {
  const { courseName, trainer, startDate, duration } = updateData;

  const [existingRows] = await db.execute(
    "SELECT * FROM courses WHERE id = ?",
    [id]
  );

  if (existingRows.length === 0) {
    throw new AppError(status.NOT_FOUND, "No course found with the specified ID");
  }

  const updates = {};
  if (courseName !== undefined) updates.courseName = courseName;
  if (trainer !== undefined) updates.trainer = trainer;
  if (startDate !== undefined) updates.startDate = startDate;
  if (duration !== undefined) updates.duration = duration;

  if (Object.keys(updates).length === 0) {
    return { id, affectedRows: 0, message: "No fields provided to update" };
  }

  const setClause = Object.keys(updates)
    .map((key) => `${key} = ?`)
    .join(", ");

  const query = `UPDATE courses SET ${setClause} WHERE id = ?;`;
  const [result] = await db.execute(query, [...Object.values(updates), id]);

  return { id, affectedRows: result.affectedRows };
};

// Delete course by ID
export const deleteCourse = async (courseId) => {
  const query = `DELETE FROM courses WHERE id = ?;`;
  const [result] = await db.execute(query, [courseId]);

  if (result.affectedRows === 0) {
    throw new AppError(status.NOT_FOUND, "Course not found with specified ID");
  }

  return { id: courseId, affectedRows: result.affectedRows };
};

export const getCoursesByVolunteer = async (volunteerId) => {
  const query = `
    SELECT 
      e.id AS enrollmentId,
      c.id AS courseId,
      c.courseName,
      t.fullname AS trainerName,
      c.startDate,
      c.duration,
      e.enrollment_date
    FROM enrollments e
    JOIN courses c ON e.course_id = c.id
    JOIN trainers t ON c.trainer = t.id
    WHERE e.student_id = ?;
  `;

  const [rows] = await db.execute(query, [volunteerId]);
  return rows;
};

export const getCourseEnrollmentInfo = async () => {
  const query = `
    SELECT 
      c.id AS course_id,
      c.courseName AS course_name,
      c.startDate AS start_date,
      c.duration AS duration_months,
      COUNT(e.student_id) AS student_count
    FROM courses c
    LEFT JOIN enrollments e ON c.id = e.course_id
    GROUP BY c.id, c.courseName, c.startDate, c.duration;
  `;

  const [rows] = await db.query(query);
  return rows;
};
