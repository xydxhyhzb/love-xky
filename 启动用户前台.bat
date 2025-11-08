@echo off
title 校园表白墙 - 用户前台
color 0A
echo.
echo ================================================
echo           校园表白墙 - 用户前台服务
echo ================================================
echo.
echo 正在初始化服务器环境...

cd /d "%~dp0用户前台"

:: 检查Node.js是否已安装
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 未检测到Node.js，请先安装Node.js
    echo [下载] https://nodejs.org/
    pause
    exit /b 1
)

:: 检查并创建服务器文件
echo [信息] 检查服务器文件...
if not exist "server.js" (
    echo [信息] 创建服务器文件...
    call :createServerFile 8000 "表白墙用户前台"
)

:: 检查端口是否被占用
echo [信息] 检查端口8000是否被占用...
netstat -ano | findstr :8000 >nul
if %errorlevel% equ 0 (
    echo [警告] 端口8000已被占用，尝试使用8080端口...
    if not exist "server_8080.js" (
        call :createServerFile 8080 "表白墙用户前台"
        move server_8080.js server.js >nul 2>&1
    )
    echo [信息] 用户前台将在端口8080运行
    set PORT=8080
) else (
    echo [信息] 端口8000可用
    set PORT=8000
)

:: 启动服务器
echo.
echo ================================================
echo [成功] 服务器已准备就绪！
echo.
echo [信息] 用户前台访问地址: http://localhost:%PORT%
echo [信息] 按Ctrl+C可停止服务器
echo.
echo ================================================
echo.

:: 延迟2秒后自动打开浏览器
timeout /t 2 /nobreak >nul
start http://localhost:%PORT%

:: 启动Node.js服务器
node server.js

goto :eof

:createServerFile
:: 参数: %1=端口号, %2=服务器标题
echo const http = require('http'); > server_%1.js
echo const fs = require('fs'); >> server_%1.js
echo const path = require('path'); >> server_%1.js
echo. >> server_%1.js
echo const PORT = %1; >> server_%1.js
echo const SERVER_TITLE = '%2'; >> server_%1.js
echo. >> server_%1.js
echo const MIME_TYPES = { >> server_%1.js
echo   '.html': 'text/html', >> server_%1.js
echo   '.js': 'text/javascript', >> server_%1.js
echo   '.css': 'text/css', >> server_%1.js
echo   '.json': 'application/json', >> server_%1.js
echo   '.png': 'image/png', >> server_%1.js
echo   '.jpg': 'image/jpeg', >> server_%1.js
echo   '.gif': 'image/gif', >> server_%1.js
echo   '.svg': 'image/svg+xml', >> server_%1.js
echo   '.wav': 'audio/wav', >> server_%1.js
echo   '.mp4': 'video/mp4', >> server_%1.js
echo   '.woff': 'application/font-woff', >> server_%1.js
echo   '.ttf': 'application/font-ttf', >> server_%1.js
echo   '.eot': 'application/vnd.ms-fontobject', >> server_%1.js
echo   '.otf': 'application/font-otf', >> server_%1.js
echo   '.wasm': 'application/wasm' >> server_%1.js
echo }; >> server_%1.js
echo. >> server_%1.js
echo const server = http.createServer((req, res) =^> { >> server_%1.js
echo   // 解析URL >> server_%1.js
echo   let filePath = '.' + req.url; >> server_%1.js
echo   if (filePath === './') { >> server_%1.js
echo     filePath = './index.html'; >> server_%1.js
echo   } >> server_%1.js
echo. >> server_%1.js
echo   // 获取文件扩展名 >> server_%1.js
echo   const extname = String(path.extname(filePath)).toLowerCase(); >> server_%1.js
echo   const mimeType = MIME_TYPES[extname] ^|^| 'application/octet-stream'; >> server_%1.js
echo. >> server_%1.js
echo   // 设置CORS头 >> server_%1.js
echo   res.setHeader('Access-Control-Allow-Origin', '*'); >> server_%1.js
echo   res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE'); >> server_%1.js
echo   res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization'); >> server_%1.js
echo. >> server_%1.js
echo   // 读取文件 >> server_%1.js
echo   fs.readFile(filePath, (error, content) =^> { >> server_%1.js
echo     if (error) { >> server_%1.js
echo       if (error.code === 'ENOENT') { >> server_%1.js
echo         res.writeHead(404, { 'Content-Type': 'text/html' }); >> server_%1.js
echo         res.end('^<h1^>404 Not Found^</h1^>', 'utf-8'); >> server_%1.js
echo       } else { >> server_%1.js
echo         res.writeHead(500); >> server_%1.js
echo         res.end('Server Error: ' + error.code, 'utf-8'); >> server_%1.js
echo       } >> server_%1.js
echo     } else { >> server_%1.js
echo       res.writeHead(200, { 'Content-Type': mimeType }); >> server_%1.js
echo       res.end(content, 'utf-8'); >> server_%1.js
echo     } >> server_%1.js
echo   }); >> server_%1.js
echo }); >> server_%1.js
echo. >> server_%1.js
echo server.listen(PORT, () =^> { >> server_%1.js
echo   console.log(''); >> server_%1.js
echo   '========================================'); >> server_%1.js
echo   console.log('  ' + SERVER_TITLE + ' 服务器已启动'); >> server_%1.js
echo   '========================================'); >> server_%1.js
echo   console.log(''); >> server_%1.js
echo   console.log('访问地址: http://localhost:' + PORT); >> server_%1.js
echo   console.log('按 Ctrl+C 停止服务器'); >> server_%1.js
echo   console.log(''); >> server_%1.js
echo   '========================================'); >> server_%1.js
echo }); >> server_%1.js
goto :eof