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
            //passes the error to global error handler
            next(error)
        }
    }
}

/* GET books listing. */
router.get('/', handleAsync(async (req, res) => {
    const books = await Book.findAll({ order: [["title", "ASC"]]})
    res.render("books/index", { books, title: "Library App" });
}));

/* Search for Books */
router.get('/search', handleAsync( async (req, res) => {
    let {term}  = req.query;
    term = term.toLowerCase();
    const books = await Book.findAll({ 
    where: { 
    [Op.or]:
            {
                title: {
                    [Op.like]: '%' + term + '%'
                },
                author: {
                    [Op.like]:'%' + term + '%'
                },
                genre: {
                    [Op.like]: '%' + term + '%'
                },
                year: {
                    [Op.like]: '%' + parseInt(term) + '%'
                }  
            }
        } 
    })
    res.render("books/searchResults", { books , title: "Search results"});
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

/**
 * Error handling is done by checking if the book id is a number or not
 * If the book Id is not a number then throw a 404 error letting the user know that the book doesn't exist
 * in the Else block if the book exists then render it else throw 500 error
 */

/* Upddate book form */
router.get("/:id", handleAsync(async(req, res) => {
    
    if(isNaN(parseInt(req.params.id))) {
        throw error = {
            status: 404,
            message: "Sorry that book doesn't exist"
        }
    } else {
        const book = await Book.findByPk(req.params.id);
        if(book) {
            res.render("books/update-book", { book, title: "Update Book"});
        } else {
            throw error = {
                status: 500
            }
        }
    }
}));

/* GET individual book. */
// router.get("/:id", handleAsync(async (req, res) => {
//     if(isNaN(parseInt(req.params.id))) {

//         throw error = {
//             status: 404,
//             message: "page not found"
//         }
//     } else {
//         const book = await Book.findByPk(req.params.id);
//         if(book) {
//             res.render("books/update-book", { book, title: book.title });  
//         } else {
//             throw error = {
//                 status: 500,
//             }
//         }
//     }
    
//   })); 


/* Update a book entry */
router.post("/:id", handleAsync(async(req, res) => {
    let book;
    try {
        
        if(isNaN(parseInt(req.params.id))) {
            throw error = {
                status: 404,
                message: "Sorry that book doesn't exist"
            }  
        } else {
            book = await Book.findByPk(req.params.id);
            if(book) {
                await book.update(req.body)
                res.redirect("/books/" + book.id); 
            }
            throw error = {
                status: 500,
            }
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
    if(isNaN(parseInt(req.params.id))) {
        console.log(typeof id)
        throw error = {
            status: 404,
            message: "Sorry that book doesn't exist"
        }  
    }else {
        const book = await Book.findByPk(req.params.id);
        if(book) {
            res.render("books/delete",{ book, title: "Delete Book"});
        }else {
            throw error = {   
                status: 500, 
            }
        }
    } 
}));

/*Delete a book entry */
router.post("/:id/delete", handleAsync( async (req, res) => {
    if(isNaN(parseInt(req.params.id))) {
        throw error = {
            status: 404,
            message: "Sorry that book doesn't exist"
        } 

    } else {
        const book = await Book.findByPk(req.params.id);
        if(book) {
            await book.destroy();
            res.redirect("/books")
        } else {
            throw error = {
                status: 500,
            }   
        }
    }
}));



module.exports = router;


