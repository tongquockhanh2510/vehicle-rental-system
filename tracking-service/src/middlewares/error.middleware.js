import { errorResponse } from '../utils/response.js';

export class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
  }
}

export const asyncHandler = (handler) => (req, res, next) =>
  Promise.resolve(handler(req, res, next)).catch(next);

export const notFoundHandler = (req, res) => {
  errorResponse(res, `Route not found: ${req.originalUrl}`, 404);
};

export const errorHandler = (error, req, res, next) => {
  console.error(error);
  errorResponse(res, error.message || 'Internal server error', error.statusCode || 500);
};
