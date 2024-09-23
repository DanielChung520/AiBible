import http from 'http';
import fs from 'fs';
import path from 'path';
import { parse } from 'url';
import { URL } from 'url';

const hostname = '127.0.0.1';
const port = 3010;

// 创建 HTTP 服务器
const server = http.createServer((req, res) => {
    // 解析请求的URL
    const url = parse(req.url, true);
    let filePath = path.join('.', decodeURIComponent(url.pathname)); // 使用 decodeURIComponent 解码路径

    if (url.pathname === '/') {
        filePath = path.join('.', 'index.html'); // 默认返回的文件
    }

    // 确定文件的扩展名
    const extname = String(path.extname(filePath)).toLowerCase();
    const mimeTypes = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.csv': 'text/csv',
        '.png': 'image/png',
        '.jpg': 'image/jpg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.ico': 'image/x-icon',
        '.txt': 'text/plain',
        '.xml': 'text/xml'
    };

    const contentType = mimeTypes[extname] || 'application/octet-stream';

    // 读取请求的文件
    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.statusCode = 404;
                res.setHeader('Content-Type', 'text/html');
                res.end('<h1>404 Not Found</h1>', 'utf-8');
            } else {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'text/html');
                res.end('500 Internal Server Error\n', 'utf-8');
            }
        } else {
            res.statusCode = 200;
            res.setHeader('Content-Type', contentType);
            res.end(content, 'utf-8');
        }
    });
});

// 启动服务器
server.listen(port, hostname, () => {
    console.log(`服务器运行在 http://${hostname}:${port}/`);
});
