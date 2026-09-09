import { success } from '../../utils/response.js';
import * as service from './rbac.service.js';
export const roles = async (req, res) => res.json(success(await service.listRoles()));
export const createRole = async (req, res) =>
  res.status(201).json(success(await service.createRole(req.validated.body)));
export const updateRole = async (req, res) =>
  res.json(success(await service.updateRole(req.validated.params.id, req.validated.body)));
export const deleteRole = async (req, res) =>
  res.json(success(await service.deleteRole(req.validated.params.id)));
export const permissions = async (req, res) => res.json(success(await service.listPermissions()));
export const createPermission = async (req, res) =>
  res.status(201).json(success(await service.createPermission(req.validated.body)));
export const assignRole = async (req, res) =>
  res.json(success(await service.assignRole(req.validated.body.userId, req.validated.body.roleId)));
export const revokeRole = async (req, res) =>
  res.json(success(await service.revokeRole(req.validated.body.userId, req.validated.body.roleId)));
