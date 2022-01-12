const express = require('express');
const router = express.Router();
//controllers
const campgrounds = require('../controllers/campgrounds');
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const Campground = require('../models/campground');
//const { campgroundSchema } = require('../schemas.js');
const {isLoggedIn, isAuthor, validateCampground} = require('../middleware')
const multer = require('multer');

//require new storage we set up
//and now upload those saved photos to cloudinary storage
const { storage } = require('../cloudinary');
const upload = multer({ storage });

router.route('/')
    .get(catchAsync(campgrounds.index))
    .post(isLoggedIn, upload.array('image'), validateCampground ,catchAsync( campgrounds.createCampground ) )
    // .post(upload.array('image'), (req, res) => {
    //     console.log(req.body, req.files);
    //     res.send("IT WORKED!");
    // })
    //the above will auto use multer middleware for the single peice of form data named image
    //it will add in the file attribute to request and the rest of the body 
    //now were gonna instead added it as middleware 

router.get('/new', isLoggedIn, campgrounds.renderNewForm)

router.route('/:id')
    .get(catchAsync(campgrounds.showCampground))
    .put(isLoggedIn, isAuthor, upload.array('image') , validateCampground, catchAsync( campgrounds.updateCampground ) )
    .delete(isLoggedIn, isAuthor, catchAsync( campgrounds.deleteCampground ) )

router.get('/:id/edit', isLoggedIn, isAuthor,  catchAsync( campgrounds.renderEditForm ) )

// //ROUTESSS YAY
// router.get('/', catchAsync(campgrounds.index) )
// //update route
// //order matters here should be before id one or wont work
// router.get('/new', isLoggedIn, campgrounds.renderNewForm)

// router.post('/', isLoggedIn, validateCampground, catchAsync( campground.createCampground ) )

// router.get('/:id', catchAsync( campgrounds.showCampground ) )
// //edit 
// router.get('/:id/edit', isLoggedIn, isAuthor,  catchAsync( campgrounds.renderEditForm ) )

// router.put('/:id' , isLoggedIn, isAuthor,  validateCampground, catchAsync( campgrounds.updateCampground ) )

// router.delete('/:id', isLoggedIn, isAuthor, catchAsync( campgrounds.deleteCampground ) )

module.exports = router;