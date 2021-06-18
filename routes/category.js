const express = require('express');
const router = express.Router();

const Category = require('../models/category');
const Product = require('../models/product');

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

router.get('/:id', async function(req, res, next) {
    const id = req.params.id;

    try {
        const category = await Category.findById(id)
            .populate('products products.manufacturer')
            .exec();

        console.log(category);

        res.render('category/details', { id: id, title: 'Category Details', category: category })

    } catch (err) {
        return next(err);
    }
});

router.get('/delete/:id', async function(req, res, next) {
    const id = req.params.id;

    try {
        const category = await Category.findById(id).exec();

        res.render('category/delete', { title: 'Category Deletion', category: category })
    } catch (err) {
        return next(err);
    }
});

router.post('/delete/:id', async function(req, res, next) {
    const id = req.params.id;

    try {
        const category = await Category.findById(id).exec();

        await Product.deleteMany({
            _id: { $in: category.products }
        });

        await category.remove(function (err) {
            console.log('Error deleting category');
            return next(err);
        });

        res.redirect('/category');
    } catch (err) {
        return next(err);
    }
});

router.get('/edit/:id', async function(req, res, next) {
    const id = req.params.id;

    try {
        const category = await Category.findById(id).exec();

        res.render('category/edit', { title: 'Editing Category', category: category, failure: false })
    } catch (err) {
        return next(err);
    }
});

router.post('/edit/:id', async function(req, res, next) {
    const id = req.params.id;
    const data = req.body;

    try {
        const category = await Category.findById(id).exec();

        if (!data.name) {
            res.render('category/edit', {title: 'Editing Category', category: category, failure: true});
        }
        else
        {
            category.name = data.name;
            category.description = data.description;

            await category.save();

            res.render('category/details', { id: id, title: 'Category Details', category: category })
        }
    } catch (err) {
        return next(err);
    }
});

module.exports = router;