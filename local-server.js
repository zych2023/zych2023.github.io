/* 本地预览服务器（和 GitHub Pages 行为一致：无扩展名路径自动找 index.html）
   用法：node local-server.js  然后浏览器打开 http://localhost:8123/ */
const http = require('http');
const fs = require('fs');
const path = require('path');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.txt': 'text/plain',
};

const ROOT = __dirname;
const PORT = 8123;

http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p.endsWith('/')) p += 'index.html';

  let file = path.join(ROOT, p);
  try {
    const stat = fs.statSync(file);
    if (stat.isDirectory()) file = path.join(file, 'index.html');
  } catch (e) {
    // 无扩展名路径：/archives -> /archives/index.html
    file = path.join(ROOT, p, 'index.html');
    try { fs.statSync(file); } catch (e2) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }
  }

  try {
    const data = fs.readFileSync(file);
    res.writeHead(200, {
      'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': 'no-cache, must-revalidate', // 禁止缓存，改完文件刷新必见新内容
    });
    res.end(data);
  } catch (e) {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('500 Internal Server Error');
  }
}).listen(PORT, () => console.log('local server: http://localhost:' + PORT));
