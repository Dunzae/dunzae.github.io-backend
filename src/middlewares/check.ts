import { Request, Response, NextFunction } from "express"
import errors from "@utils/error";
import { verifyJwtToken } from "@utils/jwt";

export default (req: Request, res: Response, next: NextFunction) => {
    const { TokenIsEmpty, TokenIsInvalid } = errors;
    const jwt = req.headers.authorization?.split("Bearer ")[1];

    if (jwt === undefined) {
        res.status(400).json({ error: TokenIsEmpty })
        return;
    }


    const payload = verifyJwtToken(jwt);
    if (payload === false) {
        res.status(401).json({ error: TokenIsInvalid })
        return;
    }

    req.user = payload;
    next();
}