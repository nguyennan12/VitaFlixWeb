import { verifyAccessToken } from '../utils/jwt.js';

export function requireAuth(req, res, next) {
  const token = req.cookies?.accessToken;
  if (!token) {
    console.log(`[Auth] requireAuth missing accessToken on ${req.method} ${req.originalUrl} | cookies=${Object.keys(req.cookies || {}).join(',')}`);
    return res.status(401).json({ error: 'Unauthorized', message: 'Chưa đăng nhập hoặc phiên đã hết hạn.' });
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = {
      id: payload.sub,
      role: payload.role || 'user'
    };
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'TokenExpiredOrInvalid', message: 'Access token không hợp lệ hoặc đã hết hạn.' });
  }
}
