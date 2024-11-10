import {Schema} from "mongoose";
import { hashPassword } from "../utils/password";

export interface IUserSchema {
    id : string,
    email : string,
    password : string
}

const UserSchema = new Schema<IUserSchema>({
    id : {
        type : String,
        minlength : 6,
        unique : true,
        required : true,
    },
    email : {
        type : String,
        unique : true,
        required : true,
        match: /.+@.+\..+/

    },
    password : {
        type : String,
        required : true
    }
})

UserSchema.pre("save", async function (next) {
    this.password = await hashPassword(this.password);
    next();
})

export default UserSchema;