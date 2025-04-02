const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = 'uploads/avatars/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configurar el almacenamiento
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/avatars/'); // Asegúrate de que esta carpeta exista
  },
  filename: function (req, file, cb) {
    cb(null, `user-${req.userId}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

// Filtrar archivos
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('No es una imagen! Solo se permiten imágenes.'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5 // Limitar a 5MB
  },
  fileFilter: fileFilter
});

module.exports = upload;