const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

//setting up config for cloudinary
//basically setting it up with our cloudinary account
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
});

//new instance of cloudinary storage
//clodinary object we did earlier
//what folder and types stored in cloudinary
const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'CamperLife',
        allowedFormats: ['jpeg', 'png', 'jpg']
    }
});

module.exports = {
    cloudinary,
    storage
}