const jwt = require('jsonwebtoken');
const ApiError = require('../exceptions/api-error');

module.exports = function(req, res, next) {
  const authorizationHeader = req.headers.authorization;
  if (!authorizationHeader) {
    return next(ApiError.UnauthorizedError('User not authorized'));
  }

  const token = authorizationHeader.split(' ')[1];
  if (!token) {
    return next(ApiError.UnauthorizedError('User not authorized'));
  }

  try {
    const userData = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.user = userData;
    next();
  } catch (e) {
    return next(ApiError.UnauthorizedError('User not authorized'));
  }
};
