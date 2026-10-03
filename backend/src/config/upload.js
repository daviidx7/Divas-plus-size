const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', '..', 'uploads'));
  },
  filename: (req, file, cb) => {
    const nomeUnico = crypto.randomBytes(16).toString('hex');
    cb(null, `${nomeUnico}${path.extname(file.originalname).toLowerCase() || '.jpg'}`);
  },
});

function filtroArquivo(req, file, cb) {
  const tiposPermitidos = ['image/jpeg', 'image/png', 'image/webp'];
  if (!tiposPermitidos.includes(file.mimetype)) {
    return cb(new Error('Formato de imagem não suportado. Use JPG, PNG ou WEBP.'));
  }
  cb(null, true);
}

const upload = multer({
  storage,
  fileFilter: filtroArquivo,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB (o site já reduz a foto antes de enviar)
});

module.exports = upload;
