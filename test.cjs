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
test('legacy settings migrate and shared progress is retained only for first child',()=>{const old={version:1,name:'Our evening',format:'24',celebrations:true,chores:[{id:'supper',title:'Supper',icon:'🍽️',start:'18:00',end:'18:45'}]},c=R.validate(old),d=date(),p={day:R.dayKey(d),done:{supper:{at:d.toISOString()}}};assert.equal(c.version,2);assert.equal(c.chores[0].kidIds.length,2);const clean=R.cleanProgress(p,c,d,true);assert.ok(clean.done['child-1:supper']);assert.equal(clean.done['child-2:supper'],undefined);});
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
