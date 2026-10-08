import{useRef,useState,type ChangeEvent}from'react';
import{Camera,Trash2,UserRound}from'lucide-react';
export const AVATAR_KEY='arc.profile.avatar.v1';
const readAvatar=()=>{try{return localStorage.getItem(AVATAR_KEY)||''}catch{return''}};
export default function TodayAvatar(){
 const [avatar,setAvatar]=useState(readAvatar),[error,setError]=useState('');const input=useRef<HTMLInputElement>(null);
 const select=async(e:ChangeEvent<HTMLInputElement>)=>{const file=e.target.files?.[0];e.target.value='';if(!file)return;setError('');
 if(!file.type.startsWith('image/')){setError('Choose an image file.');return}
 if(file.size>3*1024*1024){setError('Choose an image smaller than 3 MB.');return}
 try{const data=await new Promise<string>((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result));reader.onerror=()=>reject(new Error('Unable to read image'));reader.readAsDataURL(file)});localStorage.setItem(AVATAR_KEY,data);setAvatar(data)}catch{setError('Unable to save avatar in this browser. Try a smaller image.')}};
 const remove=()=>{localStorage.removeItem(AVATAR_KEY);setAvatar('');setError('')};
 return <section className="arc-today-avatar" aria-label="Your avatar"><div className="arc-avatar-portrait">{avatar?<img src={avatar} alt="Your profile avatar"/>:<UserRound size={76} strokeWidth={1.1} aria-hidden="true"/>}</div><div className="arc-avatar-controls"><button type="button" onClick={()=>input.current?.click()}><Camera size={15}/>{avatar?'Change':'Add photo'}</button>{avatar&&<button type="button" onClick={remove} aria-label="Remove avatar"><Trash2 size={14}/>Remove</button>}</div><input ref={input} type="file" accept="image/*" onChange={select} className="arc-avatar-input" aria-label="Upload avatar image"/>{error&&<small role="alert" className="arc-avatar-error">{error}</small>}</section>;
}
