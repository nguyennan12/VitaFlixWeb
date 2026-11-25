import { OAuth2Client } from 'google-auth-library';
import { env } from '../config/env.js';
import { userModel } from '../models/userModel.js';
import { tokenModel } from '../models/tokenModel.js';
import { signAccessToken, generateRefreshToken } from '../utils/jwt.js';
import { sha256 } from '../utils/hash.js';

const googleClient = new OAuth2Client(env.googleClientId);

function getCookieOptions(req, maxAgeMs) {
  const isHttps = Boolean(
    req.secure || req.headers['x-forwarded-proto'] === 'https'
  );
  return {
    httpOnly: true,
    secure: isHttps,
    sameSite: isHttps ? 'none' : 'lax',
    path: '/',
    maxAge: maxAgeMs
  };
}

function clearAuthCookies(req, res) {
  const isHttps = Boolean(
    req.secure || req.headers['x-forwarded-proto'] === 'https'
  );
  const opts = {
    httpOnly: true,
    secure: isHttps,
    sameSite: isHttps ? 'none' : 'lax',
    path: '/'
  };
  res.clearCookie('accessToken', opts);
  res.clearCookie('refreshToken', opts);
}

async function issueSessionCookies(req, res, user) {
  const accessToken = signAccessToken(user);
  const refreshToken = generateRefreshToken();
  const tokenHash = sha256(refreshToken);
  const expiresAt = new Date(Date.now() + env.refreshTokenDays * 24 * 60 * 60 * 1000);

  await tokenModel.createToken({
    userId: user.id,
    tokenHash,
    expiresAt
  });

  res.cookie('accessToken', accessToken, getCookieOptions(req, 15 * 60 * 1000));
  res.cookie('refreshToken', refreshToken, getCookieOptions(req, env.refreshTokenDays * 24 * 60 * 60 * 1000));
}

export const authController = {
  async googleLogin(req, res, next) {
    try {
      const { credential } = req.body;
      if (!credential) {
        return res.status(400).json({ error: 'BadRequest', message: 'Thiếu Google credential token.' });
      }

      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: env.googleClientId
      });

      const payload = ticket.getPayload();
      if (!payload || !payload.sub || !payload.email) {
        return res.status(401).json({ error: 'InvalidGoogleToken', message: 'Không thể xác thực tài khoản Google.' });
      }

      const user = await userModel.upsertGoogleUser({
        googleId: payload.sub,
        email: payload.email,
        fullName: payload.name || payload.email.split('@')[0],
        avatarUrl: payload.picture || ''
      });

      await tokenModel.deleteExpiredForUser(user.id);
      await issueSessionCookies(req, res, user);

      return res.status(200).json({ user });
    } catch (err) {
      if (err.message?.includes('Token used too late') || err.message?.includes('Wrong number of segments')) {
        return res.status(401).json({ error: 'InvalidGoogleToken', message: 'Google token không hợp lệ hoặc đã hết hạn.' });
      }
      return next(err);
    }
  },

  async refresh(req, res, next) {
    try {
      const rawRefreshToken = req.cookies?.refreshToken;
      console.log(`[Auth] Refresh called: hasRefreshCookie=${Boolean(rawRefreshToken)}, cookiesKeys=${Object.keys(req.cookies || {}).join(',')}`);
      if (!rawRefreshToken) {
        clearAuthCookies(req, res);
        return res.status(401).json({ error: 'NoRefreshToken', message: 'Phiên đăng nhập không tồn tại.' });
      }

      const tokenHash = sha256(rawRefreshToken);
      const storedToken = await tokenModel.findByHash(tokenHash);

      if (!storedToken) {
        clearAuthCookies(req, res);
        return res.status(401).json({ error: 'InvalidRefreshToken', message: 'Refresh token không hợp lệ.' });
      }

      // Reuse detection: if a revoked token is presented, revoke all active tokens for this user
      if (storedToken.revoked) {
        await tokenModel.revokeAllForUser(storedToken.user_id);
        clearAuthCookies(req, res);
        return res.status(401).json({ error: 'TokenReuseDetected', message: 'Phát hiện bất thường bảo mật, vui lòng đăng nhập lại.' });
      }

      if (new Date(storedToken.expires_at) <= new Date()) {
        await tokenModel.revokeById(storedToken.id);
        clearAuthCookies(req, res);
        return res.status(401).json({ error: 'RefreshTokenExpired', message: 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.' });
      }

      const user = await userModel.findById(storedToken.user_id);
      if (!user) {
        clearAuthCookies(req, res);
        return res.status(401).json({ error: 'UserNotFound', message: 'Tài khoản không tồn tại.' });
      }

      // Token Rotation: revoke old token & issue new pair
      await tokenModel.revokeById(storedToken.id);
      await issueSessionCookies(req, res, user);

      return res.status(200).json({ success: true, user });
    } catch (err) {
      return next(err);
    }
  },

  async me(req, res, next) {
    try {
      const user = await userModel.findById(req.user.id);
      if (!user) {
        clearAuthCookies(req, res);
        return res.status(404).json({ error: 'UserNotFound', message: 'Không tìm thấy người dùng.' });
      }
      return res.status(200).json({ user });
    } catch (err) {
      return next(err);
    }
  },

  async logout(req, res, next) {
    try {
      const rawRefreshToken = req.cookies?.refreshToken;
      if (rawRefreshToken) {
        await tokenModel.revokeByHash(sha256(rawRefreshToken));
      }
      clearAuthCookies(req, res);
      return res.status(200).json({ success: true, message: 'Đã đăng xuất.' });
    } catch (err) {
      return next(err);
    }
  }
};
