export function errorHandler(err, req, res, _next) {
  console.error('[Server Error]', err);
  const status = err.status || 500;
  res.status(status).json({
    error: err.name || 'InternalServerError',
    message: err.message || 'Đã xảy ra lỗi hệ thống.'
  });
}
