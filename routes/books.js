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
    const books = await Book.findAll({ order: [["createdAt", "DESC"]]})
    res.render("books/index", { books, title: "Sequelize-It!" });
}));

/* Create a new book form. */
router.get('/new', (req, res) => {
    res.render("books/new", { book: {}, title: "New Book" });
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

/* Edit article form. */
router.get("/:id/edit", handleAsync(async(req, res) => {
    const book = await Book.findByPk(req.params.id);
    if(book) {
        res.render("books/edit", { book, title: "Edit Book Entry"});
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
router.get("/:id/edit", handleAsync(async(req, res) => {
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
            res.render("books/edit", { book, errors: error.errors, title: "Edit Books"});
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