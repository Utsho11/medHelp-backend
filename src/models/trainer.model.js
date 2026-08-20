import db from "../config/db.js";
import { generateId } from "../utils/generateId.js";
import AppError from "../middlewares/AppError.js";
import status from "http-status";

export const createTrainer = async (trainerData) => {
  const { fullname, age, qualifications, bloodType, address, email, phoneNo } =
    trainerData;

  const query = `
    INSERT INTO trainers (
      id, fullname, age, qualifications, bloodType, address, email, phoneNo
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?);
  `;

  const trainerId = generateId();

  const [result] = await db.execute(query, [
    trainerId,
    fullname,
    age,
    qualifications,
    bloodType,
    address,
    email,
    phoneNo,
  ]);

  return { id: trainerId, affectedRows: result.affectedRows };
};

export const getTrainers = async () => {
  const query = `SELECT * FROM trainers ORDER BY created_at DESC`;
  const [rows] = await db.execute(query);
  return rows;
};

export const editTrainerById = async (id, trainerData) => {
  const { fullname, age, qualifications, bloodType, address, email, phoneNo } =
    trainerData;

  const [existingRows] = await db.execute(
    "SELECT * FROM trainers WHERE id = ?",
    [id]
  );

  if (existingRows.length === 0) {
    throw new AppError(status.NOT_FOUND, "No trainer found with the specified ID");
  }

  const updates = {};
  if (fullname !== undefined) updates.fullname = fullname;
  if (age !== undefined) updates.age = age;
  if (qualifications !== undefined) updates.qualifications = qualifications;
  if (bloodType !== undefined) updates.bloodType = bloodType;
  if (address !== undefined) updates.address = address;
  if (email !== undefined) updates.email = email;
  if (phoneNo !== undefined) updates.phoneNo = phoneNo;

  if (Object.keys(updates).length === 0) {
    return { id, affectedRows: 0, message: "No fields provided to update" };
  }

  if (updates.age !== undefined && updates.age <= 18) {
    throw new AppError(status.BAD_REQUEST, "Age must be greater than 18");
  }

  const setClause = Object.keys(updates)
    .map((key) => `${key} = ?`)
    .join(", ");

  const query = `UPDATE trainers SET ${setClause} WHERE id = ?;`;
  const [result] = await db.execute(query, [...Object.values(updates), id]);

  return { id, affectedRows: result.affectedRows };
};

export const deleteTrainerById = async (id) => {
  const query = `DELETE FROM trainers WHERE id = ?`;
  const [result] = await db.execute(query, [id]);

  if (result.affectedRows === 0) {
    throw new AppError(status.NOT_FOUND, "Trainer not found with specified ID");
  }

  return { id, affectedRows: result.affectedRows };
};
