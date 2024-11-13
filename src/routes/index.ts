import express from "express";
import authRouter from "./auth";
import postRouter from "./post";
import checkMiddleware from "@middlewares/check";

const router = express.Router();

router.use("/auth", authRouter);
router.use("/post", checkMiddleware, postRouter);

export default router;