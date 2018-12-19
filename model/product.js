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

module.exports = mongoose.model('Product', Products);