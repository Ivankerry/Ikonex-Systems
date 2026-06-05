// subjects.routes.js
// Routes for subject management.

const express    = require('express');
const router     = express.Router();
const controller = require('../controllers/subjects.controller');
const validate   = require('../middleware/validate');
const { validateCreateSubject, validateUpdateSubject } = require('../validators/subjects.validator');

router.get('/',               controller.getAll);
router.get('/:id',            controller.getOne);
router.post('/',   validate(validateCreateSubject), controller.create);
router.put('/:id', validate(validateUpdateSubject), controller.update);
router.delete('/:id',         controller.remove);

module.exports = router;
