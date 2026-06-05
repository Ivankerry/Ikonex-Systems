// streams.routes.js
// Routes for class stream management.

const express    = require('express');
const router     = express.Router();
const controller = require('../controllers/streams.controller');
const validate   = require('../middleware/validate');
const { validateCreateStream, validateUpdateStream } = require('../validators/streams.validator');

router.get('/',               controller.getAll);
router.get('/:id',            controller.getOne);
router.post('/',   validate(validateCreateStream), controller.create);
router.put('/:id', validate(validateUpdateStream), controller.update);
router.delete('/:id',         controller.remove);

// Stream subjects
router.get('/:id/subjects',   controller.getSubjects);
router.post('/subjects',      controller.assignSubject);

module.exports = router;
