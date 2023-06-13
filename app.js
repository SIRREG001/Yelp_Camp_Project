const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const Campground = require('./models/campground');

//connect to mongo database
mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp',{
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", () =>{
    console.log("Database connected");
});

//start express app
const app = express();

//middleware setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
//parsing request middleware
app.use(express.urlencoded({extended: true}))

//Home route
app.get('/', (req, res) =>{
    res.render('home')
});

//view all camps
app.get('/campgrounds', async (req, res) =>{
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', {campgrounds})
})

//creating new campground
app.get('/campgrounds/new', (req, res) =>{
    res.render('campgrounds/new');
})
app.post('/campgrounds', async (req, res) =>{
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`)
})

//show a campground
app.get('/campgrounds/:id', async (req, res) =>{
    const {id} = req.params;
    const campground = await Campground.findById(id);
    res.render('campgrounds/show', {campground});
})


app.listen(3000, () =>{
    console.log("App is listening to port 3000!!")
})