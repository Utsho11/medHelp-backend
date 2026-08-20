import db from "../config/db.js";
import { generateId } from "../utils/generateId.js";
import { haversineDistance } from "../utils/haversineDistance.js";
import AppError from "../middlewares/AppError.js";
import status from "http-status";

export const seekHelp = async ({ latitude, longitude, patient_id }) => {
  const query = `
    INSERT INTO helps (id, patient_id, latitude, longitude, status)
    VALUES (?, ?, ?, ?, 'pending');
  `;

  try {
    const helpId = generateId();
    const [result] = await db.execute(query, [
      helpId,
      patient_id,
      latitude,
      longitude,
    ]);

    return { id: helpId, status: "pending", affectedRows: result.affectedRows };
  } catch (error) {
    console.error("❌ Error seeking help:", error.message);
    throw error;
  }
};

export const getHelps = async () => {
  const query = `
    SELECT 
      helps.*,
      CONCAT(patient.firstName, ' ', patient.lastName) AS patientName,
      patient.phone AS patientPhone,
      CONCAT(volunteer.firstName, ' ', volunteer.lastName) AS volunteerName,
      volunteer.phone AS volunteerPhone
    FROM helps
    LEFT JOIN users AS patient ON helps.patient_id = patient.id
    LEFT JOIN users AS volunteer ON helps.volunteer_id = volunteer.id
    ORDER BY helps.created_at DESC
  `;

  const [rows] = await db.query(query);
  return rows;
};

export const getHelpForVolunteer = async (volunteerId) => {
  if (!volunteerId) {
    throw new AppError(status.BAD_REQUEST, "Missing volunteer ID parameter");
  }

  // Get volunteer's current location
  const [volunteerLocation] = await db.query(
    `
      SELECT latitude, longitude, is_available
      FROM volunteer_availability
      WHERE volunteer_id = ?
    `,
    [volunteerId]
  );

  if (!volunteerLocation || volunteerLocation.length === 0) {
    return [];
  }

  const { latitude: volunteerLat, longitude: volunteerLon } = volunteerLocation[0];

  if (!volunteerLat || !volunteerLon) {
    return [];
  }

  const vLat = parseFloat(volunteerLat);
  const vLon = parseFloat(volunteerLon);

  try {
    // High-performance MySQL Spatial query (ST_Distance_Sphere calculates distance in meters)
    const spatialQuery = `
      SELECT 
        h.id, h.patient_id, h.latitude, h.longitude, h.status, h.created_at,
        CONCAT(u.firstName, ' ', u.lastName) AS patientName,
        u.phone AS patientPhone,
        u.address AS patientAddress,
        ROUND(ST_Distance_Sphere(point(h.longitude, h.latitude), point(?, ?)) / 1000, 2) AS distance_km
      FROM helps h
      LEFT JOIN users u ON h.patient_id = u.id
      WHERE h.status = 'pending'
        AND ST_Distance_Sphere(point(h.longitude, h.latitude), point(?, ?)) <= 10000
      ORDER BY distance_km ASC
    `;

    const [rows] = await db.query(spatialQuery, [vLon, vLat, vLon, vLat]);
    return rows;
  } catch (spatialErr) {
    console.warn("⚠️ Spatial query fallback to Haversine calculation:", spatialErr.message);

    // Fallback using Haversine formula
    const [helps] = await db.query(`
      SELECT 
        h.id, h.patient_id, h.latitude, h.longitude, h.status, h.created_at,
        CONCAT(u.firstName, ' ', u.lastName) AS patientName,
        u.phone AS patientPhone,
        u.address AS patientAddress
      FROM helps h
      LEFT JOIN users u ON h.patient_id = u.id
      WHERE h.status = 'pending'
      ORDER BY h.created_at DESC
    `);

    const nearbyHelps = (helps || [])
      .map((help) => {
        const dist = haversineDistance(
          vLat,
          vLon,
          parseFloat(help.latitude),
          parseFloat(help.longitude)
        );
        return { ...help, distance_km: Number(dist.toFixed(2)) };
      })
      .filter((help) => help.distance_km <= 10)
      .sort((a, b) => a.distance_km - b.distance_km);

    return nearbyHelps;
  }
};

// Update help status with SQL Transaction
export const updateHelpStatus = async (helpId, volunteerId) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const [helps] = await connection.query(
      `SELECT status FROM helps WHERE id = ? FOR UPDATE`,
      [helpId]
    );

    if (helps.length === 0) {
      await connection.rollback();
      throw new AppError(status.NOT_FOUND, "Help request not found.");
    }

    const help = helps[0];

    if (help.status === "assigned" || help.status === "completed") {
      await connection.rollback();
      throw new AppError(
        status.CONFLICT,
        "Help request has already been assigned or completed."
      );
    }

    // Assign the volunteer and update status
    await connection.query(
      `UPDATE helps 
       SET status = 'assigned', volunteer_id = ?, updated_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [volunteerId, helpId]
    );

    // Update volunteer availability to inService
    await connection.query(
      `UPDATE volunteer_availability 
       SET is_available = 'inService', updated_at = CURRENT_TIMESTAMP 
       WHERE volunteer_id = ?`,
      [volunteerId]
    );

    await connection.commit();
    return { success: true, message: "Help assigned successfully." };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

// Complete help with SQL Transaction
export const completeHelp = async (helpId, volunteerId) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const [helps] = await connection.query(
      `SELECT status, volunteer_id FROM helps WHERE id = ? FOR UPDATE`,
      [helpId]
    );

    if (helps.length === 0) {
      await connection.rollback();
      throw new AppError(status.NOT_FOUND, "Help request not found.");
    }

    const help = helps[0];

    if (help.status !== "assigned") {
      await connection.rollback();
      throw new AppError(
        status.BAD_REQUEST,
        `Cannot complete help request with status: ${help.status}`
      );
    }

    if (volunteerId && help.volunteer_id !== volunteerId) {
      await connection.rollback();
      throw new AppError(
        status.FORBIDDEN,
        "You are not assigned to this help request."
      );
    }

    // Mark completed
    await connection.query(
      `UPDATE helps 
       SET status = 'completed', updated_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [helpId]
    );

    // Reset volunteer availability to available
    const targetVolunteerId = volunteerId || help.volunteer_id;
    if (targetVolunteerId) {
      await connection.query(
        `UPDATE volunteer_availability 
         SET is_available = 'available', updated_at = CURRENT_TIMESTAMP 
         WHERE volunteer_id = ?`,
        [targetVolunteerId]
      );
    }

    await connection.commit();
    return { success: true, message: "Help completed successfully." };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export const getHelpById = async (helpId) => {
  const [helps] = await db.query(
    `SELECT 
       h.*,
       CONCAT(p.firstName, ' ', p.lastName) AS patientName,
       p.phone AS patientPhone,
       CONCAT(v.firstName, ' ', v.lastName) AS volunteerName,
       v.phone AS volunteerPhone
     FROM helps h
     LEFT JOIN users p ON h.patient_id = p.id
     LEFT JOIN users v ON h.volunteer_id = v.id
     WHERE h.id = ?`,
    [helpId]
  );

  if (helps.length === 0) {
    throw new AppError(status.NOT_FOUND, "Help request not found.");
  }

  return helps[0];
};

export const getRunningServices = async (volunteerId) => {
  const [services] = await db.query(
    `SELECT 
       h.*,
       CONCAT(p.firstName, ' ', p.lastName) AS patientName,
       p.phone AS patientPhone,
       p.address AS patientAddress
     FROM helps h
     LEFT JOIN users p ON h.patient_id = p.id
     WHERE h.volunteer_id = ? AND h.status = 'assigned'`,
    [volunteerId]
  );

  return services;
};

export const getServiceHistory = async (volunteerId) => {
  const [history] = await db.query(
    `SELECT 
       h.*,
       CONCAT(p.firstName, ' ', p.lastName) AS patientName,
       p.phone AS patientPhone
     FROM helps h
     LEFT JOIN users p ON h.patient_id = p.id
     WHERE h.volunteer_id = ? AND h.status = 'completed'
     ORDER BY h.updated_at DESC`,
    [volunteerId]
  );

  return history;
};

export const getPatientHelpHistory = async (patientId) => {
  const query = `
    SELECT 
      h.id,
      h.status,
      h.latitude,
      h.longitude,
      CONCAT(u.firstName, ' ', u.lastName) AS volunteerName,
      u.phone AS volunteerPhone,
      h.created_at AS helpDate,
      h.updated_at AS completedDate
    FROM helps h
    LEFT JOIN users u ON h.volunteer_id = u.id
    WHERE h.patient_id = ?
    ORDER BY h.created_at DESC
  `;

  const [rows] = await db.query(query, [patientId]);
  return rows;
};
