# OpenAPI 与 Swagger

- JSON 契约：`GET /api/v1/openapi.json`
- 交互式文档：`GET /api/v1/docs/`
- 所有业务路径均以 `/api/v1` 为前缀；需要认证的操作在 `securitySchemes.bearerAuth` 中声明。
- OpenAPI 契约校验：`npm run contract:check`

文档只描述公开接口和稳定错误语义，不包含真实账号、密码、Token 或数据库连接信息。
