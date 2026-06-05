// scores.routes.js

const express    = require('express');
const router     = express.Router();
const controller = require('../controllers/scores.controller');
const validate   = require('../middleware/validate');
const { validateCreateScore, validateUpdateScore } = require('../validators/scores.validator');

router.get('/',               controller.getAll);      // Supports ?student_id= &subject_id= &stream_id= &term= &year=
router.post('/',  validate(validateCreateScore), controller.create);
router.put('/:id', validate(validateUpdateScore), controller.update);
router.delete('/:id',         controller.remove);

module.exports = router;
