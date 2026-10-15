import type{SessionPrescription}from'../plans';
export const bjjMobilityTemplate=():SessionPrescription=>({
 version:1,
 purpose:'Hip mobility, thoracic rotation and comfortable movement to support BJJ training and recovery.',
 completionRule:'Complete each prescribed movement at a comfortable range of motion; record the session when finished.',
 movements:[
  {id:'hip-9090',name:'90/90 hip switches',sets:2,reps:10,instructions:'Move slowly between sides without forcing the hips.'},
  {id:'adductor-rock',name:'Adductor rock-backs',sets:2,reps:12,instructions:'Keep the spine neutral and move through a comfortable range.'},
  {id:'thoracic-rotation',name:'Thoracic rotations',sets:2,reps:8,instructions:'Eight repetitions per side; rotate through the upper back.'},
  {id:'deep-squat',name:'Supported deep squat hold',sets:2,holdSeconds:45,instructions:'Use support as needed; do not force depth.'},
  {id:'couch-stretch',name:'Couch stretch',sets:2,holdSeconds:60,instructions:'Sixty seconds per side, without pain.'}
 ]
});
export const movementPrescription=(m:SessionPrescription['movements'][number])=>[
 m.sets?m.sets+' sets':null,m.reps?m.reps+' reps':null,m.holdSeconds?m.holdSeconds+' sec hold':null,m.restSeconds?m.restSeconds+' sec rest':null
].filter(Boolean).join(' · ');
