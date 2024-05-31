import { Router } from "express";
import { login, verify, status, logout } from "../controllers/auth";

const router = Router();

router.post("/login", login);
router.get("/verify", verify);
router.get("/status", status);
router.get("/logout", logout);

export default router;
