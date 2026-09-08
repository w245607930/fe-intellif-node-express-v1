import crypto from 'node:crypto';
import { prisma } from '../../config/database.js';
import { AppError } from '../../errors/app-error.js';
import { ERROR_CODES } from '../../constants/error-codes.js';
import {
  hashPassword,
  verifyPassword,
  signAccessToken,
  createRefreshToken,
  hashRefreshToken,
} from './auth.crypto.js';
const publicUser = (u) => ({ id: u.id, username: u.username, email: u.email, status: u.status });
const invalid = () =>
  new AppError({ statusCode: 401, code: ERROR_CODES.UNAUTHENTICATED, message: '用户名或密码错误' });
export async function register(data) {
  const passwordHash = await hashPassword(data.password);
  try {
    const user = await prisma.user.create({
      data: { username: data.username, email: data.email, passwordHash },
    });
    return publicUser(user);
  } catch (cause) {
    throw new AppError({
      statusCode: 409,
      code: ERROR_CODES.CONFLICT,
      message: '用户名或邮箱已存在',
      cause,
    });
  }
}
async function issue(user, meta = {}) {
  const token = createRefreshToken();
  await prisma.refreshSession.create({
    data: {
      userId: user.id,
      familyId: crypto.randomUUID(),
      tokenHash: hashRefreshToken(token),
      expiresAt: new Date(Date.now() + 30 * 86400000),
      userAgent: meta.userAgent,
      ipAddress: meta.ipAddress,
    },
  });
  return { accessToken: signAccessToken(user), refreshToken: token, user: publicUser(user) };
}
export async function login(identifier, password, meta) {
  const user = await prisma.user.findFirst({
    where: { OR: [{ username: identifier }, { email: identifier }], deletedAt: null },
  });
  if (!user || user.status !== 'ACTIVE' || !(await verifyPassword(password, user.passwordHash)))
    throw invalid();
  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  return issue(user, meta);
}
export async function refresh(token, meta) {
  const hash = hashRefreshToken(token);
  const session = await prisma.refreshSession.findUnique({
    where: { tokenHash: hash },
    include: { user: true },
  });
  if (!session || session.expiresAt < new Date() || session.status !== 'ACTIVE') {
    if (session?.userId)
      await prisma.refreshSession.updateMany({
        where: { userId: session.userId, familyId: session.familyId, status: 'ACTIVE' },
        data: { status: 'REVOKED', revokedAt: new Date(), revokeReason: 'replay-detected' },
      });
    throw invalid();
  }
  const next = createRefreshToken();
  const nextSession = await prisma.$transaction(async (tx) => {
    const created = await tx.refreshSession.create({
      data: {
        userId: session.userId,
        familyId: session.familyId,
        tokenHash: hashRefreshToken(next),
        expiresAt: session.expiresAt,
        userAgent: meta.userAgent,
        ipAddress: meta.ipAddress,
      },
    });
    await tx.refreshSession.update({
      where: { id: session.id },
      data: {
        status: 'REVOKED',
        revokedAt: new Date(),
        revokeReason: 'rotated',
        replacedById: created.id,
        lastUsedAt: new Date(),
      },
    });
    return created;
  });
  return {
    accessToken: signAccessToken(session.user),
    refreshToken: next,
    user: publicUser(session.user),
    sessionId: nextSession.id,
  };
}
export async function logout(userId, refreshToken) {
  if (refreshToken)
    await prisma.refreshSession.updateMany({
      where: { userId, tokenHash: hashRefreshToken(refreshToken), status: 'ACTIVE' },
      data: { status: 'REVOKED', revokedAt: new Date(), revokeReason: 'logout' },
    });
}

export async function logoutAll(userId) {
  await prisma.$transaction([
    prisma.refreshSession.updateMany({
      where: { userId, status: 'ACTIVE' },
      data: { status: 'REVOKED', revokedAt: new Date(), revokeReason: 'logout-all' },
    }),
    prisma.user.update({ where: { id: userId }, data: { tokenVersion: { increment: 1 } } }),
  ]);
}
