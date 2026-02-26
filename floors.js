// =====================================================
function showWeaponShrine(afterCb){
  const modal=document.getElementById('weapon-shrine-modal');
  const content=document.getElementById('weapon-shrine-content');
  const btns=document.getElementById('weapon-shrine-btns');
  const wep=player.equipped.weapon;

  if(!wep){
    content.innerHTML=`<p style="text-align:center;color:rgba(255,255,255,.5);font-style:italic;">You have no weapon equipped.<br>The shrine awaits a worthy offering.</p>`;
    btns.innerHTML=`<button class="btn" onclick="closeWeaponShrineSkip()">Continue</button>`;
    window._weaponShrineAfterCb=afterCb;
    modal.classList.remove('hidden');return;
  }

  const isBS=wep.rarity==='blankslate';
  const currentAffixes=wep.affixes||[];
  const maxA=isBS?(wep.maxAffixes||7):1; // BS can hold up to 7, normal gets re-rolled

  content.innerHTML=`
    <div style="text-align:center;margin-bottom:12px;">
      <div style="display:flex;justify-content:center;margin-bottom:8px;">${drawWeaponSVG(wep.typeName||wep.name,getWeaponColor(wep.rarity),28)}</div>
      <div style="font-family:'Cinzel',serif;font-size:14px;color:${RARITIES[wep.rarity]?.color||'#fff'};">${wep.name}</div>
      <div style="font-size:11px;color:rgba(255,255,255,.5);margin-top:4px;">ATK ${wep.minVal}–${wep.maxVal}</div>
    </div>
    <div style="font-size:12px;color:rgba(255,255,255,.6);text-align:center;margin-bottom:10px;">
      ${isBS?`Affixes: ${currentAffixes.length}/${maxA} — add a new one`:`The shrine will re-roll <b>one</b> of this weapon's affixes`}
    </div>
    ${currentAffixes.map(a=>`<div class="affix-row ${a.positive?'affix-pos':'affix-neg'}">${a.label}: ${a.desc}</div>`).join('')}
    ${isBS&&currentAffixes.length>=maxA?`<div style="text-align:center;color:#e88;font-size:12px;margin-top:8px;">All affix slots filled. No room to add more.</div>`:''}
  `;

  btns.innerHTML='';
  window._weaponShrineAfterCb=afterCb;

  if(isBS&&currentAffixes.length>=maxA){
    const skip=document.createElement('button');skip.className='btn';skip.textContent='Continue';skip.onclick=closeWeaponShrineSkip;btns.appendChild(skip);
    modal.classList.remove('hidden');return;
  }

  if(isBS){
    // Blank slate: just add a new affix
    const reforgeBtn=document.createElement('button');
    reforgeBtn.className='btn';
    reforgeBtn.textContent='Add Affix';
    reforgeBtn.onclick=()=>{
      const pool=ALL_AFFIXES.filter(a=>!currentAffixes.find(x=>x.id===a.id));
      const newAffix=pool[rand(0,pool.length-1)];
      wep.affixes.push(newAffix);
      log(`⚗️ <b>${wep.name}</b> gained: <span class="${newAffix.positive?'perk-positive':'perk-negative'}">${newAffix.label}</span>`,'log-perk');
      updateHUD();closeWeaponShrineSkip();
    };
    btns.appendChild(reforgeBtn);
  } else {
    // Normal weapon: show a reroll button PER affix so player picks which one to replace
    if(currentAffixes.length===0){
      const addBtn=document.createElement('button');addBtn.className='btn';addBtn.textContent='Add Affix';
      addBtn.onclick=()=>{
        const pool=ALL_AFFIXES.slice();
        const newAffix=pool[rand(0,pool.length-1)];
        wep.affixes=[newAffix];
        log(`⚗️ <b>${wep.name}</b> gained affix: <span class="${newAffix.positive?'perk-positive':'perk-negative'}">${newAffix.label}</span>`,'log-perk');
        updateHUD();closeWeaponShrineSkip();
      };
      btns.appendChild(addBtn);
    } else {
      // One reroll button per affix
      currentAffixes.forEach((affix, idx)=>{
        const btn=document.createElement('button');
        btn.className='btn';
        btn.style.cssText='font-size:11px;padding:7px 14px;margin:3px;display:block;width:100%;text-align:left;';
        btn.innerHTML=`🎲 Re-roll: <span class="${affix.positive?'perk-positive':'perk-negative'}">${affix.label}</span>`;
        btn.onclick=()=>{
          const pool=ALL_AFFIXES.filter(a=>!currentAffixes.find(x=>x.id===a.id));
          const newAffix=pool[rand(0,pool.length-1)];
          const old=wep.affixes[idx];
          wep.affixes[idx]=newAffix;
          log(`⚗️ <b>${wep.name}</b>: <span class="${old.positive?'perk-positive':'perk-negative'}">${old.label}</span> → <span class="${newAffix.positive?'perk-positive':'perk-negative'}">${newAffix.label}</span>`,'log-perk');
          updateHUD();closeWeaponShrineSkip();
        };
        btns.appendChild(btn);
      });
    }
  }

  const skip=document.createElement('button');skip.className='btn danger';skip.textContent='Leave Shrine';skip.onclick=closeWeaponShrineSkip;btns.appendChild(skip);
  modal.classList.remove('hidden');
}

function closeWeaponShrineSkip(){
  document.getElementById('weapon-shrine-modal').classList.add('hidden');
  if(window._weaponShrineAfterCb){window._weaponShrineAfterCb();window._weaponShrineAfterCb=null;}
}

// =====================================================
// PERK ALTAR SHOP
// =====================================================
function showPerkAltarShop(){
  document.getElementById('perk-altar-modal').classList.remove('hidden');
  renderPerkAltarList();
}
function closePerkAltar(){document.getElementById('perk-altar-modal').classList.add('hidden');}

function renderPerkAltarList(){
  document.getElementById('altar-gold-display').textContent=player.gold;
  document.getElementById('altar-perks-count').textContent=altarPurchasedCount;
  const list=document.getElementById('perk-altar-list');
  list.innerHTML='';

  if(altarPurchasedCount>=5){
    list.innerHTML=`<p style="text-align:center;color:rgba(255,255,255,.4);font-style:italic;">You have reached the maximum of 5 purchased perks.</p>`;
    return;
  }

  const nextCost=ALTAR_PERK_COSTS[altarPurchasedCount];
  const canAfford=player.gold>=nextCost;

  // Show all shrine perks as purchasable options
  SHRINE_PERKS.forEach(perk=>{
    const alreadyHas=player.perks.find(p=>p.id===perk.id);
    const row=document.createElement('div');
    row.className='perk-altar-row';
    const effects=Object.entries(perk.effects).map(([k,v])=>{
      if(k==='regenPerFloor') return `<span class="perk-positive">+${v} HP/floor</span>`;
      if(k==='luckBonus')     return `<span class="perk-positive">Luck +${v}</span>`;
      if(k==='critBonus')     return `<span class="perk-positive">Crit +${v}%</span>`;
      if(k==='lifestealBonus')return `<span class="perk-positive">Lifesteal +${v}%</span>`;
      if(k==='statusResist')  return `<span class="perk-positive">Resist +${v}%</span>`;
      if(k==='executioner')   return `<span class="perk-positive">Execute +${v}%</span>`;
      if(k==='maxManaBonus')  return `<span class="perk-positive">Max Mana +${v}</span>`;
      if(k==='maxHp')  return v>0?`<span class="perk-positive">Max HP +${v}</span>`:`<span class="perk-negative">Max HP ${v}</span>`;
      if(k==='hp')     return v>0?`<span class="perk-positive">HP +${v}</span>`:`<span class="perk-negative">HP ${v}</span>`;
      if(k==='atk')    return v>0?`<span class="perk-positive">ATK +${v}</span>`:`<span class="perk-negative">ATK ${v}</span>`;
      if(k==='def')    return v>0?`<span class="perk-positive">DEF +${v}</span>`:`<span class="perk-negative">DEF ${v}</span>`;
      if(k==='spd')    return v>0?`<span class="perk-positive">SPD +${v}</span>`:`<span class="perk-negative">SPD ${v}</span>`;
      return v>0?`<span class="perk-positive">${k} +${v}</span>`:`<span class="perk-negative">${k} ${v}</span>`;
    }).join(' ');
    row.innerHTML=`<div>
      <div style="font-family:'Cinzel',serif;font-size:12px;color:${alreadyHas?'rgba(255,255,255,.3)':'var(--gold2)'};">${perk.name}</div>
      <div style="font-size:10px;color:rgba(255,255,255,.45);margin-top:2px;">${perk.desc}</div>
      <div style="font-size:10px;margin-top:2px;">${effects}</div>
    </div>
    <button class="btn" style="font-size:11px;padding:8px 12px;min-width:80px;white-space:nowrap;" ${(alreadyHas||!canAfford)?'disabled':''} onclick="buyAltarPerk('${perk.id}')">
      ${alreadyHas?'Owned':canAfford?`${nextCost}💰`:`${nextCost}💰`}
    </button>`;
    list.appendChild(row);
  });

  const note=document.createElement('div');
  note.style.cssText='text-align:center;font-size:11px;color:rgba(255,255,255,.3);margin-top:8px;font-style:italic;';
  note.textContent=`Next perk cost: ${nextCost}💰 · Slots remaining: ${5-altarPurchasedCount}`;
  list.appendChild(note);
}

function buyAltarPerk(perkId){
  const perk=SHRINE_PERKS.find(p=>p.id===perkId);
  if(!perk) return;
  const cost=ALTAR_PERK_COSTS[altarPurchasedCount];
  if(player.gold<cost||altarPurchasedCount>=5) return;
  player.gold-=cost;
  altarPurchasedCount++;
  applyPerk(perk);
  log(`🏛 Purchased perk: <b>${perk.name}</b> for ${cost}💰`,'log-perk');
  renderPerkAltarList();
  document.getElementById('merchant-gold').textContent=player.gold;
}

// =====================================================
// POST-ROOM REWARD
// =====================================================
function showPostRoomReward(fled){
  const modal=document.getElementById('reward-modal');
  const choices=document.getElementById('reward-choices');choices.innerHTML='';
  const effMaxHp=getEffectiveMaxHp();
  const hpPct=player.hp/effMaxHp*100;
  const hpColor=hpPct<25?'#c0392b':hpPct<55?'#e67e22':'#27ae60';
  document.getElementById('reward-hp-display').innerHTML=`<div style="text-align:center;font-size:12px;margin-bottom:4px;color:${hpColor};">HP: ${player.hp} / ${effMaxHp}</div><div style="height:8px;background:rgba(0,0,0,.5);border:1px solid rgba(255,255,255,.1);overflow:hidden;"><div style="height:100%;width:${hpPct}%;background:${hpColor};transition:width .3s;"></div></div>`;

  // Full reward pool — weighted by rarity
  const allRewards=[
    // Healing — only available when hurt, rarer at higher HP
    ...(hpPct<90?[{icon:'💉',name:'Field Dressing',desc:'Bind your wounds. Recover some HP.',weight:hpPct<40?4:2,fn:()=>{
      const h=Math.round(getEffectiveMaxHp()*.2);player.hp=Math.min(getEffectiveMaxHp(),player.hp+h);
      updateHUD();showRewardResult('💉','Wounds Bound',`+${h} HP restored.`);}}]:[]),
    ...(hpPct<70?[{icon:'🩹',name:'Healing Salve',desc:'Apply the salve. Recover a good chunk of HP.',weight:hpPct<40?5:3,fn:()=>{
      const h=Math.round(getEffectiveMaxHp()*.35);player.hp=Math.min(getEffectiveMaxHp(),player.hp+h);
      updateHUD();showRewardResult('🩹','Salve Applied',`+${h} HP restored.`);}}]:[]),
    ...(hpPct<40&&Math.random()<.4?[{icon:'💖',name:'Full Recovery',desc:'Restore all HP to maximum.',weight:3,fn:()=>{
      const emh=getEffectiveMaxHp();player.hp=emh;updateHUD();showRewardResult('💖','Fully Recovered',`HP restored to ${emh}.`);}}]:[]),
    {icon:'💰',name:'Loot the Corpse',desc:'Rummage through the remains for coin.',weight:3,fn:()=>{
      const g=10+currentFloor*4;player.gold+=g;updateHUD();showRewardResult('💰','Coin Found',`+${g} gold added to your purse.`);}},
    {icon:'💎',name:'Hidden Cache',desc:'Pry loose a stone and find something stashed.',weight:2,fn:()=>{
      const g=20+currentFloor*8;player.gold+=g;updateHUD();showRewardResult('💎','Cache Discovered',`+${g} gold! Someone hid this well.`);}},
    {icon:'⚔️',name:'Blood Rush',desc:'ATK +6 until next floor.',weight:2,fn:()=>{
      player.tempBuffs=player.tempBuffs||{};player.tempBuffs.atk=(player.tempBuffs.atk||0)+6;
      updateHUD();showRewardResult('⚔️','Blood Rush','ATK +6 until the next floor.');}},
    {icon:'🛡️',name:'Iron Skin',desc:'DEF +5 until next floor.',weight:2,fn:()=>{
      player.tempBuffs=player.tempBuffs||{};player.tempBuffs.def=(player.tempBuffs.def||0)+5;
      updateHUD();showRewardResult('🛡️','Iron Skin','DEF +5 until the next floor.');}},
    {icon:'🙏',name:'Pray at Shrine',desc:'Choose one of 3 blessings from the gods.',weight:3,fn:()=>{
      closeRewardModal();showPerkChoice(()=>descendToNext());}},
    {icon:'📦',name:'Search the Room',desc:'Find a random item drop.',weight:4,fn:()=>{
      closeRewardModal();pendingLoot=generateItem(currentFloor);showLootModal(pendingLoot);
      rewardCallback=()=>descendToNext();}},
    {icon:'⚗️',name:'Rare Find',desc:'Find a rare or better item.',weight:2,fn:()=>{
      closeRewardModal();
      const rarities=['rare','rare','legendary'];
      const forced=rarities[rand(0,rarities.length-1)];
      const item=generateItem(currentFloor+2);item.rarity=forced;
      pendingLoot=item;showLootModal(pendingLoot);rewardCallback=()=>descendToNext();}},
    ...(player.maxMana>0?[{icon:'🔮',name:'Mana Surge',desc:'The arcane flows back. Mana restored.',weight:2,fn:()=>{
      const m=Math.round(player.maxMana*.6);player.mana=Math.min(player.maxMana,(player.mana||0)+m);
      updateHUD();showRewardResult('🔮','Mana Surge',`+${m} mana channeled back.`);}}]:[]),
    {icon:'⭐',name:'Moment of Clarity',desc:'Gain bonus XP from the encounter.',weight:2,fn:()=>{
      const xp=10+currentFloor*3;gainXP(xp);updateHUD();showRewardResult('⭐','Clarity',`+${xp} XP gained from the encounter.`);}},
    {icon:'🎲',name:'Gamble',desc:'Gain 0–60 gold. Could be nothing.',weight:2,fn:()=>{
      const g=rand(0,60);player.gold+=g;updateHUD();
      if(g>40) showRewardResult('🎲','Lucky Roll!',`+${g} gold. Fortune smiles on you.`);
      else if(g>15) showRewardResult('🎲','Modest Haul',`+${g} gold. Better than nothing.`);
      else if(g>0) showRewardResult('🎲','Slim Pickings',`+${g} gold. Barely worth the risk.`);
      else showRewardResult('🎲','Snake Eyes','Nothing. The dice are cold today.');}},
  ];

  // Weighted random pick of 3 unique rewards
  const weighted=[];
  allRewards.forEach(r=>{for(let i=0;i<(r.weight||1);i++) weighted.push(r);});
  const picked=[];
  const seen=new Set();
  let attempts=0;
  while(picked.length<3&&attempts<200){
    attempts++;
    const r=weighted[rand(0,weighted.length-1)];
    if(!seen.has(r.name)){seen.add(r.name);picked.push(r);}
  }

  picked.forEach(r=>choices.appendChild(makeRewardChoice(r.icon,r.name,r.desc,r.fn)));
  modal.classList.remove('hidden');
}
function makeRewardChoice(icon,name,desc,fn){
  const d=document.createElement('div');d.className='reward-choice';
  d.innerHTML=`<div class="reward-icon">${icon}</div><div class="reward-name">${name}</div><div class="reward-desc">${desc}</div>`;
  // Use pointer-events:none on children so clicks always hit the div
  d.querySelectorAll('*').forEach(el=>el.style.pointerEvents='none');
  d.onclick=fn;
  return d;
}
function showRewardResult(icon, title, desc){
  // Nuke all choice clicks immediately
  document.querySelectorAll('#reward-choices .reward-choice').forEach(el=>{
    el.onclick=null;
    el.style.pointerEvents='none';
  });
  document.getElementById('reward-choices').style.display='none';
  document.getElementById('reward-subtitle').style.display='none';
  document.getElementById('reward-result-icon').textContent=icon;
  document.getElementById('reward-result-title').textContent=title;
  document.getElementById('reward-result-desc').textContent=desc;
  document.getElementById('reward-result').style.display='block';
}
function rewardResultContinue(){
  closeRewardModal();
  descendToNext();
}
function closeRewardModal(){
  // Reset all state for next room
  document.getElementById('reward-result').style.display='none';
  document.getElementById('reward-choices').style.display='';
  document.getElementById('reward-subtitle').style.display='';
  document.getElementById('reward-modal').classList.add('hidden');
}

// =====================================================
// SHRINE PERK CHOICE
// =====================================================
function showPerkChoice(afterCb,titleOverride,subtitleOverride){
  perkCallback=afterCb;
  document.getElementById('perk-modal-title').textContent=titleOverride||'🙏 The Shrine Stirs...';
  document.getElementById('perk-modal-subtitle').textContent=subtitleOverride||'Choose one blessing — and accept its cost.';
  const container=document.getElementById('perk-choices');container.innerHTML='';
  const pool=[...SHRINE_PERKS].sort(()=>Math.random()-.5).slice(0,3);
  pool.forEach(perk=>{
    const d=document.createElement('div');d.className='perk-choice';
    const effects=Object.entries(perk.effects).map(([k,v])=>{
      if(k==='regenPerFloor') return `<span class="perk-positive">+${v} HP/floor</span>`;
      if(k==='luckBonus')     return `<span class="perk-positive">Luck +${v}</span>`;
      if(k==='critBonus')     return `<span class="perk-positive">Crit +${v}%</span>`;
      if(k==='lifestealBonus')return `<span class="perk-positive">Lifesteal +${v}%</span>`;
      if(k==='statusResist')  return `<span class="perk-positive">Status Resist +${v}%</span>`;
      if(k==='executioner')   return `<span class="perk-positive">Execute +${v}%</span>`;
      if(k==='maxManaBonus')  return `<span class="perk-positive">Max Mana +${v}</span>`;
      if(k==='maxHp')  return v>0?`<span class="perk-positive">Max HP +${v}</span>`:`<span class="perk-negative">Max HP ${v}</span>`;
      if(k==='hp')     return v>0?`<span class="perk-positive">HP +${v}</span>`:`<span class="perk-negative">HP ${v}</span>`;
      if(k==='atk')    return v>0?`<span class="perk-positive">ATK +${v}</span>`:`<span class="perk-negative">ATK ${v}</span>`;
      if(k==='def')    return v>0?`<span class="perk-positive">DEF +${v}</span>`:`<span class="perk-negative">DEF ${v}</span>`;
      if(k==='spd')    return v>0?`<span class="perk-positive">SPD +${v}</span>`:`<span class="perk-negative">SPD ${v}</span>`;
      return v>0?`<span class="perk-positive">${k} +${v}</span>`:`<span class="perk-negative">${k} ${v}</span>`;
    }).join('  ');
    d.innerHTML=`<div class="perk-choice-name">${perk.name}</div><div class="perk-choice-desc">${perk.desc}</div><div class="perk-choice-effects">${effects}</div>`;
    d.onclick=()=>{applyPerk(perk);document.getElementById('perk-modal').classList.add('hidden');if(perkCallback){perkCallback();perkCallback=null;}};
    container.appendChild(d);
  });
  document.getElementById('perk-modal').classList.remove('hidden');
}

function applyPerk(perk){
  player.perks.push(perk);
  if(perk.effects.maxHp){player.maxHp+=perk.effects.maxHp;if(perk.effects.maxHp<0) player.hp=Math.min(player.hp,player.maxHp);}
  if(perk.effects.hp) player.hp=Math.min(getEffectiveMaxHp(),player.hp+perk.effects.hp);
  if(perk.effects.maxManaBonus){player.maxMana=(player.maxMana||30)+perk.effects.maxManaBonus;player.mana=Math.min(player.mana||30,player.maxMana);}
  log(`🙏 Perk: <span class="log-perk"><b>${perk.name}</b></span>`,'log-perk');updateHUD();
}

// =====================================================
// DESCEND
// =====================================================
function descendToNext(){
  currentFloor++;player.deepestFloor=Math.max(player.deepestFloor,currentFloor);
  const ev=FLOOR_EVENTS[rand(0,FLOOR_EVENTS.length-1)];
  let evMsg=`🗝 <i>${ev.text}</i>`;
  switch(ev.type){
    case'gold':{const g=rand(ev.value[0],ev.value[1]);player.gold+=g;evMsg+=` <span style="color:var(--gold)">+${g}💰</span>`;break;}
    case'heal':{const h=rand(ev.value[0],ev.value[1]);player.hp=Math.min(getEffectiveMaxHp(),player.hp+h);evMsg+=` <span style="color:#4ec94e">+${h}HP</span>`;break;}
    case'buff_atk':player.atk+=ev.value;evMsg+=` <span style="color:var(--gold)">ATK+${ev.value} perm</span>`;break;
    case'buff_def':player.def+=ev.value;evMsg+=` <span style="color:var(--gold)">DEF+${ev.value} perm</span>`;break;
    case'buff_spd':player.spd+=ev.value;evMsg+=` <span style="color:var(--gold)">SPD+${ev.value} perm</span>`;break;
    case'xp':{const x=rand(ev.value[0],ev.value[1]);gainXP(x);evMsg+=` <span style="color:#a0c4ff">+${x}XP</span>`;break;}
    case'chest':pendingLoot=generateItem(currentFloor);setTimeout(()=>showLootModal(pendingLoot),1500);break;
  }
  updateHUD();
  saveGame(); // auto-save between rooms
  const prevFloor=currentFloor-1;
  const justClearedBoss=prevFloor%5===0;
  const t=document.getElementById('floor-transition');
  if(justClearedBoss){
    t.innerHTML=`<span style="font-size:20px;letter-spacing:3px;color:rgba(255,255,255,.4);">Descending...</span><span>Floor B${currentFloor}</span><span style="font-size:13px;opacity:.5;letter-spacing:2px;">${ev.text}</span>`;
  } else {
    t.innerHTML=`<span>Room ${currentFloor}</span><span style="font-size:13px;opacity:.5;letter-spacing:2px;">${ev.text}</span>`;
  }
  t.classList.add('show');
  setTimeout(()=>{t.classList.remove('show');startFloor();log(evMsg,'log-system');},1500);
}

// =====================================================
// MERCHANT
// =====================================================
const MERCHANT_GREETINGS=[
  {visits:0,msg:`"Welcome, stranger! Fine wares for a fine price."`},
  {visits:1,msg:`"Ah, back already? I've... adjusted prices for return customers."`},
  {visits:2,msg:`"You again! I'm starting to think you enjoy paying me."`},
  {visits:3,msg:`"Oh, it's you. I've had to restock twice now. Prices reflect that."`},
  {visits:4,msg:`"I know your face. My prices know it too. We're all friends here."`},
  {visits:5,msg:`"You're practically my best customer — which is why I charge you the most."`},
  {visits:6,msg:`"Again?! At this rate I could retire. Good for me. Expensive for you."`},
];

function getMerchantGreeting(){
  const v=gameState.merchantVisitCount||0;
  const best=MERCHANT_GREETINGS.filter(g=>g.visits<=v).pop()||MERCHANT_GREETINGS[0];
  return best.msg;
}

function getMerchantMarkup(){
  const v=gameState.merchantVisitCount||0;
  return 1+Math.min(v*0.10,0.80);
}

function showMerchant(){
  showScreen('merchant-screen');currentFloor++;
  gameState.merchantVisitCount=(gameState.merchantVisitCount||0)+1;
  const markup=getMerchantMarkup();
  document.getElementById('merchant-gold').textContent=player.gold;
  document.getElementById('merchant-greeting').textContent=getMerchantGreeting();
  if(markup>1) document.getElementById('merchant-markup-note').textContent=`⚠ Prices inflated ×${markup.toFixed(1)} (visit ${gameState.merchantVisitCount})`;
  else document.getElementById('merchant-markup-note').textContent='';
  merchantHasAltar=Math.random()<.01;
  document.getElementById('merchant-perk-altar').style.display=merchantHasAltar?'block':'none';

  const grid=document.getElementById('merchant-grid');grid.innerHTML='';
  const items=[];
  for(let i=0;i<4;i++) items.push(generateItem(currentFloor));
  CONSUMABLES.slice(0,4).forEach(c=>items.push({...c,rarity:'common',isConsumable:true,id:uid()}));
  if(Math.random()<.01) items.unshift(generateItem(currentFloor,false,true));

  items.forEach(item=>{
    const basePrice=item.sellPrice||20;
    const price=Math.round(basePrice*markup);
    const d=document.createElement('div');d.className='merchant-item';
    const rColor=RARITIES[item.rarity]?.color||'#fff';
    const weapSvg=(!item.isConsumable&&item.slot==='weapon')?`<div style="display:flex;justify-content:center;margin-bottom:4px;">${drawWeaponSVG(item.typeName||item.name,getWeaponColor(item.rarity),20)}</div>`:`<div class="merchant-icon">${item.icon}</div>`;
    let desc=item.isConsumable?item.desc:`${item.stat?.toUpperCase()} ${item.minVal}–${item.maxVal||item.value}`;
    const affixLine=item.affixes?.length?item.affixes.slice(0,2).map(a=>`<span style="color:${a.positive?'#4ec94e':'#e88'};font-size:9px;">${a.label}</span>`).join(' '):'';
    const markupNote=markup>1?`<div style="font-size:8px;color:rgba(255,150,50,.6);">+${Math.round((markup-1)*100)}% surcharge</div>`:'';
    d.innerHTML=`${weapSvg}<div class="merchant-name" style="color:${rColor}">${item.name}</div><div class="merchant-desc">${desc}${affixLine?'<br>'+affixLine:''}</div><div class="merchant-price">${price}💰</div>${markupNote}`;
    d.onclick=()=>{
      if(player.gold<price){
        d.style.animation='shake .3s ease';setTimeout(()=>d.style.animation='',400);
        showMerchantMsg(`You don't have enough gold! Need ${price}💰, have ${player.gold}💰.`,'#e88');
        return;
      }
      if(player.inventory.filter(i=>i).length>=(player.inventoryMax||8)){
        showMerchantMsg('Your pack is full! Drop or sell something first.','#e88');
        return;
      }
      player.gold-=price;player.inventory.push({...item,id:uid()});
      document.getElementById('merchant-gold').textContent=player.gold;
      d.style.opacity='.25';d.style.pointerEvents='none';
      showMerchantMsg(`Purchased ${item.name} for ${price}💰.`,'#4ec94e');
      updateHUD();
    };
    grid.appendChild(d);
  });

  renderMerchantSellPanel();
}

function showMerchantMsg(msg,color='#c9a84c'){
  let el=document.getElementById('merchant-msg');
  if(!el) return;
  el.textContent=msg;el.style.color=color;el.style.opacity='1';
  clearTimeout(el._t);el._t=setTimeout(()=>el.style.opacity='0',3000);
}

function renderMerchantSellPanel(){
  const panel=document.getElementById('merchant-sell-panel');
  if(!panel) return;
  const sellable=player.inventory.filter(i=>i&&i.sellPrice);
  if(!sellable.length){panel.innerHTML=`<div style="font-size:11px;color:rgba(255,255,255,.3);font-style:italic;text-align:center;padding:8px;">Nothing to sell.</div>`;return;}
  panel.innerHTML=sellable.map((item,i)=>{
    const sv=Math.round(item.sellPrice*.35);
    return`<div style="display:flex;justify-content:space-between;align-items:center;padding:5px 7px;margin-bottom:4px;background:rgba(0,0,0,.3);border:1px solid rgba(255,255,255,.06);font-size:12px;">
      <span>${item.icon||'📦'} ${item.name}</span>
      <button class="btn" style="font-size:10px;padding:3px 8px;" onclick="sellItemToMerchant(${player.inventory.indexOf(item)})">Sell ${sv}💰</button>
    </div>`;
  }).join('');
}

function sellItemToMerchant(invIdx){
  const item=player.inventory[invIdx];if(!item) return;
  const sv=Math.round(item.sellPrice*.35);
  player.gold+=sv;
  player.inventory.splice(invIdx,1);
  showMerchantMsg(`Sold ${item.name} for ${sv}💰.`,'#4ec94e');
  document.getElementById('merchant-gold').textContent=player.gold;
  renderMerchantSellPanel();updateHUD();
}
function leaveMerchant(){
  saveGame();
  const t=document.getElementById('floor-transition');
  t.innerHTML=`<span>Room ${currentFloor}</span>`;
  t.classList.add('show');setTimeout(()=>{t.classList.remove('show');startFloor();},1200);
}

// =====================================================
