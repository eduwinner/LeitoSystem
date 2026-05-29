const express = require('express');
const router = express.Router();

const controller = require('../controllers/bedController');
const authMiddleware = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

const podeAlocar    = roleMiddleware('admin', 'medico', 'enfermeiro', 'recepcionista');
const podeMovimentar = roleMiddleware('admin', 'medico', 'enfermeiro');

router.get('/dashboard', authMiddleware, controller.getDashboard);
router.get('/historico', authMiddleware, controller.getHistorico);
router.get('/', authMiddleware, controller.listarLeitos);
router.post('/', authMiddleware, adminMiddleware, controller.criarLeito);
router.put('/:id', authMiddleware, adminMiddleware, controller.atualizarLeito);
router.delete('/:id', authMiddleware, adminMiddleware, controller.deletarLeito);
router.get('/inativos', authMiddleware, adminMiddleware, controller.listarInativos);
router.put('/:id/inativar', authMiddleware, adminMiddleware, controller.inativarLeito);
router.put('/:id/reativar', authMiddleware, adminMiddleware, controller.reativarLeito);
router.put('/:id/ocupar', authMiddleware, podeAlocar, controller.ocupar);
router.put('/:id/liberar', authMiddleware, podeMovimentar, controller.liberar);

module.exports = router;
