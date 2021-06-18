const express = require('express');
const router = express.Router();

const Manufacturer = require('../models/manufacturer');

router.get('/', async function(req, res) {
    try {
        const allManufacturer = await Manufacturer.find({}).exec();

        res.render('manufacturer/index', { manufacturers: allManufacturer, title: 'All Manufacturers' });
    } catch (err) {
        console.log('Could not execute find all manufacturers.');
        //res.status(500);
        res.render('manufacturer/index', { manufacturers: [], title: 'All Manufacturers' });
    }
});

router.get('/create', async function(req, res) {
    res.render('manufacturer/create', { title: 'Creating Manufacturer', failure: false, description: "" });
});

router.post('/create', async function(req, res, next) {
    const data = req.body;

    if (!data.name) {
        console.log('Name was not provided for manufacturer.');
        res.render('manufacturer/create', { title: 'Creating Manufacturer', failure: true, description: data.description });
    }
    else {
        const newMan = new Manufacturer({
            name: data.name,
            description: data.description,
            products: []
        });

        newMan.save(function(err) {
            if (err) {
                return next(err);
            }
        });

        res.redirect('/manufacturer');
    }
});

router.get('/:id', async function(req, res, next) {
    const id = req.params.id;

    try {
        const manufacturer = await Manufacturer.findById(id)
            .populate('products')
            .exec();

        res.render('manufacturer/details', { id: id, title: 'Manufacturer Details', manufacturer: manufacturer })

    } catch (err) {
        return next(err);
    }
});

router.get('/delete/:id', async function(req, res, next) {
    const id = req.params.id;

    try {
        const manufacturer = await Manufacturer.findById(id).exec();

        res.render('manufacturer/delete', { title: 'Manufacturer Deletion', manufacturer: manufacturer })
    } catch (err) {
        return next(err);
    }
});

router.post('/delete/:id', async function(req, res, next) {
    const id = req.params.id;

    try {
        const manufacturer = await Manufacturer.findById(id).exec();

        await manufacturer.remove(function (err) {
            console.log('Error deleting manufacturer');
            return next(err);
        });

        res.redirect('/manufacturer');
    } catch (err) {
        return next(err);
    }
});

router.get('/edit/:id', async function(req, res, next) {
    const id = req.params.id;

    try {
        const manufacturer = await Manufacturer.findById(id).exec();

        res.render('manufacturer/edit', { title: 'Editing Manufacturer', manufacturer: manufacturer, failure: false })
    } catch (err) {
        return next(err);
    }
});

router.post('/edit/:id', async function(req, res, next) {
    const id = req.params.id;
    const data = req.body;

    try {
        const manufacturer = await Manufacturer.findById(id).exec();

        if (!data.name) {
            res.render('manufacturer/edit', {title: 'Editing Manufacturer', manufacturer: manufacturer, failure: true});
        }
        else
        {
            manufacturer.name = data.name;
            manufacturer.description = data.description;

            await manufacturer.save();

            res.render('manufacturer/details', { id: id, title: 'Manufacturer Details', manufacturer: manufacturer })
        }
    } catch (err) {
        return next(err);
    }
});

module.exports = router;