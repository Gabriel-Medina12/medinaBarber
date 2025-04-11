// Your existing multer configuration as it is above
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = 'uploads/avatars/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir); // Ensuring uploadDir is correct
  },
  filename: function (req, file, cb) {
   if (!req.userId) {
      return cb(new Error('User ID is missing'), '');
    }
    cb(null, `user-${req.userId}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('File is not an image! Only images are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 },
  fileFilter: fileFilter
});

module.exports = upload;