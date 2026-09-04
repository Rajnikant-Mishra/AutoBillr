const validate = (schema) => {
  return (req, res, next) => {
    try {
      const { error, value } = schema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
      });

      if (error) {
        const errors = error.details.map((detail) => ({
          field: detail.path.join("."),
          message: detail.message,
        }));

        return res.status(400).json({
          success: false,
          message: errors.map((err) => err.message).join(", "),
          errors,
        });
      }

      // Replace request body with Joi's sanitized/validated value
      req.body = value;

      next();
    } catch (error) {
      console.error("VALIDATION ERROR:", error);

      return res.status(500).json({
        success: false,
        message: "Request validation failed",
      });
    }
  };
};

module.exports = validate;