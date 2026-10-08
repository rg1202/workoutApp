import {useState} from 'react';
import type {ReactNode} from 'react';

export const PILOT_NOTICE_VERSION='2026-10-08-v1';
export const PILOT_ACK_KEY='arc.pilot-acknowledgment.v1';
const contact='rgould.midwest@gmail.com';
export function hasPilotAcknowledgment(){
 try{
  const raw=localStorage.getItem(PILOT_ACK_KEY);
  if(!raw)return false;
  const value=JSON.parse(raw);
  return value?.version===PILOT_NOTICE_VERSION&&typeof value?.acceptedAt==='string'&&!Number.isNaN(Date.parse(value.acceptedAt));
 }catch{return false}
}
export default function PilotNoticeGate({children}:{children:ReactNode}){
 const [accepted,setAccepted]=useState(hasPilotAcknowledgment);
 const [checked,setChecked]=useState(false);
 const [review,setReview]=useState(false);
 const [declined,setDeclined]=useState(false);
 const save=()=>{
  if(!checked)return;
  try{
   localStorage.setItem(PILOT_ACK_KEY,JSON.stringify({version:PILOT_NOTICE_VERSION,acceptedAt:new Date().toISOString()}));
   setAccepted(true);setReview(false);setDeclined(false);setChecked(false);
  }catch{window.alert('Arc could not save your acknowledgment. Check browser storage and try again.')}
 };
 if(accepted&&!review)return <>{children}<button className="arc-pilot-notice-link" type="button" onClick={()=>setReview(true)}>Pilot privacy notice</button></>;
 return <div className="arc-pilot-gate"><main className="arc-pilot-notice" aria-labelledby="arc-pilot-title">
  <p className="arc-pilot-eyebrow">ARC · INVITATION-ONLY BETA</p>
  <h1 id="arc-pilot-title">Welcome to Arc</h1>
  {declined&&!accepted?<div role="status"><p>You have not accepted the pilot notice. Arc will not open until you choose to participate.</p><button type="button" onClick={()=>setDeclined(false)}>Review notice</button></div>:<>
  <p>Arc V2 is an experimental goal and activity planning app for BJJ, Running, and Cycling. Features may change, malfunction, or become unavailable. Please use only non-sensitive test data.</p>
  <h2>Your data and backups</h2>
  <p>Goals, calendar entries, activities, profile details, and preferences are stored in this browser. Arc has no cloud backup, Arc account, or cross-device sync. Clearing site data or changing browsers/devices may permanently remove records. Exported backups are <strong>not encrypted</strong>, may include profile images and activity details, and should be kept private. A backup export does not guarantee successful restoration.</p>
  <h2>Third-party services</h2>
  <p>Cloudflare Pages hosts Arc, Cloudflare Access manages invitation-only entry, and Cloudflare Web Analytics measures website usage and performance. Cloudflare may process login email identifiers, IP addresses, request metadata, and related technical data. Access login is not an Arc account. Weather and location search may send search or location parameters and technical request data to Open-Meteo.</p>
  <h2>Voluntary participation</h2>
  <p>You may stop using Arc at any time and request removal from the access list by emailing <a href={'mailto:'+contact}>{contact}</a>. Removing access does not delete records stored in your browser; clearing site data does. Cloudflare may retain technical or analytics records separately. Avoid sharing sensitive screenshots, credentials, or backup files when reporting bugs. Pilot feedback may be used to improve Arc.</p>
  <p className="arc-pilot-version">Pilot notice version: {PILOT_NOTICE_VERSION}</p>
  {!accepted&&<label className="arc-pilot-check"><input type="checkbox" checked={checked} onChange={e=>setChecked(e.target.checked)}/><span>I have read and understand this private beta notice. I understand the local-only storage, unencrypted backups, Cloudflare services, and voluntary nature of the pilot, and agree to use non-sensitive test data.</span></label>}
  <div className="arc-pilot-actions">{accepted?<button type="button" onClick={()=>setReview(false)}>Return to Arc</button>:<><button type="button" disabled={!checked} onClick={save}>Continue to Arc</button><button type="button" className="arc-pilot-secondary" onClick={()=>{setDeclined(true);setChecked(false)}}>Not now</button></>}</div>
  </>}
 </main></div>
}
