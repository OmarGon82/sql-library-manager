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
    let page = req.query.page;
    let term = req.query.term
    const limit = 5;
    const startIndex = (page - 1) * limit
    // const books = await Book.findAndCountAll({ order: [["title", "ASC"]], limit:limit, offset:startIndex });
    
    if (!term) {

          const books = await Book.findAndCountAll({
            order: [['title', 'ASC']],
            limit: limit,
            offset: startIndex
          });
          const neededPages = Math.ceil(books.count / limit);
          res.render('books/index', { books, neededPages, title: 'Library App' });
      } else {
        const neededPages = Math.ceil(books.count / limit)
        const books = await Book.findAndCountAll({
            limit: limit,
            offset: startIndex,
            where: {
              [Op.or]: {
                title: {
                  [Op.like]: `%${term}%`
                },
                author: {
                  [Op.like]: `%${term}%`
                },
                genre: {
                  [Op.like]: `%${term}%`
                },
                year: {
                  [Op.like]: `%${term}%`
                }
              }
            }
        });
        // res.render('books/index', { books, neededPages, title: 'Search Results'})
    
    }
}));

/* Search for Books */
router.post('/', handleAsync( async (req, res) => {
    let term = req.body;
    term.term  = term.term.toLowerCase()
    const books = await Book.findAndCountAll({ 
    where: { 
    [Op.or]:
            {
                title: {
                    [Op.like]: `%${term.term}%`
                },
                author: {
                    [Op.like]:`%${term.term}%`
                },
                genre: {
                    [Op.like]: `%${term.term}%`
                },
                year: {
                    [Op.like]: `%${term.term}%`
                }  
            }
        } 
    })
    const query = term.term
    const limit = 5;
    const neededPages = Math.ceil(books.count / limit)
    if(books.count > 0) {  
        console.log("this is the query in the search route: ", query)
        res.render("books/index", { books, neededPages, query, title: "Search results"});
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
        res.redirect("/");
    } catch (error) {
        if( error.name === "SequelizeValidationError") {
            book = await Book.build(req.body);
            book.id = req.params.id
            res.render("books/new-book", { book, errors: error.errors, title: "New Book" })
        } else {
            throw error 

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
                status: 500,
                message: "Looks like the book your trying to update doesn't exist"
            }
        }
    }
}));


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
                res.redirect("/"); 
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
            res.redirect("/")
        } else {
            throw error = {
                status: 500,
                message: "The book you are trying to delete may have already been deleted or doesn't exist" 
            }   
                
        }
    }
}));



module.exports = router;


