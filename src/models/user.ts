import {Schema} from "mongoose";

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

export default UserSchema;