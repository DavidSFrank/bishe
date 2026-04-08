# P1 第四批验收清单（轮播管理）

## 1. 入口与路由

- [x] `app.json` 已注册 `pages-admin/banners/list`
- [x] 控制台可点击“轮播”进入轮播管理页
- [ ] 未登录访问轮播管理页会被引导回管理端登录页

## 2. 列表与分页

- [x] `GET /api/articles/banners/` 返回分页数据
- [x] 列表可展示：图片、标题、链接、排序、启用状态
- [x] 支持下拉刷新与上拉加载更多
- [ ] 空数据时显示“暂无轮播数据”

## 3. 基础操作

- [x] 可新增轮播（图片URL必填）
- [x] 可编辑标题、链接、排序
- [x] 可删除轮播
- [x] 可启用/停用轮播状态

## 4. 异常处理

- [ ] 接口失败不导致页面卡死
- [x] 取消弹窗输入后不会误提交
- [x] 操作成功后列表自动刷新
- [x] 图片URL非 http/https 时前端拦截并提示
- [x] 跳转链接非 http/https 或站内路径时拦截并提示

## 5. 自动化证据（2026-04-08）

- `backend/tests/test_smoke.py` 已覆盖：
  - `test_admin_banner_validation`
  - `test_admin_can_update_and_delete_banner`
  - `test_user_only_sees_active_banners`
- 本地回归命令：`USE_SQLITE=true python manage.py test tests.test_smoke -v 1`（14 条通过）

## 5.1 最短人工实测脚本（3步）

1. 会话校验：先清理管理端登录态（删除 `admin_token`），直接打开 `pages-admin/banners/list`，预期被引导到 `pages-admin/login/login`。
2. 空数据校验：在后端清空轮播数据后进入轮播管理页，预期页面显示“暂无轮播数据”。
3. 异常校验：在开发者工具中断网或让后端不可达后下拉刷新，预期页面不崩溃，出现加载失败提示并可恢复重试。

> 执行后请回填第 1/2/4 章对应勾选项；如失败，在条目后追加“阻断原因 + 复现步骤”。

## 6. 结论

- [ ] P1 第四批（轮播管理）验收通过
- [ ] P1 第四批（轮播管理）验收不通过（记录问题并回归）




