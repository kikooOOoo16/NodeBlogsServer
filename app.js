const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

const postsRoutes = require('./routes/posts');
const authRoutes = require('./routes/auth');
const app = express();

const result = dotenv.config();
if (result.error) {
    throw result.error
}

mongoose.connect(process.env.MONGODB_ATLAS_URL,
    {useNewUrlParser: true, useUnifiedTopology: true})
    .then(() => {
        console.log('Connected to DB!')
    })
    .catch(() => {
        console.log('Connection failed.');
    });

app.use(bodyParser.json()); // setup body parser
app.use(bodyParser.urlencoded({extended: false}));

app.use('/images', express.static(path.join('images'))); // allow access to requests aimed at images folder

// Allow CORS communication
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );
    res.setHeader(
        'Access-Control-Allow-Methods',
        'GET, POST, PATCH, PUT, DELETE, OPTIONS'
    );
    next();
});

app.use('/posts', postsRoutes);
app.use('/auth', authRoutes);

module.exports = app;
