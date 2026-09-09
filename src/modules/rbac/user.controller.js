import { paginated, success } from '../../utils/response.js';
import { AppError } from '../../errors/app-error.js';
import { ERROR_CODES } from '../../constants/error-codes.js';
import * as service from './user.service.js';
export async function listUsers(req, res) {
  res.json(paginated(await service.listUsers(req.validated.query)));
}
export async function getUser(req, res) {
  const user = await service.getUser(req.validated.params.id);
  if (!user)
    throw new AppError({ statusCode: 404, code: ERROR_CODES.NOT_FOUND, message: '用户不存在' });
  res.json(success(user));
}
