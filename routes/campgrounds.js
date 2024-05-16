const express = require('express');
const router = express.Router();
const campgrounds = require('../controllers/campgrounds');
const catchAsync = require('../utilities/catchAsync');
const Campground = require('../models/campground'); 
const {isLoggedIn, isAuthor, validateCampground} = require('../middleware');

//view all camps
router.get('/', catchAsync(campgrounds.index))

//creating new campground
router.get('/new', isLoggedIn, (req, res) => {
    res.render('campgrounds/new');
})
router.post('/', isLoggedIn, validateCampground, catchAsync(async (req, res, next) => {
    const campground = new Campground(req.body.campground);
    campground.author = req.user._id;
    await campground.save();
    req.flash('success', 'Thank you for contributing! Your Campground has been created');
    res.redirect(`/campgrounds/${campground._id}`)
}))

//show a campground
router.get('/:id', catchAsync(async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findById(id).populate('reviews').populate('author');
    console.log(campground)
    if(!campground){
        req.flash('error', 'Sorry!, Campground does not exist');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground });
}))

//updating campground
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if(!campground){
        req.flash('error', 'Sorry!, Campground does not exist');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground })
}))
router.put('/:id',isLoggedIn, isAuthor, validateCampground,catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    req.flash('success', 'Successfully updated Campground!')
    res.redirect(`/campgrounds/${campground._id}`);
}))

//Deleting campground
router.delete('/:id',isLoggedIn, isAuthor ,catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Campground Deleted!')
    res.redirect('/campgrounds');
}))

module.exports = router;