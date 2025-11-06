import express from "express";
import { authMe, test } from "../controllers/userController.js";

const router = express.Router();

router.get("/me", authMe);

export default router;
