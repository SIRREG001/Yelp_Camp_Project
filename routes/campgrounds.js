const express = require('express');
const router = express.Router();
const catchAsync = require('../utilities/catchAsync');
const ExpressError = require('../utilities/ExpressError');
const Campground = require('../models/campground'); 
const {campgroundSchema} = require('../schemas.js');


//Middleware for validation
const validateCampground = (req, res, next) => {
    const {error} = campgroundSchema.validate(req.body)
    if(error){
        const errorMessage = error.details.map(element => element.message).join(',')
        throw new ExpressError(errorMessage, 400)
    }else{
        next();
    }
    
}


//view all camps
router.get('/', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds })
}))

//creating new campground
router.get('/new', (req, res) => {
    res.render('campgrounds/new');
})
router.post('/', validateCampground, catchAsync(async (req, res, next) => {
    //if(!req.body.campground) throw new ExpressError('Invalid Campgroung Data', 400);
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`)
}))

//show a campground
router.get('/:id', catchAsync(async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findById(id).populate('reviews');
    res.render('campgrounds/show', { campground });
}))

//updating campground
router.get('/:id/edit', catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    res.render('campgrounds/edit', { campground })
}))
router.put('/:id', validateCampground,catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    res.redirect(`/campgrounds/${campground._id}`);
}))

//Deleting campground
router.delete('/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}))

module.exports = router;