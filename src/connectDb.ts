import mongoose from "mongoose";

async function connectDb(uri : string) {
    return await mongoose.connect(uri);
}

export default connectDb;