const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const Campground = require('./models/campground');
const methodOverride = require('method-override');
const engine = require('ejs-mate')


//connect to mongo database
mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", () => {
    console.log("Database connected");
});

//start express app
const app = express();
app.engine('ejs', engine);

//middleware setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
//parsing request middleware
app.use(express.urlencoded({ extended: true }))
//method override setup
app.use(methodOverride('_method'));
//serving public files
//app.use(express.static("public"))
//app.use("/static", express.static(path.join(__dirname, "public")))

//Home route
app.get('/', (_req, res) => {
    res.render('home')
});

//view all camps
app.get('/campgrounds', async (_req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds })
})

//creating new campground
app.get('/campgrounds/new', (_req, res) => {
    res.render('campgrounds/new');
})
app.post('/campgrounds', async (req, res) => {
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`)
})

//show a campground
app.get('/campgrounds/:id', async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    res.render('campgrounds/show', { campground });
})

//updating campground
app.get('/campgrounds/:id/edit', async (req, res) => {
    try {
        const { id } = req.params;
        const campground = await Campground.findById(id);
        console.log(campground);
        res.render('campgrounds/edit', { campground })
    }
    catch (error) {
        console.log(error)
    }
})
app.put('/campgrounds/:id', async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    res.redirect(`/campgrounds/${campground._id}`);
})

//Deleting campground
app.delete('/campgrounds/:id', async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
})

app.listen(3000, () => {
    console.log("App is listening to port 3000!!")
})