'use srtrict';

// Load enviroment variable from .env file 
require('dotenv').config();

// server dependencies
const express = require('express');
const superagent = require('superagent');
const cors = require('cors');

// server setup
const app = express();
const PORT = process.env.PORT || 3000;

app.use('/public', express.static('./public'));
app.use(cors());

// set the view engine for templating
app.set('view engine', 'ejs');


app.get('/', (req, res) => {
    console.log('the route is working')
    res.render('pages/index');
});

// 
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));