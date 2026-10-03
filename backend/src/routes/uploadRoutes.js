const express = require('express');
const upload = require('../config/upload');
const authMiddleware = require('../middlewares/auth');

const router = express.Router();

// POST /api/admin/upload (protegida) - recebe 1 imagem no campo "image".
// Devolve o caminho relativo ("/uploads/arquivo.jpg"); o site monta o endereço completo.
// Assim as fotos continuam funcionando se o endereço do servidor mudar (ex.: na hora de publicar).
router.post('/admin/upload', authMiddleware, (req, res) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ error: 'A foto é grande demais (máximo 15 MB).' });
      }
      return res.status(400).json({ error: err.message || 'Não foi possível enviar a foto.' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Nenhuma imagem enviada.' });
    }

    return res.status(201).json({ url: `/uploads/${req.file.filename}` });
  });
});

module.exports = router;
