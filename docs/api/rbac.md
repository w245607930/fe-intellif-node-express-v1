# RBAC policy

Permissions use `resource:action` identifiers and are checked against current MySQL associations on every request. Authorization is intentionally not cached, so role changes take effect immediately. The system `admin` role is a super administrator; disabled/deleted users fail authentication and users without a matching permission are denied by default.
