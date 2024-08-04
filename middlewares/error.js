class errorHandler extends Error {
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
  }
}

export const errorMiddleware = (err, req, res, next) => {
  err.message = err.message || "An unexpected error occurred.";
  err.statusCode = err.statusCode || 500;

  if (err.code === 11000) {
    const message = `Duplicate ${Object.keys(err.keyValue)} error.`;
    err = new errorHandler(message, 400);
  }

  if (err.name === "JsonWebTokenError") {
    const message = "Invalid token. Try Again.";
    err = new errorHandler(message, 400);
  }

  if (err.name === "TokenExpiredError") {
    const message = "Token expired. Try Again.";
    err = new errorHandler(message, 400);
  }

  if (err.name === "CastError") {
    const message = `Invalid ${err.path}: ${err.name}.`;
    err = new errorHandler(message, 400);
  }

  const errorMessage = err.errors
    ? Object.values(err.errors)
        .map((error) => error.message)
        .join(", ")
    : err.message;

  return res
    .status(err.statusCode)
    .json({ success: false, message: errorMessage });
};

export default errorHandler;
