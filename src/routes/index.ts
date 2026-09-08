// import { Router } from "express";

// import tenantRoutes from "../modules/tenants/routes/tenant.routes.js";

// const router = Router();

// router.use("/tenants", tenantRoutes);

// export default router;
import { Router } from "express";

import tenantRoutes from "../modules/tenants/routes/tenant.routes.js";

const router = Router();

router.use("/", tenantRoutes);

export default router;
