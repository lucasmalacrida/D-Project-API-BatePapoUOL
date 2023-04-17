import express from 'express';
import cors from 'cors';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import joi from 'joi';

// Configs:
const app = express();
app.use(cors());
app.use(json());
dotenv.config();

// DataBase:
let db;
const mongoClient = new MongoClient(process.env.DATABASE_URL);
mongoClient.connect()
    .then(() => { db = mongoClient.db() })
    .catch((err) => console.log(err.message));

// EndPoints:


// Run Server:
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Running server on http://localhost:${PORT}`);
});