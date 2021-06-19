const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const upload = require('../uploads/upload');

const Product = require('../models/product');
const Category = require('../models/category');
const Manufacturer = require('../models/manufacturer');

router.get('/', async function(req, res) {
    try {
        const allProducts = await Product.find({}).populate('manufacturer').exec();

        res.render('product/index', { products: allProducts, title: 'All Products' });
    } catch (err) {
        console.log('Could not execute find all products.');
        //res.status(500);
        res.render('product/index', { products: [], title: 'All Products' });
    }
});

router.get('/create', async function (req, res, next) {
    try {
        const [categories, manufacturers] = await Promise.all(
            [
                Category.find({}).exec(),
                Manufacturer.find({}).exec()
            ]);
        
        res.render('product/create',
            { 
              title: 'Add a New Product',
              categories: categories,
              manufacturers: manufacturers,
              validationErrors: []
            });

    } catch (err) {
        return next(err);
    }
});

router.post('/create', upload.single('image'), async function (req, res, next) {
    const data = req.body;

    console.log(req.file);

    let validationErrors = [];

    if (!data.name) validationErrors.push('No name provided');
    if (!data.price) validationErrors.push('No price provided');
    if (!data.stock) data.stock = 0;
    if (!data.manufacturer) validationErrors.push('No manufacturer provided');
    if (!data.category) validationErrors.push('No category provided');

    if (validationErrors.length > 0) {
        const [categories, manufacturers] = await Promise.all(
            [
                Category.find({}).exec(),
                Manufacturer.find({}).exec()
            ]);

        return res.render('product/create',
                    { 
                      title: 'Add a New Product',
                      categories: categories,
                      manufacturers: manufacturers,
                      validationErrors: validationErrors
                    });
    }

    try {
        const manufacturer = await Manufacturer.findById(data.manufacturer);
        const category = await Category.findById(data.category);

        if (manufacturer && category) {
            let newProduct = new Product({
                name: data.name,
                description: data.description,
                price: data.price,
                stock: data.stock,
                features: data.features.split(';'),
                image: {
                    data: fs.readFileSync(path.join(appRoot + '/uploads/' + req.file.filename)),
                    contentType: 'image/png'
                },

                manufacturer: manufacturer,
                category: category
            });

            await newProduct.save(function(err) {
                if (err) {
                    return next(err);
                }
            });

            manufacturer.products.push(newProduct);

            await manufacturer.save(function(err) {
                if (err) {
                    return next(err);
                }
            });

            category.products.push(newProduct);

            await category.save(function(err) {
                if (err) {
                    return next(err);
                }
            });

            res.redirect('/product');
        }
        else {
            res.redirect('/product/create');
        }
    } catch (err) {
        return next(err);
    }
});

router.get('/:id', async function (req, res, next) {
    const id = req.params.id;

    try {
        const product = await Product.findById(id).populate('manufacturer category').exec();

        res.render('product/details', { title: 'Product details', product: product });
    } catch (err) {
        return next(err);
    }
});

module.exports = router;