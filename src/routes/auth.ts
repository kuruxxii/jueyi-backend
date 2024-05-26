import { Router } from "express";
import { login, verify } from "../controllers/auth";

const router = Router();

router.post("/login", login);
router.get("/verify", verify);

export default router;
