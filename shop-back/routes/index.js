var express = require('express');
var router = express.Router();

/* GET home page. */
app.get('/', function (req, res) {
    res.send('działa ale na razie statycznie')
});
app.listen(3000);

module.exports = router;
