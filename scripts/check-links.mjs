import { readFile, readdir, stat } from 'node:fs/promises';
import { join, resolve } from 'node:path';

const root = resolve('dist');
const walk = async dir => (await Promise.all((await readdir(dir, {withFileTypes:true})).map(e=>e.isDirectory()?walk(join(dir,e.name)):join(dir,e.name)))).flat();
const htmlFiles = (await walk(root)).filter(f=>f.endsWith('.html'));
const failures=[]; let checked=0;
for(const file of htmlFiles){
  const html=await readFile(file,'utf8');
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
