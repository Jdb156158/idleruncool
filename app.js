'use strict';
const $ = s => document.querySelector(s);
const screen = $('#screen');
const pets = [
  {name:'MIYEON',cn:'美延',fill:'#f2c787',stroke:'#694c39',cheek:'#e99c61',type:'deer'},
  {name:'MINNIE',cn:'敏妮',fill:'#fff9fc',stroke:'#d8a4be',cheek:'#eeacc6',type:'bunny'},
  {name:'SOYEON',cn:'小娟',fill:'#f9d966',stroke:'#75446d',cheek:'#ee9e94',type:'lion'},
  {name:'WOONINI',cn:'宇妮',fill:'#ffb573',stroke:'#b82e21',cheek:'#f07964',type:'bear'},
  {name:'SHUHUA',cn:'舒华',fill:'#d7d8e1',stroke:'#656070',cheek:'#e8a3b7',type:'cat'}
];
const songs = [
  ['Queencard','2:42','#242128','#f5bdd5','QUEEN\nCARD'],['Fate','2:38','#202824','#fcfcf0','I FEEL\nFATE'],['Tomboy','2:54','#341329','#f02885','TOM\nBOY'],['Nxde','2:57','#aa343d','#f2cc99','I LOVE'],['Latata','3:22','#ab77ba','#efe95e','LATATA'],['Lion','3:30','#bdb7aa','#514942','LION'],['HANN','3:25','#3e4b69','#d4cebd','HANN'],['Oh my god','3:15','#222735','#ead6b4','OH MY\nGOD'],['Dumdi Dumdi','3:30','#e9876e','#fff4ab','DUMDi'],['HWAA','3:17','#a5333d','#e8d3af','火 花'],['MY BAG','2:41','#703140','#fbdfdb','MY BAG'],['Allergy','2:42','#f5a6c8','#5e335a','ALLERGY'],['I DO','3:10','#94b6cb','#fff2e8','I DO'],['I Want That','2:51','#8b86b2','#fff7df','I WANT\nTHAT'],['Super Lady','2:32','#3d4270','#e7e8f3','SUPER\nLADY'],['Wife','2:01','#b1d2cc','#477b72','WIFE'],['Klaxon','2:55','#f3a569','#fff5df','KLAXON'],['Bloom','3:43','#b7a5cd','#fff9e8','BLOOM'],['Neverland','3:16','#9199b8','#fff1e1','NEVER\nLAND'],['MoNO','3:04','#47465d','#ded4ed','MONO'],['Girlfriend','2:49','#f089b8','#fdf6f4','GIRL\nFRIEND']
];
const items = [
  {id:'bow',icon:'🎀',name:'蝴蝶发夹',price:60}, {id:'cap',icon:'🧢',name:'棒球帽',price:90},
  {id:'mask',icon:'😷',name:'口罩 · 守护中',price:120}, {id:'heart',icon:'💗',name:'爱心发夹',price:140},
  {id:'star',icon:'⭐',name:'闪亮星星',price:180}, {id:'balloon',icon:'🎈',name:'气球',price:450},
  {id:'crown',icon:'👑',name:'猫猫皇冠',price:480}, {id:'mic',icon:'🎤',name:'麦克风',price:520}
];
let saved;
try { saved=JSON.parse(localStorage.getItem('idle-run-save')||'null'); } catch { saved=null; }
const state = {coins:0,pet:3,song:3,best:0,owned:[],equipped:'',cards:[],...saved};
let current='home', cleanup=()=>{}, audioCtx, audioTimer, musicOn=true, soundOn=true, beat=0, toastTimer;
function save(){try{localStorage.setItem('idle-run-save',JSON.stringify(state));}catch{}}
function reward(n){state.coins+=n;save();updateWallet();}
function updateWallet(){document.querySelectorAll('[data-wallet]').forEach(el=>el.textContent=state.coins);}
function wallet(){return `<span class="wallet"><i class="coin-icon">✦</i><span data-wallet>${state.coins}</span></span>`;}
function toast(message){$('#toast').textContent=message;$('#toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('visible'),2100);}
function tone(freq=660,duration=.12,type='sine',volume=.035){if(!audioCtx)return;const osc=audioCtx.createOscillator(),gain=audioCtx.createGain();osc.type=type;osc.frequency.setValueAtTime(freq,audioCtx.currentTime);gain.gain.setValueAtTime(volume,audioCtx.currentTime);gain.gain.exponentialRampToValueAtTime(.001,audioCtx.currentTime+duration);osc.connect(gain).connect(audioCtx.destination);osc.start();osc.stop(audioCtx.currentTime+duration);}
function sfx(kind='coin'){if(!soundOn)return;if(kind==='hit'){tone(130,.18,'triangle',.08);return;}tone(kind==='jump'?440:880,.09);setTimeout(()=>tone(kind==='jump'?660:1320,.12),65);}
function startAudio(){if(!audioCtx){audioCtx=new(window.AudioContext||window.webkitAudioContext)();}if(audioCtx.state==='suspended')audioCtx.resume();if(audioTimer)return;audioTimer=setInterval(()=>{if(!musicOn||current==='run'&&run?.paused)return;const notes=[0,7,12,7,4,9,12,9,2,7,11,7,4,9,14,12];const key=220*Math.pow(2,(state.song%5)/12);tone(key*Math.pow(2,notes[beat%16]/12),.18,'sine',.018);if(beat%4===0)tone(key/2,.32,'triangle',.025);beat++;},230);}
$('#musicToggle').onclick=()=>{musicOn=!musicOn;startAudio();updateAudio();};
$('#soundToggle').onclick=()=>{soundOn=!soundOn;updateAudio();};
function updateAudio(){$('#musicToggle').classList.toggle('off',!musicOn);$('#musicToggle span').textContent=`♫ ${songs[state.song][0]} · ${musicOn?'开':'关'}`;$('#soundToggle').classList.toggle('off',!soundOn);$('#soundToggle span').textContent=`✦ 音效 ${soundOn?'开':'关'}`;}
function petSVG(index=state.pet,accessory='',extra=''){
 const p=pets[index], f=p.fill,s=p.stroke;
 const ears=p.type==='bunny'?`<path d="M46 66 Q23 9 48 12 Q62 16 66 57M97 56 Q100 8 119 13 Q137 24 119 70" fill="${f}"/><path d="M47 48Q40 15 49 24L59 56M107 51Q115 15 120 25L116 58" stroke="#f0b6c9" stroke-width="7"/>`:p.type==='cat'?`<path d="M32 78L30 20Q34 11 61 52L98 51Q124 8 128 21L134 80" fill="${f}"/><path d="M38 33L47 58M120 34L115 55" stroke="#e3afc0" stroke-width="7"/>`:p.type==='deer'?`<path d="M45 68Q10 28 26 24Q48 23 61 62M91 60Q99 9 112 16Q127 25 113 71" fill="${f}"/>`:`<path d="M42 59Q23 52 28 41Q34 29 48 39Q42 9 60 11Q79 12 73 39L90 39Q88 8 104 11Q123 13 115 39Q133 30 136 46Q138 58 119 64" fill="${p.type==='bear'?'#ec5337':f}"/>`;
 let mane=p.type==='lion'?`<path d="M21 62Q5 46 26 36Q23 16 45 23Q58 3 74 22Q93 3 105 23Q132 17 131 39Q153 48 138 68Q151 89 132 104Q140 122 119 128L42 128Q17 126 22 107Q1 95 21 79Z" fill="#cb5590" stroke="${s}" stroke-width="5"/>`:'';
 let accessorySVG={bow:'<path d="M106 42Q75 18 87 53L106 46Q137 26 128 57Z" fill="#eb6ab1" stroke="#a94581" stroke-width="3"/><circle cx="107" cy="45" r="6" fill="#ffafd8"/>',cap:'<path d="M31 61Q31 22 78 26Q112 27 117 57L137 62Q146 69 127 73L32 67Z" fill="#85b5ef" stroke="#4f7fad" stroke-width="3"/><path d="M80 30L78 57" stroke="#cbe8ff" stroke-width="3"/>',mask:'<path d="M40 91L120 91L116 117Q80 127 44 117Z" fill="#98e2ed" stroke="#71b3c8" stroke-width="2"/><path d="M49 98H112M49 105H112M50 112H110" stroke="#e3fcff" stroke-width="2"/>',heart:'<path d="M112 50Q84 34 98 24Q109 17 114 29Q126 17 133 27Q142 39 112 50" fill="#f682b0" stroke="#c85690" stroke-width="3"/>',star:'<path d="M116 23L121 37L136 38L124 48L128 62L115 54L101 62L105 47L94 37L110 36Z" fill="#ffe677" stroke="#d8a953" stroke-width="3"/>',crown:'<path d="M44 43L36 12L63 27L80 4L97 27L123 12L115 43Z" fill="#ffdc61" stroke="#c49446" stroke-width="3"/>',balloon:'<path d="M127 151Q165 122 148 59" fill="none" stroke="#9c749a" stroke-width="2"/><ellipse cx="147" cy="32" rx="17" ry="24" fill="#ef8ebd" stroke="#c45b97" stroke-width="3"/>',mic:'<path d="M128 133L114 163" stroke="#727487" stroke-width="10"/><circle cx="132" cy="123" r="12" fill="#bcc3d4" stroke="#666779" stroke-width="3"/>'}[accessory]||'';
 return `<svg ${extra} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 170 205" aria-label="${p.name}"><g stroke="${s}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">${mane}${ears}<path d="M51 122Q30 123 27 140Q28 155 49 152L49 178Q48 195 67 194Q80 195 82 184Q84 196 101 194Q117 196 116 179L116 151Q138 153 138 139Q137 124 115 123" fill="${f}"/><path d="M82 42Q121 41 132 75Q143 111 121 124Q108 134 82 133Q49 134 32 121Q14 107 26 76Q36 42 82 42Z" fill="${f}"/><ellipse cx="82" cy="113" rx="37" ry="18" fill="${p.type==='lion'?'#ffe990':'#fff9ee'}" stroke="none"/><path d="M64 67Q74 91 90 76Q96 65 88 64Q82 63 83 69" fill="none" stroke="${p.type==='bear'?'#e99854':s}" stroke-width="3" opacity=".55"/><ellipse cx="62" cy="98" rx="5.7" ry="8" fill="#302b31" stroke="#302b31" stroke-width="2"/><ellipse cx="103" cy="98" rx="5.7" ry="8" fill="#302b31" stroke="#302b31" stroke-width="2"/><ellipse cx="61" cy="94" rx="2.6" ry="3" fill="white" stroke="none"/><ellipse cx="102" cy="94" rx="2.6" ry="3" fill="white" stroke="none"/><ellipse cx="45" cy="110" rx="9" ry="6" fill="${p.cheek}" stroke="none"/><ellipse cx="120" cy="110" rx="9" ry="6" fill="${p.cheek}" stroke="none"/><ellipse cx="82" cy="106" rx="3.6" ry="2.6" fill="#cc8591" stroke="none"/><path d="M72 115Q77 119 82 114Q87 120 92 115" stroke="#40363b" stroke-width="2.5" fill="none"/><path d="M82 157Q64 147 70 140Q75 134 82 141Q88 134 94 140Q102 148 82 157Z" fill="${p.type==='deer'?'#6f9c65':p.type==='cat'?'#f4f0f1':'#ed7866'}" stroke="none"/>${p.type==='deer'?'<path d="M57 128L65 139L77 129M88 130L98 139L106 128" fill="#79a279" stroke="#527150" stroke-width="3"/>':''}${accessorySVG}</g></svg>`;
}
function header(title,coins=false){return `<header class="page-head"><h2>${title}</h2>${coins?wallet():''}</header>`;}
function nav(page){cleanup();cleanup=()=>{};current=page;$('#modal').classList.add('hidden');screen.innerHTML='';updateAudio();({home:home,songs:songPage,characters:characterPage,wardrobe:wardrobePage,minis:miniPage,memory:memoryPage,mole:molePage,claw:clawPage,quiz:quizPage,cards:cardsPage,run:startRun})[page]();}
function bind(selector,fn){document.querySelectorAll(selector).forEach(el=>el.onclick=()=>fn(el));}
function home(){screen.innerHTML=`<section class="page home"><span class="sparkle" style="top:24%;left:18%">✧</span><span class="sparkle" style="top:32%;right:13%;font-size:14px">✦</span><div class="pet-parade">${pets.map((p,i)=>petSVG(i)).join('')}</div><div class="home-brand"><h1>i-dle 萌跑</h1><p>RUN INTO NEVERLAND</p></div>${wallet()}<button class="btn pink home-start" id="start">开始跑酷</button><nav class="home-nav"><button data-go="wardrobe"><b>🧢</b>衣柜</button><button data-go="cards"><b>🎴</b>卡册</button><button data-go="minis"><b>🎯</b>小游戏</button><button data-go="help"><b>🎮</b>玩法</button></nav><div class="home-foot">和喜欢的她们，一起向前跑 ♡</div></section>`;$('#start').onclick=()=>{startAudio();nav('songs');};bind('[data-go]',el=>{startAudio();if(el.dataset.go==='help')showModal('一起出发吧 ♡','左右滑动切换跑道，向上滑动跳跃，向下滑动下滑。<br>电脑支持方向键 / WASD，空格暂停。<br>收集金币和道具，避开巴士与路障。<br>金币可购买装扮、抽取角色卡片。',[['知道啦',closeModal]]);else nav(el.dataset.go);});}
function songPage(){screen.innerHTML=`<section class="page">${header('选择歌曲')}<div class="scroll">${songs.map((song,i)=>`<button class="song ${i===state.song?'selected':''}" data-song="${i}"><span class="cover" style="background:${song[2]};color:${song[3]}">${song[4].replace('\n','<br>')}</span><span class="song-info"><strong>${song[0]}</strong><small>(G)I-DLE</small><small>${song[1]}</small><em>${song[0].toUpperCase()}</em></span><span class="play-dot">♪</span></button>`).join('')}</div><p class="muted">共 21 首 · 网页版播放合成伴奏</p><div class="bottom-actions"><button class="btn" id="back">返回</button><button class="btn pink" id="next">下一步</button></div></section>`;bind('[data-song]',el=>{state.song=+el.dataset.song;save();beat=0;startAudio();document.querySelectorAll('.song').forEach(b=>b.classList.toggle('selected',b===el));updateAudio();});$('#back').onclick=()=>nav('home');$('#next').onclick=()=>nav('characters');}
function choices(){return `<div class="character-choices">${pets.map((p,i)=>`<button class="pet-choice ${state.pet===i?'selected':''}" data-pet="${i}" aria-label="选择${p.cn}">${petSVG(i)}<small>${p.cn}</small></button>`).join('')}</div>`;}
function characterStage(){return `<div class="character-stage">${petSVG(state.pet,state.equipped)}<h2>${pets[state.pet].name}</h2><p>${pets[state.pet].cn}</p><span class="best">最佳 ${state.best} m</span></div>`;}
function choosePet(){bind('[data-pet]',el=>{state.pet=+el.dataset.pet;save();nav(current);});}
function characterPage(){screen.innerHTML=`<section class="page">${header('选择人物')}${characterStage()}${choices()}<div class="bottom-actions"><button class="btn" id="back">返回</button><button class="btn pink" id="play">开始跑酷</button></div></section>`;choosePet();$('#back').onclick=()=>nav('songs');$('#play').onclick=()=>{startAudio();nav('run');};}
function wardrobePage(){screen.innerHTML=`<section class="page wardrobe">${header('衣柜',true)}${characterStage()}${choices()}<div class="scroll">${items.map(item=>{let owned=state.owned.includes(item.id);return `<div class="item-row"><span class="item-icon">${item.icon}</span><div class="info"><strong>${item.name}</strong><small>${owned?'已拥有':'萌萌装扮 · 所有角色通用'}</small></div><button data-item="${item.id}" class="pill ${owned?(state.equipped===item.id?'green':'pink'):''}">${owned?(state.equipped===item.id?'已穿':'穿上'):`${item.price} 币`}</button></div>`;}).join('')}</div><div class="bottom-actions"><button class="btn" id="unequip">脱下</button><button class="btn" id="back">返回</button></div></section>`;choosePet();bind('[data-item]',el=>{let item=items.find(i=>i.id===el.dataset.item);if(!state.owned.includes(item.id)){if(state.coins<item.price){toast('金币不足，先去跑酷或玩小游戏吧');return;}state.coins-=item.price;state.owned.push(item.id);}state.equipped=item.id;save();nav('wardrobe');toast(`${item.name}，穿上了 ♡`);});$('#unequip').onclick=()=>{state.equipped='';save();nav('wardrobe');};$('#back').onclick=()=>nav('home');}
function miniPage(){screen.innerHTML=`<section class="page">${header('小游戏',true)}${[['quiz','🎧','猜歌挑战','聆听合成旋律，6 题挑战 · 答对 +20 金币'],['claw','🧸','抓娃娃机','每次 30 金币 · 对准喜欢的角色再抓取'],['memory','🃏','记忆翻牌','配对 5 组萌宠伙伴 · 完成 +120 金币'],['mole','🔨','打地鼠','30 秒反应挑战 · 每次命中 +5 金币']].map(([id,icon,name,desc])=>`<div class="item-row"><span class="item-icon">${icon}</span><div class="info"><strong>${name}</strong><small>${desc}</small></div><button class="pill pink" data-mini="${id}">开始</button></div>`).join('')}<p class="muted mini-intro">休息一下，也能收集快乐和金币 ♡</p><div class="bottom-actions"><button class="btn" id="back">返回</button></div></section>`;bind('[data-mini]',el=>nav(el.dataset.mini));$('#back').onclick=()=>nav('home');}
function shuffle(array){return array.map(v=>({v,r:Math.random()})).sort((a,b)=>a.r-b.r).map(x=>x.v);}
function memoryPage(){let deck=shuffle([0,0,1,1,2,2,3,3,4,4]),opened=[],matched=[],locked=false,moves=0,tid;screen.innerHTML=`<section class="page">${header('记忆翻牌')}<div class="mini-status" id="memoryStatus">已配对 0 / 5 · 翻牌 0 次</div><div class="game-center"><div class="memory-grid">${deck.map((p,i)=>`<button class="memory-card" data-card="${i}" aria-label="翻开第${i+1}张卡">?</button>`).join('')}</div><p class="muted">找到相同的伙伴，让她们团聚吧 ♡</p></div><div class="bottom-actions"><button class="btn pink" id="again">重开一局</button><button class="btn" id="back">返回</button></div></section>`;bind('[data-card]',el=>{let i=+el.dataset.card;if(locked||opened.includes(i)||matched.includes(i))return;el.innerHTML=petSVG(deck[i]);el.classList.add('flipped');opened.push(i);if(opened.length===2){moves++;locked=true;let[a,b]=opened;tid=setTimeout(()=>{if(deck[a]===deck[b]){matched.push(a,b);[a,b].forEach(n=>$(`[data-card="${n}"]`).classList.add('matched'));sfx();}else[a,b].forEach(n=>{let e=$(`[data-card="${n}"]`);e.textContent='?';e.classList.remove('flipped');});opened=[];locked=false;$('#memoryStatus').textContent=`已配对 ${matched.length/2} / 5 · 翻牌 ${moves} 次`;if(matched.length===10){reward(120);toast('全部配对成功！+120 金币');}},650);}});$('#again').onclick=()=>nav('memory');$('#back').onclick=()=>nav('minis');cleanup=()=>clearTimeout(tid);}
function molePage(){let timer,spawn,active=-1,playing=false,score=0,time=30;screen.innerHTML=`<section class="page">${header('打地鼠')}<div class="mini-status" id="moleStatus">30 秒挑战 · 每次命中 +5 金币</div><div class="game-center"><div class="mole-grid">${Array.from({length:6},(_,i)=>`<button class="mole-hole" data-hole="${i}" aria-label="洞口${i+1}"></button>`).join('')}</div></div><div class="bottom-actions"><button class="btn pink" id="beginMole">开始</button><button class="btn" id="back">返回</button></div></section>`;const status=()=>$('#moleStatus').textContent=`剩余 ${time} 秒 · 命中 ${score} 次`;const next=()=>{document.querySelectorAll('.mole-hole').forEach(e=>e.innerHTML='');active=Math.floor(Math.random()*6);$(`[data-hole="${active}"]`).innerHTML=petSVG(Math.floor(Math.random()*5));};bind('[data-hole]',el=>{if(playing&&+el.dataset.hole===active){active=-1;el.innerHTML='';score++;reward(5);sfx();status();}});$('#beginMole').onclick=()=>{if(playing)return;playing=true;score=0;time=30;$('#beginMole').disabled=true;status();next();spawn=setInterval(next,780);timer=setInterval(()=>{time--;status();if(time<=0){playing=false;clearInterval(timer);clearInterval(spawn);document.querySelectorAll('.mole-hole').forEach(e=>e.innerHTML='');$('#beginMole').disabled=false;$('#beginMole').textContent='再玩一次';toast(`挑战完成！获得 ${score*5} 金币`);}},1000);};$('#back').onclick=()=>nav('minis');cleanup=()=>{clearInterval(timer);clearInterval(spawn);};}
function clawPage(){let position=2,busy=false,timer;screen.innerHTML=`<section class="page">${header('抓娃娃机',true)}<div class="game-center"><div class="claw-machine"><div class="claw-rail"></div><div class="claw" style="left:50%"><svg viewBox="0 0 60 60" width="54" height="54" aria-label="抓钩"><path d="M30 0V20M19 20H41M27 22Q14 35 14 48M33 22Q46 35 46 48" fill="none" stroke="#e5d9f1" stroke-width="3" stroke-linecap="round"/></svg></div><div class="claw-pets">${pets.map((p,i)=>petSVG(i)).join('')}</div></div><div class="mini-status" id="clawStatus">投币 30 抓一次 · 抓中赢得角色卡</div><div class="claw-buttons"><button class="btn" id="leftClaw">←</button><button class="btn pink" id="grab">抓</button><button class="btn" id="rightClaw">→</button></div></div><div class="bottom-actions"><button class="btn" id="back">返回</button></div></section>`;const move=n=>{if(busy)return;position=Math.max(0,Math.min(4,position+n));$('.claw').style.left=`${10+position*20}%`;};$('#leftClaw').onclick=()=>move(-1);$('#rightClaw').onclick=()=>move(1);$('#grab').onclick=()=>{if(busy)return;if(state.coins<30){toast('需要 30 金币，玩记忆翻牌就能赚取哦');return;}reward(-30);busy=true;$('#clawStatus').textContent='抓住快乐…';$('.claw').style.top='67%';timer=setTimeout(()=>{$('.claw').style.top='20px';let win=Math.random()<.7;if(win){let id=position;if(!state.cards.includes(id))state.cards.push(id);else reward(45);save();$('#clawStatus').textContent=`抓到 ${pets[position].name}！卡片已放入卡册`;sfx();}else $('#clawStatus').textContent='滑掉了… 下次一定抓紧！';busy=false;},1500);};$('#back').onclick=()=>nav('minis');cleanup=()=>clearTimeout(timer);}
function quizPage(){let round=0,correct=0,answer=0,timers=[];const play=()=>{startAudio();timers.forEach(clearTimeout);let pattern=[0,4,7,12,7,4,2,7];pattern.forEach((n,i)=>timers.push(setTimeout(()=>tone(220*Math.pow(2,(n+answer%5)/12),.2,'triangle',.09),i*240)));};const render=()=>{let options=shuffle([0,3,12,14]);answer=options[Math.floor(Math.random()*4)];screen.innerHTML=`<section class="page">${header('猜歌挑战')}<div class="mini-status">第 ${round+1} / 6 题 · 答对 ${correct}</div><div class="game-center"><h2 class="quiz-title">♫ 前奏播放中…</h2><p class="muted">合成旋律小游戏 · 提示：${songs[answer][0].slice(0,2)}…</p><div class="quiz-options">${options.map(i=>`<button data-answer="${i}">${songs[i][0]}</button>`).join('')}</div><button class="btn blue" style="flex:none;width:70%" id="replay">再听一次</button></div><div class="bottom-actions"><button class="btn" id="back">返回</button></div></section>`;bind('[data-answer]',el=>{if(+el.dataset.answer===answer){correct++;reward(20);toast('答对啦！+20 金币');sfx();}else toast(`答案是 ${songs[answer][0]}`);round++;if(round>=6){showModal('挑战完成 ♫',`答对 ${correct} / 6 题，获得 ${correct*20} 金币。`,[['再来一次',()=>nav('quiz')],['返回小游戏',()=>nav('minis')]]);}else render();});$('#replay').onclick=play;$('#back').onclick=()=>nav('minis');play();};render();cleanup=()=>timers.forEach(clearTimeout);}
function cardsPage(){let filter='全部';const render=()=>{const visible=Array.from({length:15},(_,i)=>i).filter(i=>filter==='全部'||(filter==='已拥有'?state.cards.includes(i):['专辑卡','舞台卡','自拍卡'][Math.floor(i/5)]===filter));screen.innerHTML=`<section class="page">${header('卡册',true)}<div class="tabs">${['全部','已拥有','专辑卡','舞台卡','自拍卡'].map(f=>`<button data-filter="${f}" class="${f===filter?'active':''}">${f}</button>`).join('')}</div><div class="scroll"><div class="card-grid">${visible.map(i=>`<button class="collect-card ${state.cards.includes(i)?'':'locked'}" data-view="${i}"><span class="rarity">${i<5?'R':i<10?'SR':'SSR'}</span>${petSVG(i%5,i>=10?'crown':i>=5?'bow':'')}<strong>${pets[i%5].name}</strong><small>${['NEVERLAND','ON THE STAGE','MY LITTLE WORLD'][Math.floor(i/5)]}</small>${state.cards.includes(i)?'':'<b class="lock">?</b>'}</button>`).join('')}</div>${visible.length?'':'<p class="muted">还没有卡片，试试抓娃娃或抽卡吧 ♡</p>'}</div><p class="muted">已收集 ${state.cards.length} / 15 · 重复卡返还 30 金币</p><div class="bottom-actions"><button class="btn pink" id="drawCard">抽一张 · 60 币</button><button class="btn" id="back">返回</button></div></section>`;bind('[data-filter]',el=>{filter=el.dataset.filter;render();});bind('[data-view]',el=>{let id=+el.dataset.view;if(!state.cards.includes(id)){toast('抽卡或抓娃娃，解锁这位伙伴');return;}showModal(pets[id%5].name,`${petSVG(id%5,id>=10?'crown':id>=5?'bow':'')}<br>你的第 ${id+1} 号萌宠收藏`,[['收好啦',closeModal]]);});$('#drawCard').onclick=()=>{if(state.coins<60){toast('需要 60 金币，先去冒险吧');return;}reward(-60);const id=Math.floor(Math.random()*15),duplicate=state.cards.includes(id);if(duplicate)reward(30);else state.cards.push(id);save();render();showModal(duplicate?'又见面啦 ♡':'新伙伴！',`${petSVG(id%5)}<br>${pets[id%5].name}${duplicate?' · 重复卡返还 30 金币':' · 已加入卡册'}`,[['收下',closeModal]]);};$('#back').onclick=()=>nav('home');};render();}
function showModal(title,body,actions){const modal=$('#modal');modal.innerHTML=`<div class="modal-panel"><h2>${title}</h2><div class="modal-body">${body}</div>${actions.map(([name],i)=>`<button class="btn ${i===0?'pink':''}" data-modal="${i}">${name}</button>`).join('')}</div>`;modal.classList.remove('hidden');bind('[data-modal]',el=>actions[+el.dataset.modal][1]());}
function closeModal(){$('#modal').classList.add('hidden');}
let run;
function startRun(){
 screen.innerHTML=`<section class="page run-page"><canvas id="game" aria-label="三轨萌宠跑酷，方向键或滑动控制"></canvas><div class="run-hud"><small>SCORE</small><strong id="score">0</strong><span id="distance">0 m</span><div class="speed"><i></i></div><div class="curve-hud" id="curveHud">直道</div><div class="power-hud hidden" id="powerHud"></div></div><div class="run-right"><div class="lives" id="lives">♥♥♥</div><span class="wallet"><i class="coin-icon">✦</i><span id="runCoins">0</span></span><button class="pause-btn" id="pause" aria-label="暂停游戏">Ⅱ</button></div><div class="run-message" id="runMessage">城市 CITY</div><div class="run-tutorial"><span>〈　左右滑动换道　〉</span><span>↑ 上滑 / ↑ 键跳跃</span><span>↓ 下滑躲避横杆</span></div><div class="run-touch"><button data-control="left" aria-label="左移">←</button><button data-control="right" aria-label="右移">→</button><span class="spacer"></span><button data-control="jump" aria-label="跳跃">↑</button><button data-control="slide" aria-label="下滑">↓</button></div></section>`;
 const canvas=$('#game');let ctx=canvas.getContext('2d');let frame,last=performance.now(),w,h,dpr,active=true,pointer,renderDirty=true;
 const hud={score:$('#score'),distance:$('#distance'),coins:$('#runCoins'),power:$('#powerHud'),curve:$('#curveHud'),message:$('#runMessage'),tutorial:$('.run-tutorial'),speed:$('.speed i')};
 let hudTime=0,tutorialHidden=false,backgrounds=[],scenerySprites=[];
 run={lane:1,x:1,distance:0,score:0,coins:0,lives:3,time:0,speed:44,bend:0,jump:0,slide:0,invincible:0,power:'',powerTime:0,objects:[],particles:[],spawn:0,paused:false,ended:false,theme:0,nextPower:200,banked:false};
 const playerImg=new Image();playerImg.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(petSVG(state.pet,state.equipped));
 const resize=()=>{w=canvas.clientWidth;h=canvas.clientHeight;dpr=Math.min(devicePixelRatio||1,2);canvas.width=w*dpr;canvas.height=h*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);cacheScenery();renderDirty=true;};
 const project=(lane,z)=>RunnerMotion.project(lane,z,w,h,run.bend);
 const poly=(points,color,stroke)=>{ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fillStyle=color;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1;ctx.stroke();}};
 const ellipse=(x,y,rx,ry,color)=>{ctx.beginPath();ctx.ellipse(x,y,Math.max(.01,rx),Math.max(.01,ry),0,0,Math.PI*2);ctx.fillStyle=color;ctx.fill();};
 const rect=(x,y,ww,hh,color,r=0)=>{ctx.fillStyle=color;ctx.beginPath();ctx.roundRect(x,y,ww,hh,r);ctx.fill();};
 function cloud(x,y,s){ellipse(x,y,s*1.2,s*.4,'#ffffff6b');ellipse(x-s*.25,y-s*.2,s*.65,s*.4,'#ffffff6b');ellipse(x+s*.38,y-s*.22,s*.5,s*.4,'#ffffff6b');}
 function tree(x,y,s,pine=false){rect(x-3*s,y-38*s,6*s,40*s,'#a79862');if(pine){poly([[x,y-95*s],[x-26*s,y-49*s],[x+26*s,y-49*s]],'#75b78b');poly([[x,y-73*s],[x-30*s,y-26*s],[x+30*s,y-26*s]],'#67aa80');}else{ellipse(x,y-52*s,24*s,29*s,'#8dcc99');ellipse(x-9*s,y-62*s,18*s,21*s,'#a8d9a4');}}
 function building(x,y,s,seed){const palette=['#86cdb9','#eac279','#eca0ae','#a3bce1','#bd9adb','#eab48e'];const bw=(22+seed%4*5)*s,bh=(66+seed%5*17)*s;poly([[x-bw/2,y],[x-bw/2,y-bh],[x+bw/2,y-bh],[x+bw/2,y]],palette[seed%palette.length]);poly([[x+bw/2,y],[x+bw/2,y-bh],[x+bw/2+7*s,y-bh-4*s],[x+bw/2+7*s,y-4*s]],palette[(seed+1)%palette.length]);rect(x-bw/2,y-bh-3*s,bw,3*s,'#ffffff70');for(let row=0;row<Math.floor(bh/(13*s));row++)for(let col=0;col<2;col++)rect(x-bw/2+(5+col*13)*s,y-bh+(7+row*13)*s,5*s,6*s,(row+col+seed)%3?'#ffefb6':'#ffffff80');}
 function cacheScenery(){
  const mainContext=ctx;
  backgrounds=[0,1].map(theme=>{
   const layer=document.createElement('canvas'),bw=w*1.6;
   layer.width=Math.ceil(bw*dpr);layer.height=Math.ceil(h*dpr);
   ctx=layer.getContext('2d');ctx.scale(dpr,dpr);
   const forest=theme===1,sky=ctx.createLinearGradient(0,0,0,h);
   sky.addColorStop(0,forest?'#d5dfa2':'#f0c8d9');sky.addColorStop(.21,forest?'#f0efc7':'#f9e6dd');sky.addColorStop(1,forest?'#d2ecba':'#d7c3e7');
   ctx.fillStyle=sky;ctx.fillRect(0,0,bw,h);
   ellipse(bw*.68,h*.10,31,31,'#fff4c66b');cloud(bw*.3,h*.08,34);cloud(bw*.65,h*.12,27);cloud(bw*.8,h*.045,25);
   if(forest){for(let i=0;i<16;i++)ellipse(i*bw/14,h*.205,50+(i%3)*7,43+(i%3)*8,['#a9cf97','#8bbd88','#b3d19b'][i%3]);}
   else{for(let i=0;i<34;i++)building(i*bw/33,h*.204,.35+(i%4)*.09,i+12);}
   rect(0,h*.2,bw,5,forest?'#88ac80':'#9c8daa');rect(0,h*.203,bw,2,'#f8ecc2');
   ctx.strokeStyle='#958e9e88';ctx.lineWidth=1.2;
   for(let i=0;i<7;i++){let x=bw*(.08+i*.14),y=h*(.068+(i%2)*.033);ctx.beginPath();ctx.moveTo(x-5,y);ctx.quadraticCurveTo(x-2,y-5,x,y);ctx.quadraticCurveTo(x+2,y-5,x+5,y);ctx.stroke();}
   return layer;
  });
  scenerySprites=Array.from({length:14},(_,i)=>{
   const layer=document.createElement('canvas');layer.width=110*dpr;layer.height=180*dpr;
   ctx=layer.getContext('2d');ctx.scale(dpr,dpr);
   if(i<12)building(50,175,1,i+3);else tree(50,175,1,i===13);
   return layer;
  });
  ctx=mainContext;
 }
 function scenery(){
  const forest=run.theme===1;
  ctx.drawImage(backgrounds[run.theme],-w*.3-run.bend*w*.18,0,w*1.6,h);
  // Every lane boundary uses the same curved projection as obstacles and scenery.
  const edges=Array.from({length:4},()=>[]);
  for(let segment=0;segment<=36;segment++){
   const z=140-segment*144/36;
   for(let edge=0;edge<4;edge++)edges[edge].push(project(edge-.5,z));
  }
  for(let lane=0;lane<3;lane++){
   ctx.beginPath();edges[lane].forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));
   for(let i=36;i>=0;i--)ctx.lineTo(edges[lane+1][i].x,edges[lane+1][i].y);
   ctx.closePath();ctx.fillStyle=forest?(lane===1?'#dcbda6':'#d7c297'):(lane===1?'#cea6d9':'#d7bfdc');ctx.fill();
  }
  ctx.strokeStyle='#fff5e790';ctx.lineWidth=1.5;
  for(const edge of edges){ctx.beginPath();edge.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.stroke();}
  // Stable world positions travel at exactly the same speed as the road objects.
  const rows=[];
  for(let i=0;i<14;i++){const z=RunnerMotion.sceneryDepth(i,run.distance);if(z<=140)rows.push({i,z});}
  rows.sort((a,b)=>b.z-a.z);
  for(const {i,z} of rows){
   for(const side of [-1,1]){
    const p=project(1+side*2.05,z),s=p.s*1.6,seed=i+(side===1?5:0);
    const sprite=scenerySprites[forest?12+seed%2:seed%12];
    ctx.drawImage(sprite,p.x-50*s,p.y-175*s,110*s,180*s);
    if(i%3===0){const sign=project(1+side*1.7,z),ss=sign.s;rect(sign.x,sign.y-45*ss,2*ss,45*ss,'#b287b3');rect(sign.x-10*ss,sign.y-49*ss,23*ss,10*ss,'#e69ac6',3*ss);rect(sign.x-5*ss,sign.y-46*ss,13*ss,2*ss,'#ffe5f6');}
   }
  }
  ctx.globalAlpha=.3;
  for(let i=0;i<20;i++){
   const z=RunnerMotion.sceneryDepth(i,run.distance,10,20);if(z>140)continue;
   const p=project(1+Math.sin(i*14.3)*1.2,z),t=p.t;
   rect(p.x-4*t,p.y,8*t,2*t,'#ffffff');rect(p.x,p.y-3*t,2*t,8*t,'#ffffff');
  }
  ctx.globalAlpha=1;
 }
 function coin(x,y,s,phase=0){let rw=(9+Math.abs(Math.sin(run.time*4+phase))*3)*s;ellipse(x+1*s,y+2*s,rw,14*s,'#e7b34b');ellipse(x,y,rw,14*s,'#ffdb65');ellipse(x,y,rw*.7,10*s,'#ffe587');ctx.fillStyle='#fff7c6';ctx.font=`bold ${14*s}px sans-serif`;ctx.textAlign='center';ctx.fillText('✦',x,y+5*s);}
 function object(o){if(o.z>140)return;const p=project(o.lane,o.z),x=p.x,y=p.y,s=p.s;ctx.save();if(o.kind==='coin'){coin(x,y-22*s,s,o.z);ctx.restore();return;}ellipse(x,y+2*s,31*s,8*s,'#9873a92b');if(o.kind==='bus'){const color=o.variant?'#83c6db':'#e7bb6a';poly([[x-30*s,y],[x+30*s,y],[x+30*s,y-122*s],[x+23*s,y-135*s],[x-28*s,y-130*s]],color);poly([[x+30*s,y],[x+38*s,y-7*s],[x+38*s,y-125*s],[x+30*s,y-122*s]],o.variant?'#5a9fb9':'#ba954e');rect(x-27*s,y-123*s,53*s,108*s,color,3*s);rect(x-24*s,y-119*s,45*s,28*s,'#536f81',2*s);rect(x-24*s,y-82*s,45*s,34*s,'#688798',2*s);rect(x-21*s,y-115*s,39*s,3*s,'#c4e6e7');rect(x-22*s,y-76*s,36*s,5*s,'#b6d3db');rect(x-27*s,y-31*s,53*s,6*s,'#edf1d9');rect(x-23*s,y-16*s,11*s,6*s,'#fff4b5');rect(x+12*s,y-16*s,11*s,6*s,'#fff4b5');rect(x-10*s,y-7*s,20*s,5*s,'#f3efe2');rect(x-28*s,y-2*s,10*s,8*s,'#686270');rect(x+20*s,y-2*s,10*s,8*s,'#686270');}else if(o.kind==='barrier'){rect(x-34*s,y-35*s,68*s,26*s,'#ee858d',3*s);rect(x-28*s,y-10*s,7*s,13*s,'#8d7a99');rect(x+21*s,y-10*s,7*s,13*s,'#8d7a99');rect(x-31*s,y-32*s,62*s,7*s,'#fff4e5');for(let j=0;j<5;j++)poly([[x+(-31+j*13)*s,y-25*s],[x+(-23+j*13)*s,y-25*s],[x+(-30+j*13)*s,y-12*s],[x+(-38+j*13)*s,y-12*s]],'#fff1db');}else if(o.kind==='arch'){rect(x-35*s,y-100*s,6*s,100*s,'#b898c1');rect(x+29*s,y-100*s,6*s,100*s,'#b898c1');rect(x-39*s,y-99*s,78*s,37*s,'#eaa5c2',3*s);for(let j=0;j<6;j++)rect(x+(-35+j*13)*s,y-94*s,7*s,27*s,'#fff1d7');}else{ellipse(x,y-32*s,22*s,22*s,o.kind==='magnet'?'#f690ba':'#9edee0');ctx.font=`${27*s}px sans-serif`;ctx.textAlign='center';ctx.fillText(o.kind==='magnet'?'🧲':'✈',x,y-23*s);}ctx.restore();}
 function character(){const p=project(run.x,7),jumpY=run.power==='fly'?h*.14:run.jump>0?Math.sin((1-run.jump/.85)*Math.PI)*h*.17:0;const slide=run.slide>0;const ph=Math.min(122,h*.165),pw=ph*.83;ellipse(p.x,p.y+3,pw*.37,7,'#82699435');if(run.invincible>0&&Math.floor(run.time*12)%2)return;ctx.save();ctx.translate(p.x,p.y-jumpY);let bob=Math.sin(run.time*17)*2;if(slide){ctx.translate(0,-6);ctx.rotate(-.18);ctx.scale(1.15,.55);}else ctx.rotate(Math.sin(run.time*15)*.035+run.bend*.12);if(playerImg.complete)ctx.drawImage(playerImg,-pw/2,-ph+bob,pw,ph);if(run.power==='fly'){ctx.font='23px sans-serif';ctx.textAlign='center';ctx.fillText('✦',0,19+Math.sin(run.time*10)*5);}ctx.restore();}
 function particles(dt){run.particles=run.particles.filter(p=>p.life>0);for(const p of run.particles){p.life-=dt;p.y-=dt*55;ctx.globalAlpha=Math.max(0,p.life);ctx.font=`900 ${p.text==='✦'?17:20}px sans-serif`;ctx.textAlign='center';ctx.fillStyle=p.color;ctx.fillText(p.text,p.x,p.y);ctx.globalAlpha=1;}}
 function spawnRow(){let lane=Math.floor(Math.random()*3),kind=['bus','bus','barrier','arch'][Math.floor(Math.random()*4)];run.objects.push({kind,lane,z:142,variant:Math.random()>.5});let safe=(lane+1+Math.floor(Math.random()*2))%3;for(let i=0;i<5;i++)run.objects.push({kind:'coin',lane:safe,z:142+i*9});if(run.distance>run.nextPower){run.objects.push({kind:Math.random()>.5?'magnet':'fly',lane:safe,z:135});run.nextPower+=350;}run.objects.sort((a,b)=>b.z-a.z);}
 function hit(o){if(o.kind==='coin'){run.coins++;run.score+=10;sfx();const p=project(run.x,7);run.particles.push({x:p.x,y:p.y-110,text:'+10',color:'#fff3a6',life:.7});return;}if(o.kind==='magnet'||o.kind==='fly'){run.power=o.kind;run.powerTime=9;toast(o.kind==='magnet'?'磁铁 · 金币自动吸取':'起飞 · 天空金币');sfx();return;}if(run.invincible>0||run.power==='fly')return;if(o.kind==='barrier'&&run.jump>.08)return;if(o.kind==='arch'&&run.slide>0)return;run.lives--;run.invincible=1.8;sfx('hit');$('#lives').textContent='♥'.repeat(run.lives)+'♡'.repeat(3-run.lives);run.particles.push({x:w/2,y:h*.5,text:'小心障碍！',color:'#fff',life:1});if(run.lives<=0)finishRun();}
 function update(dt){
  run.time+=dt;run.speed=RunnerMotion.speed(run.distance);run.distance+=run.speed*dt;
  run.bend=RunnerMotion.bend(run.distance);run.score+=run.speed*dt*1.8;
  run.x+=(run.lane-run.x)*(1-Math.exp(-20*dt));
  run.jump=Math.max(0,run.jump-dt);run.slide=Math.max(0,run.slide-dt);run.invincible=Math.max(0,run.invincible-dt);
  run.powerTime=Math.max(0,run.powerTime-dt);if(!run.powerTime)run.power='';
  run.spawn-=dt;if(run.spawn<=0){spawnRow();run.spawn=Math.max(1.05,1.8-run.distance/2400);}
  const theme=Math.floor(run.distance/700)%2;
  if(theme!==run.theme){run.theme=theme;hud.message.textContent=theme?'森林 FOREST':'城市 CITY';hud.message.style.opacity=1;}
  else if(run.distance%700>70&&hud.message.style.opacity!=='0')hud.message.style.opacity=0;
  if(run.time>3&&!tutorialHidden){hud.tutorial.classList.add('hidden');tutorialHidden=true;}
  for(const o of run.objects){
   o.z-=run.speed*dt;
   if(o.kind==='coin'&&run.power==='magnet'&&o.z<34){hit(o);o.z=-30;}
   else if(!o.checked&&o.z<=9){o.checked=true;if(o.lane===run.lane){hit(o);if(o.kind==='coin'||o.kind==='magnet'||o.kind==='fly')o.z=-30;}}
   if(run.ended)break;
  }
  run.objects=run.objects.filter(o=>o.z>-15);
  hudTime-=dt;
  if(hudTime<=0||run.ended){
   hudTime=.1;
   hud.score.textContent=Math.floor(run.score).toLocaleString();hud.distance.textContent=`${Math.floor(run.distance)} m`;hud.coins.textContent=run.coins;
   hud.power.classList.toggle('hidden',!run.power);hud.power.textContent=`${run.power==='fly'?'✈ 飞行':'🧲 磁铁'} ${Math.ceil(run.powerTime)}s`;
   hud.curve.textContent=Math.abs(run.bend)<.08?'↑ 直道':run.bend>0?'↱ 右弯':'↰ 左弯';
   hud.speed.style.width=`${run.speed/70*100}%`;
  }
 }
 function tick(now){
  if(!active)return;
  const dt=Math.min((now-last)/1000,.1);last=now;
  if(!run.paused&&!run.ended){
   // Small simulation steps keep collisions and jumps reliable on a dropped frame.
   renderDirty=true;let remaining=dt;while(remaining>0&&!run.ended){const step=Math.min(remaining,1/120);update(step);remaining-=step;}
  }
  if(renderDirty||!run.paused&&!run.ended){scenery();run.objects.forEach(object);character();particles(run.paused||run.ended?0:dt);renderDirty=false;}
  frame=requestAnimationFrame(tick);
 }
 function control(action){if(run.paused||run.ended)return;if(action==='left')run.lane=Math.max(0,run.lane-1);if(action==='right')run.lane=Math.min(2,run.lane+1);if(action==='jump'&&!run.jump){run.jump=.85;run.slide=0;sfx('jump');}if(action==='slide'){run.slide=.8;run.jump=0;}}
 function key(e){if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown',' ','Escape','a','d','w','s','A','D','W','S'].includes(e.key)){e.preventDefault();if(e.key===' '||e.key==='Escape'){if(!run.ended)togglePause();}else control(({ArrowLeft:'left',ArrowRight:'right',ArrowUp:'jump',ArrowDown:'slide',a:'left',d:'right',w:'jump',s:'slide'})[e.key]||({A:'left',D:'right',W:'jump',S:'slide'})[e.key]);}}
 function down(e){if(e.target.closest('button'))return;pointer={x:e.clientX,y:e.clientY};}
 function up(e){if(!pointer)return;let dx=e.clientX-pointer.x,dy=e.clientY-pointer.y;pointer=null;if(Math.max(Math.abs(dx),Math.abs(dy))<16)return;control(Math.abs(dx)>Math.abs(dy)?dx>0?'right':'left':dy>0?'slide':'jump');}
 window.addEventListener('keydown',key);canvas.addEventListener('pointerdown',down);canvas.addEventListener('pointerup',up);canvas.addEventListener('pointercancel',()=>pointer=null);bind('[data-control]',el=>control(el.dataset.control));$('#pause').onclick=togglePause;
 function visibility(){if(document.hidden&&!run.paused&&!run.ended)togglePause();}document.addEventListener('visibilitychange',visibility);
 resize();window.addEventListener('resize',resize);
 frame=requestAnimationFrame(tick);cleanup=()=>{active=false;cancelAnimationFrame(frame);window.removeEventListener('resize',resize);window.removeEventListener('keydown',key);document.removeEventListener('visibilitychange',visibility);bankRun();};
}
function bankRun(){if(!run||run.banked)return;state.coins+=run.coins;state.best=Math.max(state.best,Math.floor(run.distance));save();run.banked=true;}
function togglePause(){if(run.ended)return;run.paused=!run.paused;if(run.paused)showModal('休息一下 ♡','伙伴们会在这里等你。',[['继续跑酷',()=>{run.paused=false;closeModal();}],['重新开始',()=>nav('run')],['回到首页',()=>nav('home')]]);else closeModal();}
function finishRun(){run.ended=true;bankRun();showModal('这次也很棒！',`${petSVG(state.pet,state.equipped)}<div class="result-score">${Math.floor(run.score).toLocaleString()}</div><div class="result-stats"><span><b>${Math.floor(run.distance)} m</b>本次距离</span><span><b>+${run.coins}</b>收集金币</span></div><span class="best">最佳纪录 ${state.best} m</span>`,[['再跑一次',()=>nav('run')],['回到首页',()=>nav('home')]]);}
nav('home');
