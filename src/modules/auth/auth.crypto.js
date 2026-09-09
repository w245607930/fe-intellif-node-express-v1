import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { env } from '../../config/env.js';

export const hashPassword = (password) => bcrypt.hash(password, 12);
export const verifyPassword = (password, hash) => bcrypt.compare(password, hash);
const dummyPasswordHash = bcrypt.hash('not-a-valid-user-password', 12);
export const burnPasswordVerification = async (password) =>
  bcrypt.compare(password, await dummyPasswordHash);
export function signAccessToken(user) {
  return jwt.sign({ sub: user.id, tv: user.tokenVersion }, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_TTL,
  });
}
export function verifyAccessToken(token) {
  return jwt.verify(token, env.JWT_ACCESS_SECRET);
}
export const createRefreshToken = () => crypto.randomBytes(48).toString('base64url');
export const hashRefreshToken = (token) => crypto.createHash('sha256').update(token).digest('hex');
