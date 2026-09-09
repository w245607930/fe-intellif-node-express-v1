# RBAC policy

Permissions use `resource:action` identifiers and are checked against current MySQL associations on every request. Authorization is intentionally not cached, so role changes take effect immediately. The system `admin` role is a super administrator; disabled/deleted users fail authentication and users without a matching permission are denied by default.

RBAC endpoints:

- `GET/POST/PATCH/DELETE /api/v1/rbac/roles` — role lifecycle management.
- `GET/POST /api/v1/rbac/permissions` — permission catalog and controlled creation.
- `POST/DELETE /api/v1/rbac/role-permissions` — idempotent role-permission binding maintenance.
- `POST/DELETE /api/v1/rbac/user-roles` — idempotent user-role assignment and revocation.
- `GET /api/v1/users` and `GET /api/v1/users/:id` — permission-protected user management views.
