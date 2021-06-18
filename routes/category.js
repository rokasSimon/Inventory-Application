const express = require('express');
const router = express.Router();

const Category = require('../models/category');

router.get('/', async function(req, res) {
    try {
        const allCategories = await Category.find({}).exec();

        res.render('category/index', { categories: allCategories, title: 'All Categories' });
    } catch (err) {
        console.log('Could not execute find all categories.');
        //res.status(500);
        res.render('category/index', { categories: [], title: 'All Categories' });
    }
});

router.get('/create', async function(req, res) {
    res.render('category/create', { title: 'Creating Category', failure: false, description: "" });
});

router.post('/create', async function(req, res, next) {
    const data = req.body;

    if (!data.name) {
        console.log('Name was not provided for category.');
        res.render('category/create', { title: 'Creating Category', failure: true, description: data.description });
    }
    else {
        const newCateg = new Category({
            name: data.name,
            description: data.description,
            products: []
        });

        newCateg.save(function(err) {
            if (err) {
                return next(err);
            }
        });

        res.redirect('/category');
    }
});

module.exports = router;