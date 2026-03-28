# 更新 AGENTS.md 文件

## TL;DR

> **Quick Summary**: 将现有的简略 AGENTS.md 替换为完整的 AI 代理指南文档，包含构建命令、代码风格规范、项目结构等关键信息。
> 
> **Deliverables**:
> - 更新 `/AGENTS.md` 文件至约 200 行，包含完整的开发指南
> 
> **Estimated Effort**: Quick
> **Parallel Execution**: NO - sequential
> **Critical Path**: Task 1

---

## Context

### Original Request
用户请求分析代码库并创建/更新 AGENTS.md 文件，用于指导 AI 代理在此项目中工作。

### Interview Summary
**研究发现**:
- 项目是医院体检预约管理系统，三端架构
- 后端：Django 4.0 + DRF，使用自定义 JWT 认证和统一响应格式
- 管理端：Vue 3 + Element Plus + Vite
- 小程序：微信原生开发
- 已有测试目录 `backend/tests/`，使用 Django TestCase
- 无 Cursor/Copilot 规则文件

---

## Work Objectives

### Core Objective
用完整的 AI 代理指南替换现有的简略 AGENTS.md

### Concrete Deliverables
- `/AGENTS.md` - 完整的项目开发指南文档

### Definition of Done
- [ ] AGENTS.md 包含构建/测试命令（含单文件测试方法）
- [ ] AGENTS.md 包含代码风格规范和示例
- [ ] AGENTS.md 包含项目结构说明
- [ ] AGENTS.md 约 200 行

### Must Have
- 后端/管理端/小程序的启动命令
- Django 单个测试运行方法
- Python/Vue/小程序的代码风格示例
- API 响应格式说明
- 项目结构目录树

### Must NOT Have (Guardrails)
- 不包含任何敏感配置信息
- 不添加项目中不存在的命令

---

## Verification Strategy

### Test Decision
- **Infrastructure exists**: YES (Django TestCase)
- **User wants tests**: NO (文档更新任务)
- **Framework**: N/A

### Automated Verification

```bash
# 验证文件存在且长度合适
wc -l /Users/david/codeFile/Finger/AGENTS.md
# 期望: 约 180-220 行

# 验证关键内容存在
grep -c "python manage.py test" /Users/david/codeFile/Finger/AGENTS.md
# 期望: >= 1

grep -c "npm run dev" /Users/david/codeFile/Finger/AGENTS.md
# 期望: >= 1
```

---

## TODOs

- [ ] 1. 替换 AGENTS.md 为完整版本

  **What to do**:
  - 使用以下完整内容替换 `/Users/david/codeFile/Finger/AGENTS.md`

  **Must NOT do**:
  - 不要保留旧内容
  - 不要添加不存在的命令或配置

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 单文件写入任务，内容已完全确定
  - **Skills**: [`git-master`]
    - `git-master`: 完成后可能需要提交

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential
  - **Blocks**: None
  - **Blocked By**: None

  **References**:
  - 目标文件: `/Users/david/codeFile/Finger/AGENTS.md`

  **New Content**:

  ```markdown
  # 医院体检预约管理系统 - AI 代理指南

  ## 项目概述

  基于微信小程序的医院体检预约管理系统，采用前后端分离架构。

  | 端 | 技术栈 | 目录 |
  |---|--------|------|
  | 后端 | Django 4.0+ / DRF / MySQL | `backend/` |
  | 管理端 | Vue 3 / Element Plus / Vite | `admin-web/` |
  | 小程序 | 微信原生开发 | `miniprogram/` |

  ---

  ## 构建、开发与测试命令

  ### 后端 (Django)

  ```bash
  cd backend

  # 安装依赖
  pip install -r requirements.txt

  # 数据库迁移
  python manage.py migrate

  # 启动开发服务器
  python manage.py runserver

  # 生成测试数据
  python manage.py seed_data

  # 清空测试数据
  python manage.py clear_data

  # 运行所有测试
  python manage.py test

  # 运行单个测试文件
  python manage.py test tests.test_smoke

  # 运行单个测试类/方法
  python manage.py test tests.test_smoke.SmokeTest.test_smoke

  # 查看 API 文档
  # 启动服务后访问: http://localhost:8000/api/docs/
  ```

  ### 管理端 (Vue 3)

  ```bash
  cd admin-web

  # 安装依赖
  npm install

  # 开发模式（热更新）
  npm run dev

  # 生产构建
  npm run build

  # 预览构建产物
  npm run preview
  ```

  ### 小程序

  - 使用微信开发者工具打开 `miniprogram/` 目录
  - AppID 配置在 `project.config.json`

  ---

  ## 项目结构

  ```
  backend/
  ├── apps/                   # Django 应用
  │   ├── users/              # 用户模块（登录、收藏）
  │   ├── packages/           # 套餐模块（分类、套餐）
  │   ├── appointments/       # 预约模块
  │   ├── reports/            # 报告模块
  │   └── articles/           # 内容模块（文章、轮播图）
  ├── config/                 # Django 配置
  │   ├── settings.py         # 全局配置
  │   └── urls.py             # 根路由
  ├── utils/                  # 通用工具
  │   ├── response.py         # 统一响应格式 success()/error()
  │   ├── viewsets.py         # StandardModelViewSet 基类
  │   ├── pagination.py       # 分页配置
  │   ├── permissions.py      # IsAdmin/IsUser 权限类
  │   └── jwt_auth.py         # JWT 认证
  └── tests/                  # 测试目录

  admin-web/
  ├── src/
  │   ├── api/request.js      # axios 请求封装
  │   ├── router/index.js     # 路由配置
  │   ├── views/              # 页面组件
  │   ├── components/         # 公共组件
  │   └── main.js             # 入口文件
  └── vite.config.js          # Vite 配置

  miniprogram/
  ├── pages/                  # 页面（按功能划分）
  ├── utils/request.js        # 请求封装
  ├── app.js                  # 全局逻辑
  └── app.json                # 小程序配置
  ```

  ---

  ## 代码风格规范

  ### Python (后端)

  - **缩进**: 4 空格
  - **规范**: 遵循 PEP 8
  - **分层**: 每个 app 包含 `models.py`, `serializers.py`, `views.py`, `urls.py`

  ```python
  # 模型示例
  class Package(models.Model):
      """体检套餐"""
      name = models.CharField('套餐名称', max_length=100)
      price = models.DecimalField('价格', max_digits=10, decimal_places=2)
      is_active = models.BooleanField('是否上架', default=True)
      created_at = models.DateTimeField('创建时间', auto_now_add=True)

      class Meta:
          db_table = 'package'
          verbose_name = '体检套餐'
          ordering = ['-created_at']

  # 序列化器示例
  class PackageSerializer(serializers.ModelSerializer):
      class Meta:
          model = Package
          fields = ['id', 'name', 'price', 'is_active', 'created_at']
          read_only_fields = ['id', 'created_at']

  # 视图示例 - 使用统一响应
  from utils.response import success, error
  from utils.viewsets import StandardModelViewSet

  class PackageViewSet(StandardModelViewSet):
      queryset = Package.objects.all()
      serializer_class = PackageSerializer
      permission_classes = [IsAdmin]
  ```

  ### API 响应格式

  统一使用 `utils/response.py` 中的 `success()` 和 `error()` 函数：

  ```python
  # 成功响应
  return success(data)
  # {"code": 200, "message": "ok", "data": {...}}

  # 错误响应
  return error('错误信息', code=400)
  # {"code": 400, "message": "错误信息", "data": null}
  ```

  ### Vue 3 (管理端)

  - **缩进**: 2 空格
  - **组件**: 使用 `<script setup>` 语法
  - **命名**: PascalCase 组件名，camelCase 变量/函数

  ```vue
  <script setup>
  import { ref, onMounted } from 'vue'
  import request from '@/api/request'
  import { ElMessage } from 'element-plus'

  const data = ref([])
  const loading = ref(false)

  const loadData = async () => {
    loading.value = true
    try {
      data.value = await request.get('/api/endpoint/')
    } catch (e) {
      // request.js 已处理错误提示
    } finally {
      loading.value = false
    }
  }

  onMounted(loadData)
  </script>

  <template>
    <el-table :data="data" v-loading="loading">
      <!-- 表格列 -->
    </el-table>
  </template>
  ```

  ### 微信小程序

  - **缩进**: 2 空格
  - **模块**: CommonJS (`require` / `module.exports`)
  - **页面**: 每个页面一个目录，包含 `.js`, `.json`, `.wxml`, `.wxss`

  ```javascript
  // 页面示例
  const { get, post } = require('../../utils/request')

  Page({
    data: {
      list: [],
      loading: true
    },

    onLoad(options) {
      this.loadData()
    },

    async loadData() {
      try {
        const data = await get('/api/endpoint/')
        this.setData({ list: data, loading: false })
      } catch (error) {
        console.error('加载失败:', error)
        this.setData({ loading: false })
      }
    }
  })
  ```

  ---

  ## 环境配置

  后端环境变量配置在 `backend/.env`：

  ```env
  SECRET_KEY=your-secret-key
  DEBUG=True
  USE_SQLITE=True          # 开发环境使用 SQLite
  DB_NAME=hospital_checkup
  DB_USER=root
  DB_PASSWORD=
  DB_HOST=localhost
  DB_PORT=3306
  ```

  **重要**: 请勿提交 `.env` 文件到版本控制，敏感信息仅保留在本地。

  ---

  ## API 路由结构

  | 前缀 | 模块 | 说明 |
  |------|------|------|
  | `/api/users/` | users | 登录、用户管理、收藏 |
  | `/api/packages/` | packages | 套餐、分类 |
  | `/api/appointments/` | appointments | 预约管理 |
  | `/api/reports/` | reports | 报告管理 |
  | `/api/articles/` | articles | 文章、轮播图 |
  | `/api/docs/` | - | Swagger API 文档 |

  ---

  ## 常见开发任务

  ### 新增 Django 应用

  ```bash
  cd backend
  python manage.py startapp new_app apps/new_app
  # 在 config/settings.py INSTALLED_APPS 中添加 'apps.new_app'
  # 在 config/urls.py 中添加路由
  ```

  ### 新增管理端页面

  1. 在 `admin-web/src/views/` 创建页面目录
  2. 在 `admin-web/src/router/index.js` 添加路由
  3. 在 Layout 菜单中添加入口

  ### 新增小程序页面

  1. 在 `miniprogram/pages/` 创建页面目录
  2. 在 `miniprogram/app.json` 的 `pages` 数组中添加路径

  ---

  ## 提交规范建议

  ```
  feat(模块): 新增功能描述
  fix(模块): 修复问题描述
  refactor(模块): 重构说明
  docs: 文档更新
  style: 样式调整
  ```

  示例: `feat(packages): 新增套餐收藏功能`
  ```

  **Acceptance Criteria**:
  - [ ] 文件已写入 `/Users/david/codeFile/Finger/AGENTS.md`
  - [ ] `wc -l AGENTS.md` 返回约 180-220 行
  - [ ] `grep "python manage.py test" AGENTS.md` 能找到内容

  **Commit**: YES
  - Message: `docs: 更新 AGENTS.md 为完整的 AI 代理指南`
  - Files: `AGENTS.md`
  - Pre-commit: N/A

---

## Commit Strategy

| After Task | Message | Files | Verification |
|------------|---------|-------|--------------|
| 1 | `docs: 更新 AGENTS.md 为完整的 AI 代理指南` | AGENTS.md | wc -l AGENTS.md |

---

## Success Criteria

### Verification Commands
```bash
wc -l /Users/david/codeFile/Finger/AGENTS.md
# Expected: 180-220 行

grep -c "python manage.py test" /Users/david/codeFile/Finger/AGENTS.md
# Expected: >= 1
```

### Final Checklist
- [ ] AGENTS.md 包含构建命令
- [ ] AGENTS.md 包含测试命令（含单文件测试）
- [ ] AGENTS.md 包含代码风格规范
- [ ] AGENTS.md 约 200 行
