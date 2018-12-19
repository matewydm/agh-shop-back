var express = require('express');
var router = express.Router();
const app = require('../app');

const Product = require('../model/product');
var product = new Product();

router.put('/', function (req, res) {
    console.log(req.body);
    var id = req.body._id;
    product.name = req.body.name;
    product.link = req.body.link;
    product.price = req.body.price;
    product.category = req.body.category;
    product.description = req.body.description;
    product.amount = req.body.amount;
    product.promotion = req.body.promotion;
    if (product.promotion) {
        product.promotion.expirationDate = new Date (req.body.promotion.expirationDate);
        app.promotion("Sprawdź promocję na " + product.name + ", teraz -" + product.promotion.percentage + "%");
    }
    Product.findOneAndUpdate( {_id: id} ,
        product,
        {upsert: true},
        function(err, rows_updated) {
            if (err) throw err;
            console.log('Uaktualniono.', rows_updated);
        }
    );
    app.productEdit("Edycja produktu " + product.name);
    res.status(200);
});

router.get('/', function (req, res) {
    var filter = {};
    var name = req.query.name;
    if (name !== null && typeof name !== typeof undefined) {
        filter['name'] = { "$regex": name, "$options": "i" } ;
    }
    var categories = req.query.categories;
    if (categories && categories.split('').length > 0) {
        filter['category'] = { $in: categories.split(',') };
    }
    console.log(filter);
    Product.find(filter, function(err, products) {
        if (err) throw err;
        for (var i = 0; i < products.length; i++) {
            var product = products[i];
            if (product.promotion &&
                product.promotion.expirationDate &&
                product.promotion.expirationDate.getTime() > new Date().getTime()){
                    const price = product.price - (product.price * product.promotion.percentage / 100);
                    product.price = Math.round(price * 100) / 100;
                    console.log('Promotion still available');
            } else {
                product.promotion = null;
            }
        }
        console.log(products);
        res.status(200).json( products );
    });
});

router.delete('/', function (req, res) {
    var id = req.query.id;
    Product.deleteOne({ _id: id }, function(err, product) {
        if (err) throw err;
        console.log(product);
    });
    res.status(200) ;
});

module.exports = router;
