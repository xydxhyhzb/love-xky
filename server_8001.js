const http = require('http'); 
const fs = require('fs'); 
const path = require('path'); 
 
const PORT = 8001; 
const SERVER_TITLE = '"表白墙管理员后台"'; 
 
const MIME_TYPES = { 
  '.html': 'text/html', 
  '.js': 'text/javascript', 
  '.css': 'text/css', 
  '.json': 'application/json', 
  '.png': 'image/png', 
  '.jpg': 'image/jpeg', 
  '.gif': 'image/gif', 
  '.svg': 'image/svg+xml', 
  '.wav': 'audio/wav', 
  '.mp4': 'video/mp4', 
  '.woff': 'application/font-woff', 
  '.ttf': 'application/font-ttf', 
  '.eot': 'application/vnd.ms-fontobject', 
  '.otf': 'application/font-otf', 
  '.wasm': 'application/wasm' 
}; 
 
const server = http.createServer((req, res) => { 
  // 解析URL 
  let filePath = '.' + req.url; 
  if (filePath === './') { 
    filePath = './index.html'; 
  } 
 
  // 获取文件扩展�?
  const extname = String(path.extname(filePath)).toLowerCase(); 
  const mimeType = MIME_TYPES[extname] || 'application/octet-stream'; 
 
  // 设置CORS�?
  res.setHeader('Access-Control-Allow-Origin', '*'); 
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE'); 
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization'); 
 
  // 读取文件 
  fs.readFile(filePath, (error, content) => { 
    if (error) { 
      if (error.code === 'ENOENT') { 
        res.writeHead(404, { 'Content-Type': 'text/html' }); 
        res.end('<h1>404 Not Found</h1>', 'utf-8'); 
      } else { 
        res.writeHead(500); 
        res.end('Server Error: ' + error.code, 'utf-8'); 
      } 
    } else { 
      res.writeHead(200, { 'Content-Type': mimeType }); 
      res.end(content, 'utf-8'); 
    } 
  }); 
}); 
 
server.listen(PORT, () => { 
  console.log(''); 
  '========================================'); 
  console.log('  ' + SERVER_TITLE + ' 服务器已启动'); 
  '========================================'); 
  console.log(''); 
  console.log('访问地址: http://localhost:' + PORT); 
  console.log(''); 
  console.log('默认登录账号: admin'); 
  console.log('默认登录密码: 123456'); 
  console.log(''); 
  '========================================'); 
}); 
