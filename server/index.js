const keys = require('./keys');

// Express App
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Postgres
const { Pool } = require('pg');
const pgClient = new Pool({
    user: keys.pgUser,
    host: keys.pgHost,
    database: keys.pgDatabase,
    password: keys.pgPassword,
    port: keys.pgPort,
    ssl:
        process.env.NODE_ENV !== 'production'
            ? false
            : { rejectUnauthorized: false },
});

pgClient.on("connect", (client) => {
    client
        .query("CREATE TABLE IF NOT EXISTS values (number INT)")
        .catch((err) => console.error(err));
});  

// Redis
const redis = require('redis');
const redisClient = redis.createClient({
    host: keys.redisHost,
    port: keys.redisPort,
    retry_strategy: () => 1000
});

// Redis client must be duplicated, because if a client is used for listening, subscribing or publishing, then it cannot be used for anything else
const redisPublisher = redisClient.duplicate();

// Routes
app.get('/', (req, res) => {
    res.send('Hi');
});

app.get('/values/all', async (req, res) => {
    const values = await pgClient.query('SELECT * FROM values');
    res.send(values.rows);
});

app.get('/values/current', async (req, res) => {
    redisClient.hgetall('values', (err, values) => {
        res.send(values);
    });
});

app.post('/values', async (req, res) => {
    const index = req.body.index;

    if (parseInt(index) > 40) {
        return res.status(422).send('Index too high!');
    }

    // Put the index in Redis with a placeholder and wait until worker calculates the value
    redisClient.hset('values', index, 'Nothing yet!');
    // Wake up the worker process by publishing a message with the index
    redisPublisher.publish('insert', index);
    // Store a permament record of all indices we have ever submitted in Postgres
    pgClient.query('INSERT INTO values(number) VALUES ($1)', [index]);

    res.send({working: true});
});

app.listen(5000, err => {
    console.log('Listening')
});