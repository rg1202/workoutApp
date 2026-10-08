/** Browser-only Arc backup. Excludes credential-like storage keys; exported activity data remains sensitive. */
export type ArcBackup={format:'arc-local-backup';version:1;exportedAt:string;data:Record<string,string>};
/** Shared export/restore boundary. Future authentication storage must never be backed up. */
export const isBackupKey=(key:string)=>
 (key.startsWith('arc.')||key.startsWith('workoutapp.')) &&
 !/(?:^|[.\-_])(token|tokens|secret|password|passwd|credential|credentials|auth|oauth|apikey|api-key|session-token|refresh-token|access-token|private-key)(?:[.\-_]|$)/i.test(key);
export function createArcBackup(storage:Storage=localStorage):ArcBackup{
 const data:Record<string,string>={};
 for(let i=0;i<storage.length;i++){
  const key=storage.key(i);
  if(!key||!isBackupKey(key))continue;
  const raw=storage.getItem(key);
  if(raw!==null)data[key]=raw;
 }
 return {format:'arc-local-backup',version:1,exportedAt:new Date().toISOString(),data};
}
export function downloadArcBackup(storage:Storage=localStorage){
 const backup=createArcBackup(storage);
 const blob=new Blob([JSON.stringify(backup,null,2)],{type:'application/json'});
 const url=URL.createObjectURL(blob);
 const anchor=document.createElement('a');
 anchor.href=url;
 anchor.download='arc-backup-'+backup.exportedAt.slice(0,10)+'.json';
 document.body.appendChild(anchor);
 try{anchor.click()}finally{anchor.remove();URL.revokeObjectURL(url)}
 return Object.keys(backup.data).length;
}
