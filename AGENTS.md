# Project Guidelines

本项目为医院体检预约管理系统，采用前后端分离架构：后端 Django API、管理端 Vue SPA、小程序用户端。

## Architecture

- 后端 API 在 [backend/](backend/)（Django 4.x + DRF + MySQL/SQLite），统一响应与权限/分页封装
- 管理端在 [admin-web/](admin-web/)（Vue 3 + Element Plus + Vite），axios 封装统一处理 token/401
- 小程序在 [miniprogram/](miniprogram/)（微信原生），请求封装与全局 baseUrl

## Build and Test

后端（Django）：

```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
python manage.py test
python manage.py seed_data
python manage.py clear_data
```

管理端（Vue 3）：

```bash
cd admin-web
npm install
npm run dev
npm run build
npm run preview
```

小程序：使用微信开发者工具打开 [miniprogram/](miniprogram/)。

## Code Style

- 后端 Python：4 空格缩进，PEP 8；每个 app 包含 `models.py` / `serializers.py` / `views.py` / `urls.py`
- 管理端 Vue：2 空格缩进，使用 `<script setup>`，组件 PascalCase，变量/函数 camelCase
- 小程序：2 空格缩进，CommonJS（`require` / `module.exports`），每页四件套 `.js/.json/.wxml/.wxss`

## Conventions

- API 统一使用 `success()` / `error()` 响应封装，见 [backend/utils/response.py](backend/utils/response.py)
- ViewSet 统一继承 `StandardModelViewSet`，见 [backend/utils/viewsets.py](backend/utils/viewsets.py)
- API 路由前缀见 [backend/config/urls.py](backend/config/urls.py)
- 环境变量放在 `backend/.env`，不要提交；当前无 `.env.example`，请参考 [backend/config/settings.py](backend/config/settings.py)

## Docs

- 项目概览与快速开始见 [README.md](README.md)
- 后端专项说明见 [backend/README.md](backend/README.md)
- 论文/背景文档见 [课题简介.md](课题简介.md) 与 [计算机24Z1班243233Y109方颖-开题报告.md](%E8%AE%A1%E7%AE%97%E6%9C%BA24Z1%E7%8F%AD243233Y109%E6%96%B9%E9%A2%96-%E5%BC%80%E9%A2%98%E6%8A%A5%E5%91%8A.md)
