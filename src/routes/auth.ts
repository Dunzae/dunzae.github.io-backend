import express from "express";
import { model } from "mongoose";
import userSchema from "@models/user"
import errors from "@utils/error";
import { IssueJwtToken, verifyJwtToken } from "@utils/jwt";
import isInvalidBody from "@utils/isInvalidBody"
import { comparePassword } from "@utils/password";
import { JwtPayload } from "jsonwebtoken";

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
        const refreshToken = IssueJwtToken("refreshToken", {
            id
        });

        res.json({
            accessToken,
            refreshToken
        })
    }
)

/* 회원가입 API
    @Method POST
    @body id string
    @body email string
    @body password string
    @status 
    - 200 
        {
            accessToken string
            refreshToekn string
        }
    - 400 The input is empty 아이디나 이메일, 비밀번호가 비어있을 때
    - 400 The input is invalid 아이디나 이메일, 비밀번호가 정책에 맞지 않는 경우
    - 401 The user exists 사용자가 이미 존재할 경우(아이디나 이메일이 존재하는 경우)
    - 500 Unknown Error 알 수 없는 오류가 발생했을 경우
*/

interface signUpBody {
    id: string;
    email: string;
    password: string;
}
authRouter.post("/signUp",
    async (req, res) => {
        const { id, email, password }: signUpBody = req.body;
        const { InputIsEmpty, InputIsInvalid, UserExists, UnknownError } = errors;

        // 400 아이디나 비밀번호가 비어있는가?
        if (isInvalidBody(id, email, password)) {
            res.status(400).json({ error: InputIsEmpty });
            return;
        }

        if (id.length < 6 || password.length < 6 || password.search(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~])[^  |\n]+$/gm) == -1
            || email.search(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/) == -1) {
            res.status(400).json({ error: InputIsInvalid });
            return;
        }

        const userModel = model("user", userSchema);
        try {
            const user = await userModel.findOne({
                $or: [{ id }, { email }]
            });

            if (user !== null) {
                res.status(400).json({ error: UserExists });
                return;
            }

            await new userModel({
                id, email, password
            }).save();

            // jwt 생성
            const accessToken = IssueJwtToken("accessToken", {
                id,
                email
            });
            const refreshToken = IssueJwtToken("refreshToken", {
                id
            });

            res.json({
                accessToken,
                refreshToken
            })
        } catch (e) {
            res.status(500).json({ error: UnknownError })
        }

    }
)

/* 토큰 확인하기 API
    @Method POST
    @body accessToken string
    @body refreshToken string
    @status 
    - 200 {
        accessToken string
    }
    - 400 The token is empty 토큰이 비었을 경우
    - 400 User does not exist 해당 토큰을 발급한 사용자가 존재하지 않을 경우
    - 401 The token is invalid 토큰이 유효하지 않을 때
    - 500 Unknown Error 알 수 없는 오류가 발생했을 경우
*/
authRouter.post("/check",
    async (req, res) => {
        const { TokenIsEmpty, TokenIsInvalid, UserDoesNotExist, UnknownError } = errors;
        const { accessToken, refreshToken } = req.body;

        if (isInvalidBody(accessToken, refreshToken)) {
            res.status(400).json({ error: TokenIsEmpty });
            return;
        }

        try {
            if (verifyJwtToken(accessToken) === false) {
                const decodedJwt = verifyJwtToken(refreshToken);
                if (decodedJwt === false) {
                    res.status(400).json({ error: TokenIsInvalid });
                    return;
                }

                const { id } = decodedJwt as JwtPayload;
                const userModel = model("user", userSchema);
                const user = await userModel.findOne({ id });

                if (user === null) {
                    res.status(401).json({ error: UserDoesNotExist })
                    return;
                }

                const newAccessToken = IssueJwtToken("accessToken", { id: user.id, email: user.email })

                res.json({accessToken : newAccessToken, refreshToken});
            } else {
                res.json({ accessToken, refreshToken });
            }
        } catch (e) {
            console.log(e);
            res.status(500).json({error : UnknownError})
        }
    }
)

export default authRouter;