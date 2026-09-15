const ApiError = require('../utils/ApiError');

// Validates req[source] against a zod schema, replacing it with the parsed
// (and coerced/defaulted) value so downstream handlers get clean data.
const validate = (schema, source = 'body') => (req, res, next) => {
  const result = schema.safeParse(req[source]);

  if (!result.success) {
    const details = result.error.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));
    return next(ApiError.badRequest('Validation failed', details));
  }

  req[source] = result.data;
  next();
};

module.exports = validate;
