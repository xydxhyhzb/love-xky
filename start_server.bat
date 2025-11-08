@echo off
echo 启动校园表白墙后端服务...
echo.

REM 检查Python是否安装
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 错误: 未检测到Python，请先安装Python
    pause
    exit /b 1
)

REM 检查pip是否可用
pip --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 错误: 未检测到pip，请检查Python安装
    pause
    exit /b 1
)

REM 安装依赖（如果需要）
echo 检查依赖...
pip install -r requirements.txt

REM 初始化数据库
echo 初始化数据库...
python database\init_db.py

REM 启动服务器
echo 启动服务器...
echo.
echo =========================================
echo 校园表白墙 - Python后端版本
echo =========================================
echo 前台地址: http://localhost:5000/
echo 管理后台: http://localhost:5000/admin
echo API测试页: http://localhost:5000/test
echo.
echo 默认管理员账号: admin
echo 默认管理员密码: 123456
echo =========================================
echo.
echo 服务器启动中，请稍候...
echo.

python run.py

pause