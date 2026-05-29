const express = require('express');
const router = express.Router();

const { login, perfil, trocarSenha } = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/login', login);
router.get('/perfil', authMiddleware, perfil);
router.put('/trocar-senha', authMiddleware, trocarSenha);

module.exports = router;