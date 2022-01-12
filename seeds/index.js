const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campground');

mongoose.connect('mongodb://localhost:27017/yelp-camp');

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const sample = array => array[Math.floor(Math.random() * array.length)];

//clear database then fill in with info 
const seedDB = async () => {
    //deletes campground objects in campground
    await Campground.deleteMany({});
    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({ author: '61d8571b5d8b54efa2caa5e6',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`, images: [
                {
                  url: 'https://res.cloudinary.com/camperlife/image/upload/v1641941210/CamperLife/duxrvuevwlawaizfxruh.jpg',
                  filename: 'CamperLife/duxrvuevwlawaizfxruh',
                },
                {
                  url: 'https://res.cloudinary.com/camperlife/image/upload/v1641941211/CamperLife/uklw2hcnfnaz7vxhaipz.png',
                  filename: 'CamperLife/uklw2hcnfnaz7vxhaipz',
                }
              ], description: ' Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud.', price
        })
        await camp.save();
    }
}


//when done closes 
seedDB().then(() => {
    mongoose.connection.close();
})