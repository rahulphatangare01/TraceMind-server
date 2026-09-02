import mysql from "mysql2/promise";

import { databaseConfig } from "../config/database.js";

export const pool = mysql.createPool(databaseConfig);

export const connectDatabase = async (): Promise<void> => {
  let connection;

  try {
    connection = await pool.getConnection();

    await connection.ping();

    console.log("TraceMind database connected successfully");
  } catch (error) {
    console.error("Failed to connect to TraceMind database", error);

    throw error;
  } finally {
    connection?.release();
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  try {
    await pool.end();

    console.log("TraceMind database connection closed");
  } catch (error) {
    console.error("Failed to close TraceMind database", error);

    throw error;
  }
};
