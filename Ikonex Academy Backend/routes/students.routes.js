// students.routes.js
// Routes for student management.

const express    = require('express');
const router     = express.Router();
const controller = require('../controllers/students.controller');
const validate   = require('../middleware/validate');
const { validateCreateStudent, validateUpdateStudent } = require('../validators/students.validator');

router.get('/',               controller.getAll);
router.get('/:id',            controller.getOne);
router.post('/',   validate(validateCreateStudent), controller.create);
router.put('/:id', validate(validateUpdateStudent), controller.update);
router.delete('/:id',         controller.remove);

module.exports = router;
