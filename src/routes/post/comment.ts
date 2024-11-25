import express, { Request, Response } from "express";
import PostSchema from "@models/post";
import { model } from "mongoose";
import check from "@middlewares/check";

const commentRouter = express.Router();

/* 포스트의 댓글 쓰기 API
    @Method POST
    @body postId string
    @body content string
    @status
    - 200 Ok
    - 400 Post id is empty 해당 포스트의 아이디가 존재하지 않을 경우
    - 400 Content is empty 해당 댓글 내용이 존재하지 않을 경우
    - 400 There isn't corresponding post 대응되는 포스트가 존재하지 않을 경우
    - 500 Unknown Error 알 수 없는 오류가 발생했을 때
*/
interface WriteProps {
    postId: string,
    content: string,
}

commentRouter.post("/write", check, async (req: Request, res: Response) => {
    const { postId, content }: WriteProps = req.body;

    if (postId === undefined) {
        res.status(400).json({ error: "Post id is empty" });
        return;
    }

    if (content === undefined) {
        res.status(400).json({ error: "Content is empty" });
        return;
    }

    try {
        const postModel = model("post", PostSchema);
        const post = await postModel.findById(postId);

        if (post === null) {
            res.status(400).json({ error: "There isn't corresponding post" })
            return;
        }

        await post.set("comments", [...post.comments, {
            author: req.user.id,
            content
        }]).save()

        res.sendStatus(200);
    } catch (e) {
        res.status(500).json({ error: "Unknown Error" });
    }
})

export default commentRouter;