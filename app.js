if(process.env.NODE_ENV !== "production"){
    require('dotenv').config();
}




const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const engine = require('ejs-mate')
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utilities/ExpressError'); 
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
const userRoutes =  require('./routes/user');
const passport = require('passport');
const localStrategy = require('passport-local');
const User = require('./models/user');
const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize');
const MongoStore = require('connect-mongo')(session);

const dbUrl=process.env.DB_URL || 'mongodb://127.0.0.1:27017/yelp-camp';

//connect to mongo database
mongoose.connect(dbUrl, {
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
app.use(mongoSanitize())

const secret = process.env.SECRET || 'thisshouldbesecret';

const store = new MongoStore({
    url: dbUrl,
    secret: secret,
    touchAfter: 24 * 60 * 60,
    resave: true,
    saveUninitialized: false
});
store.on("error", function(e){
    console.log("SESSION STORE ERROR", e)
});



const sessionConfig = {
    store: store,
    name:'session',
    secret: secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        //secure: true,
        expires: Date.now() + 1000 * 60 * 60* 24 * 7,
        maxAge: 1000 * 60 * 60* 24 * 7
    }
}
app.use(session(sessionConfig))
app.use(flash());
app.use(helmet());

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com",
    "https://api.tiles.mapbox.com",
    "https://api.mapbox.com",
    "https://kit.fontawesome.com",
    "https://cdnjs.cloudflare.com",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com",
    "https://stackpath.bootstrapcdn.com",
    "https://api.mapbox.com",
    "https://api.tiles.mapbox.com",
    "https://fonts.googleapis.com",
    "https://use.fontawesome.com",
    "https://cdn.jsdelivr.net/npm/bootstrap@5.3.1/dist/css/bootstrap.min.css"
];
const connectSrcUrls = [
    "https://api.mapbox.com",
    "https://*.tiles.mapbox.com",
    "https://events.mapbox.com",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            childSrc: ["blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dm4oqcq2h/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

app.use(passport.initialize());
app.use(passport.session()) ;
passport.use(new localStrategy(User.authenticate()));
 
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) =>{
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

  

app.use('/', userRoutes);
app.use('/campgrounds', campgroundRoutes)
app.use('/campgrounds/:id/reviews', reviewRoutes)

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

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`App is listening to port ${port}`)
})