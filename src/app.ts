import express from "express";
import dotenv from "dotenv";
import connectDb from "./connectDb"

dotenv.config({path : `.env.${process.env.NODE_ENV}`});
const app = express();
const {PORT, MONGO_URI} = process.env;

app.get('/', (req, res) => {
  res.send('Hello World!')
})

async function main() {
  const con = await connectDb(MONGO_URI as string);

  app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}`)
  })
}

main();