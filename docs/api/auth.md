# Authentication API contract

All endpoints use the `/api/v1/auth` prefix and the standard `{ code, message, data }` response envelope.

| Method | Path | Authentication | Request body | Success |
| --- | --- | --- | --- | --- |
| POST | `/register` | No | `username`, `email`, `password` | `201`, public user |
| POST | `/login` | No | `identifier`, `password` | access token, refresh token, public user |
| POST | `/refresh` | No | `refreshToken` | rotated access/refresh tokens, public user |
| POST | `/logout` | Bearer | optional `refreshToken` | revokes that active session |
| POST | `/logout-all` | Bearer | none | revokes all sessions and access tokens |
| GET | `/me` | Bearer | none | current public user |

`password` must contain at least 12 characters, an uppercase letter, a lowercase letter, and a digit. Login failures use the same 401 response for nonexistent users, disabled users, and incorrect passwords. Refresh tokens are opaque, are returned only at issue/rotation time, and are stored as SHA-256 hashes.
