@echo off
title 表白墙共享版一键启动
color 0F

echo.
echo ========================================
echo        表白墙共享版一键启动
echo ========================================
echo.

:: 检查管理员权限
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo [警告] 未检测到管理员权限，正在尝试以管理员身份重新启动...
    echo.
    powershell -Command "Start-Process '%~dpnx0' -Verb RunAs"
    exit
)

:: 配置防火墙规则
echo [信息] 正在配置网络环境...
echo [1/4] 配置防火墙规则...
netsh advfirewall firewall add rule name="表白墙前台-8000" dir=in action=allow protocol=TCP localport=8000 >nul 2>&1
netsh advfirewall firewall add rule name="表白墙后台-8001" dir=in action=allow protocol=TCP localport=8001 >nul 2>&1
netsh advfirewall firewall add rule name="表白墙同步-8002" dir=in action=allow protocol=TCP localport=8002 >nul 2>&1
netsh advfirewall firewall add rule name="表白墙前台-8080" dir=in action=allow protocol=TCP localport=8080 >nul 2>&1
netsh advfirewall firewall add rule name="表白墙后台-8081" dir=in action=allow protocol=TCP localport=8081 >nul 2>&1
netsh advfirewall firewall add rule name="表白墙同步-8003" dir=in action=allow protocol=TCP localport=8003 >nul 2>&1

:: 获取本机IP
echo [2/4] 获取网络配置...
for /f "tokens=2 delims=:" %%i in ('ipconfig ^| findstr /i "IPv4"') do (
    for /f "tokens=1,2" %%a in ("%%i") do (
        if not "%%a"=="" (
            set LOCAL_IP=%%a
        )
    )
)

:: 获取外网IP
echo [3/4] 检测外网访问...
for /f "tokens=2 delims=:" %%i in ('nslookup myip.opendns.com resolver1.opendns.com 2^>nul ^| findstr /i "Address"') do (
    if not "%%i"=="" (
        if "%%i" neq "127.0.0.1" (
            set PUBLIC_IP=%%i
        )
    )
)

if "%PUBLIC_IP%"=="" (
    set PUBLIC_IP=%LOCAL_IP%
)

:: 启动服务
echo.
echo [4/4] 启动所有服务...
echo [信息] 启动数据同步服务...
start "表白墙数据同步" /D "%~dp0用户前台" cmd /k "cd /d %~dp0 && 启动数据同步服务.bat"

:: 等待2秒
timeout /t 2 /nobreak >nul

echo [信息] 启动前台服务...
start "表白墙前台服务" /D "%~dp0用户前台" cmd /k "cd /d %~dp0 && 启动用户前台-网络版.bat"

:: 等待2秒
timeout /t 2 /nobreak >nul

echo [信息] 启动后台服务...
start "表白墙后台服务" /D "%~dp0管理员后台" cmd /k "cd /d %~dp0 && 启动管理员后台-网络版.bat"

:: 等待3秒
timeout /t 3 /nobreak >nul

:: 打开浏览器
echo [信息] 正在打开浏览器...
start http://localhost:8000
start http://localhost:8001
start http://localhost:8002

:: 显示访问信息
echo.
echo ========================================
echo            服务启动成功！
echo ========================================
echo.
echo 单机版表白墙:
echo 本地访问: http://localhost:8000
echo 局域网访问: http://%LOCAL_IP%:8000
echo 外网访问: http://%PUBLIC_IP%:8000
echo.
echo 管理员后台:
echo 本地访问: http://localhost:8001
echo 局域网访问: http://%LOCAL_IP%:8001
echo 外网访问: http://%PUBLIC_IP%:8001
echo 后台登录账号: admin / 123456
echo.
echo 共享版表白墙 (多人可见):
echo 本地访问: http://localhost:8002
echo 局域网访问: http://%LOCAL_IP%:8002
echo 外网访问: http://%PUBLIC_IP%:8002
echo.
echo 服务窗口已在后台运行，关闭它们可停止服务
echo.
pause