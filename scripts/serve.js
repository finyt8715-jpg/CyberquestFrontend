#!/usr/bin/env node
'use strict';
/** Tiny local preview server for public/ (no dependencies). Usage: npm run dev, then open http://localhost:3000 */
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const {spawnSync} = require('node:child_process');
const {validateLevel,readLevels,levelsPath} = require('./levels');
const root = path.join(__dirname, '..', 'public');
const projectRoot = path.join(__dirname, '..');
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.json': 'application/json', '.txt': 'text/plain', '.mp3': 'audio/mpeg', '.m4a': 'audio/mp4', '.webm': 'audio/webm', '.ogg': 'audio/ogg', '.wav': 'audio/wav' };
const port = Number(process.env.PORT) || 3000;
http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (url.pathname === '/admin' || url.pathname === '/admin/') {
    if (req.method !== 'GET') { res.writeHead(405); res.end(); return; }
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
    res.end(fs.readFileSync(path.join(projectRoot, 'src', 'admin.html'))); return;
  }
  if (url.pathname === '/__admin/levels') {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    if (req.method === 'GET') { res.end(JSON.stringify(readLevels(projectRoot))); return; }
    if (req.method !== 'POST') { res.writeHead(405); res.end(JSON.stringify({error:'Method not allowed.'})); return; }
    const origin = req.headers.origin;
    if (origin && origin !== 'http://localhost:' + port && origin !== 'http://127.0.0.1:' + port) { res.writeHead(403); res.end(JSON.stringify({error:'Invalid origin.'})); return; }
    if (!/^application\/json\b/.test(req.headers['content-type'] || '')) { res.writeHead(415); res.end(JSON.stringify({error:'JSON required.'})); return; }
    let body = '';
    req.on('data', chunk => { body += chunk; if (body.length > 65536) req.destroy(); });
    req.on('end', () => {
      try {
        const input = JSON.parse(body), levels = readLevels(projectRoot), level = validateLevel(input.level);
        const index = input.index;
        if (index === null) { if (levels.length >= 45) throw Error('Campaign limit reached.'); levels.push(level); }
        else if (Number.isInteger(index) && index >= 0 && index < levels.length) levels[index] = level;
        else throw Error('Choose an existing level or create a new one.');
        const file = levelsPath(projectRoot), before = fs.readFileSync(file, 'utf8');
        fs.writeFileSync(file, JSON.stringify(levels, null, 2) + '\n');
        const build = spawnSync(process.execPath, [path.join(projectRoot, 'scripts', 'build.js')], {cwd:projectRoot, encoding:'utf8'});
        if (build.status !== 0) { fs.writeFileSync(file, before); throw Error('Build failed: ' + (build.stderr || build.stdout || 'unknown error').slice(0, 300)); }
        res.end(JSON.stringify({levels,index:index === null ? levels.length - 1 : index}));
      } catch (error) { res.writeHead(400); res.end(JSON.stringify({error:error.message})); }
    }); return;
  }
  let rel;
  try { rel = decodeURIComponent(url.pathname); } catch (e) { res.writeHead(400); res.end(); return; }
  if (rel === '/login' || rel === '/login/') rel = '/login.html';
  if (rel.endsWith('/')) rel += 'index.html';
  const file = path.normalize(path.join(root, rel));
  if (!file.startsWith(root + path.sep)) { res.writeHead(403); res.end(); return; }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' }); res.end(fs.readFileSync(path.join(root, '404.html'))); return; }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
    res.end(data);
  });
}).listen(port, '127.0.0.1', () => console.log('Preview on http://localhost:' + port));
