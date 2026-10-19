const D=window.MD_DATA,G={},P={};D.gifts.forEach(g=>G[g.id]=g);D.packs.forEach(p=>P[p.id]=p);
// extreme completion rewards / hidden bosses, derived from Giftchoose `special` tags
const norm=s=>String(s||'').replace(/\s+/g,'');
const XP=D.packs.filter(p=>p.floors.some(f=>f.modeIdx===3));
const REWARD={},REWARD_OF={},HIDDEN=[];
D.gifts.forEach(g=>{const sp=String(g.special||'');let m;
 if((m=sp.match(/^极限模式节点-(.+)$/))){const p=XP.find(p=>norm(p.name)===norm(m[1]));if(p){REWARD[p.id]=g;REWARD_OF[g.id]=p}}
 else if((m=sp.match(/^隐藏节点-(.+)$/)))HIDDEN.push({boss:m[1],g})});
const srcLabel=g=>REWARD_OF[g.id]?`11-15F 通关奖励：${REWARD_OF[g.id].name}`:(HIDDEN.find(h=>h.g===g)?`隐藏 Boss：${HIDDEN.find(h=>h.g===g).boss}`:(g.special||''));
const $=s=>document.querySelector(s),esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const ROMAN=['0','I','II','III','IV','V','VI'];const MODES=['普通','困难'];const MODE_FULL=['普通','困难','困难 6-10F（原平行叠加）','困难 11-15F（原极限）'];
const fTag=f=>f.modeIdx===2?'困难 6-10F':f.modeIdx===3?'困难 11-15F':`${f.mode} ${f.floors.join('、')}F`;
const img=(src,alt)=>src?`<img loading="lazy" src="${src}" alt="${esc(alt)}" onerror="this.outerHTML='<div class=ph>无图</div>'">`:`<div class="ph">无图</div>`;
const NEW='<span class="newb">NEW</span>',newB=x=>x&&x.isNew?NEW:'',chgB=g=>g&&g.changed?`<span class="chgb" title="${esc(g.changed.join('；'))}">本季调整</span>`:'';
const gIcon=g=>`<div class="gi">${img(g.img,g.name)}</div>`;
const tierTxt=t=>t?`<span class="tier">${ROMAN[t]||t}级</span>`:'<span class="tier">剧情</span>';
function packFloors(p){return p.floors.map(fTag).join('；')||'未录入'}
function packCard(p,hit){const ex=p.exclusive.map(id=>G[id]).filter(Boolean);const H=hit&&new Set(hit.map(g=>g.id));const rw=REWARD[p.id];
 return `<div class="pc" onclick="showPack(${p.id})"><div class="ban" style="${p.img?`background-image:url('${p.img}')`:''}">${p.img?'':'<div class=ph>无卡包图</div>'}</div>
 <div class="nm">${esc(p.name)}${newB(p)}</div><div style="padding:0 6px 4px">${p.difficulty==='DIFFICULT'?'<span class="tag h">困难</span>':''}${p.type!=='普通'?`<span class="tag r">${esc(p.type)}</span>`:''}</div>
 <div class="ex">${ex.map(g=>`<img class="${H?(H.has(g.id)?'hit':'dim'):''}" data-gid="${g.id}" alt="⭐${esc(g.name)}" src="${g.img}" onerror="this.remove()">`).join('')}</div>${rw?`<div class="rw ${H?(H.has(rw.id)?'hit':'dim'):''}" data-gid="${rw.id}" onclick="event.stopPropagation();showGift('${rw.id}')"><span class="trophy" title="沿用上赛季数据，新赛季待确认">🏆 通关固定奖励 <i>沿用上赛季·待确认</i></span><img src="${rw.img}" alt="${esc(rw.name)}" onerror="this.remove()"><span class="rn">${esc(rw.name)}</span></div>`:''}${H?`<div class="hitl">✔ ${hit.map(g=>`${esc(g.name)}<i>${esc(g.keyword)}</i>`).join('、')}</div>`:''}</div>`}
// floor view
// legacy mode values 2 (平行叠加) / 3 (极限) map to 困难, remembering which section to scroll to
if('scrollRestoration' in history)history.scrollRestoration='manual';
const normMode=v=>{v=+v;return v>=1&&v<=3?{m:1,sec:v===2?'sec-6-10':v===3?'sec-11-15':''}:{m:0,sec:''}};
let mode=0,pendingSec='';try{const st=localStorage.getItem('mdMode');if(st!=null){const r=normMode(st);mode=r.m;if(String(st)!==String(r.m))localStorage.setItem('mdMode',r.m)}}catch(e){}
const seg=$('#modeSeg');MODES.forEach((m,i)=>seg.insertAdjacentHTML('beforeend',`<button data-m="${i}">${m}</button>`));
function setMode(m,sec){mode=m;seg.querySelectorAll('button').forEach(b=>b.classList.toggle('on',+b.dataset.m===mode));try{localStorage.setItem('mdMode',mode)}catch(e){}renderFloor();
 if(sec)setTimeout(()=>{const el=document.getElementById(sec);if(el)el.scrollIntoView({block:'start'})},60)}
seg.onclick=e=>{if(!e.target.dataset.m)return;setMode(+e.target.dataset.m);saveCats()};
// category filter
const CATS=(()=>{const c={};D.gifts.forEach(g=>{const k=g.keyword||'未录入';c[k]=(c[k]||0)+1});const tail=['泛用','暂无分类','未录入'];
 return Object.keys(c).sort((a,b)=>(tail.indexOf(a)-tail.indexOf(b))||(c[b]-c[a])).map(k=>({k,n:c[k],ex:D.packs.some(p=>p.exclusive.some(i=>G[i]&&(G[i].keyword||'未录入')===k)||(REWARD[p.id]&&(REWARD[p.id].keyword||'未录入')===k))}))})();
let sel=new Set();
try{(JSON.parse(localStorage.getItem('mdCats')||'[]')).forEach(k=>CATS.some(c=>c.k===k)&&sel.add(k))}catch(e){}
function saveCats(){try{localStorage.setItem('mdCats',JSON.stringify([...sel]))}catch(e){}
 if(document.querySelector('#v-floor.on')){const q=new URLSearchParams();if(mode)q.set('m',mode);if(sel.size)q.set('c',[...sel].join(','));const qs=q.toString().replace(/%2C/g,',');const h='#floor'+(qs?'?'+qs:'');if(location.hash!==h)history.replaceState(null,'',h)}}
function renderChips(){$('#catChips').innerHTML=`<button class="chip all ${sel.size?'':'on'}" data-c="">全部 / 清除</button>`+CATS.map(c=>`<button class="chip ${sel.has(c.k)?'on':''} ${c.ex?'':'noex'}" data-c="${esc(c.k)}" title="${c.ex?'':'该类别没有任何卡包专属饰品，选中后 4F 起不会命中卡包'}">${esc(c.k)}<b>${c.n}</b></button>`).join('')}
$('#catChips').onclick=e=>{const b=e.target.closest('.chip');if(!b)return;const k=b.dataset.c;if(!k)sel.clear();else sel.has(k)?sel.delete(k):sel.add(k);saveCats();renderChips();renderFloor()};
const hitsOf=p=>[...p.exclusive.map(i=>G[i]),REWARD[p.id]].filter(g=>g&&sel.has(g.keyword||'未录入'));
function renderFloor(){const fl=mode===0?[1,2,3,4,5].map(F=>({F,mi:0,lab:F+'F'})):[...[1,2,3,4,5].map(F=>({F,mi:1,lab:F+'F'})),{F:'6-10',mi:2,lab:'6-10F',sub:'原平行叠加',id:'sec-6-10'},{F:'11-15',mi:3,lab:'11-15F',sub:'原极限',id:'sec-11-15'}];let shown=0,total=0;
 $('#floorList').innerHTML=fl.map(({F,mi,lab,sub,id})=>{const rng=typeof F==='string';const all=D.packs.filter(p=>p.floors.some(f=>f.modeIdx===mi&&(rng||f.floors.includes(F))));
  const filt=sel.size&&(rng||F>=4);
  const ps=filt?all.filter(p=>hitsOf(p).length):all;if(filt){shown+=ps.length;total+=all.length}
  const lim=rng?[]:ps.filter(p=>{const f=p.floors.find(f=>f.modeIdx===mi);return f&&f.floors.length===1});
  return `${rng?`<div class="sec-h" id="${id}">— 困难 ${lab}（${sub}）—</div>`:''}<div class="floor ${filt?'filt':''}"><h3>${lab} · ${filt?`${ps.length}/${all.length}`:ps.length} 个卡包 ${filt?'<span class="tag r">已按类别筛选</span>':(sel.size?'<span class="tag">前三层不筛选</span>':'')} ${lim.length?`<small>（限定此层：${lim.map(p=>esc(p.name)).join('、')}）</small>`:''}</h3><div class="row">${ps.map(p=>packCard(p,filt?hitsOf(p):null)).join('')||`<span class=hint>${filt?'没有专属饰品命中所选类别的卡包':'无'}</span>`}</div></div>`}).join('');
 if(mode===1)$('#floorList').insertAdjacentHTML('beforeend',hiddenBlock());
 $('#catInfo').innerHTML=sel.size?`已选：${[...sel].map(esc).join('、')} · 4F 起${mode?'（含 6-15F）':''}共显示 ${shown}/${total} 个卡包（同一卡包可出现在多层，按层重复计）`:'未选择类别：显示全部卡包'}
function seasonBox(){const S=D.seasonInfo;if(!S)return;const np=S.newPacks.map(i=>P[i]).filter(Boolean),ng=S.newGifts.map(i=>G[i]).filter(Boolean),cg=S.changedGifts.map(i=>G[i]).filter(Boolean);
 $('#seasonBox').innerHTML=`<div class="season"><img class="sban" src="${S.banner}" alt="西西弗之镜" onerror="this.remove()"><div class="sinfo">
 <h2>第${S.no}赛季 · ${esc(S.name)} <span class="tag">2026-10-15 开放</span></h2>
 <ul><li>新增 <b>${np.length}</b> 个卡包 ${NEW}：${np.map(p=>`<span class="m" onclick="showPack(${p.id})">${esc(p.name)}</span>`).join('、')}（1 个普通/困难，3 个困难限定）</li>
 <li>新增 <b>${ng.length}</b> 件饰品 ${NEW}：${ng.map(g=>`<span class="m" data-gid="${g.id}" onclick="showGift('${g.id}')">${esc(g.name)}</span>`).join('、')}；另有 ${cg.length} 件调整：${cg.map(g=>`<span class="m" data-gid="${g.id}" onclick="showGift('${g.id}')">${esc(g.name)}</span>`).join('、')}</li>
 <li>敌人等级提升至 Lv65；困难模式可能出现「超级商店」（商品+3、可最多 5 件合成等），Boss 奖励饰品 4 选 2</li>
 <li>镜像投影/成就、极限模式隐藏 Boss 官方称之后实装</li></ul>
 <p class="hint">数据：灰机维基 ${esc(S.revs.themes)}、${esc(S.revs.gifts)}、${esc(S.revs.enemy)}；${esc(S.revs.giftchoose)}。机制说明参考 <a target="_blank" href="${S.notice}">官方公告</a> 与 <a target="_blank" href="${S.wikigg}">wiki.gg</a>。最后更新：2026-10-19（北京时间）</p></div></div>`}
seasonBox();
const HJ='https://limbuscompany.huijiwiki.com/wiki/',WG='https://limbuscompany.wiki.gg/wiki/';
const HB_SRC={hj:[HJ+'%E5%90%8D%E4%B8%8E%E8%9B%9B%E4%B9%8B%E9%95%9C','灰机·名与蛛之镜「隐藏节点」rev 133560'],wgmd:[WG+'Mirror_Dungeon','wiki.gg·Mirror Dungeon rev 198583'],gf:['https://gamesfuze.com/guides/limbus-company-how-to-find-every-secret-boss/','GamesFuze 隐藏Boss指南'],
 op1:['https://www.ourplay.net/planet/thread/666987','OurPlay·15牢隐藏情况'],op2:['https://www.ourplay.net/planet/thread/667012','OurPlay·环宝打瓦伦希娜'],
 rd1:['https://www.reddit.com/r/limbuscompany/comments/1sjxqjw/my_guide_to_beating_valencina_secret_boss_mde/','Reddit·Valencina 攻略'],rd2:['https://www.reddit.com/r/limbus_company/comments/1tx09qx/tips_on_how_to_beat_mde_valencina_beat_it_with/','Reddit·Valencina tips'],
 rd3:['https://www.reddit.com/r/limbuscompany/comments/1vo0l9x/hardest_hidden_boss_on_each_floor_starting_on/','Reddit·各层最难隐藏Boss'],rd4:['https://www.reddit.com/r/limbuscompany/comments/1sgsl5z/new_mde_hidden_boss_experience_be_like/','Reddit·新隐藏Boss体验'],
 wv:[WG+'Valencina/Enemy','wiki.gg·Valencina/Enemy (MD 1379) rev 192356'],wl:[WG+'Lucio/Enemy','wiki.gg·Lucio/Enemy (MD 1418) rev 192352'],wr:[WG+'Rien/Enemy','wiki.gg·Rien/Enemy (MD 1380) rev 192398'],
 wm:[WG+'Matthias/Enemy','wiki.gg·Matthias/Enemy (MD 1382) rev 192355'],wk:[WG+'Kira/Enemy','wiki.gg·Kira/Enemy (MD 1388) rev 169517'],wc:[WG+'Callisto/Enemy','wiki.gg·Callisto/Enemy (MD 1383) rev 192354'],wa:[WG+'Albina/Enemy','wiki.gg·Albina/Enemy (MD 1417) rev 175660']};
const HB_INFO={
 '蜘蛛巢的拇指':{who:'拇指父辈·瓦伦希娜',ally:'拇指子辈·卢西奥',img:'assets/hidden/valencina.webp',cue:{icon:'assets/hidden/envy.webp',txt:'节点下方显示【嫉妒】弱点图标',st:'ok'},cueSrc:['hj','wgmd','gf','op1'],
  cueNote:'数据佐证：同场的卢西奥嫉妒耐性 ×2.0（致命），瓦伦希娜本体罪孽耐性全为 ×1.0——图标很可能来自卢西奥（推断）。',
  stats:['瓦伦希娜 Lv77 · HP 451 · 速度 2~5 · 混乱阈值 50%','耐性：斩击 ×1.2（弱）/ 突刺 ×1.0 / 打击 ×0.5（抵抗）；七罪全 ×1.0','卢西奥 Lv60 · HP 359 · 物理全 ×1.0；嫉妒 ×2.0，暴怒/傲慢 ×0.5，其余 ×0.75'],statSrc:['wv','wl'],
  dmg:'斩击 + 突刺；罪孽：傲慢、怠惰、色欲、暴怒（处置）；闪避技「预知」为忧郁。攻击附带烧伤 + 震颤，触发震颤爆发。',
  mech:['卢西奥在场时瓦伦希娜受到的最终伤害 -50%','开场 30 层「预知之眼」，拼点越多越强，高点数闪避（预知）闪避成功后反击','卢西奥被击败（或瓦伦希娜 50% 血时卢西奥被强制撤退）→ 激活「狩猎时间」：标记随机罪人并使用红色不可摧毁硬币「处置」（目标 ≤50% 体力时伤害 +100%），每 4 回合一次','对护盾伤害大幅提高；受烧伤/流血/破裂/沉沦伤害 -30%'],mechSrc:['wv'],
  tips:['社区：不要过早击杀卢西奥，用弱人格拖住他，主力集中拼瓦伦希娜','社区：压低她的理智（如 Morositas 类 E.G.O）能削弱闪避；卢西奥援护防御时攻击可绕开闪避','社区：「处置」的目标用大点数 E.G.O / 狂暴（IRA）硬拼；持续伤害（烧伤、震颤等）不受闪避影响','社区：中指队、蜘蛛巢良秀（秀姐队）打她较轻松；15F 普遍被认为最难'],tipSrc:['rd1','rd2','rd3','op1','op2'],
  conflict:'有玩家建议「第 3 回合前先秒掉卢西奥，否则二人一起成长」（Reddit rd3），与「不要过早击杀卢西奥」的主流建议相反。'},
 '蜘蛛巢的食指':{who:'食指父辈·里恩',ally:'无（单独出场）',img:'assets/hidden/rien.webp',cue:{icon:'',txt:'节点下方【无弱点图标】——与环指无法区分',st:'part'},cueSrc:['hj','wgmd','gf','op1'],
  cueNote:'进入后只有里恩一人（无子辈）即可确认是食指；但 wiki.gg 称进入隐藏节点后不可放弃战斗。数据显示里恩斩击/暴怒/色欲 ×1.2，但两家维基与玩家均称节点不显示图标，原因未知。',
  stats:['里恩 Lv85 · HP 635 · 速度 1~2 · 混乱阈值 60%','耐性：斩击 ×1.2 / 突刺 ×0.9 / 打击 ×0.9；暴怒 ×1.2、色欲 ×1.2，其余 ×1.0'],statSrc:['wr'],
  dmg:'斩击/突刺/打击三种都有；罪孽：暴食、傲慢、忧郁；大招「Furioso-复刻」为暴怒·斩击。',
  mech:['每回合给随机罪人施加「指令的目标」并优先攻击；目标残 1 血可转移攻击','按「指令恩典」或 95%/85%/75% 体力逐级「解放」，提升强度','受非拼点攻击伤害 -50%；受烧伤/流血/震颤/破裂/沉沦伤害 -50%','积满 9 层后打断轮换使用 Furioso-复刻（高伤）'],mechSrc:['wr'],
  tips:['社区：尽量在第 3 回合前把他打进混乱，否则大招伤害极高','社区：持续伤害与单方面攻击收益低，应以拼点取胜；没有常驻回血时风险很大','社区：11F 遇到时被部分玩家认为最难，后期相对温和'],tipSrc:['op1','rd3','rd4'],conflict:''},
 '蜘蛛巢的中指':{who:'中指父辈·马蒂亚斯',ally:'中指子辈·绮罗',img:'assets/hidden/matthias.webp',cue:{icon:'assets/hidden/pierce.webp',txt:'节点下方显示【突刺】弱点图标',st:'ok'},cueSrc:['hj','wgmd','gf','op1'],
  cueNote:'已证实：「突刺 = 中指」。数据佐证：马蒂亚斯突刺 ×1.2，绮罗突刺 ×1.25。',
  stats:['马蒂亚斯 Lv85 · HP 500 · 速度 3~4 · 混乱阈值 35%','耐性：斩击 ×1.0 / 突刺 ×1.2（弱）/ 打击 ×0.8；七罪全 ×1.0','绮罗 Lv65 · HP 400 · 突刺 ×1.25'],statSrc:['wm','wk'],
  dmg:'前期几乎全为打击（暴怒、嫉妒、傲慢）；莱瓦汀解封后加入斩击/突刺。绮罗为打击 + 斩击。',
  mech:['「封印之剑」共 4 阶段，约 80% / 50% 体力时逐级解封，技能全面变强','每被 2 个技能命中 +1「仇怨」，满层释放强力攻击；有反击技「犯规！！」','开场对全体罪人施加「复仇账簿」；受烧伤/流血/震颤/破裂伤害 -30%，混乱阈值抬升 -50%','「荒谬的毅力」按已损失体力减伤'],mechSrc:['wm'],
  tips:['社区：本质是输出竞速，在他完全解封前击杀','社区：他的红色不可摧毁硬币——拼点赢后再攻击不会被反击；准备弱人格吃反击，带满 12 人','社区：避免选择降低防御等级相关的苦难；中指队打他最轻松'],tipSrc:['rd3','rd4','op1'],conflict:''},
 '蜘蛛巢的环指':{who:'环指父辈·卡利斯托',ally:'环指子辈·阿尔比娜',img:'assets/hidden/callisto.webp',cue:{icon:'',txt:'节点下方【无弱点图标】——与食指无法区分',st:'part'},cueSrc:['hj','wgmd','gf','op1'],
  cueNote:'进入后有阿尔比娜同场即可确认是环指。数据显示卡利斯托与阿尔比娜都是打击/怠惰/暴食 ×1.2，但维基与玩家均称节点不显示图标，原因未知。',
  stats:['卡利斯托 Lv83 · HP 626 · 速度 1~3 · 混乱阈值 70%','耐性：斩击 ×0.8 / 突刺 ×1.0 / 打击 ×1.2；怠惰、暴食 ×1.2，色欲、忧郁 ×0.8','阿尔比娜 Lv65 · HP 417 · 耐性同上'],statSrc:['wc','wa'],
  dmg:'主要为斩击（暴食、色欲、傲慢、暴怒），装置艺术为突刺·色欲；闪避技「策展」为怠惰。',
  mech:['技能命中积累「人体素材（骨/血）」，凑满后获得「作品-胫骨」，下回合释放大招「胫骨的旋律」','回合结束对速度最快的罪人施加「素材剥落伤口」','受流血伤害 -50%，受烧伤/震颤/破裂/沉沦伤害 -30%；混乱后回合开始立即恢复'],mechSrc:['wc'],
  tips:['社区：四个中普遍被认为最温和，但大招仍危险','社区：群攻 E.G.O 有效；低层遇到可优先打'],tipSrc:['rd4','rd3','op1'],conflict:''}};
const srcLinks=ks=>ks.map(k=>HB_SRC[k]?`<a target="_blank" href="${HB_SRC[k][0]}">${esc(HB_SRC[k][1])}</a>`:'').join(' · ');
function hbCard(h){const I=HB_INFO[h.boss]||{};const on=sel.size?(sel.has(h.g.keyword||'未录入')?'hit':'dim'):'';const c=I.cue||{};
 return `<div class="hbc ${on}"><div class="hbtop">${I.img?`<img class="hbp" src="${I.img}" alt="" onerror="this.remove()">`:''}<div class="hbm"><div class="hbn">${esc(h.boss)} · ${esc(I.who||'')}</div><div class="hint">同行：${esc(I.ally||'未录入')}</div>
 <div class="hbcue ${c.st||''}">${c.icon?`<img src="${c.icon}" alt="">`:'<span class="noicon">—</span>'}<div><b>识别：</b>${esc(c.txt||'未录入')} <span class="tag ${c.st==='ok'?'r':'h'}">${c.st==='ok'?'多源确认':'无法事先区分'}</span><div class="hint">${esc(I.cueNote||'')}</div><div class="hsrc">来源：${srcLinks(I.cueSrc||[])}</div></div></div>
 <div class="hbrw" data-gid="${h.g.id}" onclick="showGift('${h.g.id}')">${gIcon(h.g)}<div><div class="t">🎁 ${esc(h.g.name)}${tierTxt(h.g.tier)}</div><span class="tag">${esc(h.g.keyword)}</span>${h.g.cost?`<span class="tag">商店价 ${h.g.cost}</span>`:''}</div></div></div></div>
 <details class="hbd"><summary>数据 · 机制 · 打法</summary>
 <h5>📊 数据（名与蛛之镜 MD 版）</h5><ul>${(I.stats||[]).map(s=>`<li>${esc(s)}</li>`).join('')}</ul><div class="hsrc">来源：${srcLinks(I.statSrc||[])}</div>
 <h5>⚔ 伤害类型 / 罪孽</h5><p>${esc(I.dmg||'未录入')}</p>
 <h5>⚙ 关键机制 <small class="hint">（据 wiki.gg 英文资料意译，术语可能与国服译名不同）</small></h5><ul>${(I.mech||[]).map(s=>`<li>${esc(s)}</li>`).join('')}</ul><div class="hsrc">来源：${srcLinks(I.mechSrc||[])}</div>
 <h5>🛡 打法建议 <span class="tag h">社区经验·未验证</span></h5><ul>${(I.tips||[]).map(s=>`<li>${esc(s.replace(/^社区：/,''))}</li>`).join('')}</ul>${I.conflict?`<p class="hint warn">⚠ 说法冲突：${esc(I.conflict)}</p>`:''}<div class="hsrc">来源：${srcLinks(I.tipSrc||[])}</div></details></div>`}
function hiddenBlock(){return `<div class="floor hidden-boss"><h3>🎭 隐藏 Boss · ${HIDDEN.length} 个 <span class="tag h">上赛季数据</span> <span class="tag">筛选不隐藏</span></h3>
 <p class="hint warn" style="margin:8px 12px 0">⚠ 以下为名与蛛之镜（上赛季）的隐藏 Boss。官方公告：西西弗之镜极限模式的隐藏 Boss 将在之后的更新中实装，届时上赛季隐藏 Boss 饰品的部分效果会调整（<a target="_blank" href="${D.seasonInfo.notice}">公告</a>）。wiki.gg 西西弗之镜页面目前也未列出隐藏 Boss。</p>
 <div class="hbquick"><b>进入前识别速查：</b><span><img src="assets/hidden/envy.webp" alt="">嫉妒 → 拇指·瓦伦希娜</span><span><img src="assets/hidden/pierce.webp" alt="">突刺 → 中指·马蒂亚斯</span><span><i class="noicon">—</i>无图标 → 食指·里恩 或 环指·卡利斯托（进入后：单人=里恩，带阿尔比娜=卡利斯托）</span>
 <div class="hint">图标指节点下方的弱点提示。来源：${srcLinks(['hj','wgmd','gf'])}</div></div>
 <p class="hint" style="margin:8px 12px 0">11-15F 除楼层 Boss 与商店外的节点各有 10% 概率变为隐藏节点，每层最多 1 次（灰机）。击败后获得固定 IV 级饰品，并获得 1000 经费、全体罪人回满（wiki.gg）。<span class="warn">说法冲突：灰机称可以选择撤退战斗来避免交战，wiki.gg 称进入后不可放弃战斗——未核实。</span></p>
 <div class="hbgrid">${HIDDEN.map(hbCard).join('')}</div></div>`}
renderChips();
setMode(mode);
// pack view
const opt=(el,arr)=>el.innerHTML=arr.map(([v,t])=>`<option value="${esc(v)}">${esc(t)}</option>`).join('');
opt($('#pMode'),[['','全部难度'],...MODES.map((m,i)=>[i,m])]);opt($('#pFloor'),[['','全部楼层'],...[1,2,3,4,5].map(f=>[f,f+'F']),['6-10','6-10F（困难）'],['11-15','11-15F（困难）']]);
opt($('#pType'),[['','全部类型'],...[...new Set(D.packs.map(p=>p.type))].map(t=>[t,t])]);
function renderPacks(){const q=$('#pq').value.trim().toLowerCase(),m=$('#pMode').value,f=$('#pFloor').value,t=$('#pType').value;
 $('#packGrid').innerHTML=D.packs.filter(p=>{if(t&&p.type!==t)return false;
  if(m!==''||f){if(!p.floors.some(x=>(m===''||(m==='0'?x.modeIdx===0:x.modeIdx>=1))&&(!f||(f==='6-10'?x.modeIdx===2:f==='11-15'?x.modeIdx===3:(x.modeIdx<2&&x.floors.includes(+f))))))return false}
  if(q){const hay=(p.name+p.bosses.map(b=>b.name).join()+p.exclusive.map(i=>G[i]?.name).join()).toLowerCase();if(!hay.includes(q))return false}return true}).map(p=>packCard(p)).join('')}
['#pq','#pMode','#pFloor','#pType'].forEach(s=>$(s).oninput=renderPacks);renderPacks();
// gift view
const KW=[...new Set(D.gifts.map(g=>g.keyword))];opt($('#gKw'),[['','全部体系'],...KW.map(k=>[k,k])]);
opt($('#gTier'),[['','全部等级'],...[1,2,3,4,5,6].map(t=>[t,ROMAN[t]+'级']),['0','剧情(0)']]);
opt($('#gSin'),[['','全部罪孽'],...[...new Set(D.gifts.map(g=>g.sin).filter(Boolean))].map(s=>[s,s])]);
opt($('#gPack'),[['','全部专属卡包'],...D.packs.filter(p=>p.exclusive.length).map(p=>[p.id,p.name])]);
opt($('#gFloor'),[['','专属饰品所在楼层'],...[0,1].flatMap(m=>[1,2,3,4,5].map(f=>[m+'_'+f,MODES[m]+' '+f+'F'])),['2_','困难 6-10F'],['3_','困难 11-15F']]);
function fuzzy(h,q){if(h.includes(q))return 2;let i=0;for(const c of h){if(c===q[i])i++;if(i===q.length)return 1}return 0}
function renderGifts(){const q=$('#gq').value.trim().toLowerCase(),kw=$('#gKw').value,ti=$('#gTier').value,si=$('#gSin').value,pk=$('#gPack').value,fl=$('#gFloor').value,hd=$('#gHard').checked,md=$('#gMd').checked;
 let allow=null;if(pk)allow=new Set(P[pk].exclusive);
 if(fl){const[m,f]=fl.split('_');const s=new Set();D.packs.forEach(p=>{if(p.floors.some(x=>x.modeIdx==m&&(!f||x.floors.includes(+f))))p.exclusive.forEach(i=>s.add(i))});allow=allow?new Set([...allow].filter(i=>s.has(i))):s}
 let r=D.gifts.filter(g=>(!kw||g.keyword===kw)&&(ti===''||String(g.tier)===ti)&&(!si||g.sin===si)&&(!allow||allow.has(g.id))&&(!hd||g.special)&&(!md||g.where.includes('镜像迷宫')));
 if(q){r=r.map(g=>[g,Math.max(fuzzy(g.name.toLowerCase(),q),...(g.aliases||[]).map(x=>x.includes(q)?2:0))*3+((g.desc+g.desc1+g.desc2).toLowerCase().includes(q)?1:0)]).filter(x=>x[1]).sort((a,b)=>b[1]-a[1]).map(x=>x[0])}
 $('#gCount').textContent=`共 ${r.length} 件饰品`;
 $('#giftGrid').innerHTML=r.slice(0,400).map(g=>`<div class="gc" onclick="showGift('${g.id}')" data-gid="${g.id}">${gIcon(g)}<div><div class="t">${esc(g.name)}${tierTxt(g.tier)}${newB(g)}${chgB(g)}</div>
 <div><span class="tag">${esc(g.keyword)}</span>${g.sin?`<span class="tag">${esc(g.sin)}</span>`:''}${g.special?`<span class="tag h">${esc(srcLabel(g))}</span>`:''}</div><div class="d">${esc(g.desc)}</div></div></div>`).join('')+(r.length>400?'<p class=hint>仅显示前400条，请缩小筛选范围</p>':'')}
['#gq','#gKw','#gTier','#gSin','#gPack','#gFloor','#gHard','#gMd'].forEach(s=>$(s).oninput=renderGifts);renderGifts();
// recipes
const mini=id=>{const g=G[id];return g?`<span class="mini"><span class="m" onclick="showGift('${id}')" data-gid="${id}"><img src="${g.img}" onerror="this.remove()">${esc(g.name)}</span></span>`:`<span class=tag>#${id} 未录入</span>`};
function recRow(r){return `<div class="rec"><span class="tag ${r.packLimited?'r':''}">${esc(r.group)}</span>${r.inputs.map(mini).join('<span class=op>＋</span>')}<span class="op">➜</span>${mini(r.output)}</div>`}
function renderRec(){const q=$('#rq').value.trim().toLowerCase();$('#recipeList').innerHTML=D.recipes.filter(r=>!q||[...r.inputs,r.output].some(i=>G[i]?.name.toLowerCase().includes(q))||r.group.includes(q)).map(recRow).join('')}
$('#rq').oninput=renderRec;renderRec();
// modals
function openM(h){hideTip();$('#mbody').innerHTML=h;$('#modal').classList.add('on')}function closeM(){$('#modal').classList.remove('on')}
$('#modal').onclick=e=>{if(e.target.id==='modal')closeM()};document.onkeydown=e=>{if(e.key==='Escape')closeM()};
function showGift(id){const g=G[id];const rs=D.recipes.filter(r=>r.output===id||r.inputs.includes(id));
 const ps=D.packs.filter(p=>p.exclusive.includes(id));
 openM(`<div class="mh">${gIcon(g)}<div><h2 style="margin:0">${esc(g.name)}${tierTxt(g.tier)}${newB(g)}${chgB(g)}</h2>${g.changed?`<div class="hint">本赛季调整：${esc(g.changed.join("；"))}（来源 Data:Egogift.json rev 150443）</div>`:""}
 <div><span class="tag">体系：${esc(g.keyword)}</span>${g.sin?`<span class="tag">罪孽：${esc(g.sin)}</span>`:''}${g.cost?`<span class="tag">商店价 ${g.cost}</span>`:''}${g.hardOnly?'<span class="tag h">困难限定</span>':''}</div>
 ${g.aliases?`<div class="hint">维基旧名：${g.aliases.map(esc).join('、')}</div>`:''}<div class="hint">出现地点：${esc(g.where||'未录入')}${g.event?' · '+esc(g.event):''}${g.special?' · 获得方式：'+esc(srcLabel(g)):''}</div></div></div>
 <div class="eff"><b>效果</b>\n${esc(g.desc||'未录入')}</div>${g.desc1?`<div class="eff"><b>强化+</b>\n${esc(g.desc1)}</div>`:''}${g.desc2?`<div class="eff"><b>强化++</b>\n${esc(g.desc2)}</div>`:''}
 ${REWARD_OF[id]?`<h4>🏆 11-15F 通关固定奖励</h4><div class="mini"><span class="m" onclick="showPack(${REWARD_OF[id].id})">${esc(REWARD_OF[id].name)}</span></div>`:''}
 ${ps.length?`<h4>专属卡包</h4><div class="mini">${ps.map(p=>`<span class="m" onclick="showPack(${p.id})">${esc(p.name)}</span>`).join('')}</div>`:''}
 ${rs.length?`<h4>合成配方</h4>${rs.map(recRow).join('')}`:''}
 ${giftEvents(id)}
 <p class="hint">来源：<a target="_blank" href="https://limbuscompany.huijiwiki.com/wiki/E.G.O%E9%A5%B0%E5%93%81">E.G.O饰品</a> / Data:Giftchoose.tabx · ID ${id}</p>`)}
function showPack(id){const p=P[id];const ex=p.exclusive.map(i=>G[i]).filter(Boolean);
 openM(`<div class="mh"><div class="ban" style="${p.img?`background-image:url('${p.img}')`:''}">${p.img?'':'<div class=ph>无卡包图</div>'}</div><div style="flex:1">
 <h2 style="margin:0">${esc(p.name)}${newB(p)}</h2>${p.isNew?'<div class="hint">西西弗之镜新增卡包（第十章相关）</div>':''}<div>${p.difficulty==='DIFFICULT'?'<span class="tag h">困难卡包</span>':'<span class="tag">普通卡包</span>'}<span class="tag r">${esc(p.type)}</span>${p.floors.length&&!p.floors.some(f=>f.modeIdx===0)?'<span class="tag h">仅困难模式</span>':''}${p.unrecordable?'<span class="tag">不计入图鉴</span>':''}</div>
 <h4>出现楼层</h4><div>${p.floors.map(f=>`<span class="tag">${fTag(f)}</span>`).join('')||'未录入'}</div>
 <h4>头目</h4><div>${p.bosses.map(b=>`<span class="tag">${esc(b.name)}</span>`).join('')||'未录入'}</div></div></div>
 ${REWARD[id]?`<h4>🏆 通关固定奖励 <small>（沿用上赛季数据，新赛季待确认）</small></h4><div class="ggrid"><div class="gc rwc" onclick="showGift('${REWARD[id].id}')" data-gid="${REWARD[id].id}">${gIcon(REWARD[id])}<div><div class="t">${esc(REWARD[id].name)}${tierTxt(REWARD[id].tier)}</div><span class="tag">${esc(REWARD[id].keyword)}</span><span class="tag h">击败关底 Boss 后自动获得</span><div class="d">${esc(REWARD[id].desc)}</div></div></div></div>`:''}
 <h4>⭐ 专属饰品（${ex.length}）</h4><div class="ggrid">${ex.map(g=>`<div class="gc" onclick="showGift('${g.id}')" data-gid="${g.id}">${gIcon(g)}<div><div class="t">${esc(g.name)}${tierTxt(g.tier)}</div><span class="tag">${esc(g.keyword)}</span><div class="d">${esc(g.desc)}</div></div></div>`).join('')||'<span class=hint>该卡包无专属饰品（仅通用饰品池）</span>'}</div>
 ${packEvents(id)}
 <p class="hint">通用饰品池 ${p.pool.length} 件 · 来源：<a target="_blank" href="${D.sources.themes}">Data:Mirrordungeon-theme-floor.json（oldid=133145）</a>、<a target="_blank" href="https://limbuscompany.huijiwiki.com/wiki/%E9%95%9C%E5%83%8F%E8%BF%B7%E5%AE%AB-%E6%95%8C%E6%96%B9%E6%95%B0%E6%8D%AE">镜像迷宫-敌方数据</a></p>`)}
// nav
document.querySelector('nav').onclick=e=>{const v=e.target.dataset.v;if(!v)return;document.querySelectorAll('nav button').forEach(b=>b.classList.toggle('on',b===e.target));document.querySelectorAll('.view').forEach(s=>s.classList.toggle('on',s.id==='v-'+v));location.hash=v;if(v==='floor')saveCats()};
function route(){const h=location.hash.slice(1),v=h.split('?')[0];const b=document.querySelector(`nav button[data-v="${v}"]`);
 if(b){document.querySelectorAll('nav button').forEach(x=>x.classList.toggle('on',x===b));document.querySelectorAll('.view').forEach(s=>s.classList.toggle('on',s.id==='v-'+v))}
 const qs=new URLSearchParams(h.split('?')[1]||'');if(v==='event')setTimeout(()=>{if(qs.has('k'))$('#eKind').value=qs.get('k');if(qs.has('q'))$('#eq').value=qs.get('q');if(qs.has('p'))$('#ePack').value=qs.get('p');renderEvents();if(qs.get('k')==='generic'){const el=document.getElementById('sec-generic');if(el)el.scrollIntoView({block:'start'})}},0)
 if(v==='floor'&&qs.has('m')){const r=normMode(qs.get('m'));pendingSec=r.sec;setMode(r.m,r.sec);saveCats()}
 if(v==='floor'&&qs.has('c')){sel=new Set(qs.get('c').split(',').filter(k=>CATS.some(c=>c.k===k)));saveCats();renderChips();renderFloor()}if(qs.get('q')){$('#gq').value=qs.get('q');renderGifts()}}
window.addEventListener('hashchange',route);route();

// hover tooltip
const tip=document.createElement('div');tip.id='tip';tip.setAttribute('role','tooltip');document.body.appendChild(tip);
let tipT=0,tipEl=null,mx=0,my=0,lastTouch=0;
const canHover=()=>matchMedia('(hover:hover) and (pointer:fine)').matches&&Date.now()-lastTouch>800;
function tipHTML(id){const g=G[id];if(!g)return '';
 const made=D.recipes.filter(r=>r.output===id),used=D.recipes.filter(r=>r.inputs.includes(id));
 const nm=i=>esc(G[i]?.name||('#'+i));
 return `<div class="th">${gIcon(g)}<div><div class="tn">${esc(g.name)}${tierTxt(g.tier)}${newB(g)}${chgB(g)}</div>
 <div><span class="tag">体系：${esc(g.keyword||'未录入')}</span>${g.sin?`<span class="tag">罪孽：${esc(g.sin)}</span>`:''}${g.cost?`<span class="tag">商店价 ${g.cost}</span>`:''}${g.hardOnly?'<span class="tag h">困难限定</span>':''}</div>
 ${g.aliases?`<div class="tm">维基旧名：${g.aliases.map(esc).join('、')}</div>`:''}${g.where||g.event?`<div class="tm">出现：${esc(g.where||'')}${g.event?' · '+esc(g.event):''}</div>`:''}</div></div>
 <div class="td">${esc(g.desc||'效果未录入')}</div>${g.desc1?`<div class="tl">强化+</div><div class="td">${esc(g.desc1)}</div>`:''}${g.desc2?`<div class="tl">强化++</div><div class="td">${esc(g.desc2)}</div>`:''}
 ${g.packs&&g.packs.length?`<div class="tl">⭐ 专属卡包</div><div class="tm">${g.packs.map(esc).join('、')}</div>`:''}
 ${g.special&&!(g.packs&&g.packs.length)?`<div class="tl">${REWARD_OF[id]?'🏆 获得方式':'获得方式'}</div><div class="tm">${esc(srcLabel(g))}</div>`:''}
 ${made.length?`<div class="tl">合成配方</div>${made.map(r=>`<div class="tm">${r.inputs.map(nm).join(' ＋ ')} ➜ <b>${nm(r.output)}</b>${r.packLimited?' <span class="tag r">卡包限定</span>':''}</div>`).join('')}`:''}
 ${used.length?`<div class="tl">可作为材料（${used.length}）</div>${used.slice(0,4).map(r=>`<div class="tm">${r.inputs.map(nm).join(' ＋ ')} ➜ <b>${nm(r.output)}</b></div>`).join('')}${used.length>4?`<div class="tm">…另有 ${used.length-4} 个，点击查看详情</div>`:''}`:''}
 <div class="tf">点击查看详情</div>`}
function placeTip(){if(!tip.classList.contains('on'))return;const W=innerWidth,Hh=innerHeight,r=tip.getBoundingClientRect(),o=14;
 let x=mx+o,y=my+o;if(x+r.width>W-6)x=mx-o-r.width;if(x<6)x=Math.max(6,W-6-r.width);
 if(y+r.height>Hh-6)y=my-o-r.height;if(y<6)y=Math.max(6,Hh-6-r.height);tip.style.left=x+'px';tip.style.top=y+'px'}
function hideTip(){clearTimeout(tipT);tipEl=null;tip.classList.remove('on')}
document.addEventListener('touchstart',()=>{lastTouch=Date.now();hideTip()},{passive:true});
document.addEventListener('mouseover',e=>{const el=e.target.closest('[data-gid]');if(el===tipEl)return;hideTip();if(!el||!canHover()||!G[el.dataset.gid])return;
 tipEl=el;mx=e.clientX;my=e.clientY;tipT=setTimeout(()=>{if(tipEl!==el)return;tip.innerHTML=tipHTML(el.dataset.gid);tip.classList.add('on');tip.style.left='-9999px';placeTip()},280)});
document.addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;placeTip()},{passive:true});
document.addEventListener('mouseout',e=>{if(tipEl&&!tipEl.contains(e.relatedTarget))hideTip()});
['scroll','mousedown','keydown','blur'].forEach(t=>addEventListener(t,hideTip,{passive:true,capture:true}));

// ===== 事件 (v7) =====
const EV=(D.events||[]).map((e,i)=>Object.assign(e,{i}));
const EVURL='https://limbuscompany.huijiwiki.com/wiki/';
const evLine=t=>esc(t).replace(/⟦o:([^⟧]*)⟧/g,'<span class="eo">$1</span>').replace(/⟦ok⟧/g,'<span class="eok">成功</span>').replace(/⟦ng⟧/g,'<span class="eng">失败</span>')
 .replace(/⟦s:([^⟧]*)⟧/g,'<span class="esin">$1</span>').replace(/⟦u:([^⟧]*)⟧/g,'<span class="eitem" title="道具/效果：未在饰品数据中">$1</span>')
 .replace(/⟦g:(\d+)⟧/g,(m,id)=>{const g=G[id];return g?`<span class="eg" data-gid="${id}" onclick="event.stopPropagation();showGift('${id}')"><img src="${g.img}" onerror="this.remove()">${esc(g.name)}</span>`:`<span class="tag">#${id} 未录入</span>`});
const evKindTag=e=>e.kind==='exclusive'?'<span class="tag r">主题包专属</span>':`<span class="tag">通用 · ${esc(e.group)}</span>`;
function evCard(e,open,why){const gs=e.gifts.map(i=>G[i]).filter(Boolean);
 return `<details class="ev ${e.isNew?'evnew':''}" ${open?'open':''}><summary>${e.img?`<img class="evt" loading="lazy" src="${e.img}" onerror="this.remove()">`:'<div class="evt ph">无图</div>'}<div class="evs"><div class="evn">${esc(e.name)}${e.isNew?NEW:''}${e.hasDetail?'':' <span class="tag h">未录入</span>'}</div>
 <div>${evKindTag(e)}${e.packs.map(p=>P[p]?`<span class="tag ep" onclick="event.preventDefault();event.stopPropagation();showPack(${p})">${esc(P[p].name)}</span>`:'').join('')}</div>
 ${why?`<div class="evm">匹配：${why.map(esc).join(' · ')}</div>`:''}${gs.length?`<div class="evg">${gs.map(g=>`<img src="${g.img}" data-gid="${g.id}" title="" onclick="event.preventDefault();event.stopPropagation();showGift('${g.id}')" onerror="this.remove()">`).join('')}</div>`:''}</div></summary>
 <div class="evb">${e.img?`<img class="evi" loading="lazy" src="${e.img}" onerror="this.remove()">`:''}<div class="evc">${e.hasDetail?e.lines.map(l=>`<div class="el d${Math.min(l.d,4)}">${evLine(l.t)}</div>`).join(''):`<p class="hint">维基「探索事件」页尚未录入该事件（ID ${e.id}）的名称、选项与奖励，此处不做推测。</p>`}
 <p class="hint">来源：<a target="_blank" href="${EVURL}%E6%8E%A2%E7%B4%A2%E4%BA%8B%E4%BB%B6">探索事件</a>${e.page?` · <a target="_blank" href="${EVURL}${encodeURIComponent(e.page)}">${esc(e.page)}</a>`:''}${e.id?` · ID ${e.id}`:''}${e.how==='section'?' · 卡包归属依据维基「活动卡包」分节':e.how==='pool'?' · 卡包归属依据主题包数据 specialEventPool':''}</p></div></div></details>`}
function packEvents(id){const es=EV.filter(e=>e.kind==='exclusive'&&e.packs.includes(+id));
 return `<h4>🎲 主题包事件（${es.length}）<small>仅本卡包专属</small></h4>${es.length?`<div class="evl">${es.map(e=>evCard(e)).join('')}</div>`:'<div class="hint">维基未记载该卡包的专属事件（可能只出现通用事件）。</div>'}
 <div class="hint"><span class="elink" onclick="closeM();location.hash='event?k=generic'">另可能遇到通用事件（${EV.filter(e=>e.kind==='generic').length}） →</span></div>`}
function giftEvents(id){const es=EV.filter(e=>e.gifts.includes(String(id)));if(!es.length)return '';
 return `<h4>🎲 可从事件获得</h4><div class="mini">${es.map(e=>`<span class="m" onclick="showEvent(${e.i})">${esc(e.name)}${e.kind==='exclusive'?' · '+esc(e.packs.map(p=>P[p]?.name).filter(Boolean).join('/')):' · 通用'}</span>`).join('')}</div>`}
function showEvent(i){openM(evCard(EV[i],true))}
(()=>{const ps=[...new Set(EV.filter(e=>e.kind==='exclusive').flatMap(e=>e.packs))].filter(p=>P[p]).sort((a,b)=>(P[b].isNew?1:0)-(P[a].isNew?1:0)||a-b);
 opt($('#ePack'),[['','全部卡包'],...ps.map(p=>[p,P[p].name+(P[p].isNew?' (NEW)':'')])])})();
const SN=s=>String(s||'').toLowerCase().replace(/[\s·・:：—\-–_,，.。、\/|()（）「」『』【】\[\]!！?？~～'"“”]+/g,'');
const famBase=n=>SN(n).replace(/复刻$/,'');
function evMatch(e,qn,mp){const r=[];
 const pk=e.kind==='exclusive'?e.packs.filter(p=>mp.has(p)):[];if(pk.length)r.push('卡包「'+pk.map(p=>P[p].name).join(' / ')+'」');
 if(SN(e.name).includes(qn))r.push('事件名');
 const gs=e.gifts.filter(i=>G[i]&&[G[i].name,...(G[i].aliases||[])].some(x=>SN(x).includes(qn)));if(gs.length)r.push('奖励饰品「'+gs.map(i=>G[i].name+((G[i].aliases||[]).some(x=>SN(x).includes(qn))&&!SN(G[i].name).includes(qn)?'（旧名 '+G[i].aliases.join('/')+'）':'')).join('、')+'」');
 if(!r.length&&SN(e.lines.map(l=>l.t.replace(/⟦g:(\d+)⟧/g,(m,i)=>G[i]?.name||'').replace(/⟦[^⟧]*⟧/g,'')).join('|')).includes(qn))r.push('选项文本');
 return r}
function renderEvents(){const q=$('#eq').value.trim(),qn=SN(q),pk=$('#ePack').value,k=$('#eKind').value;
 let mp=new Set(),mpList=[];
 if(qn){const hit=D.packs.filter(p=>SN(p.name).includes(qn));const bases=new Set(hit.map(p=>famBase(p.name)));
  D.packs.forEach(p=>{if(bases.has(famBase(p.name)))mp.add(p.id)});mpList=D.packs.filter(p=>mp.has(p.id))}
 const M=new Map();
 const ok=e=>{if(k&&e.kind!==k)return false;if(pk&&!(e.kind==='exclusive'&&e.packs.includes(+pk)))return false;
  if(qn){const r=evMatch(e,qn,mp);if(!r.length)return false;M.set(e.i,r)}return true};
 const ex=EV.filter(e=>e.kind==='exclusive'&&ok(e)),ge=EV.filter(e=>e.kind==='generic'&&ok(e));
 const card=e=>evCard(e,!!qn,M.get(e.i));
 const byPack={};ex.forEach(e=>{const key=e.packs.map(p=>P[p]?.name).join(' / ');(byPack[key]=byPack[key]||{e:[],n:P[e.packs[0]]?.isNew}).e.push(e)});
 const byGrp={};ge.forEach(e=>(byGrp[e.group]=byGrp[e.group]||[]).push(e));
 const pkKeys=Object.keys(byPack).sort((a,b)=>(byPack[b].n?1:0)-(byPack[a].n?1:0));
 const pbox=mpList.length?`<div class="pmatch"><b>匹配到卡包（${mpList.length}）：</b>${mpList.map(p=>{const n=EV.filter(e=>e.kind==='exclusive'&&e.packs.includes(p.id)).length;return `<span class="tag ep" onclick="showPack(${p.id})">${esc(p.name)}${p.isNew?' NEW':''}</span><small>${n?n+' 个专属事件':'维基未记载专属事件'}</small>`}).join(' ')}${mpList.some(p=>!EV.some(e=>e.kind==='exclusive'&&e.packs.includes(p.id)))?'<div class="hint">未记载专属事件的卡包，游戏中可能只出现通用事件。</div>':''}</div>`:'';
 const gm=qn?D.gifts.filter(g=>[g.name,...(g.aliases||[])].some(x=>SN(x).includes(qn))):[];const gNo=gm.filter(g=>!EV.some(e=>e.gifts.includes(String(g.id))));
 const gbox=gNo.length?`<div class="hint">另有同名/含该词的饰品 ${gNo.slice(0,8).map(g=>`<span class="eg" data-gid="${g.id}" onclick="showGift('${g.id}')"><img src="${g.img}" onerror="this.remove()">${esc(g.name)}</span>`).join('')}${gNo.length>8?` 等 ${gNo.length} 件`:''}：没有任何事件以其为奖励。</div>`:'';
 $('#eventList').innerHTML=pbox+gbox+((ex.length?`<div class="sec-h">🎲 主题包专属事件（${ex.length}）</div>`+pkKeys.map(kk=>`<div class="floor"><h3>${esc(kk)}${byPack[kk].n?NEW:''} <small>${byPack[kk].e.length} 个</small></h3><div class="evl">${byPack[kk].e.map(card).join('')}</div></div>`).join(''):'')
  +(ge.length?`<div class="sec-h" id="sec-generic">🌐 通用事件（${ge.length}）</div><p class="hint">不属于任何卡包专属池的事件，按维基「镜像迷宫」各赛季分节归类（表示该事件引入的赛季）。</p>`+Object.keys(byGrp).map(g=>`<div class="floor"><h3>通用 · ${esc(g)} <small>${byGrp[g].length} 个</small></h3><div class="evl">${byGrp[g].map(card).join('')}</div></div>`).join(''):'')
  ||'<p class="hint">没有匹配的事件。</p>');
 const full=EV.filter(e=>e.hasDetail).length;
 $('#eInfo').innerHTML=`共 ${EV.length} 个事件：主题包专属 ${EV.filter(e=>e.kind==='exclusive').length}、通用 ${EV.filter(e=>e.kind==='generic').length}；已录入选项/奖励 ${full}，未录入 ${EV.length-full}。当前显示 ${ex.length+ge.length}。来源：<a target="_blank" href="${EVURL}%E6%8E%A2%E7%B4%A2%E4%BA%8B%E4%BB%B6">探索事件</a>（rev 149995）+ 主题包数据 specialEventPool（rev 149992）。`}
['input','change'].forEach(t=>{$('#eq').addEventListener(t,renderEvents);});$('#ePack').onchange=renderEvents;$('#eKind').onchange=renderEvents;renderEvents();
