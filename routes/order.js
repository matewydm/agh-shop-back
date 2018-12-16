var express = require('express');
var mongoose = require('mongoose');
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
var BasketProducts = new Schema({
    amount: Number,
    product: Products
});
var OrderProducts = new Schema({
    isRealised: Boolean,
    orderItem: BasketProducts
});
var Orders = new Schema({
    _id: String,
    items: [OrderProducts],
    userId: String,
    email: String,
    username: String,
    address: String,
    price: Number,
    status: String
});
mongoose.model('order', Orders);
var Order = mongoose.model('order');
var order = new Order();
const Product = mongoose.model('product');

router.put('/', function (req, res) {
    console.log(req.body);
    var id = req.body._id;
    order = req.body;
    Order.update( {_id: id} ,
        order,
        {multi: false},
        function(err, rows_updated) {
            if (err) throw err;
            console.log('Uaktualniono zamówienie.', rows_updated);
        }
    );
    res.status(200);
});

router.get('/', function (req, res) {
    var status = req.query.status;
    Order.find({status: status},function(err, orders) {
        if (err) throw err;
        console.log(orders);
        res.status(200).json( orders );
    });
});

router.post('/realize/part', function (req, res) {
    var id = req.query.id;
    var orderItems = req.body;
    Order.findOne({_id : id}, function(err, foundOrder) {
        if (err) throw err;
        console.log('Pobrano zamówienie.', foundOrder);
        order = foundOrder;
    }).then(function (order) {

        Order.update( {_id: id} ,
            {status : 'IN_PROGRESS'},
            {upsert: true},
            function(err, rows_updated) {
                if (err) throw err;
                console.log('Uaktualniono zamówienie częściowe.', rows_updated);
            }
        );

        realizeAllItems(orderItems).then(function () {
            var realisedIds = orderItems
                .filter(function (item) {
                    return item.isRealised === true;
                })
                .map(function (item) {
                    return item.orderItem.product._id;
                });
            order.items.forEach(function (item) {
                if (realisedIds.includes(item.orderItem.product._id)) {
                    item.isRealised = true;
                }
            });
            if (order.items.filter(function (item) {
                    return item.isRealised === false;
                }).length === 0) {

                order.status = 'REALISED';
            }
            console.log('Aktualizacja zamówienia', order);
            Order.update( {_id: id} ,
                order,
                {upsert: true},
                function(err, rows_updated) {
                    if (err) throw err;
                    console.log('Uaktualniono zamówienie.', rows_updated);
                }
            );
        });
    });
    res.status(200);
});

router.post('/realize', function (req, res) {
    var id = req.body._id;
    Order.findOne({_id : id}, function(err, foundOrder) {
        if (err) throw err;
        console.log('Pobrano zamówienie.', foundOrder);
        order = foundOrder;
    }).then(function (order) {

        Order.update( {_id: id} ,
            {status : 'IN_PROGRESS'},
            {upsert: true},
            function(err, rows_updated) {
                if (err) throw err;
                console.log('Uaktualniono zamówienie.', rows_updated);
            }
        );

        realizeAllItems(order.items).then(function () {
            if (order.items.filter(function (item) {
                    return item.isRealised === false;
                }).length === 0) {
                order.status = 'REALISED';
            }
            console.log('Aktualizacja zamówienia', order);
            Order.update( {_id: id} ,
                order,
                {upsert: true},
                function(err, rows_updated) {
                    if (err) throw err;
                    console.log('Uaktualniono zamówienie.', rows_updated);
                }
            );
        });
    });
    res.status(200);
});

async function realizeAllItems(items) {
    await Promise.all(items.map(async function(item) {
        await realizeItem(item);
    }));
}

async function realizeItem (item) {
    if (item.isRealised){
        console.log('Item already realized', item.orderItem.product._id);
        return;
    }
    var product = item.orderItem.product;
    await Product.findOne({_id: item.orderItem.product._id}, function (err, foundProduct) {
        if (err) throw err;
        console.log('Pobrano produkt.', foundProduct);
        product = foundProduct;
    });
    await updateProduct(item, product);
}

async function updateProduct(item, product) {
    const orderedAmount = item.orderItem.amount;
    if (product.amount < orderedAmount) {
        console.log('Produkt niedostępny.');
        item.isRealised = false;
    } else {
        console.log('Dostępność produktu:', product.amount);
        product.amount -= orderedAmount;
        await Product.update({_id: product._id},
            {amount: product.amount},
            {multi: false},
              function (err, rows_updated) {
                if (err) throw err;
                console.log('Uaktualniono.', rows_updated);
            }
        );
        console.log('Dostępność zaktualizowano produkt:', product.amount);
        item.isRealised = true;
    }
}

module.exports = router;
