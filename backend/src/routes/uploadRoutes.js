const express = require('express');
const crypto = require('crypto');
const path = require('path');
const { put } = require('@vercel/blob');
const upload = require('../config/upload');
const authMiddleware = require('../middlewares/auth');

const router = express.Router();

// POST /api/admin/upload (protegida) - recebe 1 imagem no campo "image" e guarda no
// Vercel Blob (armazenamento externo). Devolve a URL pública completa da foto, já pronta.
router.post('/admin/upload', authMiddleware, (req, res) => {
  upload.single('image')(req, res, async (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ error: 'A foto é grande demais (máximo 15 MB).' });
      }
      return res.status(400).json({ error: err.message || 'Não foi possível enviar a foto.' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Nenhuma imagem enviada.' });
    }

    try {
      const nomeUnico = crypto.randomBytes(16).toString('hex');
      const extensao = path.extname(req.file.originalname).toLowerCase() || '.jpg';

      const blob = await put(`produtos/${nomeUnico}${extensao}`, req.file.buffer, {
        access: 'public',
        contentType: req.file.mimetype,
      });

      return res.status(201).json({ url: blob.url });
    } catch (erroUpload) {
      console.error(erroUpload);
      return res.status(500).json({ error: 'Não foi possível salvar a foto. Tente de novo.' });
    }
  });
});

module.exports = router;