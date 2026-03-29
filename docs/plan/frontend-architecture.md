# 小程序管理端前端架构（v1）

## 1. 目标

- 在不影响现有用户端页面的前提下，新增管理端页面与登录态。
- 统一请求层，支持 `user` 与 `admin` 两种鉴权模式。

## 2. 目录规划

- `miniprogram/utils/request.js`：统一请求封装与错误处理
- `miniprogram/utils/admin-auth.js`：管理员会话读写
- `miniprogram/services/admin/*.js`：管理端 API 服务层
- `miniprogram/pages-admin/login/*`：管理端登录页
- `miniprogram/pages-admin/dashboard/*`：管理控制台
- `miniprogram/pages-admin/packages/*`：套餐列表页（MVP）
- `miniprogram/pages-admin/appointments/*`：预约列表与审核（MVP）

## 3. 鉴权策略

- 用户端 token：`token`
- 管理端 token：`admin_token`
- 管理端信息：`admin_info`
- 请求层按 `authMode` 读取 token：
  - 默认 `user`
  - 管理端使用 `admin`

## 4. 请求层规范

- 所有接口调用必须走 `utils/request.js`
- 管理端快捷方法：
  - `getAdmin`
  - `postAdmin`
  - `putAdmin`
  - `delAdmin`
- 401 处理：
  - 管理端：清理 `admin_*` 会话并跳转 `pages-admin/login/login`
  - 用户端：清理用户会话并提示登录

## 5. 页面路由

- 已注册：
  - `pages-admin/login/login`
  - `pages-admin/dashboard/index`
  - `pages-admin/packages/list`
  - `pages-admin/appointments/list`
- 当前入口：`pages/mine/index` -> “管理端入口”

## 6. 服务层职责

- `services/admin/auth.js`：登录、登出、管理员资料
- `services/admin/dashboard.js`：控制台统计
- `services/admin/packages.js`：套餐列表
- `services/admin/appointments.js`：预约列表、状态更新

## 7. 下一步

1. 新增 `pages-admin/reports/*`（对接 `/reports/`）
2. 新增 `pages-admin/articles/*` 与 `pages-admin/banners/*`
3. 补充 `docs/acceptance/p0-checklist.md` 用于联调验收
