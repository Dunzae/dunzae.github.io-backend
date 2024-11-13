import { Schema } from "mongoose";

export interface IPoshSchema {
    author : Schema.Types.ObjectId,
    like : {
        num : number,
        people : [Schema.Types.ObjectId]
    },
    body : string,
}

const PostSchema = new Schema<IPoshSchema>({
    author: {
        type: Schema.Types.ObjectId,
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
    body: {
        type: String,
        default: ""
    }
})