import { readFile, readdir, stat } from 'node:fs/promises';
import { join, resolve } from 'node:path';

const root = resolve('dist');
const walk = async dir => (await Promise.all((await readdir(dir, {withFileTypes:true})).map(e=>e.isDirectory()?walk(join(dir,e.name)):join(dir,e.name)))).flat();
const htmlFiles = (await walk(root)).filter(f=>f.endsWith('.html'));
const failures=[]; let checked=0;
for(const file of htmlFiles){
  const html=await readFile(file,'utf8');
  if (/\/_image\//.test(html)) failures.push({page:file,error:'Static deployment must not depend on the runtime image endpoint'});
  for (const set of html.matchAll(/\bsrcset="([^"]+)"/g)) {
    for (const candidate of set[1].split(',')) {
      const asset=candidate.trim().split(/\s+/)[0];
      if (!asset.startsWith('/')) continue;
      try { await stat(join(root,asset)); checked++; }
      catch { failures.push({page:file,link:asset,error:'Missing responsive image'}); }
    }
  }
  const pagePath=file.slice(root.length).replaceAll('\\','/').replace(/index\.html$/,'');
  for(const match of html.matchAll(/\b(?:href|src)="([^"]+)"/g)){
    const raw=match[1]; if(/^(https?:|mailto:|data:|blob:|tel:)/.test(raw))continue;
    const url=new URL(raw,'https://4art.work'+pagePath);
    let target=join(root,decodeURIComponent(url.pathname));
    try{if((await stat(target)).isDirectory())target=join(target,'index.html');await stat(target);
      if(url.hash&&target.endsWith('.html')){const content=await readFile(target,'utf8');const id=decodeURIComponent(url.hash.slice(1));if(!content.includes(`id="${id}"`))throw new Error(`missing anchor ${id}`);}
      checked++;
    }catch(error){failures.push({page:pagePath,link:raw,error:error.message});}
  }
}
console.log(JSON.stringify({pages:htmlFiles.length,checked,failures},null,2));
if(failures.length)process.exitCode=1;
