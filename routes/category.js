const express = require('express');
const router = express.Router();

const Category = require('../models/category');

router.get('/', async function(req, res) {
    try {
        const allCategories = await Category.find({}).exec();

        res.render('category/index', { categories: allCategories, title: 'All categories' });
    } catch (err) {
        console.log('Could not execute find all categories.');
        res.status(500);
    }
});