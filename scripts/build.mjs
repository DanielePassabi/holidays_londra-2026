import { cp, mkdir, readFile, writeFile, readdir, rm, open, unlink } from 'node:fs/promises';
import { setTimeout } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { render } from './render.mjs';

export const root = fileURLToPath(new URL('../', import.meta.url));
async function writeBuild() {
  const photos = JSON.parse(await readFile(path.join(root,'public/photos.json'),'utf8'));
  const entries = await readdir(path.join(root, 'public/photos'));
  for (const p of photos) for (const size of p.sizes) {
    if (!entries.includes(path.basename(size.file))) throw new Error(`Missing asset: ${size.file}`);
  }
  const data = render(photos);
  let html = await readFile(path.join(root,'src/index.html'),'utf8');
  for (const [key,value] of Object.entries(data)) html=html.replaceAll(`{{${key}}}`,String(value));
  if (/\{\{\w+\}\}/.test(html)) throw new Error('Unresolved template marker');
  const output=path.resolve(root,'dist');
  if(path.dirname(output)!==path.resolve(root) || path.basename(output)!=='dist') throw new Error('Unsafe build output path');
  await rm(output,{recursive:true,force:true});
  await mkdir(path.join(output,'photos'),{recursive:true});
  for(const photo of photos) for(const size of photo.sizes) await cp(path.join(root,'public',size.file),path.join(output,size.file));
  for(const file of ['photos.json','social.jpg','favicon.svg']) await cp(path.join(root,'public',file),path.join(output,file));
  for (const file of ['app.js','styles.css']) await cp(path.join(root,'src',file),path.join(root,'dist',file));
  await writeFile(path.join(root,'dist/index.html'),html);
  await writeFile(path.join(root,'dist/.nojekyll'),'');
  console.log(`Built diary: ${photos.length} photographs, 5 days. Output: dist/`);
}
export async function build() {
  // The development watcher and a manual build may run at the same time.
  const cache=path.join(root,'.cache');
  await mkdir(cache,{recursive:true});
  const lockPath=path.join(cache,'build.lock');
  let lock;
  const started=Date.now();
  while(!lock) {
    try { lock=await open(lockPath,'wx'); await lock.writeFile(String(process.pid)); }
    catch(error) {
      if(error.code!=='EEXIST') throw error;
      try {
        const owner=Number(await readFile(lockPath,'utf8'));
        if(owner>0) {
          try { process.kill(owner,0); }
          catch(processError) { if(processError.code==='ESRCH') await unlink(lockPath); }
        }
      } catch(readError) { if(readError.code!=='ENOENT') throw readError; }
      if(Date.now()-started>15000) throw new Error('Another build is still running. Retry when it finishes.');
      await setTimeout(80);
    }
  }
  try { await writeBuild(); }
  finally { await lock.close(); await unlink(lockPath); }
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await build();
