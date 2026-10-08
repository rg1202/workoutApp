import fs from 'node:fs';
import path from 'node:path';
const dist=path.resolve('dist');
const fail=(message)=>{console.error('Production artifact check failed: '+message);process.exitCode=1};
if(!fs.existsSync(path.join(dist,'index.html')))fail('dist/index.html missing; run npm run build');
else{
 const html=fs.readFileSync(path.join(dist,'index.html'),'utf8');
 if(!/<title>Arc\b/.test(html))fail('Arc page title missing');
 if(!/assets\//.test(html))fail('compiled asset references missing');
 if(/localhost:8787|127\.0\.0\.1:8787/.test(html))fail('development integration endpoint leaked into HTML');
 const assets=path.join(dist,'assets');
 if(!fs.existsSync(assets)||!fs.readdirSync(assets).some(x=>x.endsWith('.js')))fail('compiled JavaScript assets missing');
 else {
  for(const name of fs.readdirSync(assets).filter(x=>x.endsWith('.js'))){
   const code=fs.readFileSync(path.join(assets,name),'utf8');
   if(/STRAVA_CLIENT_SECRET|\.strava-tokens\.json/.test(code))fail('Strava server secret reference in '+name);
  }
 }
}
