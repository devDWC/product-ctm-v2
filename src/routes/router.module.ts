import { Router } from "express";
import { RegisterRoutes as RegisterAdminRoutes } from "./admin/routes";
import { RegisterRoutes as RegisterPublicRoutes } from "./public/routes";
import { RegisterRoutes as RegisterMobileRoutes } from "./mobile/routes";
import { flowMiddleware } from "../middleware/flow.middleware";
const router = Router();

// Mount admin route vào /admin
const adminRouter = Router();
// adminRouter.use(flowMiddleware);
RegisterAdminRoutes(adminRouter);
router.use("/", adminRouter); // 👈 mount tại root

// Mount public route vào /public
const publicRouter = Router();
RegisterPublicRoutes(publicRouter);
router.use("/", publicRouter);

const mobileRouter = Router();
RegisterMobileRoutes(mobileRouter);
router.use("/", mobileRouter);
export default router;
