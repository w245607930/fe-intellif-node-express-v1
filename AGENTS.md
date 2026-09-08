# AGENTS.md

本文件是本仓库内开发人员与 AI 编程代理必须遵守的工程规则。其作用域覆盖项目根目录及全部子目录。若规则与更高优先级的安全要求、团队决策或任务说明冲突，以更高优先级要求为准；不能确定时先停止修改并说明风险。

## 项目架构

- 采用 **JavaScript + ESM** 的 Express 模块化单体架构，并为后续独立 Worker 保留边界。
- HTTP 调用方向固定为：`Route → Middleware → Controller → Service → Prisma/Redis/Queue`。
- Controller 只负责接收已校验输入、调用 Service、转换 HTTP 状态并返回统一响应。
- **禁止在 Controller、Route 或 Middleware 中直接操作 Prisma。**
- **所有业务规则、授权判断、事务边界和跨资源编排必须放在 Service。**
- Service 不得依赖 Express 的 `request`、`response` 或 `next` 对象。
- 基础设施连接由配置层集中管理；禁止业务模块自行创建 Prisma Client、Redis Client 或队列连接。
- API 与 Worker 必须使用独立入口；禁止在模块导入时自动监听端口或启动长期任务。
- 优先保持模块化单体，不得在没有明确 ADR 和验收依据时引入微服务或新的基础设施。

## 技术栈

- Node.js `22.22.x`、npm `10.9.x`，版本以 `engines`、`packageManager`、`.nvmrc` 和 lockfile 为准。
- JavaScript、ESM；第一版不引入 TypeScript。
- Express 5；异步处理器使用其原生 Promise 错误传播。
- Zod 用于环境变量和所有外部输入校验。
- MySQL 8.x + Prisma `6.19.3`；不得擅自升级 Prisma 主版本。
- Redis 用于缓存、会话加速、限流、锁和 BullMQ，不能替代应持久化到 MySQL 的业务事实。
- Pino/pino-http 用于结构化日志。
- Vitest + Supertest 用于单元测试和 HTTP 集成测试。
- ESLint、Prettier、Husky、lint-staged、Commitlint 作为质量门禁。

## 目录规范

- `src/config/`：环境、日志、数据库及基础设施配置。
- `src/constants/`：稳定错误码、枚举和跨模块常量。
- `src/errors/`：应用错误类型及错误归一化基础能力。
- `src/middlewares/`：Express 通用中间件，不承载业务逻辑。
- `src/modules/<module>/`：业务模块；新增业务模块必须放在此目录。
- `src/routes/`：API 路由聚合，只负责挂载模块路由。
- `src/services/`：仅放确实跨模块共享的服务；模块私有 Service 优先放在模块目录内。
- `src/utils/`：无业务状态的通用工具，禁止演变为隐式业务层。
- `prisma/`：Schema、Migration 和幂等种子脚本。
- `tests/unit/`：纯单元测试；`tests/integration/`：HTTP 或基础设施集成测试。
- `docs/`：架构、开发、测试、部署、规划和决策文档。
- `scripts/`：可重复执行的维护与诊断脚本。
- 模块文件建议采用 `<module>.routes.js`、`<module>.controller.js`、`<module>.service.js`、`<module>.schema.js`；测试使用 `*.test.js`。
- 禁止创建含义重叠的 `common`、`helpers`、`misc` 等目录；新增共享能力前先确认清晰归属。

## 编码规范

- 统一使用 ESM `import`/`export`，本地导入必须包含 `.js` 扩展名。
- 遵循现有 ESLint 和 Prettier 配置；禁止为了绕过检查而大范围关闭规则。
- 命名应表达业务含义：变量和函数使用 camelCase，类和 Prisma 模型使用 PascalCase，常量使用 UPPER_SNAKE_CASE。
- 函数保持单一职责；优先早返回，避免深层嵌套和超长参数列表。
- 禁止吞掉异常、空 `catch`、无说明的魔法数字和重复实现。
- 不得修改无关代码、进行无关重构或破坏现有公共 API。
- **禁止在源码、测试、文档、提交记录和日志中写死 Secret、Password、Token、私钥或 API Key。**
- 本地秘密只能保存在被 Git 忽略的 `.env` 中；`.env.example` 只能使用明显无效的占位值。
- 依赖必须锁定精确版本；新增依赖前确认必要性、许可证、维护状态和安全风险。

## API 规范

- 所有公开 API 使用 `/api/v1` 前缀，资源路径使用复数名词和 REST 语义。
- Route 只声明路径、中间件链和 Controller；禁止在路由内编写业务逻辑。
- **所有 API 外部输入必须使用 Zod 校验**，包括 `body`、`query`、`params` 和需要读取的 `headers`。
- Controller 必须只读取校验后的输入；禁止绕过校验直接信任原始请求数据。
- **所有 API 必须使用统一响应函数**：成功使用 `success()`，分页使用 `paginated()`，失败由全局错误处理中间件使用 `failure()` 返回。
- 成功响应结构为 `{ code: 0, message, data }`；分页数据放在 `data` 中，包含 `list`、`total`、`page`、`pageSize`。
- 失败响应使用稳定业务错误码；不得把堆栈、SQL、内部路径、Token 或其他敏感细节返回客户端。
- 新增或修改 API 必须同步更新 OpenAPI/Swagger 定义、示例、错误响应和认证要求；未同步文档不得视为完成。
- 新增 API 必须包含正常路径、校验失败、权限失败及关键错误路径测试。
- `requestId` 必须在响应头和错误响应中保持可追踪，不得自行生成另一套链路 ID。

## 数据库规范

- Controller 不得直接访问 Prisma；Service 或明确的基础设施层才可执行数据库操作。
- Prisma Client 使用项目统一单例，禁止 `new PrismaClient()` 散落在业务模块中；独立脚本可在自身生命周期内创建并关闭客户端。
- **修改 Prisma Schema 后必须创建并提交 Migration。** 禁止只执行 `db push` 后提交代码。
- **禁止直接修改生产数据库表结构、索引或约束。** 所有结构变更必须通过已审查、可追踪的 Migration 部署。
- Prisma 模型使用 PascalCase、字段使用 camelCase；MySQL 表和列映射为复数 snake_case。
- 多表写入、状态迁移和读后写操作必须由 Service 使用 `prisma.$transaction()` 定义事务边界。
- 禁止拼接原始 SQL；仅允许 Prisma API、参数化 tagged template 或经过审查的迁移 SQL。
- 列表查询必须分页并采用稳定排序；新增高频查询时同步评估索引。
- 默认查询应排除软删除记录；读取软删除记录必须明确说明业务用途。
- 用户名、邮箱、权限标识及关联关系必须依赖数据库唯一约束保证一致性。
- Refresh Token 只能保存不可逆哈希，禁止保存明文。
- 种子脚本必须幂等，重复执行不得生成重复管理员、角色、权限或关联记录。
- 数据库清理只能在 `NODE_ENV=test` 下对独立测试库执行；严禁对开发库或生产库运行清理测试。
- 具体事务、软删除和测试保护规则以 `docs/development/数据库规范.md` 为准。

## Redis 规范

- Redis Key 统一采用：`<app>:<env>:<domain>:<entity>:<identifier>[:<purpose>]`。
- 示例：`fe-intellif:prod:auth:session:<sessionId>`、`fe-intellif:test:cache:user:<userId>`。
- Key 片段使用小写 kebab-case；不得使用空格、中文、完整 Token、密码、邮箱等敏感信息。
- 每类 Key 必须明确所有者、数据结构、TTL、失效策略和最大体积；缓存及临时状态原则上必须设置 TTL。
- 禁止使用 `KEYS`、无界集合、无界 Lua 脚本或生产环境全库扫描；扫描必须使用 `SCAN` 并限制批次。
- 缓存不是业务事实来源；缓存失效时系统应能从权威数据源恢复。
- 分布式锁必须使用唯一持有者值、安全释放和有限租期，并明确超时与幂等策略。
- 不同用途必须使用 Key 前缀隔离，不得依赖 `FLUSHDB` 作为常规清理方式。

## 错误处理规范

- 预期业务错误使用 `AppError`，并提供稳定 `code`、HTTP `statusCode` 和安全消息。
- 错误码统一登记在 `src/constants/error-codes.js`；禁止在业务代码中随意写死新错误码。
- Controller 和 Service 不得直接拼装失败响应，应将错误交给全局错误处理中间件。
- 未知异常统一转换为 500；生产响应不得暴露原始异常消息、堆栈或数据库细节。
- 4xx 日志只记录必要的稳定元数据；5xx 日志记录异常和 Request ID，但仍须经过脱敏。
- 禁止用异常表示正常分支；禁止捕获后仅记录日志而不重新抛出或处理。
- Prisma、Zod、Redis 和第三方错误应在边界层转换为项目稳定错误语义。

## 日志规范

- 统一使用 Pino；业务代码禁止使用 `console.log()`、`console.error()` 等控制台输出。
- 使用结构化字段和固定消息，避免字符串拼接；日志必须包含可用的 Request ID 或任务 ID。
- 日志级别：`debug` 用于诊断，`info` 用于关键状态，`warn` 用于可恢复异常，`error` 用于请求或任务失败，`fatal` 用于进程无法继续。
- 禁止记录密码、Token、Cookie、Authorization、数据库连接串、完整请求体和个人敏感信息。
- 新增敏感字段时同步更新日志 `redact` 配置和相关测试。
- 不得以日志代替审计；重要权限和状态变更后续应进入专用审计记录。

## 测试规范

- 每个新增或修复的行为必须有自动化测试；Bug 修复应先添加可复现失败的回归测试。
- 单元测试不得依赖真实网络、时钟随机性或共享数据库；必要时注入依赖或使用可控替身。
- HTTP 集成测试通过导入 `createApp()` 或 `app` 执行，不得在测试中启动真实监听端口。
- 数据库集成测试必须使用独立测试库，执行前调用误库保护，结束后按外键安全顺序清理。
- 测试应覆盖正常路径、边界条件、非法输入、唯一约束、关联删除和错误响应。
- 测试不得依赖执行顺序，不得提交 `.only`、`.skip` 或无明确原因的快照更新。
- 完成修改前必须运行 `npm run check`；数据库模型变更还需运行 `npm run db:validate` 和相关数据库集成测试。
- 测试日志和断言不得包含真实秘密或生产数据。

## Git 规范

- 提交信息遵循 Conventional Commits，例如 `feat(auth): add login endpoint`、`fix(db): guard test cleanup`。
- 每次提交聚焦单一目的；禁止混入无关格式化、生成物或个人 IDE 配置。
- 禁止提交 `.env`、凭据、数据库导出、日志、覆盖率产物和临时文件。
- `package.json` 依赖变更必须同步提交 `package-lock.json`。
- Prisma Schema 变更必须与对应 Migration 一并提交。
- 禁止改写共享分支历史、绕过 Hook、强制推送或删除他人变更，除非用户明确授权。
- 提交前检查 `git diff`、运行质量门禁，并确认没有秘密和调试代码。

## AI 开发规则

- 开始修改前先读取相关代码、测试、规划文档和本文件，不得凭假设覆盖用户变更。
- 以最小、完整、可验证的改动解决任务；保留现有代码风格、公共 API 和架构边界。
- 不得擅自修改 `.env`、生产配置、真实数据库数据或基础设施；需要破坏性操作时必须先说明影响并获得明确授权。
- 不得读取、复制、输出或提交秘密；如上下文中出现凭据，应立即停止传播，并建议轮换已暴露凭据。
- 新增业务能力时按 `Schema → Service → Controller → Route → OpenAPI → Test` 的顺序实现并验证。
- 修改数据库时按 `Schema → Migration → Client Generate → Test → Documentation` 的顺序执行。
- 新增架构决策、依赖主版本、跨模块约定或安全边界时，必须同步更新 ADR/风险登记。
- 实现完成后必须运行相关 lint、格式检查、测试和配置校验；不得宣称未实际运行的验证已经通过。
- 若测试失败，只修复与当前任务相关且能确认根因的问题；不得删除测试或降低断言来制造通过。
- 同步更新实施路线图和进度台账，但只有满足验收门禁的任务才能标记完成。
- 不得在未检查现状时覆盖用户改动，不得还原与当前任务无关的工作区内容。
- 最终说明应列出改动、验证结果、剩余风险和阻塞项，禁止隐藏失败或未验证事项。
