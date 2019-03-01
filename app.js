const express = require('express');
const path = require('path');
const logger = require('morgan');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const MongoClient = require('mongodb').MongoClient;
const cors = require('cors');

const app = express();

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.use(cors());

const participants = require('./api/participants/index');
const users = require('./api/');

const auth = require('./middleware/auth');

dotenv.config();
(async () => {

    const client = await MongoClient.connect(process.env.DB, { useNewUrlParser:true });
    const db = client.db('Udaan-19');
    const userDb = client.db('Udaan-19-users');
    console.log('Connected to database');
    app.use('/events', auth, events(db));
    app.use('/users', users(userDb));

})();

module.exports = app;