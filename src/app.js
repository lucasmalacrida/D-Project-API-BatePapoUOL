import express, { json } from 'express';
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
const mongoClient = new MongoClient(process.env.DATABASE_URL);
try {
    await mongoClient.connect();
    console.log('MongoDB Connected!');
} catch (err) {
    console.log(err.message);
}
const db = mongoClient.db();

// EndPoints:
app.post('/participants', async (req, res) => {
    try {
        res.send(200);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.get('/participants', async (req, res) => {
    try {
        res.send(200);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.post('/messages', async (req, res) => {
    try {
        res.send(200);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.get('/messages', async (req, res) => {
    try {
        res.send(200);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.post('/status', async (req, res) => {
    try {
        res.send(200);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.delete('/messages/:id', async (req, res) => {
    try {
        res.send(200);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.put('/messages/:id', async (req, res) => {
    try {
        res.send(200);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Run Server:
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Running server on http://localhost:${PORT}`);
});