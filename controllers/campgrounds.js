const Campground = require('../models/campground');
const { cloudinary } = require("../cloudinary");
//export specific functions
module.exports.index = async (req, res) => {
    //gets all campgrounds
    const campgrounds = await Campground.find({});
    //renders the page(ejs page) and passes through the campgrounds
    res.render('campgrounds/index', { campgrounds });
}

module.exports.renderNewForm = (req, res) => {
    //passport method to check if logged in
    //made it into a middleware
    //if(!req.isAuthenticated()) {
        //req.flash('error', 'you must be signed in');
        //return res.redirect('/login');
    //}
    res.render('campgrounds/new')
}

module.exports.createCampground = async(req, res, next) => {
    //body will be empty without parsing so 
    //wee need to parse
    //creating new modal
    //if(!req.body.campground) throw new ExpressError('Invalid Campground Data', 400);
    //now we have access to files object because of multer and lets map the array of files given to us to a new aray
    const campground = new Campground(req.body.campground);
    campground.images = req.files.map(f => ({url: f.path, filename: f.filename }));
    //console.log(campground.images);
    campground.author = req.user._id;
    await campground.save() //save to database
    //redirect to newly created campground
    req.flash('success', 'Successfully made a new campground!')
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.showCampground = async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate({
        path:'reviews',
        populate: {
            path: 'author' 
        }
    }).populate('author') //populates on the 1 author on the whole campground and the other one is for populateing the author of each different review
    if(!campground) {
        req.flash('error' , 'Cannot find that campground!')
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground } );
}

module.exports.renderEditForm =  async (req, res) => {
    const {id} = req.params;
    //look up campground by id
    const campground = await Campground.findById(id)
    if(!campground) {
        req.flash('error' , 'Cannot find that campground!')
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground } );
}

module.exports.updateCampground =  async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground });
    const imgs = req.files.map(f => ({url: f.path, filename: f.filename }));
    campground.images.push(...imgs);
    await campground.save();
    //$pull operator pulls elements out of an array
    if(req.body.deleteImages){
        for(let filename of req.body.deleteImages){
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({$pull: {images: {filename: {$in: req.body.deleteImages }}}});
    }
    req.flash('success', 'Successfully updated campground!')
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully Deleted campground!')
    res.redirect('/campgrounds');
}