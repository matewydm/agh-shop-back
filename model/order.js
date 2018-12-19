const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const Promotions = new Schema({
    percentage: Number,
    expirationDate: Date
});

const Products = new Schema({
    _id: String,
    name: String,
    link: String,
    price: Number,
    category: String,
    description: String,
    amount: Number,
    promotion: Promotions
});

const BasketProducts = new Schema({
    amount: Number,
    product: Products
});

const OrderProducts = new Schema({
    isRealised: Boolean,
    orderItem: BasketProducts
});

const Orders = new Schema({
    _id: String,
    items: [OrderProducts],
    userId: String,
    email: String,
    username: String,
    address: String,
    price: Number,
    status: String
});

module.exports = mongoose.model('Order', Orders);