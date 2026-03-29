# 体检预约项目重构全流程计划（小程序管理端）

## 1. 目标与范围

- 目标：在现有 `backend/`（Django + DRF）可运行基础上，将 `admin-web/` 的后台管理能力重构到微信小程序中，并完成可演示、可验收的联调版本。
- 范围：
  - 文档对齐：`README.md`、`课题简介.md`、`计算机24Z1班243233Y109方颖-开题报告.md`
  - 后端核查：模型、路由、鉴权、分页、错误码、管理后台可维护性
  - 小程序重构：管理端页面、请求层、状态层、组件层
  - 联调验收：主流程、异常流程、回归测试、风险回滚
- 非目标（本阶段不做）：
  - 大规模数据库结构重构
  - 与课题无关的扩展业务（如支付、第三方医院系统打通）

## 2. 当前已知基线（截至 2026-03-30）

- Django 管理后台可登录（`/admin/` 可进入）。
- 项目目录已具备三端形态：`backend/`、`admin-web/`、`miniprogram/`。
- 进入“可运行基础已具备，进入联调与重构阶段”。

## 3. 总体实施策略

- 先冻结需求和接口，再开发页面，避免返工。
- 优先打通 P0 主链路：登录 -> 首页 -> 套餐 -> 预约 -> 报告/文章基础查询。
- 采用“可运行增量交付”：每周有可验收产物。
- 保持后端兼容优先，不影响现有 `admin-web/` 可用性。

## 4. 分阶段计划（按周）

## Week 1：需求对齐 + 后端核查 + 接口清单冻结

### 任务

- 通读并对齐文档：
  - `README.md`
  - `课题简介.md`
  - `计算机24Z1班243233Y109方颖-开题报告.md`
- 后端核查：
  - `backend/config/settings.py`：鉴权、分页、跨域、数据库配置
  - `backend/config/urls.py`：总路由与模块挂载
  - `backend/apps/*`：模型、序列化器、视图、URL
  - `backend/utils/`：`jwt_auth.py`、`pagination.py`、`response.py`
- 清点后台业务模块是否覆盖：`users`、`packages`、`appointments`、`reports`、`articles`。
- 产出 API 对照表（页面 -> 接口 -> 字段 -> 权限 -> 错误码）。

### 产出物

- `docs/plan/scope-baseline.md`
- `docs/api/api-mapping-v1.md`
- `docs/api/field-contract-v1.md`

### DoD

- 核心页面所需接口都有对应条目。
- 每个接口都标注：是否鉴权、分页格式、成功/失败示例。
- 团队对“本期范围”和“非目标”达成一致。

## Week 2：小程序重构底座（请求层/认证/路由结构）

### 任务

- 重构 `miniprogram/utils/request.js`：
  - 统一 `baseURL`
  - 自动携带 JWT
  - 401 统一处理（清理会话并跳登录）
  - 统一错误提示与日志
- 新建分层目录（建议）：
  - `miniprogram/services/`（API 调用封装）
  - `miniprogram/store/`（登录态/用户态）
  - `miniprogram/constants/`（状态码、路由名、分页常量）
  - `miniprogram/pages-admin/`（管理端页面）
- 完成管理员登录与会话持久化。

### 产出物

- `miniprogram/services/*.js`
- `miniprogram/store/auth.js`
- `docs/plan/frontend-architecture.md`

### DoD

- 登录成功后可稳定访问受保护页面。
- token 过期可被统一拦截并引导重新登录。
- 请求封装被至少 2 个页面复用。

## Week 3：P0 业务页面开发（核心 CRUD）

### 任务

- 实现 P0 页面（先可用后美化）：
  - 首页（关键统计/快捷入口）
  - 套餐管理（列表/详情/新增/编辑/上下架）
  - 预约管理（列表/筛选/状态流转）
- 统一列表页能力：分页、搜索、筛选、空态、加载态。
- 建立表单校验规则（前后端一致）。

### 产出物

- `miniprogram/pages-admin/dashboard/*`
- `miniprogram/pages-admin/packages/*`
- `miniprogram/pages-admin/appointments/*`
- `docs/acceptance/p0-checklist.md`

### DoD

- P0 页面主流程全部可走通。
- 每个页面至少完成 1 条新增/编辑/查询/异常处理用例。
- 无阻断级报错（白屏、循环请求、鉴权失效后无法恢复）。

## Week 4：P1 页面开发（内容与用户相关）

### 任务

- 实现：
  - 报告管理（列表/详情/状态）
  - 文章管理（列表/发布/编辑）
  - 用户管理（基础查询、状态查看）
  - 个人资料页（管理员信息与退出）
- 对齐 `admin-web/src/views/` 对应模块，补齐字段差异。

### 产出物

- `miniprogram/pages-admin/reports/*`
- `miniprogram/pages-admin/articles/*`
- `miniprogram/pages-admin/users/*`
- `miniprogram/pages-admin/profile/*`

### DoD

- P1 页面接口对接完成并稳定。
- 关键字段在页面显示正确（时间、状态、关联对象）。
- 常见异常（空数据、404、500、超时）均有可理解反馈。

## Week 5：联调回归 + 测试补齐 + 性能体验优化

### 任务

- 联调回归：全链路检查（登录 -> 管理操作 -> 数据回写）。
- 测试清单执行：
  - 主流程
  - 异常流程
  - 边界数据（空值、长文本、重复提交）
- 优化体验：减少重复请求、列表加载优化、操作防抖。
- 补齐文档：部署步骤、环境变量、常见问题。

### 产出物

- `docs/acceptance/e2e-test-report.md`
- `docs/ops/deploy-runbook.md`
- `docs/ops/troubleshooting.md`

### DoD

- 核心业务链路回归通过率 >= 95%。
- 无 P0/P1 级未关闭缺陷。
- 文档可支持新同学独立拉起项目并联调。

## Week 6：验收发布准备（答辩/演示版）

### 任务

- 固定演示脚本：数据准备、演示账号、演示路径。
- 完成验收材料：功能清单、测试证据、问题闭环说明。
- 预演并压测关键页面（列表、详情、表单提交）。

### 产出物

- `docs/acceptance/final-checklist.md`
- `docs/acceptance/demo-script.md`
- `docs/acceptance/release-note-v1.md`

### DoD

- 按演示脚本可 1 次走通。
- 验收问题均有记录与处理结论。
- 版本可标记为“可答辩/可验收”。

## 5. 页面优先级与实现顺序

- P0（必须）：登录、首页、套餐管理、预约管理。
- P1（应有）：报告管理、文章管理、用户管理、个人资料。
- P2（可选优化）：统计报表增强、批量操作、交互与性能细节。

## 6. 技术实现约定

- 鉴权：统一 JWT（请求头 `Authorization: Bearer <token>`）。
- 分页：统一适配后端分页结构（例如 `count/next/results`）。
- 错误处理：统一错误映射（401/403/404/422/500）。
- 时间与状态：统一格式化方法，避免页面各自处理。
- 接口封装：页面不直连 `wx.request`，必须走 `services/`。

## 7. 风险与回滚方案

- 风险 1：接口字段不一致导致页面反复修改
  - 预防：先冻结 `field-contract-v1.md`
  - 回滚：临时字段适配层，保持页面层不改
- 风险 2：鉴权与会话过期导致频繁掉线
  - 预防：统一 401 处理与登录态恢复
  - 回滚：短期降低会话过期敏感操作范围
- 风险 3：进度延迟
  - 预防：严格 P0 优先，P2 后移
  - 回滚：发布“P0 + 部分 P1”可验收版本
- 风险 4：影响现有管理能力
  - 预防：并行保留 `admin-web/`
  - 回滚：出现阻断问题时切回 `admin-web/` 演示

## 8. 验收标准（总）

- 功能：P0 全通过，P1 主要流程通过。
- 质量：无阻断缺陷，主要页面可稳定操作。
- 文档：计划、接口、测试、部署文档齐全。
- 可演示：演示账号、演示路径、演示数据完整。

## 9. 今日起步清单（立即执行）

- [x] 建立文档目录：`docs/plan`、`docs/api`、`docs/acceptance`、`docs/ops`
- [x] 输出 `api-mapping-v1.md`（先覆盖 P0 页面）
- [x] 确认 `miniprogram/utils/request.js` 的统一改造方案
- [x] 完成管理员登录态与 401 处理
- [x] 先做一个可联调页面（建议：套餐列表）

---

维护建议：每周五更新一次本文件中的“阶段状态”和“风险清单”，确保计划始终与代码进度一致。
