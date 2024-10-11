import express from "express";

const authRouter = express.Router();

authRouter.post("/signIn", 
    async (req, res) => {
       res.send("signIn")
    }
)

authRouter.post("/signUp",
    async (req, res) => {
        res.send("signUp")
    }
)

authRouter.post("/check", 
    async (req, res) => {
        res.send("check")
    }
)

export default authRouter;