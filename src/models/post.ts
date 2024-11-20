import { Schema } from "mongoose";

export interface IPoshSchema {
    author: string,
    like: {
        num: number,
        people: [Schema.Types.ObjectId]
    },
    title: string,
    body?: string,
    thumbnail?: string,
    createDate : Date,
}

const PostSchema = new Schema<IPoshSchema>({
    author: {
        type: String,
        required: true,
    },
    like: {
        num: {
            type: Number,
            default: 0,
        },
        people: {
            type: [Schema.Types.ObjectId],
            default: []
        }
    },
    title: {
        type: String,
        required: true,
    },
    body: {
        type: String,
        default: ""
    },
    thumbnail: {
        type: String,
        default: undefined,
        required: false,
    },
    createDate : {
        type : Date,
        default : Date.now,
    }
})

export default PostSchema;