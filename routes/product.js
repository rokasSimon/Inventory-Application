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

        let image;

        if (!req.file) {
            image = null;
        }
        else {
            image = {
                data: fs.readFileSync(path.join(appRoot + '/uploads/' + req.file.filename)),
                contentType: 'image/png'
            };
        }

        if (manufacturer && category) {
            let newProduct = new Product({
                name: data.name,
                description: data.description,
                price: data.price,
                stock: data.stock,
                features: data.features.split(';'),
                image: image,

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

router.get('/delete/:id', async function (req, res, next) {
    const id = req.params.id;

    try {
        const product = await Product.findById(id).exec();

        res.render('product/delete', { title: 'Deleting Product', product: product });
    } catch (err) {
        return next(err);
    }
});

router.post('/delete/:id', async function (req, res, next) {
    const id = req.params.id;

    try {
        const product = await Product.findById(id).exec();

        await product.remove(function (err) {
            if (err) {
                return next(err);
            }
        });

        res.redirect('/product');
    } catch (err) {
        return next(err);
    }
});

router.get('/edit/:id', async function (req, res, next) {
    const id = req.params.id;

    try {
        const [categories, manufacturers, product] = await Promise.all(
            [
                Category.find({}).exec(),
                Manufacturer.find({}).exec(),
                Product.findById(id).populate('category manufacturer').exec()
            ]);
        
        res.render('product/edit',
            { 
              title: 'Add a New Product',
              product: product,
              categories: categories,
              manufacturers: manufacturers,
              validationErrors: []
            });

    } catch (err) {
        return next(err);
    }
});

router.post('/edit/:id', upload.single('image'), async function (req, res, next) {
    const data = req.body;
    const id = req.params.id;

    let validationErrors = [];

    if (!data.name) validationErrors.push('No name provided');
    if (!data.price) validationErrors.push('No price provided');
    if (!data.stock) data.stock = 0;
    if (!data.manufacturer) validationErrors.push('No manufacturer provided');
    if (!data.category) validationErrors.push('No category provided');

    if (validationErrors.length > 0) {
        const [categories, manufacturers, product] = await Promise.all(
            [
                Category.find({}).exec(),
                Manufacturer.find({}).exec(),
                Product.findById(id).populate('category manufacturer').exec()
            ]);

        return res.render('product/edit',
            { 
                title: 'Add a New Product',
                product: product,
                categories: categories,
                manufacturers: manufacturers,
                validationErrors: validationErrors
            });
    }

    try {
        const [manufacturer, category, product] = await Promise.all(
            [
                Manufacturer.findById(data.manufacturer).exec(),
                Category.findById(data.category).exec(),
                Product.findById(id).exec()
            ]
        );

        let image;

        if (!req.file) {
            image = product.image;
        }
        else {
            image = {
                data: fs.readFileSync(path.join(appRoot + '/uploads/' + req.file.filename)),
                contentType: 'image/png'
            };
        }

        if (manufacturer && category) {

            const [oldMan, oldCat] = await Promise.all(
                [
                    Manufacturer.findById(product.manufacturer._id).exec(),
                    Category.findById(product.category._id).exec()
                ]
            );

            oldMan.products.pull({ _id: product._id });
            oldCat.products.pull({ _id: product._id });

            await Promise.all(
                [
                    oldMan.save(),
                    oldCat.save()
                ]
            );
            
            product.name = data.name;
            product.description = data.description;
            product.price = data.price;
            product.stock = data.stock;
            product.features = data.features.split(';');
            product.image = image;

            manufacturer.products.push(product);
            category.products.push(product);

            product.category = category;
            product.manufacturer = manufacturer;

            try {
                await Promise.all(
                    [
                        manufacturer.save(),
                        category.save(),
                        product.save()
                    ]
                );
            } catch (err) {
                return next(err);
            }

            res.redirect(product.url);
        }
        else {
            res.redirect('/product/edit/' + product._id);
        }
    } catch (err) {
        return next(err);
    }
});

module.exports = router;