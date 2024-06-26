const Review = require('../models/review');
const Campground = require('../models/campground');

module.exports.createReview = async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    campground.reviews.push(review);
    review.save();
    campground.save();
    req.flash('success', 'Hey! Your review has been added!')
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.deleteReview = async(req, res) =>{
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId }});
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Review Deleted!');
    res.redirect(`/campgrounds/${id}`);
}