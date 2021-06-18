const express = require('express');
const router = express.Router();

const Product = require('../models/product');

router.get('/', async function(req, res) {
    try {
        const allProducts = await Product.find({}).exec();

        res.render('category/index', { products: allProducts, title: 'All Products' });
    } catch (err) {
        console.log('Could not execute find all products.');
        //res.status(500);
        res.render('category/index', { categories: [], title: 'All Products' });
    }
});

module.exports = router;