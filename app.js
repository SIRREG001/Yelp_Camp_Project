const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const engine = require('ejs-mate')
const session = require('express-session');
const ExpressError = require('./utilities/ExpressError'); 
const campgrounds =  require('./routes/campgrounds');
const reviews = require('./routes/reviews');

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
app.use(express.static(path.join(__dirname, 'public')))

// const sessionConfig = {
//     secret: 'thisshouldbesecret',
//     resave: false,
//     saveUninitialized: true,
//     cookie: {
//         expires: Date.now() + 
//     }
// }
// app.use(session(sessionConfig))




app.use('/campgrounds', campgrounds)
app.use('/campgrounds/:id/reviews', reviews)

//Home route
app.get('/', (req, res) => {
    res.render('home')
});





//Handling error
app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
    
})

app.use((err, req, res, next) => {
    const {statusCode = 500} = err;
    if(!err.message) err.message = 'Something went wrong';
    res.status(statusCode).render('error', {err});
})


app.listen(3000, () => {
    console.log("App is listening to port 3000!!")
})