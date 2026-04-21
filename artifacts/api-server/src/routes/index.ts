import { Router, type IRouter } from "express";
import healthRouter from "./health";
import purchasesRouter from "./purchases";
import dashboardRouter from "./dashboard";
import insightsRouter from "./insights";
import profileRouter from "./profile";

const router: IRouter = Router();

router.use(healthRouter);
router.use(purchasesRouter);
router.use(dashboardRouter);
router.use(insightsRouter);
router.use(profileRouter);

export default router;
