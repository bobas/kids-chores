(()=>{
'use strict';
const R=window.Routine,$=id=>document.getElementById(id),KEY='evening-garden-v1';
let config=R.defaults(),progress=R.freshProgress(new Date()),renderStamp='',toastTimer,lastCelebration=-1,lastReminder=-1,layout;
function escape(v){return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function id(prefix){return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`;}
function kidStyle(kid,index=0){const t=R.kidTheme(kid.color||R.KID_COLORS[index%R.KID_COLORS.length]);return `--kid-bg:${t.bg};--kid-color:${t.color};--kid-ink:${t.ink}`;}
function notify(message){clearTimeout(toastTimer);$('toast').textContent=message;$('toast').hidden=false;toastTimer=setTimeout(()=>$('toast').hidden=true,2200);}
function save(){try{localStorage.setItem(KEY,JSON.stringify({config,progress}));$('storage-warning').hidden=true;}catch{$('storage-warning').hidden=false;}}
function load(){try{const raw=localStorage.getItem(KEY);if(raw){const data=JSON.parse(raw),legacy=data.config?.version===1;config=R.validate(data.config);progress=R.cleanProgress(data.progress,config,new Date(),legacy);if(legacy){save();notify('Rename children in Settings.');}}}catch(error){if(error.name==='SecurityError')$('storage-warning').hidden=false;else notify('Saved routine unreadable. Starter routine loaded.');}}
function formatTime(time){const[h,m]=time.split(':').map(Number);return config.format==='24'?time:`${h%12||12}:${String(m).padStart(2,'0')} ${h<12?'AM':'PM'}`;}
function timeString(m){return `${String(Math.floor(m/60)).padStart(2,'0')}:${String(Math.floor(m%60)).padStart(2,'0')}`;}
function digits(time){return escape(formatTime(time)).replace(/ (AM|PM)$/,'<small>$1</small>');}
function clockSvg(hour,minute){
 let ticks='',numbers='';for(let i=0;i<60;i++){const a=i*Math.PI/30,r=i%5===0?83:88;ticks+=`<line x1="${100+Math.sin(a)*r}" y1="${100-Math.cos(a)*r}" x2="${100+Math.sin(a)*92}" y2="${100-Math.cos(a)*92}" stroke="${i%5===0?'#7c8d70':'#c5cebc'}" stroke-width="${i%5===0?2:1}"/>`;}
 for(let i=1;i<=12;i++){const a=i*Math.PI/6;numbers+=`<text x="${100+Math.sin(a)*68}" y="${107-Math.cos(a)*68}" text-anchor="middle">${i}</text>`;}
 return `<svg class="clock-svg" viewBox="0 0 200 200" aria-hidden="true"><circle cx="100" cy="100" r="98" fill="#fffef6" stroke="#c3ceb7" stroke-width="2"/>${ticks}<g style="font:500 22px ui-sans-serif,system-ui;fill:#3c5236">${numbers}</g><line class="hour-hand" x1="100" y1="105" x2="100" y2="60" transform="rotate(${hour%12*30+minute*.5} 100 100)" stroke="#304f36" stroke-width="7" stroke-linecap="round"/><line class="minute-hand" x1="100" y1="110" x2="100" y2="26" transform="rotate(${minute*6} 100 100)" stroke="#819e56" stroke-width="5" stroke-linecap="round"/><circle cx="100" cy="100" r="6" fill="#304f36"/></svg>`;
}
function rangeClock(chore){
 const start=R.minutes(chore.start),end=R.minutes(chore.end),sector=R.rangeSector(start,end),duration=end-start;
 let svg=clockSvg(Math.floor(start/60),start%60);
 const shade=sector.full?'<circle class="range-sector" cx="100" cy="100" r="82" fill="#b8d9bb"/>':`<path class="range-sector" d="${sector.path}" fill="#b8d9bb"/>`;
 const circleEnd=svg.indexOf('/>')+2;svg=svg.slice(0,circleEnd)+shade+svg.slice(circleEnd);
 svg=svg.replace('<circle cx="100" cy="100" r="6"',`<line class="range-end-hand" x1="100" y1="100" x2="100" y2="24" transform="rotate(${sector.endAngle} 100 100)" stroke="#b46a36" stroke-width="5" stroke-linecap="round"/><circle cx="100" cy="100" r="6"`);
 const durationLabel=duration>=60?`${Math.floor(duration/60)}h${duration%60?` ${duration%60}m`:''}`:`${duration} min`;
 return `<span class="range-clock"><span class="mini-clock" role="img" aria-label="${escape(formatTime(chore.start))} to ${escape(formatTime(chore.end))}, ${duration} minutes">${svg}</span><span class="range-digits"><span class="range-start">${digits(chore.start)}</span><span aria-hidden="true"> – </span><span class="range-end">${digits(chore.end)}</span></span><span class="range-duration">${durationLabel}</span></span>`;
}
function timelineTicks(){
 const boundaries=new Set(layout.segments.flatMap(s=>[s.start,s.end])),candidates=[...boundaries];
 for(let m=Math.ceil(layout.start/15)*15;m<layout.end;m+=15)if(!layout.segments.some(s=>!s.active&&s.end-s.start>30&&m>s.start&&m<s.end))candidates.push(m);
 const ticks=[];for(const m of [...new Set(candidates)].sort((a,b)=>a-b)){const y=R.position(layout,m);if(ticks.some(t=>Math.abs(t.y-y)<31))continue;ticks.push({m,y,boundary:boundaries.has(m)});}return ticks;
}
function done(kidId,choreId){return !!progress.done[R.completionKey(kidId,choreId)];}
function assigned(kidId){return config.chores.filter(c=>c.kidIds.includes(kidId));}
function render(now){
 layout=R.timeline(config);const focused=document.activeElement?.dataset?.key;
 $('schedule').style.setProperty('--kid-count',config.kids.length);$('timeline').style.height=`${layout.height}px`;
 $('column-heads').innerHTML='<div class="axis-head" aria-hidden="true">◷</div><div class="chore-column-head">Chore</div>'+config.kids.map((kid,i)=>{const chores=assigned(kid.id),n=chores.filter(c=>done(kid.id,c.id)).length;return `<div class="kid-head" style="${kidStyle(kid,i)}"><div class="kid-name-wrap"><div class="kid-name">${escape(kid.name)}</div><div class="kid-progress" role="progressbar" aria-label="${escape(kid.name)}’s chores" aria-valuemin="0" aria-valuemax="${chores.length||1}" aria-valuenow="${n}" aria-valuetext="${n} of ${chores.length}"><i style="width:${chores.length?n/chores.length*100:0}%"></i></div><span class="kid-score">${n}/${chores.length}${chores.length&&n===chores.length?' ✓':''}</span></div></div>`;}).join('');
 const ticks=timelineTicks();$('time-axis').innerHTML=ticks.map(t=>`<div class="time-tick${t.boundary?' major':''}" style="top:${t.y}px">${digits(timeString(t.m))}</div>`).join('');
 const lines=ticks.map(t=>`<i class="grid-line" aria-hidden="true" style="top:${t.y}px"></i>`).join('');
 const gaps=layout.segments.filter(s=>!s.active&&s.end-s.start>=30).map(s=>`<span class="gap-fold" aria-hidden="true" style="top:${s.top+s.height/2}px">↕ ${Math.floor((s.end-s.start)/60)?`${Math.floor((s.end-s.start)/60)}h `:''}${(s.end-s.start)%60?`${(s.end-s.start)%60}m`:''}</span>`).join('');
 $('kid-columns').innerHTML=lines+gaps+layout.rows.map(row=>{
  const chore=config.chores.find(c=>c.id===row.id),complete=chore.kidIds.every(k=>done(k,chore.id)),state=R.status(chore,now,complete);
  return `<div class="routine-row ${state}" data-id="${escape(chore.id)}" style="top:${row.top+4}px;height:${row.height-8}px"><div class="shared-chore"><div class="shared-chore-content"><span class="chore-heading"><span class="chore-icon" aria-hidden="true">${chore.icon}</span><span class="chore-title">${escape(chore.title)}</span></span>${rangeClock(chore)}</div></div>${config.kids.map((kid,i)=>{const included=chore.kidIds.includes(kid.id),checked=included&&done(kid.id,chore.id);return `<div class="kid-cell${included?'':' unassigned'}${checked?' checked':''}" style="${kidStyle(kid,i)}">${included?`<label class="check-target"><input class="child-check" type="checkbox" data-kid="${escape(kid.id)}" data-id="${escape(chore.id)}" data-key="${escape(R.completionKey(kid.id,chore.id))}"${checked?' checked':''} aria-label="${escape(kid.name)}: ${escape(chore.title)}, ${escape(formatTime(chore.start))} to ${escape(formatTime(chore.end))}"></label>`:`<span class="not-assigned" aria-label="${escape(kid.name)}: not assigned">—</span>`}</div>`;}).join('')}</div>`;
 }).join('');
 if(focused)[...document.querySelectorAll('.child-check')].find(b=>b.dataset.key===focused)?.focus({preventScroll:true});
}
function updateNow(now){if(!layout)return;const marker=$('now-marker');marker.hidden=now<layout.start||now>layout.end;if(!marker.hidden){marker.style.top=`${R.position(layout,now)}px`;$('now-label').innerHTML=`NOW<br>${digits(timeString(now))}`;}}
function tick(force=false){
 const date=new Date(),now=R.timeOfDay(date),day=R.dayKey(date);if(progress.day!==day){progress=R.freshProgress(date);save();force=true;}
 const time=timeString(now);$('digital-time').innerHTML=digits(time);const clock=$('main-clock');if(!clock.firstChild)clock.innerHTML=clockSvg(date.getHours(),date.getMinutes());clock.setAttribute('role','img');clock.setAttribute('aria-label',`Current time ${formatTime(time)}`);clock.querySelector('.hour-hand').setAttribute('transform',`rotate(${date.getHours()%12*30+date.getMinutes()*.5+date.getSeconds()/120} 100 100)`);clock.querySelector('.minute-hand').setAttribute('transform',`rotate(${date.getMinutes()*6+date.getSeconds()*.1} 100 100)`);
 const stamp=`${day}-${time}`;if(force||stamp!==renderStamp){render(now);renderStamp=stamp;}updateNow(now);
 const active=config.chores.some(c=>R.onTime(c,now)&&c.kidIds.some(k=>!done(k,c.id))),next=config.chores.find(c=>R.minutes(c.start)>now&&c.kidIds.some(k=>!done(k,c.id))),left=next?Math.ceil(R.minutes(next.start)-now):0;$('starts-in').textContent=!active&&next?`${formatTime(next.start)} · ${left>=60?`${Math.floor(left/60)}h `:''}${left%60}m`:'';
}
function jumpNow(){if(!layout)return;const now=R.timeOfDay(new Date()),target=(now<layout.start?R.minutes(config.chores[0].start):(now>layout.end?R.minutes(config.chores.at(-1).start):now));$('schedule-scroll').scrollTo({top:Math.max(0,R.position(layout,target)-90),behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}
$('jump-now').addEventListener('click',jumpNow);
$('kid-columns').addEventListener('change',event=>{
 const button=event.target.closest('.child-check');if(!button)return;const kidId=button.dataset.kid,choreId=button.dataset.id,wasChecked=button.checked;tick();const kid=config.kids.find(k=>k.id===kidId),chore=config.chores.find(c=>c.id===choreId&&c.kidIds.includes(kidId));if(!kid||!chore)return;
 const key=R.completionKey(kidId,choreId),undo=!wasChecked,date=new Date();if(undo)delete progress.done[key];else progress.done[key]={at:date.toISOString()};save();tick(true);
 if(undo){dismissCelebration();return;}
 const personalDone=assigned(kidId).every(c=>done(kidId,c.id)),everyone=config.chores.every(c=>c.kidIds.every(k=>done(k,c.id)));
 if(config.celebrations)celebrate(personalDone,kid.name,everyone,R.isLate(chore,R.timeOfDay(date)));else notify(`${kid.name} ✓`);
});
const celebrationThemes=[
 ['🌟','A little star!','Look at you shine.','✦','burst'],['🦋','Look at you grow!','One lovely step at a time.','🦋','float'],['🎈','Up, up, hooray!','You did your little step.','🎈','float'],['🌸','Beautifully done!','Our evening is blooming.','🌸','rain'],['🚀','You’re soaring!','A little closer to dreamland.','✧','burst'],['🐝','What a busy bee!','Time for a happy little wiggle.','🐝','orbit'],['🌈','A splash of happy!','You made this moment brighter.','●','rain'],['✨','Sparkle time!','Look at that little win.','✦','orbit'],['🐸','Hip, hip, hop!','You did it. Give a little hop!','●','bounce'],['🫧','Pop! Well done!','A bubbly little celebration.','○','float'],['🍓','Sweet little win!','That was berry well done.','🍓','rain'],['🌻','Hello, sunshine!','A little step. A happy heart.','✿','burst'],['🐞','Lucky little you!','Another step, all done.','🐞','bounce'],['🎉','Hooray for you!','A little cheer for a lovely effort.','▰','rain'],['🐠','Just keep swimming!','You’re doing swimmingly.','🐠','float'],['💛','A heart full of happy!','You can be proud of yourself.','♥','burst'],['🪁','Flying high!','Look how far you’ve come.','◆','orbit'],['🍂','A gentle little cheer!','One step closer to cozy.','🍂','rain'],['🐇','Hop to the happy!','A lovely little leap forward.','✧','bounce'],['🌙','Dreamland is closer!','You’re making a lovely evening.','★','float']
];
const lateReminders=[
 'Slow and steady… a little earlier next time!',
 'Made it! Let’s beat the clock next time.',
 'Next time, let’s try turtle turbo!',
 'You did it! Keep an eye on the clock next time.',
 'A little shell-powered speed next time?',
 'Finished! Shall we race the clock next time?'
];
function celebrate(grand=false, childName='', everyone=false, late=false) {
 clearTimeout(toastTimer);$('toast').hidden=true;let index;
 do{index=Math.floor(Math.random()*celebrationThemes.length);}while(index===lastCelebration);lastCelebration=index;
 const [icon,title,subtitle,particle,motion]=late?['🐢','','','🍃','float']:grand?['🏆','You did every little step!','Big hugs. Sweet dreams. See you tomorrow!','✦','rain']:celebrationThemes[index];
 const layer=$('celebration');($('settings-dialog').open ? $('settings-dialog') : document.body).append(layer);layer.classList.toggle('grand',grand);layer.classList.toggle('late',late);layer.dataset.motion=motion;
 $('celebration-icon').textContent=icon;
 let reminder='';if(late){let next;do{next=Math.floor(Math.random()*lateReminders.length);}while(next===lastReminder);lastReminder=next;reminder=lateReminders[next];}
 $('celebration-title').textContent=late?reminder:everyone?'Everyone: all done!':grand&&childName?`${childName}: all done!`:title;
 $('celebration-subtitle').textContent=late?(everyone?'Everyone: all done!':grand?`${childName}: all done!`:`${childName}, you finished!`):childName&&!grand?childName:'';
 layer.querySelector('.celebration-particles').innerHTML=Array.from({length:late?8:grand?64:30},(_,i)=>{const a=(i/(late?8:grand?64:30))*Math.PI*2,d=120+Math.random()*300,colors=['#d8b35b','#a0b67e','#b19bc5','#d59678','#7ca6a1'];return `<span class="particle" style="--x:${Math.cos(a)*d}px;--y:${Math.sin(a)*d}px;--r:${180+Math.random()*540}deg;--size:${12+Math.random()*21}px;--color:${colors[i%colors.length]};--duration:${1.5+Math.random()*1.3}s;--delay:${Math.random()*.4}s">${particle}</span>`;}).join('');
 layer.hidden=false;
}
function dismissCelebration(){$('celebration').hidden=true;$('celebration').querySelector('.celebration-particles').replaceChildren();}
$('celebration').addEventListener('click',dismissCelebration);
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!$('celebration').hidden){event.preventDefault();dismissCelebration();}});
function kidRow(kid,index){
 const row=document.createElement('div');row.className='kid-editor-row';row.dataset.id=kid.id;row.style.cssText=kidStyle(kid,index);
 row.innerHTML=`<input class="kid-name-input" maxlength="30" value="${escape(kid.name)}" placeholder="Child’s name" aria-label="Child name" required><label class="kid-color-field"><span>Color</span><input class="kid-color" type="color" value="${escape(kid.color||R.KID_COLORS[index%R.KID_COLORS.length])}" aria-label="Child color" title="Choose this child’s color"></label><button type="button" class="delete-kid" aria-label="Remove child">×</button>`;
 row.querySelector('.kid-name-input').addEventListener('input',refreshAssignments);
 row.querySelector('.kid-color').addEventListener('input',event=>{row.style.cssText=kidStyle({color:event.target.value});});
 row.querySelector('.delete-kid').addEventListener('click',()=>{row.remove();refreshAssignments();$('add-kid').disabled=$('kids-editor').children.length>=8;});return row;
}
function currentKids(){return [...$('kids-editor').children].map(row=>({id:row.dataset.id,name:row.querySelector('.kid-name-input').value,color:row.querySelector('.kid-color').value}));}
function assignmentMarkup(ids){return '<legend>Children</legend>'+currentKids().map(k=>`<label class="assignment"><input type="checkbox" value="${escape(k.id)}"${ids.includes(k.id)?' checked':''}><span>${escape(k.name)||'Child'}</span></label>`).join('');}
function refreshAssignments(){for(const field of document.querySelectorAll('.assignments')){const checked=[...field.querySelectorAll('input:checked')].map(i=>i.value);field.innerHTML=assignmentMarkup(checked);}}
function editorRow(chore){const row=document.createElement('div');row.className='editor-row';row.dataset.id=chore.id;row.innerHTML=`<div class="edit-main"><label>Icon<select class="edit-icon" aria-label="Chore icon">${R.ICONS.map(icon=>`<option${chore.icon===icon?' selected':''}>${icon}</option>`).join('')}</select></label><label>Chore<input class="edit-title" maxlength="60" required value="${escape(chore.title)}" placeholder="Story" aria-label="Chore name"></label><label>From<input class="edit-start" type="time" required value="${escape(chore.start)}" aria-label="Start time"></label><label>To<input class="edit-end" type="time" required value="${escape(chore.end)}" aria-label="End time"></label><button type="button" class="delete-chore" aria-label="Remove chore">×</button></div><fieldset class="assignments">${assignmentMarkup(chore.kidIds)}</fieldset>`;row.querySelector('.delete-chore').addEventListener('click',()=>{row.remove();updateAddButton();});return row;}
function updateAddButton(){$('add-chore').disabled=$('chore-editor').children.length>=40;}
function populateEditor(value){$('clock-format').value=value.format;$('celebrations-enabled').checked=value.celebrations;$('kids-editor').replaceChildren(...value.kids.map(kidRow));$('add-kid').disabled=value.kids.length>=8;$('chore-editor').replaceChildren(...value.chores.map(editorRow));$('settings-error').hidden=true;updateAddButton();}
function readEditor(){return R.validate({version:2,format:$('clock-format').value,celebrations:$('celebrations-enabled').checked,kids:currentKids(),chores:[...$('chore-editor').children].map(row=>({id:row.dataset.id,title:row.querySelector('.edit-title').value,icon:row.querySelector('.edit-icon').value,start:row.querySelector('.edit-start').value,end:row.querySelector('.edit-end').value,kidIds:[...row.querySelectorAll('.assignments input:checked')].map(i=>i.value)}))});}
function settingsError(error){$('settings-error').textContent=error.message;$('settings-error').hidden=false;$('settings-error').scrollIntoView({block:'nearest',behavior:'smooth'});}
$('settings-open').addEventListener('click',()=>{populateEditor(config);$('settings-dialog').showModal();});
function saveAndCloseSettings(){
 try{
  const updated=readEditor(),changed=JSON.stringify(updated)!==JSON.stringify(config);
  if(changed){progress=R.cleanProgress(progress,updated,new Date());config=updated;save();tick(true);}
  dismissCelebration();$('settings-dialog').close();
  if(changed){notify('Saved ✓');jumpNow();}
 }catch(error){settingsError(error);}
}
for(const button of document.querySelectorAll('.close-dialog'))button.addEventListener('click',saveAndCloseSettings);
$('settings-dialog').addEventListener('cancel',event=>{event.preventDefault();saveAndCloseSettings();});
let backdropPressed=false;
function outsideSettings(event){const r=$('settings-dialog').getBoundingClientRect();return event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom;}
$('settings-dialog').addEventListener('pointerdown',event=>{backdropPressed=event.target===$('settings-dialog')&&outsideSettings(event);});
$('settings-dialog').addEventListener('click',event=>{if(backdropPressed&&event.target===$('settings-dialog')&&outsideSettings(event))saveAndCloseSettings();backdropPressed=false;});
$('discard-settings').addEventListener('click',()=>{dismissCelebration();$('settings-dialog').close();});
$('settings-form').addEventListener('submit',event=>event.preventDefault());
$('add-kid').addEventListener('click',()=>{const child={id:id('child'),name:'',color:R.KID_COLORS[$('kids-editor').children.length%R.KID_COLORS.length]};$('kids-editor').append(kidRow(child,$('kids-editor').children.length));refreshAssignments();$('add-kid').disabled=$('kids-editor').children.length>=8;$('kids-editor').lastChild.querySelector('.kid-name-input').focus();});
$('add-chore').addEventListener('click',()=>{const rows=[...$('chore-editor').children],last=rows.at(-1)?.querySelector('.edit-end').value||'18:00';let start=R.minutes(last);if(!Number.isFinite(start)||start>=1439)start=1080;const row=editorRow({id:id('chore'),title:'',icon:'⭐',start:timeString(start),end:timeString(Math.min(start+15,1439)),kidIds:currentKids().map(k=>k.id)});$('chore-editor').append(row);updateAddButton();row.querySelector('.edit-title').focus();});
$('preview-celebration').addEventListener('click',()=>celebrate(false));
$('export-settings').addEventListener('click',()=>{try{const value=readEditor(),url=URL.createObjectURL(new Blob([JSON.stringify(value,null,2)],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download='evening-garden-routine.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}catch(error){settingsError(error);}});
$('import-settings').addEventListener('click',()=>$('import-file').click());
$('import-file').addEventListener('change',async event=>{const file=event.target.files[0];if(!file)return;try{if(file.size>100000)throw Error('Choose a routine file smaller than 100 KB.');populateEditor(R.validate(JSON.parse(await file.text())));notify('Loaded. Close Settings to save.');}catch(error){settingsError(new Error(error instanceof SyntaxError?'Invalid JSON file.':error.message));}finally{event.target.value='';}});
$('fullscreen').addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else if(document.documentElement.requestFullscreen)await document.documentElement.requestFullscreen();else notify('Full screen unavailable.');}catch{notify('Full screen unavailable.');}});
document.addEventListener('fullscreenchange',()=>$('fullscreen').setAttribute('aria-label',document.fullscreenElement?'Exit full screen':'Enter full screen'));
window.addEventListener('storage',event=>{if(event.key===KEY||event.key===null){if(event.newValue===null){config=R.defaults();progress=R.freshProgress(new Date());}else load();tick(true);}});
document.addEventListener('visibilitychange',()=>{if(!document.hidden)tick(true);});
load();tick(true);requestAnimationFrame(jumpNow);setInterval(tick,1000);
if('serviceWorker'in navigator&&location.protocol!=='file:'&&!document.documentElement.dataset.standalone)navigator.serviceWorker.register('./sw.js').catch(()=>{});
})();
