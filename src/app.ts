import express from "express";
import apiRouter from "./routes/index.js";
import { requestContextMiddleware } from "./common/middleware/request-context.middleware.js";
import { errorHandlerMiddleware } from "./common/middleware/error-handler.middleware.js";

const app = express();

app.use(requestContextMiddleware);
app.use(express.json());
app.use("/api/v1", apiRouter);
app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "TraceMind API is running",
  });
});
app.use(errorHandlerMiddleware);
export default app;
