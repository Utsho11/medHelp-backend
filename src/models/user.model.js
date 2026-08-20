import db from "../config/db.js";
import { generateId } from "../utils/generateId.js";
import bcrypt from "bcrypt";
import { jwtHelpers } from "../utils/jwtHelpers.js";
import config from "../config/index.js";
import AppError from "../middlewares/AppError.js";
import status from "http-status";

export const createUser = async (userData) => {
  const {
    firstName,
    lastName,
    email,
    age,
    gender,
    phone,
    address,
    role,
    password,
    guest_id,
  } = userData;

  const query = `
    INSERT INTO users (
      id, firstName, lastName, email, age, gender, phone, address, role, password
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
  `;

  const updateHelpsQuery = `
    UPDATE helps 
    SET patient_id = ?
    WHERE patient_id = ?
  `;

  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);
    const userId = generateId();

    // Execute the query
    const [result] = await db.execute(query, [
      userId,
      firstName,
      lastName,
      email,
      age,
      gender,
      phone,
      address,
      role,
      hashedPassword,
    ]);

    if (guest_id) {
      try {
        await db.execute(updateHelpsQuery, [userId, guest_id]);
      } catch (updateError) {
        console.error("❌ Error updating helps table for guest:", updateError.message);
      }
    }

    return { id: userId, affectedRows: result.affectedRows };
  } catch (error) {
    console.error("❌ Error creating user:", error.message);
    throw error;
  }
};

export const loginUser = async ({ email, password }) => {
  const query = "SELECT * FROM users WHERE email = ?";

  const [rows] = await db.execute(query, [email]);

  if (rows.length === 0) {
    throw new AppError(status.UNAUTHORIZED, "Invalid email or password");
  }

  const user = rows[0];

  // Fix: Correct property check on user record
  if (user.isBlocked) {
    throw new AppError(status.FORBIDDEN, "Your account has been blocked. Please contact admin.");
  }

  // Compare the password
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new AppError(status.UNAUTHORIZED, "Invalid email or password");
  }

  // Create JWT payload (do not expose password)
  const payload = {
    id: user.id,
    name: `${user.firstName} ${user.lastName}`,
    address: user.address,
    phone: user.phone,
    email: user.email,
    role: user.role,
    status: user.isBlocked,
  };

  const accessToken = jwtHelpers.generateToken(
    payload,
    config.access_token_secret,
    config.access_token_expires_in
  );

  return {
    accessToken,
    user: payload,
  };
};

// Get all users by role (excluding password hash)
export const getUsers = async (role) => {
  if (!role) {
    throw new AppError(status.BAD_REQUEST, "Role query parameter is required");
  }

  const query = `
    SELECT id, firstName, lastName, email, age, gender, phone, address, role, isBlocked, created_at 
    FROM users 
    WHERE role = ?
  `;

  const [rows] = await db.execute(query, [role]);
  return rows;
};

// Delete User
export const deleteUser = async (id) => {
  const query = `DELETE FROM users WHERE id = ?`;
  const [result] = await db.execute(query, [id]);

  if (result.affectedRows === 0) {
    throw new AppError(status.NOT_FOUND, "User not found with specified ID");
  }

  return { id, affectedRows: result.affectedRows };
};

// Toggle Block Status
export const toggleBlockStatus = async (id) => {
  const getStatusQuery = `SELECT isBlocked FROM users WHERE id = ?`;
  const updateQuery = `UPDATE users SET isBlocked = ? WHERE id = ?`;

  const [rows] = await db.execute(getStatusQuery, [id]);

  if (rows.length === 0) {
    throw new AppError(status.NOT_FOUND, "User not found with specified ID");
  }

  const currentStatus = rows[0].isBlocked;
  const newStatus = !currentStatus;

  const [result] = await db.execute(updateQuery, [newStatus, id]);

  return { id, isBlocked: Boolean(newStatus), affectedRows: result.affectedRows };
};

export const updateVolunteerAvailability = async (
  volunteerId,
  isAvailable,
  latitude,
  longitude
) => {
  const query = `
    INSERT INTO volunteer_availability (volunteer_id, is_available, latitude, longitude)
    VALUES (?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      is_available = VALUES(is_available),
      latitude = VALUES(latitude),
      longitude = VALUES(longitude),
      updated_at = CURRENT_TIMESTAMP;
  `;

  const [result] = await db.execute(query, [
    volunteerId,
    isAvailable,
    latitude,
    longitude,
  ]);
  return { affectedRows: result.affectedRows };
};

export const getVolunteerAvailability = async (volunteerId) => {
  const query = `SELECT * FROM volunteer_availability WHERE volunteer_id = ?;`;
  const [rows] = await db.execute(query, [volunteerId]);
  return rows[0] || null;
};

export const getVolunteerStatsById = async (volunteerId = null) => {
  let query = `
    SELECT 
      u.id AS volunteer_id,
      COUNT(DISTINCT h.id) AS number_of_helps,
      COUNT(DISTINCT e.id) AS number_of_enrolled_courses,
      GREATEST(
        COALESCE(MAX(h.updated_at), '2000-01-01'),
        COALESCE(MAX(e.enrollment_date), '2000-01-01'),
        COALESCE(MAX(va.updated_at), '2000-01-01')
      ) AS last_active
    FROM 
      users u
    LEFT JOIN 
      helps h ON u.id = h.volunteer_id
    LEFT JOIN 
      enrollments e ON u.id = e.student_id
    LEFT JOIN 
      volunteer_availability va ON u.id = va.volunteer_id
    WHERE 
      u.role = 'volunteer'
  `;

  const params = [];
  if (volunteerId) {
    query += " AND u.id = ?";
    params.push(volunteerId);
  }

  query += " GROUP BY u.id;";

  const [rows] = await db.query(query, params);

  return rows.map((row) => ({
    volunteerId: row.volunteer_id,
    numberOfHelps: Number(row.number_of_helps) || 0,
    numberOfEnrolledCourses: Number(row.number_of_enrolled_courses) || 0,
    lastActive: row.last_active ? new Date(row.last_active).toISOString() : null,
  }));
};
