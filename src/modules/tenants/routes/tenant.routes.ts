import { Router } from "express";

import { organizationRoutes } from "./index.js";

const router = Router();

router.use("/organizations", organizationRoutes);

export default router;
