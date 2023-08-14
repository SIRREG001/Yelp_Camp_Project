
const mongoose = require('mongoose');
const Campground = require('../models/campground');
const cities = require('./cities');
const {places, descriptors} = require('./seedHelpers');

mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp',{
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", () =>{
    console.log("Database connected");
});

//making new titles
const sample = (array) =>{
    return array[Math.floor(Math.random() * array.length)];
};

//making new locations
const seedDB = async () =>{
    await Campground.deleteMany({});
    for(let i = 0; i < 50; i++){
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            image: 'https://source.unsplash.com/collection/349236',
            description: 'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Deleniti impedit ipsa repellendus nesciunt earum omnis tempora ab harum. Sunt voluptate nobis aliquid doloremque nam ratione repudiandae atque ad reprehenderit laborum?',
            price 
        })
        await camp.save();
    }
}

seedDB().then(() =>{
    mongoose.connection.close();
})