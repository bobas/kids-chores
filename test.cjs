const test=require('node:test'),assert=require('node:assert/strict'),R=require('./routine.js');
const date=()=>new Date(2026,9,16,19);
test('default schedule has two children with assigned chores',()=>{const c=R.validate(R.defaults());assert.equal(c.kids.length,2);assert.ok(c.chores.every(ch=>ch.kidIds.length===2));});
test('children complete the same chore independently and undo independently',()=>{const c=R.defaults(),d=date(),p=R.freshProgress(d),a=R.completionKey('child-1','supper'),b=R.completionKey('child-2','supper');p.done[a]={at:d.toISOString()};let clean=R.cleanProgress(p,c,d);assert.ok(clean.done[a]);assert.equal(clean.done[b],undefined);clean.done[b]={at:d.toISOString()};delete clean.done[a];clean=R.cleanProgress(clean,c,d);assert.ok(clean.done[b]);assert.equal(clean.done[a],undefined);});
test('midnight clears every child’s progress',()=>{const c=R.defaults(),d=date(),p=R.freshProgress(d);p.done['child-1:supper']={at:d.toISOString()};p.done['child-2:supper']={at:d.toISOString()};assert.equal(Object.keys(R.cleanProgress(p,c,new Date(2026,9,17))).length,2);assert.equal(Object.keys(R.cleanProgress(p,c,new Date(2026,9,17)).done).length,0);});
test('removed children and assignments do not retain completion',()=>{const c=R.defaults(),d=date(),p=R.freshProgress(d);p.done['child-1:supper']={at:d.toISOString()};p.done['child-2:supper']={at:d.toISOString()};c.chores[0].kidIds=['child-2'];const clean=R.cleanProgress(p,c,d);assert.equal(clean.done['child-1:supper'],undefined);assert.ok(clean.done['child-2:supper']);});
test('overlap is rejected per child and allowed across different children',()=>{const c=R.defaults();c.chores[1].start='18:30';assert.throws(()=>R.validate(c),/overlap for Child 1/);c.chores[0].kidIds=['child-1'];c.chores[1].kidIds=['child-2'];assert.doesNotThrow(()=>R.validate(c));});
test('chores must be assigned to existing children',()=>{const c=R.defaults();c.chores[0].kidIds=[];assert.throws(()=>R.validate(c),/at least one child/);c.chores[0].kidIds=['unknown'];assert.throws(()=>R.validate(c),/at least one child/);});
test('child names are required and distinct; at least one child remains',()=>{const c=R.defaults();c.kids[1].name=c.kids[0].name;assert.throws(()=>R.validate(c),/different name/);c.kids[1].name=' ';assert.throws(()=>R.validate(c),/each child a name/);c.kids=[];assert.throws(()=>R.validate(c),/between 1 and 8/);});
test('invalid, zero-length and overnight slots are rejected',()=>{for(const [start,end]of[['23:00','01:00'],['18:00','18:00'],['25:00','26:00'],['18:70','19:00']]){const c=R.defaults();c.chores[0].start=start;c.chores[0].end=end;assert.throws(()=>R.validate(c));}});
test('current-slot boundaries use inclusive start and exclusive end',()=>{const c=R.defaults().chores[0];assert.equal(R.onTime(c,1079.99),false);assert.equal(R.onTime(c,1080),true);assert.equal(R.onTime(c,1124.99),true);assert.equal(R.onTime(c,1125),false);});
test('compressed scale keeps long chores compact and short chores readable',()=>{const c=R.defaults(),l=R.timeline(c);const height=ch=>R.position(l,R.minutes(ch.end))-R.position(l,R.minutes(ch.start));assert.ok(height(c.chores[0])<300);assert.ok(height(c.chores[4])>=190);assert.ok(height(c.chores[0])>height(c.chores[4]));assert.ok(l.height<2000);});
test('time mapping is continuous, monotonic, and linear within each segment',()=>{const l=R.timeline(R.defaults());let last=-1;for(let t=l.start;t<=l.end;t+=.1){const y=R.position(l,t);assert.ok(y>=last);last=y;}for(const s of l.segments){assert.ok(Math.abs(R.position(l,s.start)-s.top)<1e-8);assert.ok(Math.abs(R.position(l,(s.start+s.end)/2)-(s.top+s.height/2))<1e-8);}assert.equal(R.position(l,l.end),l.height);});
test('long gaps are compressed but remain visible and have correct NOW interpolation',()=>{const c=R.defaults();c.chores.at(-1).start='23:30';c.chores.at(-1).end='23:45';const l=R.timeline(c),gap=l.segments.find(s=>!s.active&&s.end-s.start>180);assert.ok(gap);assert.ok(gap.height<=130&&gap.height>=60);assert.ok(Math.abs(R.position(l,(gap.start+gap.end)/2)-(gap.top+gap.height/2))<1e-8);});
test('each chore has one row, including overlapping chores for different children',()=>{const c=R.defaults();c.chores[0].kidIds=['child-1'];c.chores.push({id:'extra',title:'Story',icon:'📖',start:'18:10',end:'18:20',kidIds:['child-2']});const l=R.timeline(R.validate(c));assert.equal(l.rows.length,c.chores.length);assert.equal(new Set(l.rows.map(r=>r.id)).size,c.chores.length);for(let i=1;i<l.rows.length;i++)assert.ok(l.rows[i].top>=l.rows[i-1].top+l.rows[i-1].height-1e-8);assert.ok(l.rows.every(r=>r.height>=190));assert.ok(R.position(l,1090)<R.position(l,1100));});
test('range sector wraps past twelve and handles intervals of one hour or more',()=>{const wrapped=R.rangeSector(18*60+50,19*60+10);assert.equal(wrapped.duration,20);assert.equal(wrapped.startAngle,300);assert.equal(wrapped.endAngle,60);assert.equal(wrapped.full,false);assert.match(wrapped.path,/A82 82 0 0 1/);assert.match(R.rangeSector(1080,1125).path,/A82 82 0 1 1/);assert.equal(R.rangeSector(1080,1140).full,true);assert.equal(R.rangeSector(1080,1155).duration,75);});
test('reload strips corrupt timestamps, deleted chores and unknown fields',()=>{const c=R.defaults(),d=date(),p=R.freshProgress(d);p.done['child-1:supper']={at:d.toISOString()};p.done['child-2:supper']={at:'bad'};p.done['child-1:deleted']={at:d.toISOString()};assert.deepEqual(Object.keys(R.cleanProgress(JSON.parse(JSON.stringify(p)),c,d).done),['child-1:supper']);c.extra='drop';assert.equal(R.validate(c).extra,undefined);});

test('turtle reminders apply only after the deadline, never to early or exactly-on-time finishes',()=>{const c=R.defaults().chores[0];assert.equal(R.isLate(c,1000),false);assert.equal(R.isLate(c,1080),false);assert.equal(R.isLate(c,1124.999),false);assert.equal(R.isLate(c,1125),false);assert.equal(R.isLate(c,1125.001),true);assert.equal(R.isLate(c,1200),true);});
test('child colors persist through validation, backups and removal of other children',()=>{const c=R.defaults();c.kids[1].color='#12ABEF';const first=R.validate(JSON.parse(JSON.stringify(c)));assert.equal(first.kids[1].color,'#12abef');first.kids.shift();first.chores.forEach(ch=>ch.kidIds=['child-2']);assert.equal(R.validate(first).kids[0].color,'#12abef');});
test('older routines receive default colors and invalid color values are rejected',()=>{const c=R.defaults();delete c.kids[0].color;assert.equal(R.validate(c).kids[0].color,R.KID_COLORS[0]);for(const color of ['red','#xyzxyz','#123','url(test)',null]){c.kids[0].color=color;assert.throws(()=>R.validate(c),/valid color/);}});
test('checkbox marks stay readable with both light and dark chosen colors',()=>{assert.equal(R.kidTheme('#ffffff').ink,'#17251d');assert.equal(R.kidTheme('#000000').ink,'#ffffff');assert.equal(R.kidTheme('#000000').bg,'#dbdbdb');});


test('saved routines and the timeline work without Object.hasOwn or Array.at',()=>{
 const vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
 const context=vm.createContext({});
 vm.runInContext('Object.hasOwn=undefined;Array.prototype.at=undefined;',context);
 vm.runInContext(fs.readFileSync(path.join(__dirname,'routine.js'),'utf8'),context);
 const result=vm.runInContext(`(()=>{
  const r=globalThis.Routine,c=r.validate(r.defaults()),d=new Date(2026,9,16,19),p=r.freshProgress(d);
  p.done[r.completionKey(c.kids[0].id,c.chores[0].id)]={at:d.toISOString()};
  const restored=r.cleanProgress(JSON.parse(JSON.stringify(p)),c,d),layout=r.timeline(c);
  return {done:Object.keys(restored.done).length,rows:layout.rows.length,height:layout.height,end:r.position(layout,layout.end)};
 })()`,context);
 assert.equal(result.done,1);assert.equal(result.rows,6);assert.ok(result.height>0);assert.equal(result.end,result.height);
});


test('all chore and celebration icons have bundled graphics without fonts or external images',()=>{
 const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),source=fs.readFileSync(path.join(__dirname,'app.js'),'utf8');
 const helpers=source.slice(source.indexOf('const ICON_ART='),source.indexOf('// Keep browser-facing code compatible'));
 const themes=source.slice(source.indexOf('const celebrationThemes='),source.indexOf('const lateReminders='));
 const icons=vm.runInNewContext(helpers+themes+';({art:ICON_ART,labels:ICON_LABELS,markup:iconMarkup,themes:celebrationThemes})');
 const symbols=new Set([...R.ICONS,...icons.themes.flatMap(theme=>[theme[0],theme[3]]),'🐢','🏆','🍃']);
 for(const symbol of symbols){
  const svg=icons.markup(symbol);assert.match(svg,/^<svg /,symbol);assert.match(svg,/aria-hidden="true"/,symbol);
  assert.match(svg,/<(?:path|circle|polygon|ellipse|rect)\b/,symbol);
  assert.doesNotMatch(svg,/<(?:text|image|script|foreignObject|use)\b|(?:href|onload|onerror)=/,symbol);
 }
 for(const icon of R.ICONS){assert.ok(icons.art[icon],icon);assert.ok(icons.labels[icon],icon);const config=R.defaults();config.chores[0].icon=icon;assert.equal(R.validate(JSON.parse(JSON.stringify(config))).chores[0].icon,icon);}
 assert.equal(icons.markup('<img src=x onerror=alert(1)>'),icons.markup('⭐'));
});

function awakeHarness(request,play){
 const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),source=fs.readFileSync(path.join(__dirname,'app.js'),'utf8');
 const section=source.slice(source.indexOf('// BEGIN SCREEN AWAKE'),source.indexOf('// END SCREEN AWAKE'));
 const states=[],videos=[],document={hidden:false,body:{appendChild(){}},createElement(tag){
  if(tag!=='video')return {};
  const listeners={},video={paused:true,style:{},children:[],setAttribute(){},appendChild(child){this.children.push(child);},addEventListener(name,fn){listeners[name]=fn;},play(){this.paused=false;return play?play():Promise.resolve();},pause(){this.paused=true;if(listeners.pause)listeners.pause();}};
  videos.push(video);return video;
 }};
 const navigator=request?{wakeLock:{request}}:{};
 const factory=vm.runInNewContext(section+';createScreenAwake',{document,navigator});
 return {controller:factory(state=>states.push(state)),document,states,videos};
}
function wakeSentinel(){
 let onRelease;
 return {released:false,addEventListener(name,fn){if(name==='release')onRelease=fn;},release(){this.released=true;if(onRelease)onRelease();return Promise.resolve();}};
}
test('fullscreen wake lock is deduplicated and released when stopped or hidden',async()=>{
 const locks=[],h=awakeHarness(()=>{const lock=wakeSentinel();locks.push(lock);return Promise.resolve(lock);});
 await Promise.all([h.controller.enable(),h.controller.enable()]);assert.equal(locks.length,1);assert.equal(h.states.at(-1),'active');
 h.document.hidden=true;await h.controller.sync();assert.equal(locks[0].released,true);assert.equal(h.states.at(-1),'paused');
 h.document.hidden=false;await h.controller.sync();assert.equal(locks.length,2);h.controller.disable();assert.equal(locks[1].released,true);assert.equal(h.states.at(-1),'off');
});
test('late native wake-lock results are released after leaving fullscreen',async()=>{
 let finish;const lock=wakeSentinel(),h=awakeHarness(()=>new Promise(resolve=>{finish=resolve;}));
 const enabling=h.controller.enable();h.controller.disable();finish(lock);assert.equal(await enabling,false);assert.equal(lock.released,true);assert.equal(h.states.at(-1),'off');assert.equal(h.videos.length,0);
});
test('a system-revoked wake lock reports failure and can be retried without a loop',async()=>{
 const locks=[],h=awakeHarness(()=>{const lock=wakeSentinel();locks.push(lock);return Promise.resolve(lock);});
 await h.controller.enable();await locks[0].release();assert.equal(h.states.at(-1),'failed');assert.equal(locks.length,1);
 await h.controller.enable();assert.equal(locks.length,2);assert.equal(h.states.at(-1),'active');h.controller.disable();
});
test('older browsers use one muted bundled video and pause it outside fullscreen',async()=>{
 const h=awakeHarness();await h.controller.enable();assert.equal(h.videos.length,1);assert.equal(h.videos[0].muted,true);assert.equal(h.states.at(-1),'active');
 assert.equal(h.videos[0].children.length,2);assert.ok(h.videos[0].children.every(s=>s.src.startsWith('data:video/')));
 h.controller.disable();assert.equal(h.videos[0].paused,true);assert.equal(h.states.at(-1),'off');
 await h.controller.enable();assert.equal(h.videos.length,1);h.document.hidden=true;await h.controller.sync();assert.equal(h.videos[0].paused,true);assert.equal(h.states.at(-1),'paused');
 h.document.hidden=false;await h.controller.sync();assert.equal(h.videos[0].paused,false);h.controller.disable();
});
test('native refusal falls back to the bundled video',async()=>{
 const h=awakeHarness(()=>Promise.reject(Error('Unavailable')));assert.equal(await h.controller.enable(),true);assert.equal(h.videos.length,1);assert.equal(h.states.at(-1),'active');h.controller.disable();
});
test('blocked video playback reports failure rather than claiming a wake lock',async()=>{
 const h=awakeHarness(null,()=>Promise.reject(Error('Playback blocked')));assert.equal(await h.controller.enable(),false);assert.equal(h.states.at(-1),'failed');h.controller.disable();assert.equal(h.states.at(-1),'off');
});
test('backgrounding during video startup cannot reactivate keep-awake',async()=>{
 let finish;const h=awakeHarness(null,()=>new Promise(resolve=>{finish=resolve;})),enabling=h.controller.enable();
 h.document.hidden=true;await h.controller.sync();finish();assert.equal(await enabling,false);assert.equal(h.states.at(-1),'paused');assert.equal(h.videos[0].paused,true);h.controller.disable();
});

test('today shift moves future and overdue unfinished chores by the same offset',()=>{
 const config=R.defaults(),d=new Date(2026,9,23,19,10),p=R.freshProgress(d);
 for(const kid of config.kids)p.done[R.completionKey(kid.id,'pajamas')]={at:d.toISOString()};
 p.done[R.completionKey(config.kids[0].id,'supper')]={at:d.toISOString()};
 const original=JSON.stringify(config),saved=JSON.stringify(p),result=R.shiftRemaining(config,p,15,d),today=R.effectiveConfig(config,result.progress,d);
 assert.equal(result.changes.length,5);assert.ok(!result.changes.some(c=>c.id==='pajamas'));
 for(const change of result.changes){assert.equal(R.minutes(change.start)-R.minutes(change.beforeStart),15);assert.equal(R.minutes(change.end)-R.minutes(change.beforeEnd),15);}
 assert.equal(today.chores.find(c=>c.id==='supper').start,'18:15');assert.equal(today.chores.find(c=>c.id==='pajamas').start,'18:50');
 assert.deepEqual({...result.progress.done},{...p.done});assert.equal(JSON.stringify(config),original);assert.equal(JSON.stringify(p),saved);
});
test('an early-completed future chore is still shifted',()=>{
 const c=R.defaults(),d=new Date(2026,9,23,17),p=R.freshProgress(d);
 for(const kid of c.kids)p.done[R.completionKey(kid.id,'bed')]={at:d.toISOString()};
 const result=R.shiftRemaining(c,p,10,d);assert.ok(result.changes.some(ch=>ch.id==='bed'));assert.equal(Object.keys(result.progress.done).length,2);
});
test('daily shifts accumulate and undo restores times without undoing later completions',()=>{
 const c=R.defaults(),d=new Date(2026,9,23,19),first=R.shiftRemaining(c,R.freshProgress(d),15,d),second=R.shiftRemaining(c,first.progress,10,d);
 const key=R.completionKey(c.kids[0].id,'supper');second.progress.done[key]={at:d.toISOString()};
 const undo=R.undoShift(c,second.progress,d);assert.equal(undo.offsets.supper,15);assert.ok(undo.done[key]);assert.equal(undo.undoOffsets,undefined);
 const baseline=R.undoShift(c,first.progress,d);assert.equal(baseline.offsets,undefined);
});
test('shifted times and undo survive reload but expire at local midnight',()=>{
 const c=R.defaults(),d=new Date(2026,9,23,19),shift=R.shiftRemaining(c,R.freshProgress(d),15,d);
 const reload=R.cleanProgress(JSON.parse(JSON.stringify(shift.progress)),c,d);assert.equal(R.effectiveConfig(c,reload,d).chores[0].start,'18:15');assert.deepEqual({...reload.undoOffsets},{});
 const tomorrow=new Date(2026,9,24),fresh=R.cleanProgress(reload,c,tomorrow);assert.equal(fresh.offsets,undefined);assert.equal(fresh.undoOffsets,undefined);assert.equal(R.effectiveConfig(c,shift.progress,tomorrow).chores[0].start,'18:00');
});
test('shift rejects midnight crossings and bad offsets atomically',()=>{
 const c=R.defaults(),d=new Date(2026,9,23,19),p=R.freshProgress(d),saved=JSON.stringify(p);
 for(const offset of [0,1.5,NaN,Infinity,'15',1440,240,-1200])assert.throws(()=>R.shiftRemaining(c,p,offset,d));
 assert.equal(JSON.stringify(p),saved);const earlier=R.shiftRemaining(c,p,-10,d);assert.equal(earlier.changes[0].start,'17:50');
});
test('completed past chores do not prevent shifting unfinished chores through their history',()=>{
 const c=R.defaults(),d=new Date(2026,9,23,21),p=R.freshProgress(d);
 for(const chore of c.chores.filter(ch=>ch.id!=='supper'))for(const kid of chore.kidIds)p.done[R.completionKey(kid,chore.id)]={at:d.toISOString()};
 const result=R.shiftRemaining(c,p,30,d);assert.equal(result.changes.length,1);assert.equal(result.changes[0].end,'19:15');assert.doesNotThrow(()=>R.timeline(R.effectiveConfig(c,result.progress,d)));
});
test('nothing shifts when every past chore is finished',()=>{
 const c=R.defaults(),d=new Date(2026,9,23,21),p=R.freshProgress(d);
 for(const chore of c.chores)for(const kid of chore.kidIds)p.done[R.completionKey(kid,chore.id)]={at:d.toISOString()};
 assert.throws(()=>R.shiftRemaining(c,p,15,d),/No future/);
});
test('shift cleanup drops invalid and removed chore offsets and keeps valid ones',()=>{
 const c=R.defaults(),d=new Date(2026,9,23,19),p=R.freshProgress(d);
 p.offsets={supper:15,pajamas:'10',teeth:1.5,prayer:1440,toilet:-1500,deleted:10};p.undoOffsets={supper:5,deleted:30};
 const clean=R.cleanProgress(p,c,d);assert.deepEqual({...clean.offsets},{supper:15});assert.deepEqual({...clean.undoOffsets},{supper:5});
});
test('celebration lateness uses the shifted deadline',()=>{
 const c=R.defaults(),d=new Date(2026,9,23,18,50),shift=R.shiftRemaining(c,R.freshProgress(d),15,d),chore=R.effectiveConfig(c,shift.progress,d).chores.find(ch=>ch.id==='supper');
 assert.equal(R.isLate(c.chores[0],R.timeOfDay(d)),true);assert.equal(R.isLate(chore,R.timeOfDay(d)),false);
});

test('each checkbox replays its first daily reward without drawing again',()=>{
 const c=R.defaults(),d=new Date(2026,9,23,19),p=R.freshProgress(d),key=R.completionKey('child-1','supper');let draws=0;
 p.done[key]={at:d.toISOString()};const draw=()=>{draws++;return .1;},first=R.assignCelebration(c,p,'child-1','supper',{late:false,grand:false,everyone:false},d,draw);
 assert.equal(draws,3);assert.equal(p.celebrations,undefined);delete first.progress.done[key];
 const undone=R.cleanProgress(first.progress,c,d);assert.deepEqual(undone.celebrations[key],first.celebration);
 undone.done[key]={at:d.toISOString()};const replay=R.assignCelebration(c,undone,'child-1','supper',{late:true,grand:false,everyone:false},d,draw);
 assert.equal(draws,3);assert.deepEqual(replay.celebration,first.celebration);assert.equal(replay.celebration.late,false);
});
test('celebrations belong to individual children and chores',()=>{
 const c=R.defaults(),d=new Date(2026,9,23,19),first=R.assignCelebration(c,R.freshProgress(d),'child-1','supper',{},d,()=>.1);
 const otherChild=R.assignCelebration(c,first.progress,'child-2','supper',{},d,()=>.8);
 const otherChore=R.assignCelebration(c,otherChild.progress,'child-1','pajamas',{},d,()=>.5);
 assert.equal(Object.keys(otherChore.progress.celebrations).length,3);assert.equal(first.celebration.theme,2);assert.equal(otherChild.celebration.theme,16);assert.equal(otherChore.celebration.theme,10);
 assert.throws(()=>R.assignCelebration(c,first.progress,'missing','supper',{},d));
});
test('unchecking and reloading retain the daily celebration',()=>{
 const c=R.defaults(),d=new Date(2026,9,23,19),first=R.assignCelebration(c,R.freshProgress(d),'child-1','supper',{},d,()=>.3),key=R.completionKey('child-1','supper');
 const reload=R.cleanProgress(JSON.parse(JSON.stringify(first.progress)),c,d);assert.equal(reload.done[key],undefined);assert.deepEqual(reload.celebrations[key],first.celebration);
 const replay=R.assignCelebration(c,reload,'child-1','supper',{},d,()=>{throw Error('Should not randomize on reload');});assert.deepEqual(replay.celebration,first.celebration);
});
test('new local dates clear rewards and draw fresh daily celebrations',()=>{
 const c=R.defaults(),d=new Date(2026,9,23,19),first=R.assignCelebration(c,R.freshProgress(d),'child-1','supper',{},d,()=>.1),tomorrow=new Date(2026,9,24,18);
 assert.equal(R.cleanProgress(first.progress,c,tomorrow).celebrations,undefined);
 const next=R.assignCelebration(c,first.progress,'child-1','supper',{},tomorrow,()=>.8);assert.equal(next.progress.day,R.dayKey(tomorrow));assert.equal(next.celebration.theme,16);assert.notDeepEqual(next.celebration,first.celebration);
});
test('late reminders and earned completion celebrations also replay their original choice',()=>{
 const c=R.defaults(),d=new Date(2026,9,23,21),first=R.assignCelebration(c,R.freshProgress(d),'child-1','supper',{late:true,grand:true,everyone:true},d,()=>.7);
 const replay=R.assignCelebration(c,first.progress,'child-1','supper',{late:false,grand:false,everyone:false},d,()=>.1);
 assert.deepEqual(replay.celebration,first.celebration);assert.equal(replay.celebration.reminder,4);assert.equal(replay.celebration.grand,true);assert.equal(replay.celebration.everyone,true);assert.equal(replay.celebration.late,true);
});
test('shifts, undo and settings cleanup preserve assigned daily celebrations',()=>{
 const c=R.defaults(),d=new Date(2026,9,23,19),first=R.assignCelebration(c,R.freshProgress(d),'child-1','supper',{},d,()=>.4),key=R.completionKey('child-1','supper');
 const shifted=R.shiftRemaining(c,first.progress,15,d),undo=R.undoShift(c,shifted.progress,d);
 assert.deepEqual(shifted.progress.celebrations[key],first.celebration);assert.deepEqual(undo.celebrations[key],first.celebration);
 c.kids[0].name='New name';assert.deepEqual(R.cleanProgress(undo,c,d).celebrations[key],first.celebration);
});
test('reward cleanup removes malformed and unassigned choices without removing valid ones',()=>{
 const c=R.defaults(),d=new Date(2026,9,23,19),first=R.assignCelebration(c,R.freshProgress(d),'child-1','supper',{},d,()=>.2),p=first.progress;
 p.celebrations['child-2:supper']={...first.celebration,theme:R.CELEBRATION_COUNT};p.celebrations['child-1:pajamas']={...first.celebration,seed:-1};p.celebrations['child-2:pajamas']={...first.celebration,late:'false'};p.celebrations['child-1:deleted']=first.celebration;
 const clean=R.cleanProgress(p,c,d);assert.deepEqual(Object.keys(clean.celebrations),['child-1:supper']);
 c.chores[0].kidIds=['child-2'];assert.equal(R.cleanProgress(clean,c,d).celebrations,undefined);
});
test('particle animation randomness is repeatable from a saved reward seed',()=>{
 const a=R.celebrationRandom(12345),b=R.celebrationRandom(12345),c=R.celebrationRandom(54321);
 const first=Array.from({length:100},()=>a()),replay=Array.from({length:100},()=>b()),other=Array.from({length:100},()=>c());
 assert.deepEqual(first,replay);assert.notDeepEqual(first,other);assert.ok(first.every(v=>v>=0&&v<1));
});
test('reward choice limits match the bundled theme and reminder lists',()=>{
 const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),source=fs.readFileSync(path.join(__dirname,'app.js'),'utf8');
 const lists=source.slice(source.indexOf('const celebrationThemes='),source.indexOf('function celebrate('));
 const counts=vm.runInNewContext(lists+';({themes:celebrationThemes.length,reminders:lateReminders.length})');
 assert.equal(counts.themes,R.CELEBRATION_COUNT);assert.equal(counts.reminders,R.LATE_REMINDER_COUNT);
});

test('reset restores original times after multiple shifts while preserving completions and rewards',()=>{
 const c=R.defaults(),date=new Date(2026,9,23,19),p=R.freshProgress(date),key=R.completionKey(c.kids[0].id,'supper');
 const first=R.shiftRemaining(c,p,15,date).progress;
 for(const kid of c.kids)first.done[R.completionKey(kid.id,'supper')]={at:date.toISOString()};
 const second=R.shiftRemaining(c,first,10,date).progress;
 assert.equal(second.offsets.supper,15);assert.equal(second.offsets.teeth,25);
 const rewarded=R.assignCelebration(c,second,c.kids[0].id,'supper',{late:true},date,()=>.4).progress;
 const original=JSON.stringify(rewarded),configBefore=JSON.stringify(c);
 const reset=R.resetShifts(c,JSON.parse(original),date);
 assert.deepEqual(R.effectiveConfig(c,reset,date),c);
 assert.deepEqual({...reset.done},{...rewarded.done});assert.ok(reset.done[key]);
 assert.deepEqual(reset.celebrations,rewarded.celebrations);
 assert.equal(reset.offsets,undefined);assert.equal(reset.undoOffsets,undefined);
 assert.equal(JSON.stringify(rewarded),original);assert.equal(JSON.stringify(c),configBefore);
 const reload=R.cleanProgress(JSON.parse(JSON.stringify(reset)),c,date);assert.deepEqual(R.effectiveConfig(c,reload,date),c);
 assert.deepEqual(R.resetShifts(c,reset,date),reset);
 const newShift=R.shiftRemaining(c,reset,5,date).progress;assert.equal(newShift.offsets.teeth,5);
 assert.equal(R.undoShift(c,newShift,date).offsets,undefined);
});

test('profiles start empty and reject older storage and backup formats',()=>{
 const s=R.freshState(date());assert.equal(s.activeProfileId,'evening');
 assert.equal(R.validateState(s,date()).version,3);
 for(const id of R.PROFILE_IDS){assert.equal(s.profiles[id].chores.length,0);assert.equal(R.timeline(R.profileConfig(s,id)).height,0);}
 for(const old of [{config:R.defaults(),progress:R.freshProgress(date())},R.defaults(),{version:1}])assert.throws(()=>R.importState(old));
});
test('profiles isolate duplicate chore ids, completion rewards and shifts across reload and midnight',()=>{
 let s=R.freshState(date());for(const id of ['morning','evening'])s.profiles[id].chores=R.defaults().chores;
 let c=R.profileConfig(s,'morning'),p=R.freshProgress(date());p.done['child-1:supper']={at:date().toISOString()};
 p=R.assignCelebration(c,p,'child-1','supper',{},date()).progress;
 s.profiles.morning.progress=R.shiftRemaining(c,p,10,date()).progress;
 s=R.validateState(JSON.parse(JSON.stringify(s)),date());assert.equal(s.profiles.morning.progress.offsets.supper,10);
 assert.equal(s.profiles.evening.progress.done['child-1:supper'],undefined);assert.equal(s.profiles.evening.progress.celebrations,undefined);
 s=R.validateState(s,new Date(2026,9,17));for(const id of R.PROFILE_IDS){assert.equal(Object.keys(s.profiles[id].progress.done).length,0);assert.equal(s.profiles[id].progress.offsets,undefined);}
});
test('shared child edits validate every profile without mutating existing state',()=>{
 const s=R.freshState(date());s.profiles.morning.chores=[{...R.defaults().chores[0],kidIds:['child-2']}];
 const c=R.profileConfig(s);c.kids=c.kids.filter(k=>k.id==='child-1');const before=JSON.stringify(s);
 assert.throws(()=>R.editProfile(s,c,date()),/Morning/);assert.equal(JSON.stringify(s),before);
 const renamed=R.profileConfig(s);renamed.kids=renamed.kids.map(k=>({...k,name:k.name+' X'}));
 const next=R.editProfile(s,renamed,date());assert.equal(R.profileConfig(next,'morning').kids[0].name,renamed.kids[0].name);
});
test('new backups round-trip every profile without any daily progress',()=>{
 const s=R.freshState(date());s.profiles.evening.chores=R.defaults().chores;
 s.profiles.evening.progress=R.shiftRemaining(R.profileConfig(s),R.freshProgress(date()),15,date()).progress;
 const backup=R.exportState(s);for(const id of R.PROFILE_IDS)assert.equal(backup.profiles[id].progress,undefined);
 const restored=R.importState(JSON.parse(JSON.stringify(backup)),date());assert.deepEqual(restored.profiles.evening.chores,s.profiles.evening.chores);assert.equal(restored.profiles.evening.progress.offsets,undefined);
 backup.profiles.evening.progress=s.profiles.evening.progress;assert.equal(R.importState(backup,date()).profiles.evening.progress.offsets,undefined);
});

test('finale uses the latest profile end rather than the last checked chore end',()=>{
 const c=R.defaults(),d=new Date(2026,9,23,20),p=R.freshProgress(d),kid='child-1';
 for(const ch of c.chores)p.done[R.completionKey(kid,ch.id)]={at:d.toISOString()};
 assert.deepEqual(R.celebrationFlags(c,p,kid,'supper',1200),{grand:true,everyone:false,late:false});
 assert.equal(R.celebrationFlags(c,p,kid,'supper',1210).late,false);
 assert.equal(R.celebrationFlags(c,p,kid,'supper',1210.001).late,true);
 delete p.done[R.completionKey(kid,'bed')];
 assert.deepEqual(R.celebrationFlags(c,p,kid,'supper',1200),{grand:false,everyone:false,late:true});
});
test('finale deadline uses shifted times and maximum end even when rows have a different order',()=>{
 const c=R.defaults(),d=new Date(2026,9,23,20),p=R.freshProgress(d);p.offsets={bed:20};
 for(const ch of c.chores)for(const kid of ch.kidIds)p.done[R.completionKey(kid,ch.id)]={at:d.toISOString()};
 const today=R.effectiveConfig(c,p,d);today.chores.reverse();
 assert.deepEqual(R.celebrationFlags(today,p,'child-1','supper',1220),{grand:true,everyone:true,late:false});
 assert.equal(R.celebrationFlags(today,p,'child-1','supper',1230.001).late,true);
});
test('a cached ordinary turtle upgrades to an earned trophy without redrawing the daily choice',()=>{
 const c=R.defaults(),d=new Date(2026,9,23,20),first=R.assignCelebration(c,R.freshProgress(d),'child-1','supper',{grand:false,late:true},d,()=>.3);
 const before=JSON.stringify(first.progress),upgrade=R.assignCelebration(c,first.progress,'child-1','supper',{grand:true,late:false,everyone:false},d,()=>{throw Error('Do not redraw');});
 assert.equal(upgrade.celebration.grand,true);assert.equal(upgrade.celebration.late,false);assert.equal(upgrade.celebration.seed,first.celebration.seed);assert.equal(JSON.stringify(first.progress),before);
 const replay=R.assignCelebration(c,upgrade.progress,'child-1','supper',{grand:true,late:true},d,()=>{throw Error('Do not redraw');});assert.deepEqual(replay.celebration,upgrade.celebration);
 const tooLate=R.assignCelebration(c,first.progress,'child-1','supper',{grand:true,late:true},d);assert.equal(tooLate.celebration.late,true);
});

test('clock details show current, next unfinished and overdue incomplete chores only',()=>{
 const c=R.defaults(),p=R.freshProgress(date());
 const view=R.choreTimings(c,p,19*60+5);
 assert.equal(view.supper,'overdue');assert.equal(view.pajamas,'overdue');assert.equal(view.teeth,'next');assert.equal(view.bed,'hidden');
 p.done['child-1:supper']={at:date().toISOString()};assert.equal(R.choreTimings(c,p,1145).supper,'overdue');
 p.done['child-2:supper']={at:date().toISOString()};assert.equal(R.choreTimings(c,p,1145).supper,'hidden');
 for(const kid of c.kids)p.done[R.completionKey(kid.id,'teeth')]={at:date().toISOString()};
 assert.equal(R.choreTimings(c,p,1145).teeth,'hidden');assert.equal(R.choreTimings(c,p,1145).prayer,'next');
 assert.equal(R.choreTimings(c,p,1155).teeth,'current');assert.equal(R.choreTimings(c,p,1170).teeth,'hidden');
});
test('clock boundaries, tied next chores and shifted schedules use actual profile times',()=>{
 const c=R.defaults(),p=R.freshProgress(date());
 assert.equal(R.choreTimings(c,p,1080).supper,'current');assert.equal(R.choreTimings(c,p,1125).supper,'overdue');
 c.chores[0].kidIds=['child-1'];c.chores[1].kidIds=['child-2'];c.chores[1].start='18:00';
 assert.equal(R.choreTimings(c,p,1079).supper,'next');assert.equal(R.choreTimings(c,p,1079).pajamas,'next');
 p.offsets={supper:30};const shifted=R.effectiveConfig(c,p,date());assert.equal(R.choreTimings(shifted,p,1125).supper,'current');
 assert.deepEqual({...R.choreTimings({...c,chores:[]},p,0)},{});
});

test('measured timeline fits compact rows, clocks and long titles while mapping time continuously',()=>{
 const c=R.defaults(),heights={};for(const ch of c.chores)heights[ch.id]=96;
 let l=R.timeline(c,heights);const short=l.rows.find(r=>r.id==='toilet'),long=l.rows.find(r=>r.id==='supper');
 assert.ok(short.height<120);assert.ok(long.height>short.height);assert.ok(l.rows.every(r=>r.height>=104));
 heights.toilet=174;heights.prayer=260;const expanded=R.timeline(c,heights);
 assert.ok(expanded.rows.find(r=>r.id==='toilet').height>=182);assert.ok(expanded.rows.find(r=>r.id==='prayer').height>=268);
 assert.equal(R.position(expanded,expanded.end),expanded.height);
 for(let i=1;i<expanded.rows.length;i++)assert.ok(expanded.rows[i].top>=expanded.rows[i-1].top+expanded.rows[i-1].height);
 let previous=-1;for(let t=expanded.start;t<=expanded.end;t+=.25){const y=R.position(expanded,t);assert.ok(y>=previous);previous=y;}
});

function queuedCelebrationHarness(){
 const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),source=fs.readFileSync(path.join(__dirname,'app.js'),'utf8');
 const section=source.slice(source.indexOf('let celebrationRequest='),source.indexOf("$('kid-columns').addEventListener('change'"));
 const frames=[],shown=[],state={activeProfileId:'evening'},progress={day:R.dayKey(new Date()),done:{box:{at:new Date().toISOString()}}},document={hidden:false};
 const api=vm.runInNewContext(section+';({queueCelebration,cancelPendingCelebration})',{R,state,progress,document,requestAnimationFrame:fn=>frames.push(fn),celebrate:(...args)=>shown.push(args)});
 return {api,frames,shown,state,progress,document,frame(){const frame=frames.shift();if(frame)frame();}};
}
test('celebration waits for a checked frame rather than blocking the input event',()=>{
 const h=queuedCelebrationHarness(),choice={theme:2};h.api.queueCelebration(choice,'Child','box');
 assert.equal(h.shown.length,0);h.frame();assert.equal(h.shown.length,0);h.frame();assert.equal(h.shown.length,1);assert.equal(h.shown[0][0],choice);
});
test('queued celebration cancels on undo, profile change, date change, hidden page or explicit cancellation',()=>{
 for(const cancel of [h=>delete h.progress.done.box,h=>h.state.activeProfileId='morning',h=>h.progress.day='2000-01-01',h=>h.document.hidden=true,h=>h.api.cancelPendingCelebration()]){
  const h=queuedCelebrationHarness();h.api.queueCelebration({},'Child','box');h.frame();cancel(h);h.frame();assert.equal(h.shown.length,0);
 }
});
test('only the latest queued celebration opens after rapid successive actions',()=>{
 const h=queuedCelebrationHarness(),first={theme:1},latest={theme:2};h.api.queueCelebration(first,'Child','box');h.api.queueCelebration(latest,'Child','box');
 while(h.frames.length)h.frame();assert.equal(h.shown.length,1);assert.equal(h.shown[0][0],latest);
});


function checkboxLockHarness(){
 const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
 const source=fs.readFileSync(path.join(__dirname,'app.js'),'utf8');
 const section=source.slice(source.indexOf('const TAP_GUARD_MS='),source.indexOf('let celebrationRequest='));
 const state={activeProfileId:'evening'},progress={day:'2026-11-09'},timers=[];
 const boxes=[{dataset:{key:'child-1:supper'},disabled:false},{dataset:{key:'child-2:supper'},disabled:false}];
 let now=0;
 const api=vm.runInNewContext(section+';({lockCheckbox,applyCheckboxLocks})',{
  state,progress,$:()=>({querySelectorAll:()=>boxes}),
  setTimeout(callback,delay){timers.push({callback,at:now+delay});}
 });
 return {api,state,progress,boxes,advance(milliseconds){
  now+=milliseconds;
  for(const timer of timers.filter(timer=>timer.at<=now)){
   timers.splice(timers.indexOf(timer),1);
   timer.callback();
  }
 }};
}
test('a checkbox ignores repeat taps for two seconds independently of other children',()=>{
 const h=checkboxLockHarness();
 h.api.lockCheckbox(h.boxes[0]);
 assert.equal(h.boxes[0].disabled,true);
 assert.equal(h.boxes[1].disabled,false);
 h.advance(1999);
 assert.equal(h.boxes[0].disabled,true);
 h.advance(1);
 assert.equal(h.boxes[0].disabled,false);
});
test('checkbox locks survive row replacement and stay scoped to the profile and day',()=>{
 const h=checkboxLockHarness();
 h.api.lockCheckbox(h.boxes[0]);
 h.boxes[0]={dataset:{key:'child-1:supper'},disabled:false};
 h.api.applyCheckboxLocks();
 assert.equal(h.boxes[0].disabled,true);
 h.state.activeProfileId='morning';h.api.applyCheckboxLocks();
 assert.equal(h.boxes[0].disabled,false);
 h.state.activeProfileId='evening';h.api.applyCheckboxLocks();
 assert.equal(h.boxes[0].disabled,true);
 h.progress.day='2026-11-10';h.api.applyCheckboxLocks();
 assert.equal(h.boxes[0].disabled,false);
 h.progress.day='2026-11-09';h.api.applyCheckboxLocks();
 assert.equal(h.boxes[0].disabled,true);
 h.advance(2000);
 assert.equal(h.boxes[0].disabled,false);
});
