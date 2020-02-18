var express = require('express');
var router = express.Router();
const url = require('url')
/* GET home page. */
router.get('/', (req, res, next) => {
  
  // res.redirect("/books/page");
  res.redirect(url.format({
    pathname:"/books/page",
    query: {
      "page":1
    }
  }));
});

module.exports = router;
