import express, { Request, Response } from "express";
import { model } from "mongoose";
import crypto from "crypto";
import multer from "multer";
import errors from "@utils/error";
import PostSchema from "@models/post";

const postRouter = express.Router();

/* 포스트 업로드 API
@Method POST
@body body string
@body thumbnail file
@status 
- 200 Ok
- 400 Title is empty 제목이 비어있습니다.
- 500 Unknown Error 알 수 없는 오류가 발생했을 경우
*/
interface uploadBody {
    body: string;
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/images/thumbnails')
    },
    filename: function (req, file, cb) {
        const shasum = crypto.createHash("sha1");
        const name = shasum.update(file.fieldname + Date.now()).digest("hex");
        const temp = file.originalname.split('.')
        const ext = temp[temp.length - 1]

        cb(null, name + '.' + ext)
    }
})
const upload = multer({ storage });

postRouter.post("/upload", upload.single("thumbnail"), async (req: Request, res: Response) => {
    const thumbnail = req.file?.filename;
    const { title, body } = req.body;
    const { UnknownError, TitleIsEmpty } = errors;

    if (title === undefined) {
        res.status(400).json({ error: TitleIsEmpty })
        return;
    }

    try {
        const postModel = model("post", PostSchema);
        await new postModel({
            author: req.user.id,
            title,
            body,
            thumbnail
        }).save()

        res.sendStatus(200);
    } catch (e) {
        console.log(e);
        res.status(500).json({ error: UnknownError })
    }
})

export default postRouter;