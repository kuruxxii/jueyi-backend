import { Router } from "express";
import { login, verify, status } from "../controllers/auth";

const router = Router();

router.post("/login", login);
router.get("/verify", verify);
router.get("/status", status);

export default router;
