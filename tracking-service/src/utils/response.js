export const successResponse = (res, data, message = 'Success', statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

export const errorResponse = (res, message, statusCode = 500, details = null) => {
  res.status(statusCode).json({
    success: false,
    message,
    ...(details ? { details } : {})
  });
};
