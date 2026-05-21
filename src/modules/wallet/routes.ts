import { Router } from "express";
import { authMiddleware as authenticate } from "../../middleware/auth";
import { isParent } from "../../middleware/roles";
import * as walletController from "./controller";

const router = Router();

router.post("/deposit", authenticate, isParent, walletController.deposit);
router.post("/set-limit", authenticate, isParent, walletController.setLimit);
router.get(
  "/transactions/:studentId",
  authenticate,
  isParent,
  walletController.getStudentTransactions,
);

export default router;
