import { Router } from "express";
import { authMiddleware as authenticate } from "../../middleware/auth";
import { isStudent } from "../../middleware/roles";
import * as txController from "./controller";

const router = Router();

router.post("/spend", authenticate, isStudent, txController.spend);
router.get("/balance", authenticate, isStudent, txController.getBalance);
router.get(
  "/transactions",
  authenticate,
  isStudent,
  txController.getTransactions,
);

export default router;
