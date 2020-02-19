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


/* GET testing pagination */
// router.get("/:page", handleAsync(async (req, res) => {
//     const page = req.query.page;
//     const limit = 5;
//     const startIndex = (page - 1) * limit
//     const endIndex = parseInt(page) * limit
    
    // console.log("this is the start index: ", startIndex)
    // console.log("this is the eend index:", endIndex)
    // const books = await Book.findAndCountAll({ order: [["title", "ASC"]],limit:limit, offset:startIndex });
    // const neededPages = Math.ceil(books.count / limit)
    // const results = {}
    // if( endIndex < books.count) {
    //     books.next = {
    //         page: page +1,
    //         limit: limit
    //     }

    // }

    // if (startIndex > 0) {
    //     books.previous = {
    //         page: page - 1,
    //         limit: limit
    //     }
    // }
    
    
    // console.log("this is the book count: ",books.count)
    // const rows = books.rows
    // results.results = books
    // res.json(rows)
    
    // res.render("books/index",  {rows, neededPages});
//     res.render("books/index", {books, neededPages })

// }));
   


/* GET books listing. */
router.get('/', handleAsync(async (req, res) => {
    const books = await Book.findAll({ order: [["title", "ASC"]]})
    res.render("books/index", { books, title: "Library App" });
}));

/* Search for Books */
router.post('/', handleAsync( async (req, res) => {
    const term   = req.body;    
    const books = await Book.findAll({ 
    where: { 
    [Op.or]:
            {
                title: {
                    [Op.like]:`%${term.term.toLowerCase()}%`
                },
                author: {
                    [Op.like]:`%${term.term.toLowerCase()}%`
                },
                genre: {
                    [Op.like]: `%${term.term.toLowerCase()}%`
                },
                year: {
                    [Op.like]: `%${term.term.toLowerCase()}%`
                }  
            }
        } 
    })

    if(books.length >= 1) {
        res.render("books/index", { books , title: "Search results"});
    } else {
            throw error = {
                status: 404,
                message: "Your search returned no results"
            }
    }
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
        res.redirect("/books");
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
router.get("/:id/update", handleAsync(async(req, res) => {
    
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
                status: 500,
                message: "Looks like the book your trying to update doesn't exist"
            }
        }
    }
}));


/* Update a book entry */
router.post("/:id/update", handleAsync(async(req, res) => {
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
                res.redirect("/books"); 
            }
            throw error = {
                status: 500,
                message: "Looks like the book your trying to update doesn't exist"
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
        throw error = {
            status: 404,
            message: "The book you are trying to delete may have already been deleted or doesn't exist" 
        }  
    }else {
        const book = await Book.findByPk(req.params.id);
        if(book) {
            res.render("books/delete",{ book, title: "Delete Book"});
        }else {
            throw error = {   
                status: 500,
                message: "The book you are trying to delete may have already been deleted or doesn't exist" 
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
                message: "The book you are trying to delete may have already been deleted or doesn't exist" 
            }   
                
        }
    }
}));



module.exports = router;


