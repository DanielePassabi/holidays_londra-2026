import http from 'node:http';
import path from 'node:path';
import { readFile, stat } from 'node:fs/promises';
import { watch } from 'node:fs';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { root, build } from './build.mjs';

const dev=process.argv.includes('--dev');
if(dev) await build();
const directory=path.resolve(root,'dist');
const port=Number(process.env.PORT || 4173);
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.webp':'image/webp','.jpg':'image/jpeg','.svg':'image/svg+xml','.woff2':'font/woff2'};
const clients=new Set();
const server=http.createServer(async(req,res)=>{
  try {
    let pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    if(dev && pathname==='/__reload') {res.writeHead(200,{'Content-Type':'text/event-stream','Cache-Control':'no-cache','Connection':'keep-alive'});res.write(': ready\n\n');clients.add(res);req.on('close',()=>clients.delete(res));return;}
    pathname=pathname.replace(/^\/holidays_londra-2026(?=\/|$)/,'');
    const target=path.resolve(directory,'.'+(pathname || '/'));
    if(target!==directory && !target.startsWith(directory+path.sep)) {res.writeHead(403);res.end();return;}
    const file=(await stat(target)).isDirectory()?path.join(target,'index.html'):target;
    let body=await readFile(file);
    if(dev && file.endsWith('.html')) body=Buffer.from(body.toString().replace('</body>',`<script>new EventSource('/__reload').onmessage=()=>location.reload()</script></body>`));
    res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':dev?'no-cache':'public, max-age=60'});
    res.end(req.method==='HEAD'?undefined:body);
  } catch {res.writeHead(404);res.end('Not found');}
});
server.listen(port,'127.0.0.1',()=>console.log(`Local: http://localhost:${port}/holidays_londra-2026/`));
if(dev) {
  let timer;
  watch(path.join(root,'src'),{recursive:true},()=>{clearTimeout(timer);timer=setTimeout(async()=>{try{await promisify(execFile)(process.execPath,[path.join(root,'scripts/build.mjs')]);for(const client of clients)client.write('data: reload\n\n');}catch(error){console.error(error.message);}},150);});
}
