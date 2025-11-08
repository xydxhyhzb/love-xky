@echo off
title 校园表白墙 - 用户前台（网络版）
color 0A
echo.
echo ================================================
echo           校园表白墙 - 用户前台服务（网络版）
echo ================================================
echo.

cd /d "%~dp0用户前台"

:: 检查Node.js是否已安装
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 未检测到Node.js，请先安装Node.js
    echo [下载] https://nodejs.org/
    pause
    exit /b 1
)

:: 获取本机IP地址
echo [信息] 获取网络配置...
for /f "tokens=2 delims=:" %%i in ('ipconfig ^| findstr /i "IPv4"') do (
    for /f "tokens=1,2" %%a in ("%%i") do (
        if not "%%a"=="" (
            set LOCAL_IP=%%a
        )
    )
)

:: 如果没有获取到IP，使用默认值
if "%LOCAL_IP%"=="" (
    echo [警告] 无法获取本机IP地址，使用默认值
    set LOCAL_IP=0.0.0.0
)

echo [信息] 本机IP地址: %LOCAL_IP%

:: 检查端口8000是否被占用
echo [信息] 检查端口8000是否被占用...
netstat -ano | findstr :8000 >nul
if %errorlevel% equ 0 (
    echo [警告] 端口8000已被占用，尝试使用8080端口...
    set PORT=8080
) else (
    echo [信息] 端口8000可用
    set PORT=8000
)

:: 创建网络版服务器文件
echo [信息] 创建网络版服务器文件...
call :createNetworkServerFile %PORT% "表白墙用户前台"

:: 获取外网访问地址（尝试从外部IP获取）
echo [信息] 检测外网访问地址...
for /f "tokens=2 delims=:" %%i in ('nslookup myip.opendns.com resolver1.opendns.com 2^>nul ^| findstr /i "Address"') do (
    if not "%%i"=="" (
        if "%%i" neq "127.0.0.1" (
            set PUBLIC_IP=%%i
        )
    )
)

:: 如果无法获取外网IP，使用本机IP
if "%PUBLIC_IP%"=="" (
    set PUBLIC_IP=%LOCAL_IP%
)

:: 启动服务器
echo.
echo ================================================
echo [成功] 服务器已准备就绪！
echo.
echo [信息] 本地访问地址: http://localhost:%PORT%
echo [信息] 局域网访问地址: http://%LOCAL_IP%:%PORT%
echo [信息] 外网访问地址: http://%PUBLIC_IP%:%PORT%
echo.
echo [注意] 外网访问需要配置防火墙和路由器端口转发
echo [信息] 按Ctrl+C可停止服务器
echo.
echo ================================================
echo.

:: 延迟2秒后自动打开浏览器
timeout /t 2 /nobreak >nul
start http://localhost:%PORT%

:: 提示网络访问信息
echo.
echo ========================================
echo           网络访问说明
echo ========================================
echo.
echo 局域网内其他设备可以通过以下地址访问:
echo http://%LOCAL_IP%:%PORT%
echo.
echo 如果需要外网访问，请进行以下配置:
echo 1. 在Windows防火墙中允许端口%PORT%的入站连接
echo 2. 在路由器中设置端口转发规则:
echo    - 外部端口: %PORT%
echo    - 内部IP: %LOCAL_IP%
echo    - 内部端口: %PORT%
echo.
echo ========================================
echo.

:: 启动Node.js服务器
node network_server.js

goto :eof

:createNetworkServerFile
:: 参数: %1=端口号, %2=服务器标题
echo const http = require('http'); > network_server.js
echo const fs = require('fs'); >> network_server.js
echo const path = require('path'); >> network_server.js
echo const os = require('os'); >> network_server.js
echo. >> network_server.js
echo const PORT = %1; >> network_server.js
echo const SERVER_TITLE = '%2'; >> network_server.js
echo. >> network_server.js
echo // 获取本机所有网络接口 >> network_server.js
echo const networkInterfaces = os.networkInterfaces(); >> network_server.js
echo const addresses = []; >> network_server.js
echo for (const name of Object.keys(networkInterfaces)) { >> network_server.js
echo   for (const iface of networkInterfaces[name]) { >> network_server.js
echo     if (iface.family === 'IPv4' && !iface.internal) { >> network_server.js
echo       addresses.push(iface.address); >> network_server.js
echo     } >> network_server.js
echo   } >> network_server.js
echo } >> network_server.js
echo. >> network_server.js
echo const MIME_TYPES = { >> network_server.js
echo   '.html': 'text/html', >> network_server.js
echo   '.js': 'text/javascript', >> network_server.js
echo   '.css': 'text/css', >> network_server.js
echo   '.json': 'application/json', >> network_server.js
echo   '.png': 'image/png', >> network_server.js
echo   '.jpg': 'image/jpeg', >> network_server.js
echo   '.gif': 'image/gif', >> network_server.js
echo   '.svg': 'image/svg+xml', >> network_server.js
echo   '.wav': 'audio/wav', >> network_server.js
echo   '.mp4': 'video/mp4', >> network_server.js
echo   '.woff': 'application/font-woff', >> network_server.js
echo   '.ttf': 'application/font-ttf', >> network_server.js
echo   '.eot': 'application/vnd.ms-fontobject', >> network_server.js
echo   '.otf': 'application/font-otf', >> network_server.js
echo   '.wasm': 'application/wasm' >> network_server.js
echo }; >> network_server.js
echo. >> network_server.js
echo const server = http.createServer((req, res) => { >> network_server.js
echo   // 解析URL >> network_server.js
echo   let filePath = '.' + req.url; >> network_server.js
echo   if (filePath === './') { >> network_server.js
echo     filePath = './index.html'; >> network_server.js
echo   } >> network_server.js
echo. >> network_server.js
echo   // 获取文件扩展名 >> network_server.js
echo   const extname = String(path.extname(filePath)).toLowerCase(); >> network_server.js
echo   const mimeType = MIME_TYPES[extname] || 'application/octet-stream'; >> network_server.js
echo. >> network_server.js
echo   // 设置CORS头 >> network_server.js
echo   res.setHeader('Access-Control-Allow-Origin', '*'); >> network_server.js
echo   res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); >> network_server.js
echo   res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization'); >> network_server.js
echo. >> network_server.js
echo   // 处理OPTIONS请求 >> network_server.js
echo   if (req.method === 'OPTIONS') { >> network_server.js
echo     res.writeHead(200); >> network_server.js
echo     res.end(); >> network_server.js
echo     return; >> network_server.js
echo   } >> network_server.js
echo. >> network_server.js
echo   // 读取文件 >> network_server.js
echo   fs.readFile(filePath, (error, content) => { >> network_server.js
echo     if (error) { >> network_server.js
echo       if (error.code === 'ENOENT') { >> network_server.js
echo         res.writeHead(404, { 'Content-Type': 'text/html' }); >> network_server.js
echo         res.end('<h1>404 Not Found</h1>', 'utf-8'); >> network_server.js
echo       } else { >> network_server.js
echo         res.writeHead(500); >> network_server.js
echo         res.end('Server Error: ' + error.code, 'utf-8'); >> network_server.js
echo       } >> network_server.js
echo     } else { >> network_server.js
echo       res.writeHead(200, { 'Content-Type': mimeType }); >> network_server.js
echo       res.end(content, 'utf-8'); >> network_server.js
echo     } >> network_server.js
echo   }); >> network_server.js
echo }); >> network_server.js
echo. >> network_server.js
echo // 绑定到所有网络接口(0.0.0.0)允许外部访问 >> network_server.js
echo server.listen(PORT, '0.0.0.0', () => { >> network_server.js
echo   console.log(''); >> network_server.js
echo   '========================================'); >> network_server.js
echo   console.log('  ' + SERVER_TITLE + ' 服务器已启动'); >> network_server.js
echo   '========================================'); >> network_server.js
echo   console.log(''); >> network_server.js
echo   console.log('本地访问地址: http://localhost:' + PORT); >> network_server.js
echo   console.log(''); >> network_server.js
echo   if (addresses.length > 0) { >> network_server.js
echo     console.log('局域网访问地址:'); >> network_server.js
echo     addresses.forEach(address => { >> network_server.js
echo       console.log('  - http://' + address + ':' + PORT); >> network_server.js
echo     }); >> network_server.js
echo     console.log(''); >> network_server.js
echo   } >> network_server.js
echo   console.log('按 Ctrl+C 停止服务器'); >> network_server.js
echo   console.log(''); >> network_server.js
echo   '========================================'); >> network_server.js
echo }); >> network_server.js
echo. >> network_server.js
echo // 错误处理 >> network_server.js
echo server.on('error', (err) => { >> network_server.js
echo   if (err.code === 'EADDRINUSE') { >> network_server.js
echo     console.error('端口 ' + PORT + ' 已被占用，请尝试其他端口'); >> network_server.js
echo     process.exit(1); >> network_server.js
echo   } else { >> network_server.js
echo     console.error('服务器错误:', err); >> network_server.js
echo     process.exit(1); >> network_server.js
echo   } >> network_server.js
echo }); >> network_server.js
goto :eof