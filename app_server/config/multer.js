const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (process.env.NODE_ENV == "development") {
            cb(null, 'uploads_dev')
        } else {
            cb(null, 'uploads')
        }
    },
    //file will save to folder as original file and filename as datestamp name
    filename: function (req, file, cb) {
        var ext = path.extname(file.originalname);
        cb(null, Date.now() + ext)
    }
});

const imageFilter = function (req, file, cb) {
    // accept image only
    if (
        file.mimetype === "image/png" ||
        file.mimetype === "image/jpg" ||
        file.mimetype === "image/jpeg"
    ) {
        cb(null, true);
    } else {
        // if validation failed then generate error
        cb(new Error("File format should be JPG, JPEG, PNG."), false);
    }
};

const filesFilter = function (req, file, cb) {
    // accept images or pdf only
    if (
        file.mimetype === "image/png" ||
        file.mimetype === "image/jpg" ||
        file.mimetype === "image/jpeg" ||
        file.mimetype === "application/pdf"
    ) {
        cb(null, true);
    } else {
        // if validation failed then generate error
        cb(new Error("File format should be PDF, JPG, PNG."), false);
    }
};

const uploadImage = multer({
    storage: storage,
    limits: {
        // 1mb
        fileSize: 1000000
    },
    fileFilter: imageFilter
});

const uploadFiles = multer({
    storage: storage,
    limits: {
        // 5mb
        fileSize: 5000000
    },
    fileFilter: filesFilter
});

module.exports = {
    uploadFiles,
    uploadImage
};