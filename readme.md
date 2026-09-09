# Node.js + Express 企业级后端基础模板

本项目计划建设一套基于 JavaScript、Express、MySQL、Prisma 与 Redis 的模块化企业级后端基础模板。

## 当前状态

- P0～P5 已完成，P6“契约、安全与可观测性”进行中；P5 RBAC 已通过本机 MySQL 集成验收。
- 已将原始规划拆解为 10 个实施阶段、99 项任务和对应验收门禁。
- 已具备 Express 启动入口、环境校验、结构化日志、Request ID、健康检查和冒烟测试。

## 环境要求

- Node.js 22.22.x
- npm 10.9.x
- Git

项目采用 JavaScript + ESM。Node.js 与 npm 版本约束分别记录在 `.nvmrc`、`.npmrc` 和 `package.json`。

## 安装与配置

安装依赖：

```bash
npm install
```

复制环境变量示例为本地配置：

```bash
copy .env.example .env
```

PowerShell 如果因执行策略拒绝 `npm.ps1`，可将命令中的 `npm` 替换为 `npm.cmd`。

项目启动脚本会在 Windows 交互式终端中自动切换到 UTF-8，确保 Pino 的中文日志正常显示。若直接执行 Node.js 入口且仍出现乱码，可先运行 `chcp 65001`，或统一通过下方 npm 脚本启动。

数据库集成测试必须配置本机独立 MySQL 测试库，并通过 `TEST_DATABASE_URL` 指向名称包含独立 `test` 标识的数据库。先执行 `npm run test:db:migrate`，再执行 `npm run test:db`；完整 P2 验收使用 `npm run test:p2`。保护脚本会拒绝远程、开发或生产数据库。Windows 本机 MySQL 8.4 默认安装目录为 `C:\Program Files\MySQL\MySQL Server 8.4`，数据库目录为 `C:\ProgramData\MySQL\MySQL Server 8.4\Data`。

## 本地运行

开发模式：

```bash
npm run dev
```

普通启动：

```bash
npm start
```

默认地址：

- 存活检查：http://localhost:3000/api/v1/health/live
- 就绪检查：http://localhost:3000/api/v1/health/ready

## 质量检查

```bash
npm run check
```

该命令依次执行 ESLint、Prettier 检查和 Vitest。Git 提交前会通过 Husky 和 lint-staged 检查暂存文件，提交信息遵循 Conventional Commits。

## 文档入口

- [OpenAPI 文档](docs/api/openapi.md)
- [错误码目录](docs/api/error-codes.md)
- [日志规范](docs/development/日志规范.md)
- [安全检查记录](docs/development/安全检查.md)

- [工程与 AI 开发规则](AGENTS.md)
- [项目文档中心](docs/README.md)
- [原始技术规划](Node.js%20+%20Express%20企业级后端项目技术规划文档.md)
- [规划解读](docs/planning/00-规划解读.md)
- [实施路线图](docs/planning/01-实施路线图.md)
- [进度台账](docs/planning/02-进度台账.md)
- [决策与风险登记](docs/planning/03-决策与风险登记.md)

后续所有规划、规范、架构、测试和部署文档统一保存在 `docs/` 目录；当前进度以进度台账为准。
