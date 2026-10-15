export const MEDICATIONS_KEY='arc.medications.v1';
export type Medication={id:string;name:string;strength:string;dose:string;times:string[];startDate:string;calendar:boolean;active:boolean};
export type DoseLog={id:string;medicationId:string;date:string;time:string;takenAt:string};
export type MedicationStore={medications:Medication[];logs:DoseLog[]};
export const emptyMedicationStore:MedicationStore={medications:[],logs:[]};
export const medicationCatalog=['Eliquis (apixaban)','Warfarin','Aspirin','Lisinopril','Losartan','Amlodipine','Metoprolol','Atorvastatin','Rosuvastatin','Metformin','Levothyroxine','Omeprazole','Sertraline','Fluoxetine','Other (enter name)'];
export const localDay=(date=new Date())=>[date.getFullYear(),String(date.getMonth()+1).padStart(2,'0'),String(date.getDate()).padStart(2,'0')].join('-');
export const medicationDoses=(store:MedicationStore,date:string,calendarOnly=false)=>store.medications.filter(m=>m.active&&m.startDate<=date&&(!calendarOnly||m.calendar)).flatMap(m=>m.times.map(time=>({medication:m,date,time,log:store.logs.find(l=>l.medicationId===m.id&&l.date===date&&l.time===time)}))).sort((a,b)=>a.time.localeCompare(b.time)||a.medication.name.localeCompare(b.medication.name));
export const formatDoseTime=(time:string)=>{const [h,m]=time.split(':').map(Number);return new Date(2020,0,1,h,m).toLocaleTimeString(undefined,{hour:'numeric',minute:'2-digit'})};
