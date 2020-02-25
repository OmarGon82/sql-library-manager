var express = require('express');
var router = express.Router();
const url = require('url')
/* GET home page. */
router.get('/', (req, res, next) => {
  //construct the exacth path for the home route.Giving it a query
  res.redirect(url.format({
    pathname:"/books",
    query: {
      "page":1
    }
  }));
});

module.exports = router;
