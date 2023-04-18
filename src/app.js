import express, { json } from 'express';
import cors from 'cors';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import joi from 'joi';
import dayjs from 'dayjs';
import { stripHtml } from "string-strip-html";

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
    const name = stripHtml(req.body.name.trim()).result;

    const participantSchema = joi.object({
        name: joi.string().required()
    });
    const validation = participantSchema.validate(req.body, { abortEarly: false });
    if (validation.error) {
        const errors = validation.error.details.map(detail => detail.message);
        return res.status(422).send(errors);
    }

    try {
        const participant = await db.collection('participants').findOne({ name });
        if (participant) { return res.sendStatus(409) }

        const now = Date.now();
        const time = dayjs().format('HH:mm:ss');
        await db.collection('participants').insertOne({ name, lastStatus: now });
        await db.collection("messages").insertOne(
            {
                from: name,
                to: 'Todos',
                text: 'entra na sala...',
                type: 'status',
                time: time
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
    const user = req.headers.user;
    const to = stripHtml(req.body.to.trim()).result;
    const text = stripHtml(req.body.text.trim()).result;
    const type = stripHtml(req.body.type.trim()).result;

    const messageSchema = joi.object({
        to: joi.string().required(),
        text: joi.string().required(),
        type: joi.string().required().valid('message', 'private_message')
    });
    const validation = messageSchema.validate(req.body, { abortEarly: false });
    if (validation.error) {
        const errors = validation.error.details.map(detail => detail.message);
        return res.status(422).send(errors);
    }

    try {
        const participant = await db.collection('participants').findOne({ name: user });
        if (!participant) { return res.sendStatus(422) }

        const time = dayjs().format('HH:mm:ss');
        await db.collection('messages').insertOne(
            {
                from: user,
                to,
                text,
                type,
                time
            }
        );
        res.sendStatus(201);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.get('/messages', async (req, res) => {
    const user = req.headers.user;
    const limit = req.query.limit;
    try {
        const messages = await db.collection('messages').find({ $or: [{ from: user }, { to: user }, { to: 'Todos' }] }).toArray();

        if (limit) {
            const numLimit = Number(limit);
            if (Number.isInteger(numLimit) && numLimit >= 1) {
                return res.send(messages.slice(-numLimit));
            } else {
                return res.sendStatus(422);
            }
        }

        res.send(messages);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.post('/status', async (req, res) => {
    const user = req.headers.user;
    if (!user) { return res.sendStatus(404) }
    try {
        const participant = await db.collection('participants').findOne({ name: user });
        if (!participant) { return res.sendStatus(404) }

        await db.collection('participants')
            .updateOne({ _id: participant._id }, { $set: { name: user, lastStatus: Date.now() } })
        res.sendStatus(200);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.delete('/messages/:id', async (req, res) => {
    try {
        res.sendStatus(200);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.put('/messages/:id', async (req, res) => {
    try {
        res.sendStatus(200);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Remoção Automática de Usuários Inativos:
let idInterval;
function startClock() {
    idInterval = setInterval(refreshTime, 15000);
}
async function refreshTime(req,res) {
    const now = Date.now();
    try {
        const participants = await db.collection('participants').find({ lastStatus: { $lte: now - 10000 } }).toArray();
        if (participants.length>0) {
            await db.collection('participants').deleteMany({ lastStatus: { $lte: now - 10000 } });

            const time = dayjs().format('HH:mm:ss');
            await db.collection('messages').insertMany(
                participants.map(p => ({
                    from : p.name,
                    to : 'Todos',
                    text: 'sai da sala...',
                    type: 'status',
                    time
                }))
            );
        }
    } catch (err) {
        console.log(err.message);
    }
}

// Run Server:
const PORT = 5000;
app.listen(PORT, () => {
    startClock();
    console.log(`Running server on http://localhost:${PORT}`);
});