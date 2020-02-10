const express = require('express');
const router = express.Router();
const Book = require('../models').Book;
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

function handleAsync(cb) {
    return async(req, res, next) => {
        try{
            await cb(req, res, next)
        } catch(error) {
            res.status(500).send(error);
        }
    }
}

/* GET books listing. */
router.get('/', handleAsync(async (req, res) => {
    const books = await Book.findAll({ order: [["title", "ASC"]]})
    res.render("books/index", { books, title: "Library App" });
}));

/* Get a new book form. */
router.get('/new', (req, res) => {
    res.render("books/new-book", { book: {}, title: "New Book" });
});

/* POST new Book entry. */ 
router.post('/new', handleAsync(async (req, res) => {
    let book;
    try {
        book = await Book.create(req.body);
        res.redirect("/books/" + book.id);
    } catch (error) {
        if( error.name === "SequelizeValidationError") {
            book = await Book.build(req.body);
            res.render("books/new-book", { book, errors: error.errors, title: "New Book" })
        } else {
            throw error;
        }
    }
}));

/* Upddate book form */
router.get("/:id", handleAsync(async(req, res) => {
    const book = await Book.findByPk(req.params.id);
    if(book) {
        res.render("books/update-book", { book, title: "Update Book"});
    } else {
        res.render("books/page-not-found");
    }
}));

/* Update a book entry */
router.post("/:id", handleAsync(async(req, res) => {
    let book;
    try {
        book = await Book.findByPk(req.params.id);
        if(book) {  
         await book.update(req.body)
         res.redirect("/books/" + book.id);
        } else {
            res.render("books/page-not-found");
        }
    } catch (error) {
        if( error.name === "SequelizeValidationError") {
            book = await Book.build(req.body);
            book.id = req.params.id
            res.render("books/update-book", { book, errors: error.errors, title: "Update Books"});
        } else {
            throw error;
        }
    }
}));

/*Delete book form */
router.get("/:id/delete", handleAsync(async(req, res) => {
    const book = await Book.findByPk(req.params.id);
    if(book) {
        res.render("books/delete",{ book, title: "Delete Book"});
    }else {
        res.render("books/page-not-found");
    }
}))

/*Delete a book entry */
router.post("/:id/delete", handleAsync( async (req, res) => {
    const book = await Book.findByPk(req.params.id);
    if(book) {
        await book.destroy();
        res.redirect("/books")
    } else {
        res.render("books/page-not-found");
    }
}));


/* Search for Books */
router.get('/search', handleAsync( async (req, res) => {
    const term  = req.query.term;
    console.dir("this is the req query: ", term)
    term = term.toLowerCase();
    const books = await Book.findAll({ where: { title: { [Op.like]: '%' + term + '%' } } })
    res.render("books/index", { books })
}))

module.exports = router;