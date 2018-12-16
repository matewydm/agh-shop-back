var express = require('express');
var mongoose = require('mongoose');
var fs = require("fs");
var router = express.Router();

var Schema = mongoose.Schema;
var Promotions = new Schema({
    percentage: Number,
    expirationDate: Date
});
var Products = new Schema({
    _id: String,
    name: String,
    link: String,
    price: Number,
    category: String,
    description: String,
    amount: Number,
    promotion: Promotions
});
mongoose.model('product', Products);
var Product = mongoose.model('product');
var product = new Product();

router.post('/', function (req, res) {
    console.log(req.body);
    product._id = req.body.id;
    product.name = req.body.name;
    product.link = req.body.link;
    product.price = req.body.price;
    product.category = req.body.category;
    product.description = req.body.description;
    product.amount = req.body.amount;
    product.promotion = req.body.promotion;
    console.log(product);
    product.up(function(err) {
        if (err) throw err;
        console.log('Zadanie został o zapisane.');
    });
  console.log(req.body);
  res.status(200).json( req.body );
});

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
        product.promotion.expirationDate = new Date (req.body.promotion.expirationDate)
    }
    Product.findOneAndUpdate( {_id: id} ,
        product,
        {upsert: true},
        function(err, rows_updated) {
            if (err) throw err;
            console.log('Uaktualniono.', rows_updated);
        }
    );
    res.status(200);
});

router.get('/', function (req, res) {
    Product.find(function(err, products) {
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