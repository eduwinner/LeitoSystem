const express = require('express');
const router = express.Router();
const controller = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');

router.get('/', authMiddleware, adminMiddleware, controller.listar);
router.get('/servicos-gerais', authMiddleware, controller.listarServicosGerais);
router.post('/', authMiddleware, adminMiddleware, controller.criar);
router.put('/:id', authMiddleware, adminMiddleware, controller.atualizar);
router.delete('/:id', authMiddleware, adminMiddleware, controller.deletar);

module.exports = router;
