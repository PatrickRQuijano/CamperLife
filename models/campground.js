const mongoose = require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema;
//just so i dont have to keep doing mongoose.Schema each time

//virtualisation
// const ImageSchema = new Schema({
//     url: String,
//     filename: String
// });

//lecture 541
//this will rever to the particular image
//used so we can edit the url to change image sizes
//so replaces the /upload with /upload/w-200
// ImageSchema.virtual('thumbnail').get(function() {
//     this.url.replace('/upload', '/upload/w_200');
// });

const CampgroundSchema = new Schema({
    title: String,
    images: [
        {
            url: String,
            filename: String
        }
    ],
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review' //object id from a review model
        }
    ]
});

//middleware from mongoose too delete our reviews when we delete our campground object model things
CampgroundSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})

//export our model
module.exports = mongoose.model('Campground', CampgroundSchema);