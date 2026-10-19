(function(root){
'use strict';
const KID_COLORS=['#688a51','#9471aa','#b9864d','#5c929a','#aa7080','#7b85b2','#a69a4d','#609578'];
const ICONS=['🍽️','🧸','🪥','🙏','🚽','🛏️','🛁','📖','👕','🧹','💧','🐶','🎒','⭐','🌙','🧩'];
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
function migrate(value){
 if(value?.version!==1)return value;
 const kids=[{id:'child-1',name:'Child 1',color:KID_COLORS[0]},{id:'child-2',name:'Child 2',color:KID_COLORS[1]}];
 return {...value,version:2,kids,chores:Array.isArray(value.chores)?value.chores.map(c=>({...c,kidIds:kids.map(k=>k.id)})):value.chores};
}
function validate(input){
 const c=migrate(input);
 if(!c||typeof c!=='object'||c.version!==2)throw Error('Choose a valid routine file.');
 if(!['12','24'].includes(c.format)||typeof c.celebrations!=='boolean')throw Error('Choose a clock style and celebration setting.');
 if(!Array.isArray(c.kids)||c.kids.length<1||c.kids.length>8)throw Error('Add between 1 and 8 children.');
 const seen=new Set();
 const kids=c.kids.map((k,i)=>{if(!k||!validId(k.id)||seen.has(k.id))throw Error('Each child needs a unique ID.');seen.add(k.id);if(typeof k.name!=='string'||!k.name.trim()||k.name.length>30)throw Error('Give each child a name (up to 30 letters).');const color=k.color===undefined?KID_COLORS[i%KID_COLORS.length]:k.color;if(typeof color!=='string'||!/^#[0-9a-f]{6}$/i.test(color))throw Error(`Choose a valid color for ${k.name}.`);return {id:k.id,name:k.name.trim(),color:color.toLowerCase()};});
 if(new Set(kids.map(k=>k.name.toLocaleLowerCase())).size!==kids.length)throw Error('Give each child a different name.');
 if(!Array.isArray(c.chores)||!c.chores.length||c.chores.length>40)throw Error('Add between 1 and 40 chores.');
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
function cleanProgress(progress,config,date,legacy=false){
 const clean=freshProgress(date);
 if(progress?.day!==clean.day||!progress.done||typeof progress.done!=='object')return clean;
 for(const chore of config.chores)for(const kidId of chore.kidIds){const key=completionKey(kidId,chore.id),oldKey=legacy&&kidId===config.kids[0].id?chore.id:key,item=Object.hasOwn(progress.done,oldKey)?progress.done[oldKey]:null;if(item&&typeof item.at==='string'&&Number.isFinite(Date.parse(item.at))&&dayKey(new Date(item.at))===clean.day)clean.done[key]={at:item.at};}
 return clean;
}
function onTime(chore,now){return now>=minutes(chore.start)&&now<minutes(chore.end);}
function isLate(chore,now){return now>minutes(chore.end);}
function status(chore,now,done){return done?'done':now<minutes(chore.start)?'upcoming':onTime(chore,now)?'current':'past';}
// Chronological rows share a compressed time axis. Overlapping chores are
// stacked inside one time block so that every chore still appears just once.
function timeline(config){
 const chores=[...config.chores].sort((a,b)=>minutes(a.start)-minutes(b.start));
 const start=Math.max(0,Math.floor((minutes(chores[0].start)-15)/5)*5),end=Math.min(1440,Math.ceil((Math.max(...chores.map(c=>minutes(c.end)))+5)/5)*5);
 const groups=[];
 for(const chore of chores){const a=minutes(chore.start),b=minutes(chore.end),last=groups.at(-1);if(last&&a<last.end){last.chores.push(chore);last.end=Math.max(last.end,b);}else groups.push({start:a,end:b,chores:[chore]});}
 const rows=[],segments=[];let y=0,cursor=start;
 function addGap(a,b){if(b<=a)return;const height=Math.min(130,30+25*Math.log1p((b-a)/5));segments.push({start:a,end:b,top:y,height,active:false});y+=height;}
 for(const group of groups){addGap(cursor,group.start);const top=y;for(const chore of group.chores){const duration=minutes(chore.end)-minutes(chore.start),height=Math.max(190,85+Math.ceil(chore.title.length/10)*30,130+48*Math.log1p(duration/5));rows.push({id:chore.id,top:y,height});y+=height;}segments.push({start:group.start,end:group.end,top,height:y-top,active:true});cursor=group.end;}
 addGap(cursor,end);return {start,end,segments,rows,height:y};
}
function position(layout,time){
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
const api={KID_COLORS,kidTheme,ICONS,defaults,minutes,dayKey,timeOfDay,migrate,validate,completionKey,freshProgress,cleanProgress,onTime,isLate,status,timeline,position,rangeSector};
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.Routine=api;
})(typeof window!=='undefined'?window:globalThis);
