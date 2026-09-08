# Node.js + Express 企业级后端项目技术规划文档

## 1. 项目概述

### 1.1 项目目标

本项目旨在搭建一套基于 **Node.js + Express + MySQL + Redis** 的通用后端服务基础架构。

项目不以具体业务为核心，而是优先搭建一套具备良好工程化能力、可扩展、可维护、可部署的 Node.js 后端基础模板。

后续可以基于该模板快速开发：

- 管理后台
- SaaS 系统
- 微信小程序后端
- AI 应用后端
- 内容管理系统
- 电商系统
- 数据管理平台
- 企业内部业务系统
- 第三方 API 服务

### 1.2 项目原则

项目第一阶段遵循以下原则：

1. 使用 JavaScript，不引入 TypeScript。
2. 使用 Express 作为 Web 服务框架。
3. 使用 MySQL 作为核心业务数据库。
4. 使用 Prisma 作为 ORM。
5. 使用 Redis 作为缓存和基础设施。
6. 使用 JWT 实现用户认证。
7. 使用 Zod 进行请求参数校验。
8. 使用 BullMQ 实现异步任务。
9. 使用 Pino 统一日志。
10. 使用 Swagger/OpenAPI 管理接口文档。
11. 使用 PM2 管理生产环境 Node.js 进程。
12. 暂不使用 Docker。
13. 暂不引入微服务架构。
14. 优先保证架构简单、清晰和可维护。

---

# 2. 技术栈规划

## 2.1 核心技术栈

| 技术 | 用途 |
|---|---|
| Node.js | JavaScript 服务端运行环境 |
| Express | Web/API 服务框架 |
| JavaScript | 项目开发语言 |
| MySQL 8.x | 关系型数据库 |
| Prisma | ORM / 数据库访问 |
| Redis | 缓存、Token、锁、限流等 |
| ioredis | Redis 客户端 |
| Zod | 请求参数校验 |
| JWT | 用户身份认证 |
| bcrypt | 密码加密 |
| BullMQ | 异步任务 / 消息队列 |
| Pino | 日志系统 |
| Swagger / OpenAPI | API 接口文档 |
| Axios | HTTP 请求 |
| node-cron | 定时任务 |
| Vitest | 单元测试 |
| Supertest | HTTP 接口测试 |
| ESLint | JavaScript 代码检查 |
| Prettier | 代码格式化 |
| Husky | Git Hook |
| PM2 | Node.js 生产进程管理 |
| Nginx | 反向代理 / HTTPS |

---

# 3. 暂不引入的技术

当前阶段为了控制复杂度，暂时不引入：

- TypeScript
- Docker
- Kubernetes
- 微服务
- RabbitMQ
- Kafka
- MongoDB
- Elasticsearch
- GraphQL

后续根据实际业务规模再评估是否增加。

---

# 4. 系统总体架构

```text
                    Client
                      │
                      ▼
                    Nginx
                      │
                      ▼
                    PM2
                      │
              ┌───────┴───────┐
              │               │
              ▼               ▼
          Express API       Worker
              │               │
              │             BullMQ
              │               │
        ┌─────┴─────┐         │
        │           │         │
        ▼           ▼         │
      MySQL       Redis ◄─────┘
```

API 服务负责：

- HTTP 请求
- 用户认证
- 业务逻辑
- 数据库操作
- Redis 操作
- API 返回

Worker 负责：

- 异步任务
- 邮件发送
- 消息通知
- 数据处理
- 定时任务
- 其他耗时任务

---

# 5. 项目架构设计

项目采用模块化单体架构。

```text
src/
├── app.js
├── server.js
│
├── config/
│   ├── env.js
│   ├── database.js
│   └── redis.js
│
├── routes/
│   └── index.js
│
├── modules/
│   ├── auth/
│   ├── user/
│   ├── role/
│   └── permission/
│
├── middleware/
│   ├── auth.js
│   ├── error.js
│   ├── validate.js
│   └── request-id.js
│
├── utils/
│   ├── jwt.js
│   ├── password.js
│   ├── response.js
│   └── pagination.js
│
├── queue/
│   ├── queues/
│   └── workers/
│
├── services/
│   ├── cache.service.js
│   ├── lock.service.js
│   └── rate-limit.service.js
│
└── docs/
    └── swagger.js
```

数据库：

```text
prisma/
├── schema.prisma
└── migrations/
```

测试：

```text
tests/
├── unit/
└── integration/
```

项目根目录：

```text
my-node-api/
├── src/
├── prisma/
├── tests/
├── logs/
├── .env
├── .env.development
├── .env.production
├── .gitignore
├── ecosystem.config.js
├── eslint.config.js
├── package.json
└── README.md
```

---

# 6. 模块化设计

每个业务模块保持相对独立。

例如用户模块：

```text
modules/user/
├── user.controller.js
├── user.service.js
├── user.routes.js
└── user.schema.js
```

职责划分：

### Controller

负责：

- 接收请求
- 获取参数
- 调用 Service
- 返回结果

Controller 不直接操作数据库。

### Service

负责：

- 核心业务逻辑
- 数据处理
- 调用 Prisma
- 调用 Redis
- 调用其他 Service

### Routes

负责：

- URL
- HTTP Method
- Middleware
- Controller

### Schema

负责：

- 参数校验
- 数据格式验证
- 参数转换

---

# 7. API 请求流程

统一采用：

```text
HTTP Request
     ↓
Router
     ↓
Middleware
     ↓
Authentication
     ↓
Zod Validation
     ↓
Controller
     ↓
Service
     ↓
Prisma / Redis
     ↓
Response
```

例如：

```text
POST /api/users
       ↓
user.routes.js
       ↓
auth middleware
       ↓
validate middleware
       ↓
user.controller.js
       ↓
user.service.js
       ↓
Prisma
       ↓
MySQL
```

---

# 8. 数据库设计

使用 MySQL 8.x。

Prisma 负责：

- Schema 定义
- Migration
- CRUD
- 事务
- 关联查询

基础系统预计包含：

```text
users
roles
permissions
user_roles
role_permissions
refresh_tokens
```

后续业务模块根据实际需求增加。

---

# 9. Redis 设计

Redis 统一通过 ioredis 访问。

Redis 主要承担以下职责。

## 9.1 数据缓存

```text
user:{id}
product:{id}
config:{key}
```

## 9.2 Token

```text
refresh_token:{userId}
```

## 9.3 验证码

```text
sms:code:{mobile}
email:code:{email}
```

## 9.4 限流

```text
rate_limit:{ip}
rate_limit:{userId}
```

## 9.5 分布式锁

```text
lock:order:{orderId}
```

## 9.6 BullMQ

Redis 同时作为 BullMQ 的基础设施。

---

# 10. 用户认证体系

采用：

```text
JWT Access Token
+
Refresh Token
+
Redis
```

登录流程：

```text
用户名 / 密码
      ↓
验证用户
      ↓
bcrypt 验证密码
      ↓
生成 Access Token
      ↓
生成 Refresh Token
      ↓
Refresh Token 保存 Redis
      ↓
返回 Token
```

请求：

```text
Authorization: Bearer <token>
```

认证流程：

```text
Request
  ↓
JWT Middleware
  ↓
验证 Token
  ↓
获取 userId
  ↓
权限检查
  ↓
Controller
```

---

# 11. RBAC 权限体系

系统采用 RBAC：

```text
User
  ↓
Role
  ↓
Permission
```

例如：

```text
管理员
├── user:list
├── user:create
├── user:update
├── user:delete
├── role:list
└── role:update
```

普通用户：

```text
普通用户
├── user:info
└── order:list
```

接口可以定义：

```text
GET /api/users
Permission: user:list
```

---

# 12. 参数校验

使用 Zod。

所有外部输入都应该进行校验：

```text
Body
Query
Params
Headers
```

例如：

```text
POST /api/user/register

username
password
email
```

统一：

```text
Request
 ↓
Zod Schema
 ↓
Validation
 ↓
Controller
```

避免非法参数直接进入业务层。

---

# 13. 统一响应格式

建议 API 返回统一格式。

成功：

```json
{
  "code": 0,
  "message": "success",
  "data": {}
}
```

失败：

```json
{
  "code": 40001,
  "message": "用户名或密码错误",
  "data": null
}
```

分页：

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [],
    "total": 100,
    "page": 1,
    "pageSize": 20
  }
}
```

---

# 14. 全局异常处理

Express 使用统一 Error Middleware。

```text
Controller
      ↓
Service
      ↓
throw Error
      ↓
Error Middleware
      ↓
Pino
      ↓
统一 Response
```

避免业务代码大量：

```text
try/catch
```

同时区分：

- 参数错误
- 认证错误
- 权限错误
- 业务错误
- 数据库错误
- 系统错误

---

# 15. 日志系统

使用 Pino。

日志至少包含：

```text
时间
日志级别
Request ID
HTTP Method
URL
User ID
响应状态
请求耗时
错误信息
```

例如：

```text
INFO
POST /api/user/login
userId=10001
status=200
duration=35ms
```

生产环境：

```text
logs/
├── app.log
├── error.log
└── access.log
```

---

# 16. Request ID

每个请求生成唯一 Request ID：

```text
Request
   ↓
Request ID
   ↓
Controller
   ↓
Service
   ↓
Database
   ↓
Log
```

例如：

```text
requestId=8f7c2d9a
```

这样可以通过一个 ID 找到一次完整请求的日志。

---

# 17. BullMQ 异步任务

需要耗时处理的任务不直接阻塞 API。

例如：

```text
用户注册
   ↓
创建用户
   ↓
加入任务队列
   ↓
立即返回
```

Worker：

```text
Redis
 ↓
BullMQ
 ↓
Worker
 ├── 发送邮件
 ├── 发送通知
 ├── 数据处理
 └── 日志处理
```

计划支持：

- 延迟任务
- 重试
- 失败任务
- 定时任务
- 并发控制

---

# 18. 定时任务

使用 node-cron。

例如：

```text
每天 00:00
 ↓
清理过期 Token

每天 02:00
 ↓
数据清理

每小时
 ↓
统计任务
```

后续复杂任务优先使用 BullMQ。

---

# 19. API 文档

使用 OpenAPI + Swagger UI。

统一访问：

```text
/api-docs
```

文档包含：

- API 地址
- 请求方式
- 参数
- Header
- 请求 Body
- Response
- 错误码
- JWT Authorization

开发阶段用于前后端联调。

---

# 20. 安全设计

基础安全措施：

### HTTP 安全

使用 Helmet。

### CORS

统一配置允许来源。

### JWT

Access Token 设置合理过期时间。

### 密码

使用 bcrypt，不保存明文密码。

### Redis

生产环境必须设置密码并限制访问地址。

### MySQL

禁止公网直接暴露数据库端口。

### API 限流

登录、验证码等接口增加限流。

### SQL 注入

通过 Prisma 参数化查询避免直接拼接 SQL。

### 敏感信息

`.env` 不提交 Git。

---

# 21. 环境配置

使用：

```text
.env
.env.development
.env.production
```

例如：

```text
NODE_ENV=production

PORT=3000

DATABASE_URL=...

REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=...

JWT_ACCESS_SECRET=...
JWT_REFRESH_SECRET=...
```

禁止将：

- 数据库密码
- Redis 密码
- JWT Secret
- 第三方 API Key

直接写入代码。

---

# 22. PM2 部署

生产环境不使用：

```text
node server.js
```

统一通过 PM2。

项目配置：

```text
ecosystem.config.js
```

生产启动：

```bash
pm2 start ecosystem.config.js --env production
```

常用操作：

```bash
pm2 status
pm2 logs
pm2 restart my-api
pm2 reload my-api
pm2 stop my-api
pm2 delete my-api
```

配置开机启动：

```bash
pm2 startup
pm2 save
```

---

# 23. Nginx

生产环境：

```text
Internet
   ↓
Nginx
   ↓
127.0.0.1:3000
   ↓
Express
```

Nginx 负责：

- HTTPS
- 域名
- 反向代理
- 静态资源
- 请求头处理
- 基础安全策略

---

# 24. 测试体系

使用：

```text
Vitest
+
Supertest
```

测试分为：

```text
tests/
├── unit/
└── integration/
```

Unit Test：

```text
Service
Utils
Helpers
```

Integration Test：

```text
POST /api/login
GET /api/user/info
POST /api/order
```

第一阶段不追求 100% 覆盖率，优先覆盖核心业务。

---

# 25. 代码规范

使用：

```text
ESLint
Prettier
Husky
lint-staged
Commitlint
```

Commit 规范：

```text
feat: 新增用户登录
fix: 修复登录失效问题
refactor: 优化用户模块
docs: 更新接口文档
test: 增加用户测试
chore: 更新依赖
```

---

# 26. 开发阶段规划

## Phase 1：项目初始化

目标：

```text
Node.js
Express
项目目录
环境配置
ESLint
Prettier
Git
```

完成基础项目启动。

---

## Phase 2：数据库

目标：

```text
MySQL
Prisma
Migration
User Model
Role Model
Permission Model
```

完成数据库基础架构。

---

## Phase 3：Redis

目标：

```text
Redis
ioredis
缓存 Service
Token Service
Lock Service
```

完成 Redis 基础能力。

---

## Phase 4：用户认证

实现：

```text
注册
登录
退出
Refresh Token
JWT
密码加密
```

---

## Phase 5：RBAC

实现：

```text
用户
角色
权限
用户角色
角色权限
```

完成权限控制。

---

## Phase 6：工程化

增加：

```text
统一 Response
统一 Error
Request ID
Pino
Zod
Swagger
```

---

## Phase 7：异步任务

增加：

```text
BullMQ
Worker
任务重试
失败任务
延迟任务
```

---

## Phase 8：测试

增加：

```text
Vitest
Supertest
Unit Test
Integration Test
```

---

## Phase 9：生产部署

部署：

```text
Linux
Nginx
Node.js
PM2
MySQL
Redis
```

完成：

```text
HTTPS
PM2 Cluster
日志
自动重启
开机启动
```

---

# 27. 第一版功能范围

第一版不追求功能过多，优先完成：

```text
┌──────────────────────────────┐
│       Node Backend Core      │
├──────────────────────────────┤
│                              │
│  用户系统                    │
│  ├── 注册                    │
│  ├── 登录                    │
│  ├── 退出                    │
│  └── 用户信息                │
│                              │
│  权限系统                    │
│  ├── 用户                    │
│  ├── 角色                    │
│  └── 权限                    │
│                              │
│  基础设施                    │
│  ├── MySQL                   │
│  ├── Redis                   │
│  ├── JWT                     │
│  ├── Zod                     │
│  ├── Pino                    │
│  └── Swagger                 │
│                              │
│  异步任务                    │
│  └── BullMQ                  │
│                              │
│  部署                        │
│  ├── Nginx                   │
│  └── PM2                     │
│                              │
└──────────────────────────────┘
```

---

# 28. 后续扩展方向

基础架构稳定后，可以继续增加：

```text
文件上传
 ↓
MinIO / OSS

邮件
 ↓
SMTP / 第三方邮件服务

短信
 ↓
短信服务商

搜索
 ↓
Elasticsearch

监控
 ↓
Prometheus + Grafana

错误监控
 ↓
Sentry

实时通信
 ↓
WebSocket

AI
 ↓
OpenAI / DeepSeek / Claude 等 API
```

但这些都不作为第一阶段的强制依赖。

---

# 29. 最终技术路线

最终第一版确定为：

```text
                    ┌───────────────┐
                    │    Browser    │
                    └───────┬───────┘
                            │
                            ▼
                         Nginx
                            │
                            ▼
                          PM2
                            │
                            ▼
                    ┌───────────────┐
                    │    Express    │
                    └───────┬───────┘
                            │
              ┌─────────────┼─────────────┐
              │             │             │
              ▼             ▼             ▼
           JWT/Zod      Controller      Pino
                            │
                            ▼
                         Service
                      ┌─────┴─────┐
                      │           │
                      ▼           ▼
                   Prisma      Redis
                      │           │
                      ▼           │
                   MySQL         │
                                  │
                                  ▼
                               BullMQ
                                  │
                                  ▼
                                Worker
```

## 30. 项目最终目标

最终形成一套：

**轻量、模块化、工程化、可扩展、可直接部署生产环境的 Node.js 后端基础模板。**

核心目标不是堆技术，而是建立统一的开发规范：

```text
统一目录
+
统一接口
+
统一异常
+
统一日志
+
统一鉴权
+
统一参数校验
+
统一数据库访问
+
统一 Redis 使用
+
统一异步任务
+
统一 API 文档
+
统一测试
+
统一部署
```

后续开发具体业务时，只需要在 `modules/` 下新增业务模块，而不需要重新搭建整套后端基础设施。