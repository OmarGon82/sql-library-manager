const express = require('express');
const router = express.Router();
const Book = require('../models').Book;


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

/* Create a new book form. */
router.get('/new', (req, res) => {
    res.render("books/new-book", { book: {}, title: "New Book" });
});

/* POST create Book entry. */ 
router.post('/', handleAsync(async (req, res) => {
    let book;
    try {
        book = await Book.create(req.body);
        res.redirect("/books/" + book.id);
    } catch (error) {
        if( error.name === "SequelizeValidationError") {
            book = await Book.build(req.body);
            res.render("books/new", { book, errors: error.errors, title: "New Book" })
        } else {
            throw error;
        }
    }
}));

/* Edit book form. */
router.get("/:id/update-book", handleAsync(async(req, res) => {
    const book = await Book.findByPk(req.params.id);
    if(book) {
        res.render("books/update-book", { book, title: "Update Book Entry"});
    } else {
        res.sendStatus(404)
    }
}));


/*Get a single Book */
router.get("/:id", handleAsync(async(req, res) => {
    const book = await Book.findByPk(req.params.id)
    if(book) {
        res.render("books/show", { book, title: book.title});
    } else {
        res.sendStatus(404);
    }
}));

/* Update a book entry */
router.get("/:id/update-book", handleAsync(async(req, res) => {
    let book;
    try {
        book = await Book.findByPk(req.params.id);
        if(book) {
         await book.update(req.body)
         res.redirect("/books/" + book.id);
        } else {
            res.sendStatus(404)
        }
    } catch (error) {
        if( error.name === "SequelizeValidationError") {
            book = await Book.build(req.body);
            book.id = req.params.id
            res.render("books/update-book", { book, errors: error.errors, title: "Update Books"});
        }else {
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
        res.sendStatus(404);
    }
}))

/*Delete a single book */
router.post("/:id/delete", handleAsync( async (req, res) => {
    const book = await Book.findByPk(req.params.id);
    if(book) {
        await book.destroy();
        res.redirect("/books")
    } else {
        res.sendStatus(404)
    }
}));

module.exports = router;