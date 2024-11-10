import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import router from "./routes"
import connectDb from "./connectDb"

dotenv.config({path : `.env.${process.env.NODE_ENV}`});
const app = express();
const {PORT, MONGO_URI} = process.env;

app.use(cors());
app.use(express.json());
app.use(express.static("files"));
app.use(express.urlencoded({extended : true}));

app.use("/", router);

async function main() {
  try {
    const con = await connectDb(MONGO_URI as string);
    app.listen(PORT, () => {
      console.log(`app listening on port ${PORT}`)
    })
  } catch(e) {
    console.log(e);
  }

}

main();