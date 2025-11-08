# 校园表白墙 - Python后端版本

一个基于Flask和SQLite的校园表白墙后端系统，支持表白发布、媒体文件上传、点赞、管理后台等功能。

## 功能特性

- 表白发布（支持文字、图片、视频）
- 表白列表展示（分页、搜索、筛选）
- 点赞功能
- 媒体文件上传和管理
- 管理员后台（数据统计、表白管理、数据导出）
- RESTful API设计
- JWT认证

## 技术栈

- **后端框架**: Flask
- **数据库**: SQLite
- **ORM**: SQLAlchemy
- **认证**: JWT
- **前端**: Bootstrap 5 + JavaScript
- **文件处理**: Werkzeug

## 项目结构

```
表白墙-Python后端/
├── api/                     # API模块
│   ├── app.py              # Flask应用和路由
│   └── models.py           # 数据库模型
├── database/               # 数据库相关
│   ├── init_db.py          # 数据库初始化脚本
│   └── (数据库文件)         # SQLite数据库文件
├── static/                 # 静态文件
│   ├── css/
│   │   ├── style.css       # 前台样式
│   │   └── admin.css       # 管理后台样式
│   └── js/
│       ├── main.js         # 前台脚本
│       └── admin.js        # 管理后台脚本
├── templates/              # HTML模板
│   ├── index.html          # 前台页面
│   └── admin.html          # 管理后台页面
├── uploads/                # 上传文件目录
├── requirements.txt        # Python依赖
├── run.py                  # 启动脚本
├── start.bat               # Windows启动脚本
└── README.md               # 说明文档
```

## 安装和运行

### 1. 克隆或下载项目

### 2. 安装依赖

```bash
pip install -r requirements.txt
```

### 3. 初始化数据库

```bash
python database/init_db.py
```

### 4. 启动服务

```bash
python run.py
```

或者在Windows上直接运行`start.bat`脚本

### 5. 访问应用

- 前台地址: http://localhost:5000/
- 管理后台: http://localhost:5000/admin
- API文档: 见下方API说明

## 默认管理员账号

- 用户名: `admin`
- 密码: `123456`

## API说明

### 认证相关

- `POST /api/login` - 管理员登录

### 表白相关

- `GET /api/confessions` - 获取表白列表（支持分页、搜索、筛选）
- `POST /api/confessions` - 创建新表白
- `GET /api/confessions/{id}` - 获取单个表白详情
- `POST /api/confessions/{id}/like` - 点赞表白
- `DELETE /api/confessions/{id}` - 删除表白（需要管理员权限）

### 媒体文件相关

- `POST /api/upload` - 上传媒体文件
- `GET /api/media/{id}` - 获取媒体文件

### 管理员相关

- `GET /api/admin/stats` - 获取统计信息（需要管理员权限）
- `GET /api/admin/export` - 导出数据（需要管理员权限）

## 配置说明

### 环境变量

- `HOST` - 服务器地址，默认: `0.0.0.0`
- `PORT` - 服务器端口，默认: `5000`
- `DEBUG` - 调试模式，默认: `True`

### 数据库

项目使用SQLite数据库，数据库文件位于`database/confessions.db`。

### 文件上传

上传的媒体文件保存在`uploads/`目录下，默认限制单个文件大小为50MB。

## 开发和扩展

### 添加新的API路由

在`api/app.py`中添加新的路由函数。

### 修改数据库模型

在`api/models.py`中修改模型类，然后运行数据库迁移脚本。

### 自定义前端样式

修改`static/css/`目录下的CSS文件。

## 许可证

本项目仅用于学习和演示目的。

## 支持

如有问题或建议，请提交Issue或Pull Request。