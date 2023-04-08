'use srtrict';

// Load enviroment variable from .env file 
require('dotenv').config();

// server dependencies
const express = require('express');
const superagent = require('superagent');
const cors = require('cors');
const pg = require('pg');

// server setup
const app = express();
const PORT = process.env.PORT || 3000;
const DATABASE_URL = process.env.DATABASE_URL;
const client = new pg.Client(DATABASE_URL);

app.use('/public', express.static('./public'));
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// set the view engine for templating
app.set('view engine', 'ejs');


// app rouates
app.get('/', homePageHandler);
app.get('/searches/new', newSearchHandler);
app.post('/searches', showResultsHandler);
app.get('/books/:id', detailsHandler);
app.post('/books', saveBookHandler);
app.get('*', handleErrors);


/**
 * get all books from the database and render them in the homw page
 * @param {*} req 
 * @param {*} res 
 */
function homePageHandler(req, res) {

    const sql = 'SELECT * FROM books';

    client.query(sql, [])
    .then( data => {
        res.render('pages/index', {books: data});
    })
   
}

/**
 * render the search page
 * @param {*} req 
 * @param {*} res 
 */
function newSearchHandler(req, res) {
    res.render('pages/searches/new');
};

/**
 * get the data from the search page then send a request to google book api
 * get the data, formatted it, and render formatted data back to the user
 * @param {*} req 
 * @param {*} res 
 */
function showResultsHandler(req, res) {

    function Book (info) {
        this.image_url = info.volumeInfo.imageLinks ? info.volumeInfo.imageLinks.thumbnail : 'https://i.imgur.com/J5LVHEL.jpg';
        this.title = info.volumeInfo.title ? info.volumeInfo.title : 'NO title available';
        this.author = info.volumeInfo.authors ? info.volumeInfo.authors[0] : 'No author available';
        this.description = info.volumeInfo.description ? info.volumeInfo.description : 'No available description';
        this.isbn = `${info.volumeInfo.industryIdentifiers[0].type} ${info.volumeInfo.industryIdentifiers[0].identifier}`;
        this.bookshelf = info.volumeInfo.categories ? info.volumeInfo.categories[0] : 'No category available'
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
    .catch( error => {
         console.log('Error', error);
         res.render('pages/error')
    });
};

/**
 * get the book with specified book id from the database and send that book to the user
 * @param {*} req 
 * @param {*} res 
 */
function detailsHandler(req, res) {
    const id = req.params.id;
    const sql = 'SELECT * FROM books WHERE id = $1'
    const value = [id];
    console.log(id);
    client.query(sql, value)
    .then( data => {
        console.log(data);
        res.render('pages/books/show', {books: data.rows[0]});
    })
};

/**
 * get the book data from the form in searches/show.ejs file, parse it, insert it to the database
 * redirect the user with book data to details page  
 * @param {*} req 
 * @param {*} res 
 */
function saveBookHandler(req, res) {

    const book = JSON.parse(req.body.book);

    const sql = 'INSERT INTO books (author, title, isbn, bookshelf, image_url, description) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *';
    const values = [book.author, book.title, book.isbn, book.bookshelf, book.image_url, book.description];

    client.query(sql, values)
    .then( data => {
        res.redirect(`/books/${data.rows[0].id}`);
    })

    
}

/**
 * render error.ejs page
 * @param {*} req 
 * @param {*} res 
 */
function handleErrors(req, res) {
    res.render('pages/error');
}

// make sure that connection with database is resolved before listen to the server port
client.connect()
.then( () => {
    app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
})
.catch( error => console.log('Error', error));