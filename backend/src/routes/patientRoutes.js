const express = require('express');
const router = express.Router();
const controller = require('../controllers/patientController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

const podeCrud = roleMiddleware('admin', 'medico', 'recepcionista');

router.get('/', authMiddleware, controller.findAll);
router.post('/', authMiddleware, podeCrud, controller.create);
router.put('/:id', authMiddleware, podeCrud, controller.update);
router.delete('/:id', authMiddleware, podeCrud, controller.delete);

module.exports = router;
