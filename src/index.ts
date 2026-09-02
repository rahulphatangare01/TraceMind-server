import app from "./app.js";

import { connectDatabase, disconnectDatabase } from "./database/index.js";

import { env } from "./config/index.js";

const startServer = async (): Promise<void> => {
  try {
    await connectDatabase();

    const server = app.listen(env.PORT, () => {
      console.log(`TraceMind server running on port ${env.PORT}`);
    });

    const shutdown = async (): Promise<void> => {
      console.log("TraceMind shutting down...");

      server.close(async () => {
        await disconnectDatabase();

        process.exit(0);
      });
    };

    process.on("SIGTERM", shutdown);

    process.on("SIGINT", shutdown);
  } catch (error) {
    console.error("Failed to start TraceMind server", error);

    process.exit(1);
  }
};

void startServer();
