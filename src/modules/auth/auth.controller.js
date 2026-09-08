import { success } from '../../utils/response.js';
import * as service from './auth.service.js';
export async function register(req, res) {
  res.status(201).json(success(await service.register(req.validated.body), 'registered'));
}
export async function login(req, res) {
  res.json(
    success(
      await service.login(req.validated.body.identifier, req.validated.body.password, {
        userAgent: req.get('user-agent'),
        ipAddress: req.ip,
      }),
      'authenticated',
    ),
  );
}
export async function refresh(req, res) {
  res.json(
    success(
      await service.refresh(req.validated.body.refreshToken, {
        userAgent: req.get('user-agent'),
        ipAddress: req.ip,
      }),
      'refreshed',
    ),
  );
}
export async function logout(req, res) {
  await service.logout(req.user.id, req.validated.body.refreshToken);
  res.json(success(null, 'logged out'));
}
export function me(req, res) {
  res.json(success(req.user));
}
export async function logoutAll(req, res) {
  await service.logoutAll(req.user.id);
  res.json(success(null, 'logged out'));
}
