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

REM 安装依赖
echo 正在安装依赖包...
pip install -r requirements.txt

REM 初始化数据库
echo 正在初始化数据库...
python database\init_db.py

REM 启动服务器
echo 启动服务器...
python run.py

pause