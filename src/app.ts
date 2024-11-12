import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import router from "./routes"
import http from "http";
import https from "https";
import fs from "fs";
import connectDb from "./connectDb"

dotenv.config({ path: `.env.${process.env.NODE_ENV}` });
const app = express();
const { MONGO_URI } = process.env;

const options = {
  key: fs.readFileSync('./privkey.pem'),
  cert: fs.readFileSync('./cert.pem'),
  ca: fs.readFileSync('./chain.pem'),
};

app.use(cors());
app.use(express.json());
app.use(express.static("files"));
app.use(express.urlencoded({ extended: true }));

app.use("/", router);

async function main() {
  try {
    const con = await connectDb(MONGO_URI as string);
    https.createServer(options, app).listen(443, () => {
      console.log(`app listening on port 443`)
    })

    http.createServer((req, res) => {
      res.writeHead(301, { "Location": `https://${req.headers.host}${req.url}` });
      res.end();
    }).listen(80);
  } catch (e) {
    console.log(e);
  }
}

async function devMain() {
  try {
    const con = await connectDb(MONGO_URI as string);
    app.listen(80, () => {
      console.log(`app listening on port 80`)
    })

  } catch (e) {
    console.log(e);
  }
}

if(process.env.NODE_ENV === "production") main();
else {
  devMain();
}

