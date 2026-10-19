const D=window.MD_DATA,G={},P={};D.gifts.forEach(g=>G[g.id]=g);D.packs.forEach(p=>P[p.id]=p);
const $=s=>document.querySelector(s),esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const ROMAN=['0','I','II','III','IV','V','VI'];const MODES=['普通','困难','平行叠加(6-10F)','极限(11-15F)'];
const img=(src,alt)=>src?`<img loading="lazy" src="${src}" alt="${esc(alt)}" onerror="this.outerHTML='<div class=ph>无图</div>'">`:`<div class="ph">无图</div>`;
const gIcon=g=>`<div class="gi">${img(g.img,g.name)}</div>`;
const tierTxt=t=>t?`<span class="tier">${ROMAN[t]||t}级</span>`:'<span class="tier">剧情</span>';
function packFloors(p){return p.floors.map(f=>`${f.mode} ${f.floors.length?f.floors.join('/')+'F':''}`).join('；')||'未录入'}
function packCard(p){const ex=p.exclusive.map(id=>G[id]).filter(Boolean);
 return `<div class="pc" onclick="showPack(${p.id})"><div class="ban" style="${p.img?`background-image:url('${p.img}')`:''}">${p.img?'':'<div class=ph>无卡包图</div>'}</div>
 <div class="nm">${esc(p.name)}</div><div style="padding:0 6px 4px">${p.difficulty==='DIFFICULT'?'<span class="tag h">困难</span>':''}${p.type!=='普通'?`<span class="tag r">${esc(p.type)}</span>`:''}</div>
 <div class="ex">${ex.map(g=>`<img title="⭐${esc(g.name)}" src="${g.img}" onerror="this.remove()">`).join('')}</div></div>`}
// floor view
let mode=0;const seg=$('#modeSeg');MODES.forEach((m,i)=>seg.insertAdjacentHTML('beforeend',`<button data-m="${i}" class="${i?'':'on'}">${m}</button>`));
seg.onclick=e=>{if(!e.target.dataset.m)return;mode=+e.target.dataset.m;seg.querySelectorAll('button').forEach(b=>b.classList.toggle('on',b===e.target));renderFloor()};
function renderFloor(){const fl=mode<2?[1,2,3,4,5]:(mode===2?['6-10']:['11-15']);
 $('#floorList').innerHTML=fl.map(F=>{const ps=D.packs.filter(p=>p.floors.some(f=>f.modeIdx===mode&&(typeof F==='string'||f.floors.includes(F))));
  const lim=ps.filter(p=>{const f=p.floors.find(f=>f.modeIdx===mode);return f&&f.floors.length===1&&mode<2});
  return `<div class="floor"><h3>${typeof F==='string'?F:F}F · ${ps.length} 个卡包 ${lim.length?`<small>（限定此层：${lim.map(p=>esc(p.name)).join('、')}）</small>`:''}</h3><div class="row">${ps.map(packCard).join('')||'<span class=hint>无</span>'}</div></div>`}).join('')}
renderFloor();
// pack view
const opt=(el,arr)=>el.innerHTML=arr.map(([v,t])=>`<option value="${esc(v)}">${esc(t)}</option>`).join('');
opt($('#pMode'),[['','全部模式'],...MODES.map((m,i)=>[i,m])]);opt($('#pFloor'),[['','全部楼层'],...[1,2,3,4,5].map(f=>[f,f+'F'])]);
opt($('#pType'),[['','全部类型'],...[...new Set(D.packs.map(p=>p.type))].map(t=>[t,t])]);
function renderPacks(){const q=$('#pq').value.trim().toLowerCase(),m=$('#pMode').value,f=$('#pFloor').value,t=$('#pType').value;
 $('#packGrid').innerHTML=D.packs.filter(p=>{if(t&&p.type!==t)return false;
  if(m!==''||f){if(!p.floors.some(x=>(m===''||x.modeIdx==m)&&(!f||x.floors.includes(+f))))return false}
  if(q){const hay=(p.name+p.bosses.map(b=>b.name).join()+p.exclusive.map(i=>G[i]?.name).join()).toLowerCase();if(!hay.includes(q))return false}return true}).map(packCard).join('')}
['#pq','#pMode','#pFloor','#pType'].forEach(s=>$(s).oninput=renderPacks);renderPacks();
// gift view
const KW=[...new Set(D.gifts.map(g=>g.keyword))];opt($('#gKw'),[['','全部体系'],...KW.map(k=>[k,k])]);
opt($('#gTier'),[['','全部等级'],...[1,2,3,4,5,6].map(t=>[t,ROMAN[t]+'级']),['0','剧情(0)']]);
opt($('#gSin'),[['','全部罪孽'],...[...new Set(D.gifts.map(g=>g.sin).filter(Boolean))].map(s=>[s,s])]);
opt($('#gPack'),[['','全部专属卡包'],...D.packs.filter(p=>p.exclusive.length).map(p=>[p.id,p.name])]);
opt($('#gFloor'),[['','专属饰品所在楼层'],...[0,1].flatMap(m=>[1,2,3,4,5].map(f=>[m+'_'+f,MODES[m]+' '+f+'F'])),['2_','平行叠加'],['3_','极限']]);
function fuzzy(h,q){if(h.includes(q))return 2;let i=0;for(const c of h){if(c===q[i])i++;if(i===q.length)return 1}return 0}
function renderGifts(){const q=$('#gq').value.trim().toLowerCase(),kw=$('#gKw').value,ti=$('#gTier').value,si=$('#gSin').value,pk=$('#gPack').value,fl=$('#gFloor').value,hd=$('#gHard').checked,md=$('#gMd').checked;
 let allow=null;if(pk)allow=new Set(P[pk].exclusive);
 if(fl){const[m,f]=fl.split('_');const s=new Set();D.packs.forEach(p=>{if(p.floors.some(x=>x.modeIdx==m&&(!f||x.floors.includes(+f))))p.exclusive.forEach(i=>s.add(i))});allow=allow?new Set([...allow].filter(i=>s.has(i))):s}
 let r=D.gifts.filter(g=>(!kw||g.keyword===kw)&&(ti===''||String(g.tier)===ti)&&(!si||g.sin===si)&&(!allow||allow.has(g.id))&&(!hd||g.special)&&(!md||g.where.includes('镜像迷宫')));
 if(q){r=r.map(g=>[g,fuzzy(g.name.toLowerCase(),q)*3+((g.desc+g.desc1+g.desc2).toLowerCase().includes(q)?1:0)]).filter(x=>x[1]).sort((a,b)=>b[1]-a[1]).map(x=>x[0])}
 $('#gCount').textContent=`共 ${r.length} 件饰品`;
 $('#giftGrid').innerHTML=r.slice(0,400).map(g=>`<div class="gc" onclick="showGift('${g.id}')">${gIcon(g)}<div><div class="t">${esc(g.name)}${tierTxt(g.tier)}</div>
 <div><span class="tag">${esc(g.keyword)}</span>${g.sin?`<span class="tag">${esc(g.sin)}</span>`:''}${g.special?`<span class="tag h">${esc(g.special)}</span>`:''}</div><div class="d">${esc(g.desc)}</div></div></div>`).join('')+(r.length>400?'<p class=hint>仅显示前400条，请缩小筛选范围</p>':'')}
['#gq','#gKw','#gTier','#gSin','#gPack','#gFloor','#gHard','#gMd'].forEach(s=>$(s).oninput=renderGifts);renderGifts();
// recipes
const mini=id=>{const g=G[id];return g?`<span class="mini"><span class="m" onclick="showGift('${id}')"><img src="${g.img}" onerror="this.remove()">${esc(g.name)}</span></span>`:`<span class=tag>#${id} 未录入</span>`};
function recRow(r){return `<div class="rec"><span class="tag ${r.packLimited?'r':''}">${esc(r.group)}</span>${r.inputs.map(mini).join('<span class=op>＋</span>')}<span class="op">➜</span>${mini(r.output)}</div>`}
function renderRec(){const q=$('#rq').value.trim().toLowerCase();$('#recipeList').innerHTML=D.recipes.filter(r=>!q||[...r.inputs,r.output].some(i=>G[i]?.name.toLowerCase().includes(q))||r.group.includes(q)).map(recRow).join('')}
$('#rq').oninput=renderRec;renderRec();
// modals
function openM(h){$('#mbody').innerHTML=h;$('#modal').classList.add('on')}function closeM(){$('#modal').classList.remove('on')}
$('#modal').onclick=e=>{if(e.target.id==='modal')closeM()};document.onkeydown=e=>{if(e.key==='Escape')closeM()};
function showGift(id){const g=G[id];const rs=D.recipes.filter(r=>r.output===id||r.inputs.includes(id));
 const ps=D.packs.filter(p=>p.exclusive.includes(id));
 openM(`<div class="mh">${gIcon(g)}<div><h2 style="margin:0">${esc(g.name)}${tierTxt(g.tier)}</h2>
 <div><span class="tag">体系：${esc(g.keyword)}</span>${g.sin?`<span class="tag">罪孽：${esc(g.sin)}</span>`:''}${g.cost?`<span class="tag">商店价 ${g.cost}</span>`:''}${g.hardOnly?'<span class="tag h">困难限定</span>':''}</div>
 <div class="hint">出现地点：${esc(g.where||'未录入')}${g.event?' · '+esc(g.event):''}${g.special?' · 获得方式：'+esc(g.special):''}</div></div></div>
 <div class="eff"><b>效果</b>\n${esc(g.desc||'未录入')}</div>${g.desc1?`<div class="eff"><b>强化+</b>\n${esc(g.desc1)}</div>`:''}${g.desc2?`<div class="eff"><b>强化++</b>\n${esc(g.desc2)}</div>`:''}
 ${ps.length?`<h4>专属卡包</h4><div class="mini">${ps.map(p=>`<span class="m" onclick="showPack(${p.id})">${esc(p.name)}</span>`).join('')}</div>`:''}
 ${rs.length?`<h4>合成配方</h4>${rs.map(recRow).join('')}`:''}
 <p class="hint">来源：<a target="_blank" href="https://limbuscompany.huijiwiki.com/wiki/E.G.O%E9%A5%B0%E5%93%81">E.G.O饰品</a> / Data:Giftchoose.tabx · ID ${id}</p>`)}
function showPack(id){const p=P[id];const ex=p.exclusive.map(i=>G[i]).filter(Boolean);
 openM(`<div class="mh"><div class="ban" style="${p.img?`background-image:url('${p.img}')`:''}">${p.img?'':'<div class=ph>无卡包图</div>'}</div><div style="flex:1">
 <h2 style="margin:0">${esc(p.name)}</h2><div>${p.difficulty==='DIFFICULT'?'<span class="tag h">困难卡包</span>':'<span class="tag">普通卡包</span>'}<span class="tag r">${esc(p.type)}</span>${p.unrecordable?'<span class="tag">不计入图鉴</span>':''}</div>
 <h4>出现楼层</h4><div>${p.floors.map(f=>`<span class="tag">${f.mode}：${f.floors.join('、')}F</span>`).join('')||'未录入'}</div>
 <h4>头目</h4><div>${p.bosses.map(b=>`<span class="tag">${esc(b.name)}</span>`).join('')||'未录入'}</div></div></div>
 <h4>⭐ 专属饰品（${ex.length}）</h4><div class="ggrid">${ex.map(g=>`<div class="gc" onclick="showGift('${g.id}')">${gIcon(g)}<div><div class="t">${esc(g.name)}${tierTxt(g.tier)}</div><span class="tag">${esc(g.keyword)}</span><div class="d">${esc(g.desc)}</div></div></div>`).join('')||'<span class=hint>该卡包无专属饰品（仅通用饰品池）</span>'}</div>
 <p class="hint">通用饰品池 ${p.pool.length} 件 · 来源：<a target="_blank" href="${D.sources.themes}">Data:Mirrordungeon-theme-floor.json（oldid=133145）</a>、<a target="_blank" href="https://limbuscompany.huijiwiki.com/wiki/%E9%95%9C%E5%83%8F%E8%BF%B7%E5%AE%AB-%E6%95%8C%E6%96%B9%E6%95%B0%E6%8D%AE">镜像迷宫-敌方数据</a></p>`)}
// nav
document.querySelector('nav').onclick=e=>{const v=e.target.dataset.v;if(!v)return;document.querySelectorAll('nav button').forEach(b=>b.classList.toggle('on',b===e.target));document.querySelectorAll('.view').forEach(s=>s.classList.toggle('on',s.id==='v-'+v));location.hash=v};
function route(){const h=location.hash.slice(1),v=h.split('?')[0];const b=document.querySelector(`nav button[data-v="${v}"]`);
 if(b){document.querySelectorAll('nav button').forEach(x=>x.classList.toggle('on',x===b));document.querySelectorAll('.view').forEach(s=>s.classList.toggle('on',s.id==='v-'+v))}
 const qs=new URLSearchParams(h.split('?')[1]||'');if(qs.get('q')){$('#gq').value=qs.get('q');renderGifts()}}
window.addEventListener('hashchange',route);route();
