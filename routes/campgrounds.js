const express = require('express');
const router = express.Router();
const catchAsync = require('../utilities/catchAsync');
const ExpressError = require('../utilities/ExpressError');
const Campground = require('../models/campground'); 
const {campgroundSchema} = require('../schemas.js');
const {isLoggedIn} = require('../middleware.js');


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
router.get('/new', isLoggedIn, (req, res) => {
    res.render('campgrounds/new');
})
router.post('/', isLoggedIn, validateCampground, catchAsync(async (req, res, next) => {
    //if(!req.body.campground) throw new ExpressError('Invalid Campgroung Data', 400);
    const campground = new Campground(req.body.campground);
    await campground.save();
    req.flash('success', 'Thank you for contributing! Your Campground has been created');
    res.redirect(`/campgrounds/${campground._id}`)
}))

//show a campground
router.get('/:id', catchAsync(async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findById(id).populate('reviews');
    if(!campground){
        req.flash('error', 'Sorry!, Campground does not exist');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground });
}))

//updating campground
router.get('/:id/edit', isLoggedIn, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if(!campground){
        req.flash('error', 'Sorry!, Campground does not exist');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground })
}))
router.put('/:id',isLoggedIn, validateCampground,catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    req.flash('success', 'Successfully updated Campground!')
    res.redirect(`/campgrounds/${campground._id}`);
}))

//Deleting campground
router.delete('/:id',isLoggedIn, catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Campground Deleted!')
    res.redirect('/campgrounds');
}))

module.exports = router;