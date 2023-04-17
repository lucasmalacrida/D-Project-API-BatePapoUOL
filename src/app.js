import express, { json } from 'express';
import cors from 'cors';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import joi from 'joi';
import dayjs from 'dayjs';

// Configs:
const app = express();
app.use(cors());
app.use(json());
dotenv.config();
dayjs().format();

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
    const { name } = req.body;

    const participantSchema = joi.object({
        name: joi.string().required()
    })
    const validation = participantSchema.validate(req.body, { abortEarly: false })
    if (validation.error) {
        const errors = validation.error.details.map(detail => detail.message)
        return res.status(422).send(errors);
    }

    try {
        const participant = await db.collection('participants').findOne({ name });
        if (participant) { return res.sendStatus(409) }

        const now = dayjs();
        await db.collection("receitas").insertOne({ name, lastStatus: now });

        const time = now.format('HH:mm:ss');
        await db.collection("messages").insertOne(
            {
                from: name,
                to: 'Todos',
                text: 'entra na sala...',
                type: 'status',
                time
            }
        );

        res.sendStatus(201);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.get('/participants', async (req, res) => {
    try {
        const participants = await db.collection('participants').find().toArray();
        res.send(participants);
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