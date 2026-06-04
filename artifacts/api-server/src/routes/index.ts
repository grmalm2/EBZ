import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import categoriesRouter from "./categories";
import businessesRouter from "./businesses";
import adsRouter from "./ads";
import usersRouter from "./users";
import dashboardRouter from "./dashboard";
import searchRouter from "./search";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(categoriesRouter);
router.use(businessesRouter);
router.use(adsRouter);
router.use(usersRouter);
router.use(dashboardRouter);
router.use(searchRouter);

export default router;
