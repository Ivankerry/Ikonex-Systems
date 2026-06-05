// validate.js
// Validation middleware factory. Takes a validator function, runs it against req.body,
// and calls next(err) if validation fails. Keeps validation logic out of controllers.

/**
 * @param {Function} validatorFn - Takes (body) and returns null or an error message string
 * @returns {Function} Express middleware
 */
module.exports = function validate(validatorFn) {
  return (req, res, next) => {
    const error = validatorFn(req.body);
    if (error) {
      const err = new Error(error);
      err.statusCode = 400;
      return next(err);
    }
    next();
  };
};
