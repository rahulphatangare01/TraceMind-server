import fs from "node:fs/promises";
import path from "node:path";

import { pool } from "../connection.js";

const runSchemas = async (): Promise<void> => {
  try {
    const schemaDirectory = path.resolve(__dirname, "../schemas/tenant");

    const files = await fs.readdir(schemaDirectory);

    const schemaFiles = files.filter((file) => file.endsWith(".sql")).sort();

    console.log(`Found ${schemaFiles.length} database schema files`);

    for (const file of schemaFiles) {
      const filePath = path.join(schemaDirectory, file);

      console.log(`Running database schema: ${file}`);

      const sql = await fs.readFile(filePath, "utf-8");

      await pool.query(sql);

      console.log(`Database schema completed successfully: ${file}`);
    }

    console.log("All tenant database schemas executed successfully");

    await pool.end();

    process.exit(0);
  } catch (error) {
    console.error("Failed to execute database schemas:", error);

    await pool.end();

    process.exit(1);
  }
};

void runSchemas();
