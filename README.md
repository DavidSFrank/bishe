# 医院体检预约管理系统

基于微信小程序的医院体检预约管理系统，采用前后端分离架构。

## 项目结构

```
Finger/
├── backend/              # Django 后端 API
├── miniprogram/          # 微信小程序（用户端）
├── admin-web/            # Vue 管理后台
└── docs/                 # 项目文档
```

## 技术栈

| 端     | 技术                           |
| ------ | ------------------------------ |
| 后端   | Python 3.9+ / Django 4.0 / DRF |
| 小程序 | 微信原生开发                   |
| 管理端 | Vue 3 + Element Plus + Vite    |
| 数据库 | MySQL 8.0 / SQLite (开发)      |

## 快速开始

### 后端启动

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env  # 配置环境变量
python manage.py migrate
python manage.py runserver
```

### 管理端启动

```bash
cd admin-web
npm install
npm run dev
```

### 小程序开发

使用微信开发者工具打开 `miniprogram` 目录。

## 功能模块

- **用户端**：套餐浏览、在线预约、报告查询、个人中心
- **管理端**：套餐管理、预约审核、报告管理、用户管理

## 开发状态

✅ 第一阶段：环境搭建与基础架构 - **已完成**

## 计划文档（固定入口）

- 最终版开发计划（冻结）：`docs/plan/final-development-plan.md`
- P0 验收清单：`docs/acceptance/p0-checklist.md`
- P1 第二批验收（文章）：`docs/acceptance/p1-batch2-checklist.md`
- P1 第三批验收（咨询）：`docs/acceptance/p1-batch3-checklist.md`
