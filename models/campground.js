const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CampgroundSchema = Schema({
    title: String,
    image: String,
    price: Number,
    description: String,
    location: String,
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
});

//exporting the model created
module.exports = mongoose.model('Campground', CampgroundSchema);


