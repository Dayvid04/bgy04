import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db, UserDocument } from './db.js';

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET?.trim();
  if (!secret) {
    throw new Error('JWT_SECRET must be set before starting the server.');
  }
  return secret;
}

export interface AuthRequest extends Request {
  user?: UserDocument;
}

export const AUTH_COOKIE_NAME = 'bgy_session';

function getRequestToken(req: Request): string | undefined {
  const cookies = req.headers.cookie?.split(';') || [];
  const authCookie = cookies.find(cookie => cookie.trim().startsWith(`${AUTH_COOKIE_NAME}=`));
  return authCookie?.trim().slice(AUTH_COOKIE_NAME.length + 1);
}

export function generateToken(user: UserDocument): string {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    getJwtSecret(),
    { expiresIn: '7d' }
  );
}

export async function authenticateUser(req: AuthRequest, res: Response, next: NextFunction) {
  const token = getRequestToken(req);
  if (!token) {
    return res.status(401).json({ error: 'Authentication required. Please sign in.' });
  }

  try {
    const decoded = jwt.verify(token, getJwtSecret()) as { id: string; email: string; role: string };
    const user = await db.findUserById(decoded.id);
    if (!user || !user.active) {
      return res.status(401).json({ error: 'User account not found.' });
    }
    req.user = user;
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired session token.' });
  }
}

export async function optionalUser(req: AuthRequest, res: Response, next: NextFunction) {
  const token = getRequestToken(req);
  if (token) {
    try {
      const decoded = jwt.verify(token, getJwtSecret()) as { id: string; email: string };
      const user = await db.findUserById(decoded.id);
      if (user?.active) {
        req.user = user;
      }
    } catch {
      // ignore
    }
  }
  return next();
}

export function setAuthCookie(res: Response, token: string): void {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader('Set-Cookie', `${AUTH_COOKIE_NAME}=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=604800${secure}`);
}

export function clearAuthCookie(res: Response): void {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader('Set-Cookie', `${AUTH_COOKIE_NAME}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0${secure}`);
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'admin' || req.user.email.trim().toLowerCase() !== 'admin') {
    return res.status(403).json({ error: 'Admin authorization required for this action.' });
  }
  return next();
}
