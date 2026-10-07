import type { LucideIcon } from 'lucide-react';
import { Bike, Footprints, Mountain, PersonStanding, Waves } from 'lucide-react';

export type FocusId='bjj'|'running'|'cycling'|'yoga'|'judo'|'karate'|'swimming'|'hiking'|'climbing'|'crossfit';
export type FocusStatus='active'|'coming-soon';
export type FocusDefinition={id:FocusId;name:string;shortName:string;status:FocusStatus;route?:string;icon:LucideIcon;description:string};

export const focusRegistry:FocusDefinition[]=[
 {id:'bjj',name:'Brazilian Jiu-Jitsu',shortName:'BJJ',status:'active',route:'BJJ',icon:PersonStanding,description:'Mat time, technical development, My Game and competition preparation.'},
 {id:'running',name:'Running',shortName:'Running',status:'active',route:'Running',icon:Footprints,description:'Runs, volume and lightweight performance context.'},
 {id:'cycling',name:'Cycling',shortName:'Cycling',status:'active',route:'Cycling',icon:Bike,description:'Rides, volume and lightweight performance context.'},
 {id:'yoga',name:'Yoga',shortName:'Yoga',status:'coming-soon',icon:PersonStanding,description:'Coming soon.'},
 {id:'judo',name:'Judo',shortName:'Judo',status:'coming-soon',icon:PersonStanding,description:'Coming soon.'},
 {id:'karate',name:'Karate',shortName:'Karate',status:'coming-soon',icon:PersonStanding,description:'Coming soon.'},
 {id:'swimming',name:'Swimming',shortName:'Swimming',status:'coming-soon',icon:Waves,description:'Coming soon.'},
 {id:'hiking',name:'Hiking',shortName:'Hiking',status:'coming-soon',icon:Mountain,description:'Coming soon.'},
 {id:'climbing',name:'Climbing',shortName:'Climbing',status:'coming-soon',icon:Mountain,description:'Coming soon.'},
 {id:'crossfit',name:'CrossFit',shortName:'CrossFit',status:'coming-soon',icon:PersonStanding,description:'Coming soon.'},
];
export const activeFocuses=focusRegistry.filter(f=>f.status==='active');
export const comingSoonFocuses=focusRegistry.filter(f=>f.status==='coming-soon');
