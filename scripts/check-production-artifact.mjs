import fs from 'node:fs';
import path from 'node:path';

const dist=path.resolve('dist');
const errors=[];
const fail=message=>errors.push(message);
const textExt=/\.(?:html|js|mjs|json|css|txt|map|svg|xml|webmanifest)$/i;
const forbiddenNames=/(?:^|[\\/])(?:\.env(?:\.[^\\/]*)?|\.strava-tokens\.json|id_rsa|id_ed25519|credentials\.json|service-account(?:\.json)?|server[\\/]index\.mjs)$/i;
const forbiddenMarkers=[
  /STRAVA_CLIENT_SECRET/,
  /\.strava-tokens\.json/,
  /STRAVA_CLIENT_ID/,
  /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/,
  /(?:api[_-]?key|client[_-]?secret|access[_-]?token|refresh[_-]?token|password)\s*[:=]\s*["'][^"']{12,}["']/i,
  /(?:localhost|127\.0\.0\.1):8787/,
  /\/api\/strava\/(?:connect|status|activities)/
];
if(!fs.existsSync(path.join(dist,'index.html')))fail('dist/index.html missing; run npm run build');
else{
 const html=fs.readFileSync(path.join(dist,'index.html'),'utf8');
 if(!/<title>Arc\b/.test(html))fail('Arc page title missing');
 if(!/assets\//.test(html))fail('compiled asset references missing');
}
if(!fs.existsSync(path.join(dist,'assets'))||!fs.readdirSync(path.join(dist,'assets')).some(x=>x.endsWith('.js')))fail('compiled JavaScript assets missing');
if(fs.existsSync(dist)){
 const walk=dir=>{
  for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
   const full=path.join(dir,entry.name);
   if(entry.isDirectory()){walk(full);continue}
   const relative=path.relative(dist,full).replaceAll('\\','/');
   if(forbiddenNames.test(relative))fail('Server-only or secret-like filename: '+relative);
   if(!textExt.test(relative))continue;
   const body=fs.readFileSync(full,'utf8');
   for(const marker of forbiddenMarkers){
    if(marker.test(body))fail('Forbidden marker '+marker.source+' in '+relative);
   }
  }
 };
 walk(dist);
}
if(errors.length){
 for(const message of errors)console.error('Production artifact check failed: '+message);
 process.exitCode=1;
}else console.log('Production artifact check passed (heuristic scan; not a guarantee of no secrets).');
