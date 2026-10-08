import fs from 'node:fs';
const fail = (message) => { console.error('Release blocked: '+message); process.exitCode=1; };
if (!fs.existsSync('package-lock.json')) {
  fail('package-lock.json is missing. Run npm install and commit the lockfile.');
} else {
  const manifest=JSON.parse(fs.readFileSync('package.json','utf8'));
  const lock=JSON.parse(fs.readFileSync('package-lock.json','utf8'));
  if (lock.lockfileVersion<2 || !lock.packages?.['']) fail('unsupported or incomplete npm lockfile');
  for (const [name,range] of Object.entries({...manifest.dependencies,...manifest.devDependencies})) {
    if (range==='latest'||range==='*') fail(name+' uses an unpinned dependency range');
    if (lock.packages?.['']?.dependencies?.[name]!==undefined &&
      lock.packages[''].dependencies[name]!==range) fail(name+' does not match lockfile');
    if (lock.packages?.['']?.devDependencies?.[name]!==undefined &&
      lock.packages[''].devDependencies[name]!==range) fail(name+' does not match lockfile');
    if (!lock.packages?.['node_modules/'+name]?.version) fail(name+' has no resolved lockfile version');
  }
}
