import fs from 'node:fs';
import path from 'node:path';
const dist=path.resolve('dist');
const headers=path.join(dist,'_headers');
const fail=(msg)=>{console.error('Staging check failed: '+msg);process.exitCode=1;};
if(!fs.existsSync(headers))fail('dist/_headers missing: Vite must copy public/_headers');
else{
 const text=fs.readFileSync(headers,'utf8');
 for(const rule of ['Content-Security-Policy:','X-Content-Type-Options:','Referrer-Policy:','X-Frame-Options:','Permissions-Policy:']){
  if(!text.includes(rule))fail('Missing required header: '+rule);
 }
 if(/unsafe-eval|unsafe-inline[^\n]*script-src/i.test(text))fail('Unsafe script policy');
}
const forbidden=['.strava-tokens.json','STRAVA_CLIENT_SECRET','STRAVA_CLIENT_ID'];
if(fs.existsSync(dist)){
 for(const item of fs.readdirSync(dist,{recursive:true})){
  const file=path.join(dist,item);
  if(!fs.statSync(file).isFile())continue;
  if(/\.strava-tokens\.json|(^|[\\/])server[\\/]index\.mjs$/.test(item))fail('Server-only file in dist: '+item);
  if(/\.(?:js|html|json|css|txt)$/.test(item)){
   const body=fs.readFileSync(file,'utf8');
   for(const secret of forbidden)if(body.includes(secret))fail('Server credential marker in dist: '+item);
  }
 }
}else fail('dist missing: run npm run build');
