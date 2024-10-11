import express from "express";
import authRouter from "./auth";

const router = express.Router();

router.all("/auth", authRouter);

export default router;