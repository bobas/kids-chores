(function(root){
'use strict';
const CELEBRATION_COUNT=20,LATE_REMINDER_COUNT=6;
const KID_COLORS=['#688a51','#9471aa','#b9864d','#5c929a','#aa7080','#7b85b2','#a69a4d','#609578'];
const ICON_CATEGORIES=[{"id":"food","icons":["🍽️","🥣","🥄","🥛","🍎","🍌","🥕","🥪","🍞","🍳"]},{"id":"hygiene","icons":["🪥","🚽","🛁","🚿","🧼","🤲","🧴","🧻","🪮","💧"]},{"id":"health","icons":["💊","🩹","🩺","🌡️","💉","🏥","⚕️","🫀","🫁","😷","🩼","🧘"]},{"id":"clothes","icons":["👕","👖","👗","🧦","👟","🧥","🧤","🧢"]},{"id":"tidying","icons":["🧹","🧺","🪣","🗑️","🧽","🧰","🪴","🏠"]},{"id":"school","icons":["🎒","✏️","📝","📚","📖","📐","🖍️","🎨"]},{"id":"pets","icons":["🐶","🐱","🐹","🐰","🐟","🐢","🐦","🐾"]},{"id":"fun","icons":["🧸","🧩","⚽","🚲","🎵","🎲","🎮","🪁","🎻","🏊"]},{"id":"rest","icons":["🛏️","🌙","⭐","🙏","💤","⏰","🛋️","💛"]}];
const ICONS=ICON_CATEGORIES.reduce((icons,category)=>icons.concat(category.icons),[]);
const defaults=()=>({version:2,format:'24',celebrations:true,kids:[{id:'child-1',name:'Child 1',color:KID_COLORS[0]},{id:'child-2',name:'Child 2',color:KID_COLORS[1]}],chores:[
{id:'supper',title:'Supper',icon:'🍽️',start:'18:00',end:'18:45'},
{id:'pajamas',title:'Pajamas',icon:'🧸',start:'18:50',end:'19:00'},
{id:'teeth',title:'Teeth',icon:'🪥',start:'19:15',end:'19:30'},
{id:'prayer',title:'Prayer',icon:'🙏',start:'19:35',end:'19:45'},
{id:'toilet',title:'Toilet',icon:'🚽',start:'19:50',end:'19:55'},
{id:'bed',title:'Bed',icon:'🛏️',start:'20:00',end:'20:10'}
].map(c=>({...c,kidIds:['child-1','child-2']}))});
function minutes(v){return typeof v==='string'&&/^([01]\d|2[0-3]):[0-5]\d$/.test(v)?Number(v.slice(0,2))*60+Number(v.slice(3)):NaN;}
function dayKey(d){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
function timeOfDay(d){return d.getHours()*60+d.getMinutes()+d.getSeconds()/60;}
function validId(id){return typeof id==='string'&&/^[a-zA-Z0-9_-]{1,100}$/.test(id);}
function validate(input){
 const c=input;
 if(!c||typeof c!=='object'||c.version!==2)throw Error('Choose a valid routine file.');
 if(!['12','24'].includes(c.format)||typeof c.celebrations!=='boolean')throw Error('Choose a clock style and celebration setting.');
 if(!Array.isArray(c.kids)||c.kids.length<1||c.kids.length>8)throw Error('Add between 1 and 8 children.');
 const seen=new Set();
 const kids=c.kids.map((k,i)=>{if(!k||!validId(k.id)||seen.has(k.id))throw Error('Each child needs a unique ID.');seen.add(k.id);if(typeof k.name!=='string'||!k.name.trim()||k.name.length>30)throw Error('Give each child a name (up to 30 letters).');const color=k.color===undefined?KID_COLORS[i%KID_COLORS.length]:k.color;if(typeof color!=='string'||!/^#[0-9a-f]{6}$/i.test(color))throw Error(`Choose a valid color for ${k.name}.`);return {id:k.id,name:k.name.trim(),color:color.toLowerCase()};});
 if(new Set(kids.map(k=>k.name.toLocaleLowerCase())).size!==kids.length)throw Error('Give each child a different name.');
 if(!Array.isArray(c.chores)||c.chores.length>40)throw Error('Add up to 40 chores.');
 const choreIds=new Set();
 const chores=c.chores.map((chore,i)=>{
 if(!chore||!validId(chore.id)||choreIds.has(chore.id))throw Error('Each chore needs a unique ID.');choreIds.add(chore.id);
 if(typeof chore.title!=='string'||!chore.title.trim()||chore.title.length>60)throw Error(`Give chore ${i+1} a name (up to 60 letters).`);
 if(!ICONS.includes(chore.icon))throw Error(`Choose an icon for chore ${i+1}.`);
 if(!Number.isFinite(minutes(chore.start))||!Number.isFinite(minutes(chore.end)))throw Error(`Set both times for “${chore.title}”.`);
 if(minutes(chore.end)<=minutes(chore.start))throw Error(`“${chore.title}” must finish after it starts, on the same day.`);
 if(!Array.isArray(chore.kidIds)||!chore.kidIds.length||chore.kidIds.some(id=>!seen.has(id))||new Set(chore.kidIds).size!==chore.kidIds.length)throw Error(`Choose at least one child for “${chore.title}”.`);
 return {id:chore.id,title:chore.title.trim(),icon:chore.icon,start:chore.start,end:chore.end,kidIds:[...chore.kidIds]};
 }).sort((a,b)=>minutes(a.start)-minutes(b.start));
 for(const kid of kids){const assigned=chores.filter(c=>c.kidIds.includes(kid.id));for(let i=1;i<assigned.length;i++)if(minutes(assigned[i].start)<minutes(assigned[i-1].end))throw Error(`“${assigned[i-1].title}” and “${assigned[i].title}” overlap for ${kid.name}.`);}
 return {version:2,format:c.format,celebrations:c.celebrations,kids,chores};
}
function completionKey(kidId,choreId){return `${kidId}:${choreId}`;}
function freshProgress(date){return {day:dayKey(date),done:Object.create(null)};}
function cleanProgress(progress,config,date){
 const clean=freshProgress(date);
 if(!progress||progress.day!==clean.day||!progress.done||typeof progress.done!=='object')return clean;
 for(const chore of config.chores)for(const kidId of chore.kidIds){const key=completionKey(kidId,chore.id),oldKey=key,item=Object.prototype.hasOwnProperty.call(progress.done,oldKey)?progress.done[oldKey]:null;if(item&&typeof item.at==='string'&&Number.isFinite(Date.parse(item.at))&&dayKey(new Date(item.at))===clean.day)clean.done[key]={at:item.at};}
 const celebrations=cleanCelebrations(progress.celebrations,config);if(Object.keys(celebrations).length)clean.celebrations=celebrations;
 const offsets=cleanOffsets(progress.offsets,config);if(Object.keys(offsets).length)clean.offsets=offsets;
 if(Object.prototype.hasOwnProperty.call(progress,'undoOffsets')&&progress.undoOffsets&&typeof progress.undoOffsets==='object'&&!Array.isArray(progress.undoOffsets))clean.undoOffsets=cleanOffsets(progress.undoOffsets,config);
 return clean;
}
function cleanCelebrations(value,config){
 const celebrations=Object.create(null);
 if(!value||typeof value!=='object'||Array.isArray(value))return celebrations;
 for(const chore of config.chores)for(const kid of chore.kidIds){
  const key=completionKey(kid,chore.id),item=Object.prototype.hasOwnProperty.call(value,key)?value[key]:null;
  if(item&&Number.isInteger(item.theme)&&item.theme>=0&&item.theme<CELEBRATION_COUNT&&Number.isInteger(item.reminder)&&item.reminder>=0&&item.reminder<LATE_REMINDER_COUNT&&Number.isInteger(item.seed)&&item.seed>=0&&item.seed<=4294967295&&['late','grand','everyone'].every(flag=>typeof item[flag]==='boolean'))celebrations[key]={theme:item.theme,reminder:item.reminder,seed:item.seed,late:item.late,grand:item.grand,everyone:item.everyone};
 }
 return celebrations;
}
function makeCelebration(flags={},random=Math.random){
 return {theme:Math.floor(random()*CELEBRATION_COUNT),reminder:Math.floor(random()*LATE_REMINDER_COUNT),seed:Math.floor(random()*4294967296),late:!!flags.late,grand:!!flags.grand,everyone:!!flags.everyone};
}
function celebrationFlags(config,progress,kidId,choreId,now){
 const assigned=config.chores.filter(ch=>ch.kidIds.includes(kidId));
 const finished=ch=>!!progress.done[completionKey(kidId,ch.id)];
 const grand=assigned.length>0&&assigned.every(finished);
 const everyone=config.chores.length>0&&config.chores.every(ch=>ch.kidIds.every(kid=>!!progress.done[completionKey(kid,ch.id)]));
 const chore=config.chores.find(ch=>ch.id===choreId);
 const deadline=grand?Math.max(...config.chores.map(ch=>minutes(ch.end))):minutes(chore.end);
 return {grand,everyone,late:now>deadline};
}
function assignCelebration(config,progress,kidId,choreId,flags={},date=new Date(),random=Math.random){
 const chore=config.chores.find(ch=>ch.id===choreId&&ch.kidIds.includes(kidId));
 if(!chore)throw Error('A celebration must belong to an assigned child’s chore.');
 const next=cleanProgress(progress,config,date),key=completionKey(kidId,choreId);
 if(!next.celebrations)next.celebrations=Object.create(null);
 const saved=next.celebrations[key];
 if(!saved){
  next.celebrations[key]=makeCelebration(flags,random);
 }else if((saved.late&&!flags.late)||(flags.grand&&!saved.grand)){
  Object.assign(saved,{grand:!!flags.grand,everyone:!!flags.everyone,late:!!flags.late});
 }
 return {progress:next,celebration:next.celebrations[key]};
}
function celebrationRandom(seed){
 let state=seed>>>0;
 return ()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296;};
}
function cleanOffsets(value,config){
 const offsets=Object.create(null);
 if(!value||typeof value!=='object'||Array.isArray(value))return offsets;
 for(const chore of config.chores){const offset=Object.prototype.hasOwnProperty.call(value,chore.id)?value[chore.id]:0;if(Number.isInteger(offset)&&offset!==0&&minutes(chore.start)+offset>=0&&minutes(chore.end)+offset<1440)offsets[chore.id]=offset;}
 return offsets;
}
function clockTime(value){return String(Math.floor(value/60)).padStart(2,'0')+':'+String(value%60).padStart(2,'0');}
function effectiveConfig(config,progress,date=new Date()){
 const offsets=progress&&progress.day===dayKey(date)&&progress.offsets||Object.create(null);
 const chores=config.chores.map(chore=>{
  const offset=Object.prototype.hasOwnProperty.call(offsets,chore.id)?offsets[chore.id]:0;
  const start=minutes(chore.start)+offset,end=minutes(chore.end)+offset;
  if(!Number.isInteger(offset)||start<0||end>=1440)throw Error(`Today’s shift for “${chore.title}” would cross midnight. Undo the shift or edit the regular times.`);
  return {...chore,start:clockTime(start),end:clockTime(end)};
 }).sort((a,b)=>minutes(a.start)-minutes(b.start));
 return {...config,chores};
}
function shiftRemaining(config,progress,offset,date=new Date()){
 if(!Number.isInteger(offset)||offset===0||Math.abs(offset)>=1440)throw Error('Enter a nonzero offset in whole minutes (at most 1439).');
 const next=cleanProgress(progress,config,date),today=effectiveConfig(config,next,date),now=timeOfDay(date),changes=[];
 const offsets=Object.assign(Object.create(null),next.offsets||{});
 for(const chore of today.chores){
  if(minutes(chore.start)<=now&&chore.kidIds.every(kid=>next.done[completionKey(kid,chore.id)]))continue;
  const start=minutes(chore.start)+offset,end=minutes(chore.end)+offset;
  if(start<0||end>=1440)throw Error(`Shifting “${chore.title}” would cross midnight. Choose a smaller offset.`);
  changes.push({id:chore.id,title:chore.title,beforeStart:chore.start,beforeEnd:chore.end,start:clockTime(start),end:clockTime(end)});
  const total=(offsets[chore.id]||0)+offset;if(total)offsets[chore.id]=total;else delete offsets[chore.id];
 }
 if(!changes.length)throw Error('No future or unfinished chores remain.');
 next.undoOffsets=Object.assign(Object.create(null),next.offsets||{});
 if(Object.keys(offsets).length)next.offsets=offsets;else delete next.offsets;
 return {progress:next,changes};
}
function undoShift(config,progress,date=new Date()){
 const next=cleanProgress(progress,config,date);
 if(!Object.prototype.hasOwnProperty.call(next,'undoOffsets'))throw Error('There is no shift to undo today.');
 if(Object.keys(next.undoOffsets).length)next.offsets=next.undoOffsets;else delete next.offsets;
 delete next.undoOffsets;return next;
}
function resetShifts(config,progress,date=new Date()){
 const next=cleanProgress(progress,config,date);
 delete next.offsets;delete next.undoOffsets;return next;
}
function onTime(chore,now){return now>=minutes(chore.start)&&now<minutes(chore.end);}
function isLate(chore,now){return now>minutes(chore.end);}
function choreTimings(config,progress,now){
 const complete=ch=>ch.kidIds.every(kid=>!!progress.done[completionKey(kid,ch.id)]);
 const upcoming=config.chores.filter(ch=>minutes(ch.start)>now&&!complete(ch));
 const nextStart=upcoming.length?Math.min(...upcoming.map(ch=>minutes(ch.start))):null;
 const timings=Object.create(null);
 for(const chore of config.chores)timings[chore.id]=onTime(chore,now)?'current':now>=minutes(chore.end)&&!complete(chore)?'overdue':minutes(chore.start)===nextStart&&!complete(chore)?'next':'hidden';
 return timings;
}
function status(chore,now,done){return done?'done':now<minutes(chore.start)?'upcoming':onTime(chore,now)?'current':'past';}
// Chronological rows share a compressed time axis. Overlapping chores are
// stacked inside one time block so that every chore still appears just once.
function timeline(config,contentHeights=null){
 if(!config.chores.length)return {start:0,end:1440,segments:[],rows:[],height:0};
 const chores=[...config.chores].sort((a,b)=>minutes(a.start)-minutes(b.start));
 const start=Math.max(0,Math.floor((minutes(chores[0].start)-15)/5)*5),end=Math.min(1440,Math.ceil((Math.max(...chores.map(c=>minutes(c.end)))+5)/5)*5);
 const groups=[];
 for(const chore of chores){const a=minutes(chore.start),b=minutes(chore.end),last=groups[groups.length-1];if(last&&a<last.end){last.chores.push(chore);last.end=Math.max(last.end,b);}else groups.push({start:a,end:b,chores:[chore]});}
 const rows=[],segments=[];let y=0,cursor=start;
 function addGap(a,b){if(b<=a)return;const height=Math.min(130,30+25*Math.log1p((b-a)/5));segments.push({start:a,end:b,top:y,height,active:false});y+=height;}
 for(const group of groups){addGap(cursor,group.start);const top=y;for(const chore of group.chores){const duration=minutes(chore.end)-minutes(chore.start),height=contentHeights?Math.max(74,(contentHeights[chore.id]||0)+8,64+40*Math.log1p(duration/5)):Math.max(190,85+Math.ceil(chore.title.length/10)*30,130+48*Math.log1p(duration/5));rows.push({id:chore.id,top:y,height});y+=height;}segments.push({start:group.start,end:group.end,top,height:y-top,active:true});cursor=group.end;}
 addGap(cursor,end);return {start,end,segments,rows,height:y};
}
function position(layout,time){
 if(!layout.segments.length)return 0;
 if(time<=layout.start)return 0;if(time>=layout.end)return layout.height;
 const s=layout.segments.find(s=>time>=s.start&&time<s.end);
 return s.top+(time-s.start)/(s.end-s.start)*s.height;
}
function rangeSector(start,end){
 const duration=end-start,startAngle=(start%60)*6,endAngle=(end%60)*6;
 if(duration>=60)return {full:true,startAngle,endAngle,duration,path:''};
 const point=a=>[100+Math.sin(a*Math.PI/180)*82,100-Math.cos(a*Math.PI/180)*82];
 const a=point(startAngle),b=point(endAngle);
 return {full:false,startAngle,endAngle,duration,path:`M100 100 L${a[0]} ${a[1]} A82 82 0 ${duration>30?1:0} 1 ${b[0]} ${b[1]} Z`};
}
function kidTheme(color){
 const channels=[1,3,5].map(i=>parseInt(color.slice(i,i+2),16));
 const bg='#'+channels.map(c=>Math.round(c*.14+255*.86).toString(16).padStart(2,'0')).join('');
 const linear=channels.map(c=>{const v=c/255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;});
 const luminance=linear[0]*.2126+linear[1]*.7152+linear[2]*.0722;
 return {color,bg,ink:luminance>.179?'#17251d':'#ffffff'};
}
const PROFILE_IDS=['morning','forenoon','noon','afternoon','evening'];
const PROFILE_NAMES={morning:'Morning',forenoon:'Forenoon',noon:'Noon',afternoon:'Afternoon',evening:'Evening'};
const PROFILE_START={morning:420,forenoon:540,noon:720,afternoon:900,evening:1080};
function profileConfig(state,id=state.activeProfileId){return {version:2,kids:state.kids,format:state.format,celebrations:state.celebrations,chores:state.profiles[id].chores};}
function freshState(date=new Date()){
 const c=defaults(),profiles=Object.create(null);
 for(const id of PROFILE_IDS)profiles[id]={chores:[],progress:freshProgress(date)};
 return {version:3,kids:c.kids,format:c.format,celebrations:c.celebrations,activeProfileId:'evening',profiles};
}
function validateState(input,date=new Date()){
 if(!input||input.version!==3||!input.profiles||!PROFILE_IDS.includes(input.activeProfileId))throw Error('Choose a five-profile backup in the new format.');
 const profiles=Object.create(null);let shared;
 for(const id of PROFILE_IDS){
  const entry=input.profiles[id];if(!entry||!Array.isArray(entry.chores))throw Error('The backup is missing a profile: '+PROFILE_NAMES[id]);
  try{const c=validate({version:2,kids:input.kids,format:input.format,celebrations:input.celebrations,chores:entry.chores});shared=c;profiles[id]={chores:c.chores,progress:cleanProgress(entry.progress,c,date)};}
  catch(error){throw Error(PROFILE_NAMES[id]+': '+error.message);}
 }
 return {version:3,kids:shared.kids,format:shared.format,celebrations:shared.celebrations,activeProfileId:input.activeProfileId,profiles};
}
function editProfile(state,config,date=new Date()){
 const next=JSON.parse(JSON.stringify(state)),ids=config.kids.map(k=>k.id);
 next.kids=config.kids;next.format=config.format;next.celebrations=config.celebrations;
 for(const id of PROFILE_IDS)next.profiles[id].chores=id===state.activeProfileId?config.chores:next.profiles[id].chores.map(ch=>({...ch,kidIds:ch.kidIds.filter(k=>ids.includes(k))}));
 return validateState(next,date);
}
function exportState(state){
 const backup=JSON.parse(JSON.stringify(state));for(const id of PROFILE_IDS)delete backup.profiles[id].progress;return backup;
}
function importState(input,date=new Date()){
 const next=validateState(input,date);for(const id of PROFILE_IDS)next.profiles[id].progress=freshProgress(date);return next;
}

const api={PROFILE_IDS,PROFILE_NAMES,PROFILE_START,profileConfig,freshState,validateState,editProfile,exportState,importState,CELEBRATION_COUNT,LATE_REMINDER_COUNT,makeCelebration,celebrationFlags,assignCelebration,celebrationRandom,KID_COLORS,kidTheme,ICON_CATEGORIES,ICONS,defaults,minutes,dayKey,timeOfDay,validate,completionKey,freshProgress,cleanProgress,effectiveConfig,shiftRemaining,undoShift,resetShifts,onTime,isLate,choreTimings,status,timeline,position,rangeSector};
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.Routine=api;
})(typeof window!=='undefined'?window:globalThis);
