const express = require('express');
const router = express.Router({mergeParams: true});
const catchAsync = require('../utilities/catchAsync');
const Review = require('../models/review');
const Campground = require('../models/campground');
const {validateReview, isLoggedIn, isAuthor, isReviewAuthor} = require('../middleware');
const reviews = require('../controllers/review');


router.post('/', validateReview, isLoggedIn, isAuthor, catchAsync(reviews.createReview))

router.delete('/:reviewId',isLoggedIn, isAuthor, isReviewAuthor, catchAsync(reviews.deleteReview))

module.exports = router; 