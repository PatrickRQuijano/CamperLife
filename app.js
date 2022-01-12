if(process.env.NODE_ENV !== "production"){
    require('dotenv').config();
}

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const mongoSanitize = require('express-mongo-sanitize');

const userRoutes = require('./routes/users')
const campgroundRoutes = require('./routes/campgrounds')
const reviewRoutes = require('./routes/reviews');
const MongoStore = require('connect-mongo');
//const MongoDBStore = require("connect-mongo")(session);
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp'
mongoose.connect(dbUrl);

//logic to check if theres an error
const  db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
//if succesfully opened
db.once("open", () => {
    console.log("Database connected");
});

const app = express();

app.engine('ejs', ejsMate);//telling which enige to make sense and parse ejs instead of default one
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//so that body will be parsed and no longer empty
app.use(express.urlencoded({ extended: true }))
//so we can put for forms(since they can only post and stuff)
app.use(methodOverride('_method')); //_method is the uery string
app.use(express.static(path.join(__dirname, 'public')))
app.use(mongoSanitize());
 
const secret = process.env.SECRET || 'thisshouldbeabettersecret!';
const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret: secret
    }
});

store.on("error", function(e) {
    console.log("SESSION STORE ERROR", e)
})

const sessionConfig = {
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig))
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
//explained in lecture 508

//how to store and unstore in session
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    //all tempplates have access to these
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next()
})

 
app.use('/', userRoutes);
app.use('/campgrounds', campgroundRoutes)
app.use('/campgrounds/:id/reviews', reviewRoutes)

app.get('/', (req, res) => {
    res.render('home');
}) 
   
  
app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})
//since using next after the all it will hit this next error handler
//and err will be the express error or another error if coming from somewhere else
app.use((err, req, res, next) => {
    //destructur from err 
    const { statusCode = 500 } = err;
    if(!err.message) err.message = 'Oh No, Something Wen Wrong!'
    res.status(statusCode).render('error', { err } );
})

   
const port = process.env.PORT || 3000
app.listen(port, () => {
    console.log(`serving on port ${port}`)
})
 