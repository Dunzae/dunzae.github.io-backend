import express, { Request, Response } from "express";
import { model } from "mongoose";
import crypto from "crypto";
import multer from "multer";
import errors from "@utils/error";
import PostSchema from "@models/post";
import isInvalidBody from "@utils/isInvalidBody";
import checkMiddleware from "@middlewares/check";
import { stripHtml } from "string-strip-html";

const postRouter = express.Router();

/* 단일 포스트 가져오기 API
    @Method get
    @body id string
    @status
    - 200 Ok
    - 400 There is no id 아이디가 존재하지 않습니다.
    - 401 There is no post 포스트가 존재하지 않습니다.
    - 500 Unknown Error 알 수 없는 오류가 발생했을 경우
*/
interface GetPostQueryProps {
    id: string
}

postRouter.get("/", async (req: Request<{}, {}, {}, GetPostQueryProps>, res) => {
    const { id } = req.query
    const { UnknownError } = errors;

    if (isInvalidBody(id)) {
        res.status(400).json({ error: "There is no id" });
        return;
    }

    try {
        const postModel = model("post", PostSchema);
        const post = await postModel.findById(id);

        if (post === null) {
            res.status(400).json({ error: "There is no post" });
            return;
        }

        res.json({
            author : post.author,
            title : post.title,
            body : post.body,
            likeNum : post.like.num,
            thumbnail : post.thumbnail,
            createDate : post.createDate
        })
    } catch (e) {
        console.log(e);
        res.status(500).json({ error: UnknownError })
    }
})

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

postRouter.post("/upload", checkMiddleware, upload.single("thumbnail"), async (req: Request, res: Response) => {
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
        res.status(500).json({ error: UnknownError })
    }
})

/* 여러 포스트 반환하는 API
    @Method get
    @body type string
    @status 
    - 200 Ok
    - 400 Skip is empty. 스킵 값이 비었습니다.
    - 400 Type is unknown. 타입을 알 수가 없습니다.
    - 500 Unknown Error 알 수 없는 오류가 발생했을 경우
*/

interface getListQuery {
    type: string;
    skip: string;
    limit: string;
}
postRouter.get("/getList", async (req: Request<{}, {}, {}, getListQuery>, res) => {
    const { type, skip, limit } = req.query;
    const { TypeIsUnknown, LimitIsEmpty, NoMorePostsAvailable, UnknownError } = errors;

    if (isInvalidBody(limit)) {
        res.status(400).json({ error: LimitIsEmpty });
        return;
    }

    // if (isInvalidBody(type)) {
    //     res.status(400).json({ error: TypeIsUnknown });
    //     return;
    // }

    try {
        const postModel = model("post", PostSchema);
        const posts = await postModel.find({}).sort([["createDate", -1]]).skip(parseInt(skip ?? 0)).limit(parseInt(limit))

        if (posts === null) {
            res.status(401).json({ error: NoMorePostsAvailable })
            return;
        }

        res.json({
            posts: posts.map(post => ({
                id: post._id,
                author: post.author,
                title: post.title,
                body: stripHtml(post.body ?? "").result,
                likeNum: post.like.num,
                thumbnail: post.thumbnail,
                createDate: post.createDate,
            }))
        })
    } catch (e) {
        res.status(500).json({ error: UnknownError })
        return;
    }

})

export default postRouter;