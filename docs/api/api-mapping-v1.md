# API Mapping v1（P0优先）
## 1. 说明
- 版本日期：2026-03-30
- 梳理依据：`backend/config/urls.py`、`backend/apps/*/urls.py`、`backend/apps/*/views.py`、`admin-web/src/views/*`
- 当前状态：基于代码静态分析，未替代联调实测
## 2. 全局约定
### 2.1 Base URL
- 管理端/小程序接口前缀：`/api`
### 2.2 认证
- Header：`Authorization: Bearer <token>`
- 管理员登录：`POST /api/users/admin/login/`
- 用户登录（微信 code）：`POST /api/users/login/`
### 2.3 统一返回
- 普通成功：
```json
{
  "code": 200,
  "message": "ok",
  "data": {}
}
```
- 分页成功：
```json
{
  "code": 200,
  "message": "ok",
  "data": {
    "list": [],
    "total": 0,
    "page": 1,
    "page_size": 10
  }
}
```
### 2.4 常见错误
- 业务错误：通常 `code != 200`，HTTP 状态可能仍为 200（见 `utils/response.py`）
- 鉴权失败：`401`（如 token 过期/无效）
- 权限不足：`403`
- 参数校验失败：`400`（DRF 校验错误格式可能与统一结构不同）
## 3. 页面 -> API 映射（P0）
## 3.1 管理员登录页
- 页面参考：`admin-web/src/views/login/index.vue`
- 小程序目标页：`miniprogram/pages-admin/login/*`
| 功能 | 方法 | 路径 | 鉴权 | 备注 |
| --- | --- | --- | --- | --- |
| 管理员登录 | POST | `/api/users/admin/login/` | 否 | body: `username`, `password` |
| 获取管理员资料 | GET | `/api/users/admin/profile/` | 是（admin） | 登录后校验会话 |
## 3.2 控制台
- 页面参考：`admin-web/src/views/dashboard/index.vue`
- 小程序目标页：`miniprogram/pages-admin/dashboard/*`
| 功能 | 方法 | 路径 | 鉴权 | 备注 |
| --- | --- | --- | --- | --- |
| 获取统计数据 | GET | `/api/users/admin/dashboard/` | 是（admin） | 返回今日预约/待审核/用户总数/套餐总数 |
## 3.3 套餐管理（P0核心）
- 页面参考：`admin-web/src/views/packages/index.vue`
- 小程序目标页：`miniprogram/pages-admin/packages/*`
| 功能 | 方法 | 路径 | 鉴权 | 备注 |
| --- | --- | --- | --- | --- |
| 套餐列表 | GET | `/api/packages/` | 否（读）/是（写） | 支持分页/筛选/搜索/排序 |
| 套餐详情 | GET | `/api/packages/{id}/` | 否（读） | 详情用于编辑回填 |
| 新增套餐 | POST | `/api/packages/` | 是（admin） | 必填核心字段：`name`, `price` |
| 编辑套餐 | PUT/PATCH | `/api/packages/{id}/` | 是（admin） | 建议 PATCH 局部更新 |
| 删除套餐 | DELETE | `/api/packages/{id}/` | 是（admin） | 物理删除 |
| 分类列表 | GET | `/api/packages/categories/` | 否（读） | 创建/编辑套餐时选择 |
查询参数建议：
- `page`, `page_size`
- `category`, `is_hot`, `is_active`
- `search`（命中 `name`, `description`, `suitable_for`）
- `ordering`（`sales_count`, `created_at`, `price`）
## 3.4 预约管理（P0核心）
- 页面参考：`admin-web/src/views/appointments/index.vue`
- 小程序目标页：`miniprogram/pages-admin/appointments/*`
| 功能 | 方法 | 路径 | 鉴权 | 备注 |
| --- | --- | --- | --- | --- |
| 预约列表（管理） | GET | `/api/appointments/` | 是（admin） | 含用户与套餐关联信息 |
| 预约详情 | GET | `/api/appointments/{id}/` | 是（admin） | |
| 审核通过 | PUT/PATCH | `/api/appointments/{id}/` | 是（admin） | `status=1` |
| 审核拒绝 | PUT/PATCH | `/api/appointments/{id}/` | 是（admin） | `status=4`, `reject_reason` |
| 用户创建预约 | POST | `/api/appointments/` | 是（user） | 小程序用户端使用 |
| 用户我的预约 | GET | `/api/appointments/my/` | 是（user） | 小程序用户端使用 |
查询参数建议：
- `page`, `page_size`
- `status`, `appointment_date`
- `ordering`（`created_at`, `appointment_date`）
## 3.5 P0联调最小闭环
1. `POST /api/users/admin/login/` 获取 token
2. `GET /api/users/admin/dashboard/` 拉取首页统计
3. `GET /api/packages/` 拉套餐列表
4. `POST /api/packages/` 新建套餐
5. `GET /api/appointments/` 拉预约列表
6. `PUT /api/appointments/{id}/` 完成审核（通过/拒绝）
## 4. P1 扩展映射（下一步）
| 模块 | 核心接口 |
| --- | --- |
| 报告管理 | `/api/reports/`, `/api/reports/{id}/`, `/api/reports/my/` |
| 用户管理 | `/api/users/`, `/api/users/{id}/`, `/api/users/me/` |
| 文章管理 | `/api/articles/`, `/api/articles/{id}/` |
| 轮播管理 | `/api/articles/banners/`, `/api/articles/banners/{id}/` |
| 咨询管理 | `/api/articles/consultations/`, `/api/articles/consultations/{id}/` |
| 管理员资料 | `/api/users/admin/profile/` |
## 5. 已识别差异与风险
- 返回结构与 DRF 默认错误结构并存，前端需要统一兜底解析。
- `IsAdminOrReadOnly` 允许未登录读操作，管理端页面可读但写必须带 admin token。
- `admin-web/` 当前调用较简化（例如列表直接取 `data.list || data`），小程序重构建议固定按分页结构读取。
## 6. 下一步
- 补充 `docs/api/field-contract-v1.md` 的字段级定义
- 进入 `miniprogram/utils/request.js` 改造（token/401/错误映射）
- 先落地一个 P0 页面（建议：套餐列表）完成首轮联调
