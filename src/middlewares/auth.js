import { AppError } from '../errors/app-error.js';
import { ERROR_CODES } from '../constants/error-codes.js';
import { verifyAccessToken } from '../modules/auth/auth.crypto.js';
import { prisma } from '../config/database.js';
export async function authenticate(request, _response, next) {
  try {
    const header = request.headers.authorization;
    if (!header?.startsWith('Bearer ')) throw new Error();
    const payload = verifyAccessToken(header.slice(7));
    const user = await prisma.user.findFirst({
      where: { id: payload.sub, status: 'ACTIVE', deletedAt: null },
      select: {
        id: true,
        username: true,
        email: true,
        status: true,
        tokenVersion: true,
        roles: { select: { role: { select: { code: true } } } },
      },
    });
    if (!user || user.tokenVersion !== payload.tv) throw new Error();
    request.user = user;
    request.log = request.log.child({ userId: user.id });
    next();
  } catch (cause) {
    throw new AppError({
      statusCode: 401,
      code: ERROR_CODES.UNAUTHENTICATED,
      message: '未认证',
      cause,
    });
  }
}
