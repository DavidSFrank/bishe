# Field Contract v1（字段契约）

## 1. 说明

- 版本日期：2026-03-30
- 依据：`backend/apps/*/models.py` 与 `backend/apps/*/serializers.py`
- 用途：统一小程序管理端与后端的数据字段认知，减少联调返工

## 2. 通用字段约定

- 主键：`id`（整数）
- 时间：
  - 日期：`YYYY-MM-DD`
  - 日期时间：`YYYY-MM-DD HH:mm:ss`
- 分页响应：`data.list`, `data.total`, `data.page`, `data.page_size`
- 布尔字段：`true/false`

## 3. 模块字段定义

## 3.1 管理员（Admin）

来源：`apps.users.models.Admin`

| 字段 | 类型 | 说明 | 读写 |
| --- | --- | --- | --- |
| id | int | 管理员 ID | 只读 |
| username | string | 账号 | 登录后只读 |
| name | string | 姓名 | 可写 |
| is_active | bool | 是否启用 | 只读（前端不改） |
| last_login | datetime/null | 最近登录时间 | 只读 |
| created_at | datetime | 创建时间 | 只读 |

## 3.2 套餐分类（Category）

来源：`apps.packages.models.Category`

| 字段 | 类型 | 说明 | 读写 |
| --- | --- | --- | --- |
| id | int | 分类 ID | 只读 |
| name | string | 分类名称 | 可写 |
| description | string | 描述 | 可写 |
| icon | string | 图标 | 可写 |
| sort_order | int | 排序值 | 可写 |
| is_active | bool | 是否启用 | 可写 |
| created_at | datetime | 创建时间 | 只读 |

## 3.3 体检套餐（Package）

来源：`apps.packages.models.Package`

| 字段 | 类型 | 说明 | 读写 |
| --- | --- | --- | --- |
| id | int | 套餐 ID | 只读 |
| category | object/int/null | 读时为对象，写时传分类 ID | 可写 |
| name | string | 套餐名称 | 可写（必填） |
| description | string | 描述 | 可写 |
| price | decimal | 价格 | 可写（必填） |
| original_price | decimal/null | 原价 | 可写 |
| image | string | 封面图 URL | 可写 |
| items | string | 项目列表（文本/JSON 字符串） | 可写 |
| suitable_for | string | 适用人群 | 可写 |
| notice | string | 注意事项 | 可写 |
| sales_count | int | 销量 | 只读 |
| views_count | int | 浏览量 | 只读 |
| is_hot | bool | 是否热门 | 可写 |
| is_active | bool | 是否上架 | 可写 |
| created_at | datetime | 创建时间 | 只读 |
| updated_at | datetime | 更新时间 | 只读 |

## 3.4 体检预约（Appointment）

来源：`apps.appointments.models.Appointment`

| 字段 | 类型 | 说明 | 读写 |
| --- | --- | --- | --- |
| id | int | 预约 ID | 只读 |
| user | int/object | 用户（读时可能带关联） | 用户端只读 |
| package | int/object | 套餐（读时对象，写时 ID） | 可写 |
| name | string | 体检人姓名 | 可写 |
| phone | string | 联系电话 | 可写 |
| id_card | string | 身份证号 | 可写 |
| gender | int | 性别（1男、2女） | 可写 |
| appointment_date | date | 预约日期 | 可写 |
| date | date | 写入别名，后端会映射到 `appointment_date` | 可写 |
| time_slot | string | 时段（如 08:00-10:00） | 可写 |
| order_no | string | 订单号 | 只读 |
| amount | decimal | 金额 | 只读（按套餐价格） |
| status | int | 预约状态 | 可写（管理员审核） |
| remark | string | 备注 | 可写 |
| reject_reason | string | 拒绝原因 | 可写 |
| created_at | datetime | 创建时间 | 只读 |
| updated_at | datetime | 更新时间 | 只读 |

状态枚举：

- `0` 待审核
- `1` 已确认
- `2` 已完成
- `3` 已取消
- `4` 已拒绝

## 3.5 体检报告（Report）

来源：`apps.reports.models.Report`

| 字段 | 类型 | 说明 | 读写 |
| --- | --- | --- | --- |
| id | int | 报告 ID | 只读 |
| appointment | int/object | 关联预约（读时对象，写时 ID） | 可写 |
| result_summary | string | 结果摘要 | 可写 |
| file_url | string | 报告文件 URL | 可写 |
| doctor | string | 报告医生 | 可写 |
| report_date | date/null | 报告日期 | 可写 |
| created_at | datetime | 创建时间 | 只读 |
| updated_at | datetime | 更新时间 | 只读 |

## 3.6 用户（User）

来源：`apps.users.models.User`

| 字段 | 类型 | 说明 | 读写 |
| --- | --- | --- | --- |
| id | int | 用户 ID | 只读 |
| openid | string | 微信 openid | 只读 |
| nickname | string | 昵称 | 可写 |
| avatar | string | 头像 URL | 可写 |
| phone | string | 手机号 | 可写 |
| real_name | string | 真实姓名 | 可写 |
| id_card | string | 身份证号 | 可写 |
| gender | int | 性别（0未知、1男、2女） | 可写 |
| is_active | bool | 是否启用 | 管理端可写 |
| created_at | datetime | 创建时间 | 只读 |
| updated_at | datetime | 更新时间 | 只读 |

## 3.7 文章/轮播/咨询（P1）

来源：`apps.articles.models.*`

- `Article`
  - `id`, `title`, `content`, `cover_image`, `views_count`, `is_active`, `created_at`, `updated_at`
- `Banner`
  - `id`, `title`, `image`, `link`, `sort_order`, `is_active`, `created_at`
- `Consultation`
  - `id`, `user`, `user_info`, `content`, `reply`, `status`, `created_at`, `replied_at`
  - 状态：`0` 待回复，`1` 已回复

## 4. 前端实现建议

- 表单提交按“写入类型”传值（例如 `category`/`package` 传 ID）。
- 列表展示按“读取类型”渲染（例如 `package.name`、`category.name`）。
- 所有日期/状态显示走统一格式化函数，不在页面散写。
- 对校验错误同时兼容：
  - 统一结构：`{ code, message, data }`
  - DRF 默认结构：字段错误对象

