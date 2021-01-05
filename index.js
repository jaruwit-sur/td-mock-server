import express from "express";
import bodyParser from "body-parser";
import cors from 'cors';
import mongoose from 'mongoose';
import * as router from './routers/router';
import * as dotenv from 'dotenv';

dotenv.config();

console.log("DB_HOST     : ", process.env.DB_HOST);
console.log("SERVER_PORT : ", process.env.SERVER_PORT);

mongoose.connect(process.env.DB_HOST, { useNewUrlParser: true})
.then(() => console.log("MongoDB connected ..."))
.catch(error => console.error(error))

const port = process.env.SERVER_PORT || 3000;
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(router.routers);
app.listen(port, async () => console.log(`TD Mock Server is running ... on port : ${port}`));