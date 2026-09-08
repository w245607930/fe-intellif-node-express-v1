import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export const hashPassword = (password) => bcrypt.hash(password, 12);
export const verifyPassword = (password, hash) => bcrypt.compare(password, hash);
export function signAccessToken(user) {
  return jwt.sign({ sub: user.id, tv: user.tokenVersion }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_TTL ?? '15m',
  });
}
export function verifyAccessToken(token) {
  return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
}
export const createRefreshToken = () => crypto.randomBytes(48).toString('base64url');
export const hashRefreshToken = (token) => crypto.createHash('sha256').update(token).digest('hex');
