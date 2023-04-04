'use srtrict';

// Load enviroment variable from .env file 
require('dotenv').config();

// server dependencies
const express = require('express');
const superagent = require('superagent');
const cors = require('cors');
const { attachCookies } = require('superagent');

// server setup
const app = express();
const PORT = process.env.PORT || 3000;

app.use('/public', express.static('./public'));
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// set the view engine for templating
app.set('view engine', 'ejs');

//const jsFile = require('./public/js/app.js');

app.get('/', homePageHandler);
app.get('/searches/new', newSearchHandler);
app.post('/searches', showResultsHandler);
app.get('*', handleErrors);

function homePageHandler(req, res) {
    res.render('pages/index');
}


function newSearchHandler(req, res) {
    res.render('pages/searches/new');
};


function showResultsHandler(req, res) {

    function Book (info) {
        this.image_url = info.volumeInfo.imageLinks ? info.volumeInfo.imageLinks.thumbnail : 'https://i.imgur.com/J5LVHEL.jpg';
        this.title = info.volumeInfo.title ? info.volumeInfo.title : 'NO title available';
        this.author = info.volumeInfo.authors ? info.volumeInfo.authors[0] : 'No author available';
        this.description = info.volumeInfo.description ? info.volumeInfo.description : 'No available description'
    }

    let url = 'https://www.googleapis.com/books/v1/volumes?q=';

    if(req.body.search === 'title') {url += `intitle:${req.body.searchWord}`};
    if(req.body.search === 'author') {url += `inauthor:${req.body.searchWord}`};


    superagent.get(url)
    .then( data => {
        const booksObjs = data.body;

        const books = booksObjs.items.reduce( (a, book) => {
            a.push(new Book(book));
            return a;
        }, [])
        res.render('pages/searches/show', {books: books});
    })
};


function handleErrors(req, res) {
    res.render('pages/error');
}

// 
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));