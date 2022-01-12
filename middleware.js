const { campgroundSchema, reviewSchema } = require('./schemas.js');
const ExpressError = require('./utils/ExpressError');
const Campground = require('./models/campground');
const Review = require('./models/review');
//middleware always has the 3rd argument of next
module.exports.isLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()) {
        //save where the user wanted to go but couldnt cause they need to login
        req.session.returnTo = req.originalUrl
        req.flash('error', 'you must be signed in first!');
        return res.redirect('/login');
    }
    next();
}

//MIDDLEWARE
module.exports.validateCampground = (req, res, next) => {
    //this next schema is NOT a mongoose schema
    //it will vaidte schema before mongoose get invloved
    //then validate the schema 
    const { error } = campgroundSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400); //will be caught and app.use will run
    } else {
        next();
    }
}

module.exports.isAuthor = async(req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if(!campground.author.equals(req.user._id)){
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}

//exaplained in lecture 522****
module.exports.isReviewAuthor = async(req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if(!review.author.equals(req.user._id)){
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}


//MIDDLEWARE
module.exports.validateReview = (req, res, next) => {
    const {error} = reviewSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400); //will be caught and app.use will run
    } else {
        next();
    }
}