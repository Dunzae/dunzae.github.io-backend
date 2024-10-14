import express from "express";
import { model } from "mongoose";
import userSchema from "../models/user"

import errors from "../utils/error";
import { IssueJwtToken } from "../utils/jwt";
import isInvalidBody from "../utils/isInvalidBody"
import { comparePassword, hashPassword } from "../utils/password";

const authRouter = express.Router();


/* 로그인 API
    @Method POST
    @body id string
    @body password string
    @status 
    - 200 
        {
            accessToken string
            refreshToekn string
        }
    - 400 The input is empty 아이디나 비밀번호가 비어있을 때
    - 400 The input is invalid 아이디나 비밀번호가 정책에 맞지 않는 경우
    - 401 User does not exist 일치하는 아이디가 없는 경우
    - 401 Password is not correct 아이디에 해당하는 패스워드가 일치하지 않는 경우
    - 500 Unknown Error 알 수 없는 오류가 발생했을 경우
*/
interface signInBody {
    id: string;
    password: string;
}

authRouter.post("/signIn",
    async (req, res) => {
        const { id, password }: signInBody = req.body;
        const { InputIsEmpty, InputIsInvalid, UserDoesNotExist, PasswordIsNotCorrect } = errors;

        // 400 아이디나 비밀번호가 비어있는가?
        if (isInvalidBody(id, password)) {
            res.status(400).json({ error: InputIsEmpty });
            return;
        }

        // 400 아이디나 비밀번호가 정책에 맞지 않는 경우
        if (id.length < 6 || password.length < 6 || password.search(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~])[^  |\n]+$/gm) == -1) {
            res.status(400).json({ error: InputIsInvalid });
            return;
        }

        const userModel = model("user", userSchema);
        const user = await userModel.findOne({
            id
        });

        // 401 일치하는 아이디가 없는 경우
        if (user === null) {
            res.status(401).json({ error: UserDoesNotExist });
            return;
        }

        // 401 아이디에 해당하는 패스워드가 일치하지 않는 경우
        if (!(await comparePassword(password, user.password))) {
            res.status(401).json({ error: PasswordIsNotCorrect });
            return;
        }

        // jwt 생성
        const accessToken = IssueJwtToken("accessToken", {
            id,
            email: user.email
        });
        const refreshToken = IssueJwtToken("refreshToken");

        res.json({
            accessToken,
            refreshToken
        })
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