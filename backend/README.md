# 医院体检预约管理系统 - 后端

基于 Django REST Framework 的后端 API 服务。

## 技术栈

- Python 3.9+
- Django 4.0+
- Django REST Framework
- MySQL 8.0

## 安装依赖

```bash
pip install -r requirements.txt
```

## 运行项目

```bash
python manage.py migrate
python manage.py runserver
```

## 运行测试

```bash
python manage.py test
```

## 初始化测试数据

```bash
python manage.py seed_data
```

## 清空测试数据

```bash
python manage.py clear_data
```

## API 文档

启动项目后访问：`http://localhost:8000/api/docs/`
