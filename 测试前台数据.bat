@echo off
title 校园表白墙 - 数据测试工具
color 0C
echo.
echo ================================================
echo          校园表白墙 - 前台数据测试工具
echo ================================================
echo.
echo 此工具将帮助你测试和验证前台数据存储功能
echo.
echo [1] 添加测试表白
echo [2] 检查本地存储
echo [3] 清除所有数据
echo [4] 恢复备份数据
echo [0] 退出
echo.

set /p choice="请选择操作: "

if "%choice%"=="1" goto :addTest
if "%choice%"=="2" goto :checkStorage
if "%choice%"=="3" goto :clearAll
if "%choice%"=="4" goto :recoverData
if "%choice%"=="0" exit

echo 无效选择，请重试
timeout /t 2 /nobreak >nul
goto :eof

:addTest
echo.
echo [操作] 添加测试表白...
echo.

:: 创建测试数据
set "testData={\"id\":%RANDOM%%RANDOM%,\"to\":\"测试接收人\",\"from\":\"测试发送人\",\"content\":\"这是一条测试表白，用于验证数据存储功能。\",\"type\":\"love\",\"timestamp\":\"%date% %time%\",\"likes\":0,\"media\":[]}"

:: 添加到本地存储
echo var testData = %testData%; > temp.js
echo var existing = localStorage.getItem('confessions'); >> temp.js
echo var confessions = existing ? JSON.parse(existing) : []; >> temp.js
echo confessions.unshift(testData); >> temp.js
echo localStorage.setItem('confessions', JSON.stringify(confessions)); >> temp.js
echo localStorage.setItem('frontend_confessions', JSON.stringify(confessions)); >> temp.js
echo localStorage.setItem('user_confessions', JSON.stringify(confessions)); >> temp.js

:: 启动浏览器执行脚本
start "" msedge "file:///D:/表白墙部署/temp.js"
timeout /t 2 /nobreak >nul
echo [完成] 测试表白已添加，请刷新前台页面查看

del temp.js >nul 2>&1
pause
goto :eof

:checkStorage
echo.
echo [操作] 检查本地存储...
echo.

:: 创建检查脚本
echo var storageKeys = Object.keys(localStorage); > check.js
echo console.log('=== 本地存储键 ==='); >> check.js
echo storageKeys.forEach(function(key) { >> check.js
echo     console.log(key); >> check.js
echo }); >> check.js
echo console.log('\n=== 表白数据 ==='); >> check.js
echo var possibleKeys = ['confessions', 'frontend_confessions', 'user_confessions']; >> check.js
echo possibleKeys.forEach(function(key) { >> check.js
echo     var data = localStorage.getItem(key); >> check.js
echo     if (data) { >> check.js
echo         try { >> check.js
echo             var parsed = JSON.parse(data); >> check.js
echo             console.log(key + ': ' + parsed.length + ' 条表白'); >> check.js
echo             if (parsed.length > 0) { >> check.js
echo                 console.log('最新: ' + parsed[0].to + ' -> ' + parsed[0].from); >> check.js
echo             } >> check.js
echo         } catch (e) { >> check.js
echo             console.log(key + ': 解析失败'); >> check.js
echo         } >> check.js
echo     } else { >> check.js
echo         console.log(key + ': 无数据'); >> check.js
echo     } >> check.js
echo }); >> check.js

start "" msedge "file:///D:/表白墙部署/check.js"
timeout /t 2 /nobreak >nul
echo [完成] 请在新打开的控制台中查看存储信息

del check.js >nul 2>&1
pause
goto :eof

:clearAll
echo.
echo [警告] 此操作将清除所有表白相关数据！
echo 确认继续吗？ (Y/N)
set /p confirm= 

if /i not "%confirm%"=="Y" goto :eof

:: 创建清除脚本
echo var keysToRemove = ['confessions', 'frontend_confessions', 'user_confessions']; > clear.js
echo keysToRemove.forEach(function(key) { >> clear.js
echo     localStorage.removeItem(key); >> clear.js
echo }); >> clear.js
echo console.log('所有表白数据已清除'); >> clear.js

start "" msedge "file:///D:/表白墙部署/clear.js"
timeout /t 2 /nobreak >nul
echo [完成] 数据已清除

del clear.js >nul 2>&1
pause
goto :eof

:recoverData
echo.
echo [操作] 恢复备份数据...
echo.
echo [注意] 此功能需要手动操作，请按照以下步骤：
echo.
echo 1. 在浏览器中打开前台页面
echo 2. 按F12打开开发者工具
echo 3. 在控制台中执行以下命令：
echo.
echo confessionWall.tryRecoverData();
echo.
echo 4. 或者点击页面上的"尝试恢复数据"按钮
echo.

pause
goto :eof