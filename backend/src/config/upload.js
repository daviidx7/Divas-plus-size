const multer = require('multer');

function filtroArquivo(req, file, cb) {
  const tiposPermitidos = ['image/jpeg', 'image/png', 'image/webp'];
  if (!tiposPermitidos.includes(file.mimetype)) {
    return cb(new Error('Formato de imagem não suportado. Use JPG, PNG ou WEBP.'));
  }
  cb(null, true);
}

// Guarda a foto na memória (não no disco) — necessário porque o servidor publicado
// não permite salvar arquivos; a foto vai direto pro armazenamento externo (Vercel Blob).
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: filtroArquivo,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB (o site já reduz a foto antes de enviar)
});

module.exports = upload;