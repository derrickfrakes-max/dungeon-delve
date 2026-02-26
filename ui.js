// LOOT MODAL
// =====================================================
function buildLootCompare(item){
  const rColor=RARITIES[item.rarity]?.color||'#fff';
  const wSvg=(!item.isConsumable&&item.slot==='weapon')?`<div style="display:flex;justify-content:center;margin-bottom:6px;">${drawWeaponSVG(item.typeName||item.name,getWeaponColor(item.rarity),26)}</div>`:'';
  const iconHtml=item.isConsumable?`<div style="font-size:32px;margin-bottom:4px;">${item.icon}</div>`:(item.slot!=='weapon'?`<div style="font-size:32px;margin-bottom:4px;">${item.icon}</div>`:wSvg);
  let stats='';
  if(item.isConsumable){stats=`<div style="font-size:11px;opacity:.7;">${item.desc}</div>`;}
  else if(item.rarity==='blankslate'){stats=`<div style="font-size:10px;color:var(--blankslate);">ATK ${item.minVal}–${item.maxVal}<br>Affix Slots: ${item.affixes.length}/${item.maxAffixes||7}</div>`;}
  else{
    const statKey=item.stat?.toUpperCase()||'ATK';
    stats=`<div style="font-size:11px;">${statKey} ${item.minVal}–${item.maxVal||item.value}</div>`;
    if(item.chestResist) stats+=`<div style="font-size:10px;color:#88aaff;">Resist ${item.chestResist}%</div>`;
    if(item.affixes?.length) stats+=item.affixes.slice(0,3).map(a=>`<div style="font-size:9px;color:${a.positive?'#7ec97e':'#e88'};">${a.label}</div>`).join('');
  }
  return`<div style="flex:1;background:rgba(0,0,0,.4);border:1px solid ${rColor};padding:10px;text-align:center;">${iconHtml}<div style="font-family:'Cinzel',serif;font-size:11px;color:${rColor};margin-bottom:4px;">${item.name}</div>${stats}</div>`;
}

function showLootModal(item){
  const isBS=item.rarity==='blankslate';
  const isBP=item.isBackpack;
  document.getElementById('loot-modal-title').textContent=isBS?'✨ BLANK SLATE DISCOVERED':isBP?'🎒 UNIQUE DROP':'💀 Item Dropped';

  const compArea=document.getElementById('loot-comparison-area');
  const equipped=player.equipped[item.slot||'weapon'];
  const isEquipable=!item.isConsumable&&!isBP;

  if(isBP){
    // Backpack — just show item, no comparison
    compArea.innerHTML='';compArea.style.display='none';
    document.getElementById('loot-item-display').innerHTML=`<div class="loot-item-display">${buildItemDisplay(item)}</div>`;
    const btns=document.getElementById('loot-modal-btns');btns.innerHTML='';
    const useBtn=document.createElement('button');useBtn.className='btn';useBtn.textContent='Equip Backpack';
    useBtn.onclick=()=>{applyBackpack(item);closeLootModalFinal();};
    btns.appendChild(useBtn);
    const dropBtn=document.createElement('button');dropBtn.className='btn danger';dropBtn.textContent='Leave it';
    dropBtn.onclick=()=>closeLootModal();
    btns.appendChild(dropBtn);
    document.getElementById('loot-modal').classList.remove('hidden');
    return;
  }

  if(isEquipable&&equipped&&equipped!==item){
    compArea.innerHTML=`
      <div style="flex:1;display:flex;flex-direction:column;">
        <div style="text-align:center;font-size:9px;color:var(--gold);letter-spacing:2px;text-transform:uppercase;margin-bottom:4px;">New Drop</div>
        ${buildLootCompare(item)}
      </div>
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:0 4px;">
        <span style="font-size:14px;color:rgba(255,255,255,.3);">vs</span>
      </div>
      <div style="flex:1;display:flex;flex-direction:column;">
        <div style="text-align:center;font-size:9px;color:rgba(255,255,255,.3);letter-spacing:2px;text-transform:uppercase;margin-bottom:4px;">Equipped</div>
        ${buildLootCompare(equipped)}
      </div>`;
    compArea.style.display='flex';
    document.getElementById('loot-item-display').innerHTML='';
  } else {
    compArea.innerHTML='';
    compArea.style.display='none';
    document.getElementById('loot-item-display').innerHTML=`<div class="loot-item-display">${buildItemDisplay(item)}</div>`;
  }

  const btns=document.getElementById('loot-modal-btns');
  btns.innerHTML='';
  if(isEquipable&&!item.isConsumable){
    if(equipped&&equipped!==item){
      const equipBtn=document.createElement('button');equipBtn.className='btn';equipBtn.textContent='Equip (replace)';
      equipBtn.onclick=()=>{
        if(item.affixes?.find(a=>a.onEquip)) item.affixes.filter(a=>a.onEquip).forEach(a=>a.onEquip(player));
        const old=player.equipped[item.slot||'weapon'];
        player.equipped[item.slot||'weapon']=item;
        if(old){if(player.inventory.filter(i=>i).length<(player.inventoryMax||8)) player.inventory.push(old);else{const sv=Math.round((old.sellPrice||0)*.2);player.gold+=sv;log(`🎒 Backpack full — dropped ${old.name} (+${sv}💰)`,'log-system');}}
        closeLootModalFinal();
      };
      btns.appendChild(equipBtn);
      const takeBtn=document.createElement('button');takeBtn.className='btn';takeBtn.textContent='Take (to pack)';
      takeBtn.onclick=()=>takeLoot();
      btns.appendChild(takeBtn);
      const dropBtn=document.createElement('button');dropBtn.className='btn danger';dropBtn.textContent='Leave it';
      dropBtn.onclick=()=>closeLootModal();
      btns.appendChild(dropBtn);
    } else {
      const equipBtn2=document.createElement('button');equipBtn2.className='btn';equipBtn2.textContent='Equip';
      equipBtn2.onclick=()=>{
        if(item.affixes?.find(a=>a.onEquip)) item.affixes.filter(a=>a.onEquip).forEach(a=>a.onEquip(player));
        player.equipped[item.slot||'weapon']=item;
        closeLootModalFinal();
      };
      btns.appendChild(equipBtn2);
      const takeBtn2=document.createElement('button');takeBtn2.className='btn';takeBtn2.textContent='Take';
      takeBtn2.onclick=()=>takeLoot();
      btns.appendChild(takeBtn2);
      const leaveBtn=document.createElement('button');leaveBtn.className='btn danger';leaveBtn.textContent='Leave';
      leaveBtn.onclick=()=>closeLootModal();
      btns.appendChild(leaveBtn);
    }
  } else {
    const takeBtn3=document.createElement('button');takeBtn3.className='btn';takeBtn3.textContent='Take';
    takeBtn3.onclick=()=>takeLoot();
    btns.appendChild(takeBtn3);
    if(item.isConsumable){
      const useBtn=document.createElement('button');useBtn.className='btn';useBtn.textContent='Use Now';
      useBtn.onclick=()=>{
        applyConsumable(item);
        pendingLoot=null;
        document.getElementById('loot-modal').classList.add('hidden');
        if(pendingRewardAfterLoot){const cb=pendingRewardAfterLoot;pendingRewardAfterLoot=null;cb();}
        else if(rewardCallback){rewardCallback();rewardCallback=null;}
        updateHUD();
      };
      btns.appendChild(useBtn);
      const size=player.pouchSize||3;
      const hasStack=player.pouch.slice(0,size).some(e=>e&&e.item.name===item.name);
      const hasFree=player.pouch.slice(0,size).some(e=>e===null);
      const pouchBtn=document.createElement('button');pouchBtn.className='btn';pouchBtn.textContent='⚗ Equip to Pouch';
      if(!hasStack&&!hasFree) pouchBtn.disabled=true;
      else pouchBtn.onclick=()=>{
        player.inventory.push(item);
        pendingLoot=null;
        document.getElementById('loot-modal').classList.add('hidden');
        assignToPouch(item);
        if(pendingRewardAfterLoot){const cb=pendingRewardAfterLoot;pendingRewardAfterLoot=null;cb();}
        else if(rewardCallback){rewardCallback();rewardCallback=null;}
      };
      btns.appendChild(pouchBtn);
    }
    const leaveBtn2=document.createElement('button');leaveBtn2.className='btn danger';leaveBtn2.textContent='Leave';
    leaveBtn2.onclick=()=>closeLootModal();
    btns.appendChild(leaveBtn2);
  }
  document.getElementById('loot-modal').classList.remove('hidden');
}

function closeLootModalFinal(){
  const item=pendingLoot;
  pendingLoot=null;
  document.getElementById('loot-modal').classList.add('hidden');
  if(item){
    const cls=item.rarity==='blankslate'?'log-blankslate':'log-loot';
    log(`⚔ Equipped <b>${item.name}</b>`,cls);
  }
  updateHUD();renderPlayerChar();
  if(pendingRewardAfterLoot){const cb=pendingRewardAfterLoot;pendingRewardAfterLoot=null;cb();return;}
  if(rewardCallback){rewardCallback();rewardCallback=null;return;}
  // Mid-combat steal — resume enemy turns
  if(!battleOver&&!playerTurn) setTimeout(enemyTurns,600);
}
function takeLoot(){
  if(!pendingLoot) return;
  if(player.inventory.filter(i=>i).length>=(player.inventoryMax||8)){log('Inventory full! Drop something first.','log-system');return;}
  player.inventory.push(pendingLoot);
  const cls=pendingLoot.rarity==='blankslate'?'log-blankslate':'log-loot';
  log(`📦 Picked up <b>${pendingLoot.name}</b>`,cls);
  pendingLoot=null;document.getElementById('loot-modal').classList.add('hidden');updateHUD();
  if(pendingRewardAfterLoot){const cb=pendingRewardAfterLoot;pendingRewardAfterLoot=null;cb();return;}
  if(rewardCallback){rewardCallback();rewardCallback=null;return;}
  // Mid-combat steal — resume enemy turns
  if(!battleOver&&!playerTurn) setTimeout(enemyTurns,600);
}
function closeLootModal(){
  pendingLoot=null;document.getElementById('loot-modal').classList.add('hidden');
  if(pendingRewardAfterLoot){const cb=pendingRewardAfterLoot;pendingRewardAfterLoot=null;cb();return;}
  if(rewardCallback){rewardCallback();rewardCallback=null;return;}
  // Mid-combat steal dismissed (Leave it) — resume enemy turns
  if(!battleOver&&!playerTurn) setTimeout(enemyTurns,600);
}

// =====================================================
// HUD / STATS
// =====================================================
function log(text,cls='log-system'){
  const el=document.getElementById('combat-log');
  const d=document.createElement('div');d.className=`log-entry ${cls}`;d.innerHTML=text;
  el.appendChild(d);el.scrollTop=el.scrollHeight;
}

function updateHUD(){
  document.getElementById('hud-floor').textContent=`B${currentFloor}`;
  document.getElementById('hud-gold').textContent=`💰${player.gold}`;
  document.getElementById('hud-xp').textContent=`${player.xp}/${player.xpToNext}`;
  document.getElementById('hud-level').textContent=player.level;
  const am=applyAmuletStats();
  const effMaxHp=player.maxHp+(am.maxHp||0);
  document.getElementById('hud-hp-num').textContent=`${player.hp}/${effMaxHp}`;
  const pct=player.hp/effMaxHp*100;
  const fill=document.getElementById('hp-fill');
  fill.style.width=pct+'%';
  fill.style.background=pct<25?'linear-gradient(90deg,#4a0a0a,#8b1a1a)':pct<55?'linear-gradient(90deg,#7a1a1a,#c0392b)':'linear-gradient(90deg,var(--blood),var(--blood2))';
  updateStats();renderEquipSilhouette();renderPouch();
  const mana=player.mana||0;const maxMana=getMaxMana();
  player.maxMana=maxMana;
  document.getElementById('hud-mana-num').textContent=`${mana}/${maxMana}`;
  const mFill=document.getElementById('mana-fill');
  if(mFill) mFill.style.width=(mana/maxMana*100)+'%';
  updateMagicButton();
}

function updateStats(){
  const atk=getPlayerAtk(),def=getPlayerDef(),spd=getPlayerSpd();
  const lp=player.perks.find(p=>p.effects.luckBonus);
  const luck=lp?lp.effects.luckBonus:0;
  document.getElementById('stat-grid').innerHTML=`
    <div class="stat-row"><span class="stat-key">ATK</span><span class="stat-val ${atk>player.atk?'stat-buff':atk<player.atk?'stat-debuff':''}">${atk}</span></div>
    <div class="stat-row"><span class="stat-key">DEF</span><span class="stat-val ${def>player.def?'stat-buff':def<player.def?'stat-debuff':''}">${def}</span></div>
    <div class="stat-row"><span class="stat-key">SPD</span><span class="stat-val ${spd>player.spd?'stat-buff':spd<player.spd?'stat-debuff':''}">${spd}</span></div>
    <div class="stat-row"><span class="stat-key">CRIT</span><span class="stat-val">${getCrit()}%</span></div>
    <div class="stat-row"><span class="stat-key">LUCK</span><span class="stat-val ${luck>0?'stat-buff':''}">${luck>0?'+'+luck:luck}</span></div>
    <div class="stat-row"><span class="stat-key">Kills</span><span class="stat-val">${player.enemiesKilled}</span></div>
    <div class="stat-row"><span class="stat-key">Floor</span><span class="stat-val">B${currentFloor}</span></div>`;

  // Status badges
  const badges=document.getElementById('status-badges');
  badges.innerHTML=(player.statusEffects||[]).map(s=>{
    const info={poison:{label:'☠ Poison',cls:'sb-poison'},burn:{label:'🔥 Burning',cls:'sb-burn'},slow:{label:'❄ Slowed',cls:'sb-slow'},curse:{label:'💀 Cursed',cls:'sb-curse'},drain:{label:'🩸 Drained',cls:'sb-drain'}}[s.type]||{label:s.type,cls:'sb-poison'};
    return `<span class="status-badge ${info.cls}">${info.label} (${s.turns})</span>`;
  }).join('');

  const pl=document.getElementById('perks-list');
  pl.innerHTML=player.perks.length?'<div style="font-size:9px;color:rgba(255,255,255,.3);letter-spacing:1px;text-transform:uppercase;margin-top:6px;margin-bottom:3px;">Perks</div>'+player.perks.map(p=>`<span class="perk-tag">${p.name}</span>`).join(''):'';
}

function renderPlayerChar(){
  const cont=document.getElementById('player-char');
  if(cont) cont.innerHTML=renderPlayerSVG();
}

// =====================================================
// EQUIPMENT SILHOUETTE
// =====================================================
const SLOT_DEFS=[
  {key:'helm',  label:'Helm', top:'4px', left:'50%',  trf:'translateX(-50%)'},
  {key:'chest', label:'Chest',top:'50px',left:'50%',  trf:'translateX(-50%)'},
  {key:'weapon',label:'Weap', top:'50px',left:'4px',  trf:'none'},
  {key:'shield',label:'Shld', top:'50px',right:'4px', trf:'none'},
  {key:'gloves',label:'Glvs', top:'96px',left:'4px',  trf:'none'},
  {key:'boots', label:'Boot', bottom:'0',left:'50%',  trf:'translateX(-50%)'},
];
const EMPTY_ICONS={helm:'🪖',chest:'🦺',weapon:'⚔️',shield:'🛡️',gloves:'🥊',boots:'👢'};

function renderPouch(){
  const cont=document.getElementById('pouch-slots');
  if(!cont) return;
  cont.innerHTML='';
  const size=player.pouchSize||3;
  for(let i=0;i<size;i++){
    const entry=player.pouch[i]||null; // {item, count} or null
    const slot=document.createElement('div');
    slot.className='pouch-slot'+(entry?' filled':' empty-slot');
    if(entry){
      const {item,count}=entry;
      slot.innerHTML=`<span style="font-size:18px;">${item.icon}</span><span class="pouch-slot-label">${item.name.split(' ')[0]}</span>${count>1?`<span style="position:absolute;top:2px;right:4px;font-size:9px;color:var(--gold);font-weight:bold;">${count}</span>`:''}`;
      slot.style.position='relative';
      slot.title=`${item.name}: ${item.desc} (x${count})`;
      slot.onclick=()=>{if(playerTurn&&!battleOver) usePouchSlot(i);};
    } else {
      slot.innerHTML=`<span style="font-size:11px;color:rgba(255,255,255,.12);">—</span>`;
    }
    cont.appendChild(slot);
  }
}

function usePouchSlot(idx){
  const entry=player.pouch[idx];
  if(!entry) return;
  applyConsumable(entry.item);
  // Remove one from inventory
  const invIdx=player.inventory.findIndex(i=>i&&i.name===entry.item.name);
  if(invIdx>-1) player.inventory.splice(invIdx,1);
  entry.count--;
  if(entry.count<=0) player.pouch[idx]=null;
  renderPouch();updateHUD();
  playerTurn=false;setActionButtons(false);setTimeout(enemyTurns,700);
}

function assignToPouch(item){
  if(!item.isConsumable){log('Only consumables can go in the pouch.','log-system');return;}
  const size=player.pouchSize||3;
  // Check if same item already in pouch — stack it
  const existIdx=player.pouch.slice(0,size).findIndex(e=>e&&e.item.name===item.name);
  if(existIdx>-1){
    player.pouch[existIdx].count++;
    // Remove from inventory
    const invIdx=player.inventory.indexOf(item);
    if(invIdx>-1) player.inventory.splice(invIdx,1);
    log(`⚗ ${item.name} added to pouch (x${player.pouch[existIdx].count}).`,'log-loot');
    renderPouch();closeItemModal();updateHUD();
    return;
  }
  // New slot
  const emptyIdx=player.pouch.slice(0,size).indexOf(null);
  if(emptyIdx===-1){log('Pouch is full!','log-system');return;}
  player.pouch[emptyIdx]={item,count:1};
  const invIdx=player.inventory.indexOf(item);
  if(invIdx>-1) player.inventory.splice(invIdx,1);
  log(`⚗ ${item.name} assigned to pouch slot ${emptyIdx+1}.`,'log-loot');
  renderPouch();closeItemModal();updateHUD();
}

function switchPanel(tab){
  document.getElementById('panel-equip').style.display=tab==='equip'?'':'none';
  document.getElementById('panel-pack').style.display=tab==='pack'?'':'none';
  document.getElementById('tab-equip').style.background=tab==='equip'?'rgba(201,168,76,.2)':'rgba(0,0,0,.3)';
  document.getElementById('tab-equip').style.color=tab==='equip'?'var(--gold2)':'rgba(255,255,255,.5)';
  document.getElementById('tab-equip').style.borderColor=tab==='equip'?'var(--gold)':'rgba(255,255,255,.15)';
  document.getElementById('tab-pack').style.background=tab==='pack'?'rgba(201,168,76,.2)':'rgba(0,0,0,.3)';
  document.getElementById('tab-pack').style.color=tab==='pack'?'var(--gold2)':'rgba(255,255,255,.5)';
  document.getElementById('tab-pack').style.borderColor=tab==='pack'?'var(--gold)':'rgba(255,255,255,.15)';
  if(tab==='pack') renderPackGrid();
}

function renderPackGrid(){
  const cont=document.getElementById('panel-pack');
  const slots=8;
  let html=`<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:5px;padding:4px;">`;
  for(let i=0;i<slots;i++){
    const item=player.inventory[i]||null;
    const rarBorder=item?`border-color:${RARITIES[item.rarity]?.color||'rgba(255,255,255,.12)'}`:'' ;
    if(item){
      const iconHtml=item.slot==='weapon'?drawWeaponSVG(item.typeName||item.name,getWeaponColor(item.rarity),14):item.icon;
      html+=`<div onclick="showItemModal(player.inventory[${i}],${i})" style="height:52px;background:rgba(0,0,0,.5);border:1px solid rgba(255,255,255,.12);${rarBorder};display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;padding:3px;transition:all .15s;" onmouseover="this.style.borderColor='rgba(201,168,76,.6)'" onmouseout="this.style.borderColor='${RARITIES[item.rarity]?.color||'rgba(255,255,255,.12)'}'">
        <div style="font-size:${item.slot==='weapon'?'11':'18'}px;line-height:1;">${iconHtml}</div>
        <div style="font-size:7px;color:rgba(255,255,255,.45);text-align:center;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:100%;margin-top:2px;">${item.name.split(' ')[0]}</div>
      </div>`;
    } else {
      html+=`<div style="height:52px;background:rgba(0,0,0,.3);border:1px dashed rgba(255,255,255,.08);display:flex;align-items:center;justify-content:center;"><span style="font-size:11px;color:rgba(255,255,255,.12);">empty</span></div>`;
    }
  }
  html+='</div>';
  cont.innerHTML=html;
}
function renderEquipSilhouette(){
  const cont=document.getElementById('equip-silhouette');
  const eq=player.equipped;
  let html=`<div style="position:relative;width:160px;height:185px;">
    <svg width="160" height="185" viewBox="0 0 160 185" style="position:absolute;inset:0;">
      <ellipse cx="80" cy="50" rx="22" ry="24" fill="rgba(255,255,255,.04)" stroke="rgba(255,255,255,.07)" stroke-width="1"/>
      <rect x="52" y="72" width="56" height="58" rx="6" fill="rgba(255,255,255,.04)" stroke="rgba(255,255,255,.07)" stroke-width="1"/>
      <rect x="30" y="74" width="22" height="44" rx="5" fill="rgba(255,255,255,.03)" stroke="rgba(255,255,255,.05)" stroke-width="1"/>
      <rect x="108" y="74" width="22" height="44" rx="5" fill="rgba(255,255,255,.03)" stroke="rgba(255,255,255,.05)" stroke-width="1"/>
      <rect x="58" y="130" width="20" height="46" rx="5" fill="rgba(255,255,255,.03)" stroke="rgba(255,255,255,.05)" stroke-width="1"/>
      <rect x="82" y="130" width="20" height="46" rx="5" fill="rgba(255,255,255,.03)" stroke="rgba(255,255,255,.05)" stroke-width="1"/>
    </svg>`;

  SLOT_DEFS.forEach(s=>{
    const item=eq[s.key];
    const rarClass=item?`rarity-${item.rarity}`:'';
    const hasClass=item?'has-item':'';
    let pos=s.right?`top:${s.top};right:${s.right};`:s.bottom?`bottom:${s.bottom};left:${s.left};`:`top:${s.top};left:${s.left};`;
    if(s.trf&&s.trf!=='none') pos+=`transform:${s.trf};`;

    // For weapons show mini SVG in slot
    const slotContent=item
      ?(s.key==='weapon'?`<div style="display:flex;align-items:center;justify-content:center;height:100%;">${drawWeaponSVG(item.typeName||item.name,getWeaponColor(item.rarity),12)}</div>`
        :`<span style="font-size:18px">${item.icon}</span>`)
      :`<span style="font-size:${s.key==='weapon'?'16':'18'}px">${EMPTY_ICONS[s.key]}</span>`;

    html+=`<div class="equip-slot ${hasClass} ${rarClass}" style="position:absolute;${pos}" onclick="openEquipSlot('${s.key}')">
      ${slotContent}
      <span class="equip-slot-label">${item?item.name.split(' ')[0]:s.label}</span>
    </div>`;
  });
  html+='</div>';

  // Belt row — 3 consumable slots shown below silhouette
  const belt=player.equipped.belt||[null,null,null];
  html+=`<div style="display:flex;gap:4px;justify-content:center;margin-top:6px;">
    <div style="font-size:8px;color:var(--gold);letter-spacing:1px;text-transform:uppercase;align-self:center;margin-right:2px;">Belt</div>`;
  for(let i=0;i<3;i++){
    const bi=belt[i];
    html+=`<div class="equip-slot ${bi?'has-item':''}" style="width:34px;height:34px;" onclick="openBeltSlot(${i})" title="${bi?bi.name+': '+bi.desc:'Empty belt slot'}">
      ${bi?`<span style="font-size:16px">${bi.icon}</span><span class="equip-slot-label">${bi.name.split(' ')[0]}</span>`:'<span style="font-size:11px;color:rgba(255,255,255,.2);">+</span>'}
    </div>`;
  }
  html+='</div>';

  cont.innerHTML=html;
}

function openEquipSlot(slotKey){
  const item=player.equipped[slotKey];
  if(item){showItemModal(item,null,slotKey);return;}
  const avail=player.inventory.filter(i=>i&&!i.isConsumable&&i.slot===slotKey);
  if(!avail.length){log(`No ${slotKey} items in inventory.`,'log-system');return;}
  if(avail.length===1){player.equipped[slotKey]=avail[0];updateHUD();renderPlayerChar();log(`Equipped ${avail[0].name}`,'log-loot');return;}
  showEquipPicker(slotKey,avail);
}

function openBeltSlot(idx){
  const belt=player.equipped.belt||[null,null,null];
  const cur=belt[idx];
  if(cur){
    // Show options: use now or remove
    const m=document.getElementById('item-modal');
    document.getElementById('item-modal-title').textContent=`Belt Slot ${idx+1}`;
    document.getElementById('item-modal-display').innerHTML=buildItemDisplay(cur);
    document.getElementById('item-modal-compare').innerHTML='';
    const btns=document.getElementById('item-modal-btns');btns.innerHTML='';
    const useBtn=document.createElement('button');useBtn.className='btn';useBtn.textContent='Use Now';
    useBtn.onclick=()=>{applyConsumable(cur);belt[idx]=null;closeItemModal();updateHUD();};
    btns.appendChild(useBtn);
    const remBtn=document.createElement('button');remBtn.className='btn danger';remBtn.textContent='Remove to Pack';
    remBtn.onclick=()=>{
      if(player.inventory.filter(i=>i).length>=(player.inventoryMax||8)){log('Pack full!','log-system');return;}
      player.inventory.push(cur);belt[idx]=null;closeItemModal();updateHUD();
    };
    btns.appendChild(remBtn);
    const cl=document.createElement('button');cl.className='btn';cl.textContent='Close';cl.onclick=closeItemModal;btns.appendChild(cl);
    m.classList.remove('hidden');
  } else {
    // Show consumables available to equip here
    const cons=player.inventory.filter(i=>i&&i.isConsumable);
    if(!cons.length){log('No consumables in pack to equip to belt.','log-system');return;}
    const m=document.getElementById('item-modal');
    document.getElementById('item-modal-title').textContent=`Equip to Belt Slot ${idx+1}`;
    document.getElementById('item-modal-display').innerHTML='';
    document.getElementById('item-modal-compare').innerHTML='';
    const btns=document.getElementById('item-modal-btns');btns.innerHTML='';
    cons.forEach(c=>{
      const b=document.createElement('button');b.className='btn';b.style.cssText='font-size:11px;padding:8px 12px;margin:3px;width:100%;text-align:left;';
      b.innerHTML=`${c.icon} ${c.name} <span style="color:rgba(255,255,255,.4);float:right;">${c.desc}</span>`;
      b.onclick=()=>{belt[idx]=c;closeItemModal();updateHUD();log(`${c.icon} ${c.name} equipped to belt slot ${idx+1}.`,'log-loot');};
      btns.appendChild(b);
    });
    const cl=document.createElement('button');cl.className='btn danger';cl.textContent='Cancel';cl.onclick=closeItemModal;btns.appendChild(cl);
    m.classList.remove('hidden');
  }
}

function showEquipPicker(slotKey,items){
  const m=document.getElementById('item-modal');
  document.getElementById('item-modal-title').textContent=`Choose ${slotKey}`;
  document.getElementById('item-modal-display').innerHTML='';
  document.getElementById('item-modal-compare').innerHTML='';
  const btns=document.getElementById('item-modal-btns');btns.innerHTML='';
  items.forEach(item=>{
    const b=document.createElement('button');b.className='btn';b.style.cssText='font-size:11px;padding:8px 12px;margin:3px;';
    b.innerHTML=`${item.slot==='weapon'?drawWeaponSVG(item.typeName||item.name,getWeaponColor(item.rarity),12):item.icon} ${item.name}`;
    b.onclick=()=>{player.equipped[slotKey]=item;closeItemModal();updateHUD();renderPlayerChar();};
    btns.appendChild(b);
  });
  const cl=document.createElement('button');cl.className='btn danger';cl.textContent='Cancel';cl.onclick=closeItemModal;btns.appendChild(cl);
  m.classList.remove('hidden');
}

// =====================================================
// ITEM MODAL
// =====================================================
function showItemModal(item,invIdx,equippedSlot=null){
  const m=document.getElementById('item-modal');
  document.getElementById('item-modal-title').textContent='Item Details';
  document.getElementById('item-modal-display').innerHTML=buildItemDisplay(item);
  const slot=item.slot||'weapon';const cur=player.equipped[slot];
  let compare='';
  if(!item.isConsumable&&cur&&cur!==item){
    const d=Math.round(((item.minVal+item.maxVal)/2)-((cur.minVal+cur.maxVal)/2));
    compare=`vs ${cur.name}: <span class="${d>0?'compare-up':'compare-down'}">${d>0?'+':''}${d} avg</span>`;
  }
  document.getElementById('item-modal-compare').innerHTML=compare;
  const btns=document.getElementById('item-modal-btns');btns.innerHTML='';
  const isEq=equippedSlot!==null||Object.values(player.equipped).includes(item);

  if(item.isConsumable){
    const u=document.createElement('button');u.className='btn';u.textContent='Use Now';
    u.onclick=()=>{applyConsumable(item);const i=player.inventory.indexOf(item);if(i>-1)player.inventory.splice(i,1);closeItemModal();updateHUD();};
    btns.appendChild(u);
    const ap=document.createElement('button');ap.className='btn';ap.textContent='⚗ Equip to Pouch';
    ap.onclick=()=>assignToPouch(item);
    btns.appendChild(ap);
  } else {
    const e=document.createElement('button');e.className='btn';e.textContent=isEq?'Unequip':'Equip';
    e.onclick=()=>{
      if(isEq){const s=equippedSlot||Object.entries(player.equipped).find(([k,v])=>v===item)?.[0];if(s)player.equipped[s]=null;}
      else{if(item.affixes?.find(a=>a.onEquip)) item.affixes.filter(a=>a.onEquip).forEach(a=>a.onEquip(player));player.equipped[slot]=item;}
      closeItemModal();updateHUD();renderPlayerChar();
    };
    btns.appendChild(e);
  }
  const sv=item.sellPrice?Math.round(item.sellPrice*.2):0;
  const dr=document.createElement('button');dr.className='btn danger';dr.textContent=`Drop (+${sv}💰)`;
  dr.onclick=()=>{
    player.gold+=sv;
    if(isEq){const s=equippedSlot||Object.entries(player.equipped).find(([k,v])=>v===item)?.[0];if(s)player.equipped[s]=null;}
    const i=player.inventory.indexOf(item);if(i>-1)player.inventory.splice(i,1);
    closeItemModal();updateHUD();renderPlayerChar();
  };
  btns.appendChild(dr);
  const cl=document.createElement('button');cl.className='btn';cl.textContent='Close';cl.onclick=closeItemModal;btns.appendChild(cl);
  m.classList.remove('hidden');
}
function closeItemModal(){document.getElementById('item-modal').classList.add('hidden');}

// =====================================================
// ENEMY RENDER
// =====================================================
function renderEnemies(){
  const area=document.getElementById('enemies-area');area.innerHTML='';
  enemies.forEach((e,i)=>{
    const slot=document.createElement('div');slot.className='enemy-slot';slot.id=`enemy-slot-${i}`;
    if(e.hp<=0) slot.classList.add('dead');
    if(selectedEnemy===i&&e.hp>0) slot.classList.add('selected');
    const hpPct=Math.max(0,e.hp/e.maxHp*100);
    const scale=e.isBoss?1.5:(.7+i*.15);
    const statusIcons=(e.statusEffects||[]).filter(s=>s==='poison').map(()=>'☠').join('');
    slot.innerHTML=`<div class="enemy-name-tag">${e.name}${e.isBoss?' 👑':''}</div>
      <div class="enemy-hp-bar"><div class="enemy-hp-fill" style="width:${hpPct}%"></div></div>
      <div class="enemy-body">${renderEnemySVG(e,scale)}</div>
      <div style="font-size:8px;color:rgba(255,255,255,.3);margin-top:1px;">${e.hp}/${e.maxHp}${statusIcons}</div>`;
    if(e.hp>0) slot.onclick=()=>{selectedEnemy=i;renderEnemies();};
    area.appendChild(slot);
  });
}

function renderEnemySVG(e,scale){
  const w=Math.round(58*scale),h=Math.round(76*scale);
  const cols={'💀':['#9a9a9a','#bcbcbc'],'👺':['#4a8a2a','#6ab04a'],'🧟':['#5a7a3a','#7a9a5a'],'👹':['#8a3a2a','#ca5a3a'],'🧛':['#2a1a4a','#4a2a8a'],'🗿':['#6a6a6a','#8a8a8a'],'👻':['#aaaac0','#d0d0e8'],'🐉':['#2a5a2a','#4a8a4a'],'😈':['#8a1a1a','#ca2a2a'],'🧙':['#2a2a6a','#4a4aaa'],'🌑':['#1a1a2a','#3a3a5a']}[e.icon]||['#4a4a4a','#6a6a6a'];
  const cx=w/2,cy=h*.55,hR=w*.22,bRx=w*.28,bRy=h*.28;
  const isPoisoned=(e.statusEffects||[]).includes('poison');
  return`<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" ${e.isBoss?`style="filter:drop-shadow(0 0 8px ${cols[0]})"`:''}>${isPoisoned?`<ellipse cx="${cx}" cy="${cy}" rx="${bRx+4}" ry="${bRy+4}" fill="rgba(60,120,40,.3)" stroke="rgba(100,200,60,.4)" stroke-width="1"/>`:''}
  <ellipse cx="${cx}" cy="${cy+bRy*.1}" rx="${bRx}" ry="${bRy}" fill="${cols[0]}" stroke="${cols[1]}" stroke-width="1.5"/>
  <ellipse cx="${cx}" cy="${cy-bRy*.7}" rx="${hR}" ry="${hR*1.1}" fill="${cols[1]}" stroke="${cols[1]}" stroke-width="1"/>
  <ellipse cx="${cx-hR*.35}" cy="${cy-bRy*.7}" rx="${hR*.2}" ry="${hR*.18}" fill="#fff"/><ellipse cx="${cx+hR*.35}" cy="${cy-bRy*.7}" rx="${hR*.2}" ry="${hR*.18}" fill="#fff"/>
  <ellipse cx="${cx-hR*.3}" cy="${cy-bRy*.68}" rx="${hR*.12}" ry="${hR*.12}" fill="#c00"/><ellipse cx="${cx+hR*.35}" cy="${cy-bRy*.68}" rx="${hR*.12}" ry="${hR*.12}" fill="#c00"/>
  ${e.isBoss?`<ellipse cx="${cx}" cy="${cy-bRy*1.1}" rx="${w*.18}" ry="${h*.07}" fill="none" stroke="gold" stroke-width="2"/>`:''}
  </svg>`;
}

function showFloater(el,text,color){
  const ar=document.getElementById('arena').getBoundingClientRect();const r=el.getBoundingClientRect();
  const f=document.createElement('div');f.className='floater';f.textContent=text;f.style.color=color;
  f.style.left=(r.left-ar.left+r.width/2-12)+'px';f.style.top=(r.top-ar.top)+'px';
  document.getElementById('arena').appendChild(f);setTimeout(()=>f.remove(),1000);
}

// =====================================================
// GRAVEYARD
// =====================================================
function showGraveyardMerchant(){
  document.getElementById('graveyard-merchant-modal').classList.remove('hidden');
  gmSwitchTab('buy');
  renderGraveyardMerchantGrid();
}

function renderGraveyardMerchantGrid(){
  document.getElementById('gm-gold').textContent=player.gold;
  const grid=document.getElementById('gm-grid');grid.innerHTML='';

  // Equipment items (non-consumable)
  const eqItems=[];
  for(let i=0;i<6;i++) eqItems.push(generateItem(1));
  if(Math.random()<0.15){const li=generateItem(1);li.rarity='legendary';eqItems.push(li);}

  eqItems.forEach(item=>{
    const price=item.sellPrice||20;
    const d=document.createElement('div');d.className='merchant-item';
    const rColor=RARITIES[item.rarity]?.color||'#fff';
    const weapSvg=(item.slot==='weapon')?`<div style="display:flex;justify-content:center;margin-bottom:4px;">${drawWeaponSVG(item.typeName||item.name,getWeaponColor(item.rarity),18)}</div>`:`<div class="merchant-icon">${item.icon}</div>`;
    const desc=`${item.stat?.toUpperCase()} ${item.minVal}–${item.maxVal||item.value}`;
    d.innerHTML=`${weapSvg}<div class="merchant-name" style="color:${rColor};font-size:9px;">${item.name}</div><div class="merchant-desc">${desc}</div><div class="merchant-price">${price}💰</div>`;
    d.onclick=()=>{
      if(player.gold<price){d.style.animation='shake .3s ease';setTimeout(()=>d.style.animation='',400);document.getElementById('gm-msg').textContent=`Need ${price}💰!`;return;}
      if(player.inventory.filter(i=>i).length>=(player.inventoryMax||8)){document.getElementById('gm-msg').textContent='Pack full!';return;}
      player.gold-=price;player.inventory.push({...item,id:uid()});
      document.getElementById('gm-gold').textContent=player.gold;
      d.style.opacity='.25';d.style.pointerEvents='none';
    };
    grid.appendChild(d);
  });

  // Consumables section with qty selectors
  const consHeader=document.createElement('div');
  consHeader.style.cssText='grid-column:1/-1;font-family:Cinzel,serif;font-size:9px;color:var(--gold);letter-spacing:2px;text-transform:uppercase;padding:6px 0 4px;border-top:1px solid rgba(255,255,255,.1);margin-top:4px;';
  consHeader.textContent='🧪 Consumables';
  grid.appendChild(consHeader);

  CONSUMABLES.forEach(c=>{
    const price=c.sellPrice||20;
    const d=document.createElement('div');
    d.style.cssText='background:rgba(0,0,0,.4);border:1px solid rgba(255,255,255,.1);padding:8px;display:flex;justify-content:space-between;align-items:center;grid-column:1/-1;';
    const qtyId=`gm-qty-${c.name.replace(/\s/g,'')}`;
    d.innerHTML=`<span style="font-size:13px;">${c.icon}</span>
      <span style="flex:1;margin:0 8px;"><div style="font-family:'Cinzel',serif;font-size:10px;color:var(--bone2);">${c.name}</div><div style="font-size:9px;color:rgba(255,255,255,.4);">${c.desc}</div></span>
      <span style="font-size:11px;color:var(--gold);margin-right:6px;">${price}💰 ea</span>
      <div style="display:flex;align-items:center;gap:4px;">
        <button class="btn" style="padding:3px 7px;font-size:12px;" onclick="gmQtyAdj('${qtyId}',-1)">−</button>
        <span id="${qtyId}" style="font-size:14px;font-family:'Cinzel',serif;color:var(--gold2);min-width:18px;text-align:center;">0</span>
        <button class="btn" style="padding:3px 7px;font-size:12px;" onclick="gmQtyAdj('${qtyId}',1)">+</button>
        <button class="btn" style="padding:3px 10px;font-size:10px;" onclick="gmBuyConsumable('${c.name}',${price},'${qtyId}')">Buy</button>
      </div>`;
    grid.appendChild(d);
  });
}

function gmQtyAdj(qtyId,delta){
  const el=document.getElementById(qtyId);if(!el) return;
  const v=Math.max(0,Math.min(10,parseInt(el.textContent||'0')+delta));
  el.textContent=v;
}

function gmBuyConsumable(name,price,qtyId){
  const qty=parseInt(document.getElementById(qtyId)?.textContent||'0');
  if(qty<=0) return;
  const total=price*qty;
  if(player.gold<total){document.getElementById('gm-msg').textContent=`Need ${total}💰 (have ${player.gold}💰).`;return;}
  const freeSlots=8-player.inventory.filter(i=>i).length;
  const canBuy=Math.min(qty,freeSlots);
  if(canBuy<=0){document.getElementById('gm-msg').textContent='Pack is full!';return;}
  const actualCost=price*canBuy;
  player.gold-=actualCost;
  const template=CONSUMABLES.find(c=>c.name===name);
  for(let i=0;i<canBuy;i++) player.inventory.push({...template,rarity:'common',isConsumable:true,id:uid()});
  document.getElementById('gm-gold').textContent=player.gold;
  document.getElementById(qtyId).textContent=0;
  const msgEl=document.getElementById('gm-msg');
  msgEl.textContent=`Bought ${canBuy}× ${name} for ${actualCost}💰.`;
  msgEl.style.color='#4ec94e';
  if(canBuy<qty) msgEl.textContent+=` (pack could only fit ${canBuy})`;
}

function gmSwitchTab(tab){
  const isBuy=tab==='buy';
  document.getElementById('gm-panel-buy').style.display=isBuy?'':'none';
  document.getElementById('gm-panel-sell').style.display=isBuy?'none':'';
  document.getElementById('gm-tab-buy').style.opacity=isBuy?'1':'.5';
  document.getElementById('gm-tab-sell').style.opacity=isBuy?'.5':'1';
  document.getElementById('gm-msg').textContent='';
  if(!isBuy) renderGmSellList();
}

function renderGmSellList(){
  const list=document.getElementById('gm-sell-list');
  const equippedItems=new Set(Object.values(player.equipped).flat().filter(Boolean));
  const sellable=player.inventory.filter(i=>i&&i.sellPrice&&!equippedItems.has(i));

  if(!sellable.length){
    list.innerHTML=`<div style="text-align:center;padding:24px;color:rgba(255,255,255,.3);font-style:italic;">Your pack is empty — nothing to sell.</div>`;
    return;
  }

  // Sell all button
  const totalVal=sellable.reduce((s,i)=>s+Math.round((i.sellPrice||0)*.4),0);
  list.innerHTML=`<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 10px;margin-bottom:8px;background:rgba(200,160,60,.1);border:1px solid rgba(200,160,60,.25);">
    <span style="font-size:12px;color:var(--gold);">Sell everything</span>
    <button class="btn" style="font-size:11px;padding:5px 14px;" onclick="gmSellAll()">Sell All (+${totalVal}💰)</button>
  </div>`;

  sellable.forEach((item, sellIdx)=>{
    const sv=Math.round((item.sellPrice||0)*.4);
    const rColor=RARITIES[item.rarity]?.color||'#fff';
    const invIdx=player.inventory.indexOf(item);
    const row=document.createElement('div');
    row.style.cssText='display:flex;justify-content:space-between;align-items:center;padding:7px 10px;margin-bottom:4px;background:rgba(0,0,0,.35);border:1px solid rgba(255,255,255,.07);';
    row.innerHTML=`<span style="display:flex;align-items:center;gap:8px;">
        <span style="font-size:18px;">${item.icon||'📦'}</span>
        <span>
          <div style="font-family:'Cinzel',serif;font-size:11px;color:${rColor};">${item.name}</div>
          <div style="font-size:9px;color:rgba(255,255,255,.35);">${item.isConsumable?item.desc:(item.stat?.toUpperCase()+' '+item.minVal+'–'+(item.maxVal||item.value))}</div>
        </span>
      </span>
      <button class="btn" style="font-size:10px;padding:4px 10px;white-space:nowrap;">+${sv}💰</button>`;
    const btn=row.querySelector('button');
    btn.onclick=()=>gmSellOne(item, sv);
    list.appendChild(row);
  });
}

function gmSellOne(item, sv){
  const idx=player.inventory.indexOf(item);
  if(idx===-1) return;
  player.gold+=sv;
  player.inventory.splice(idx,1);
  document.getElementById('gm-gold').textContent=player.gold;
  const msg=document.getElementById('gm-msg');
  msg.style.color='#4ec94e';msg.textContent=`Sold ${item.name} for ${sv}💰.`;
  updateHUD();
  renderGmSellList();
}

function gmSellAll(){
  const equippedItems=new Set(Object.values(player.equipped).flat().filter(Boolean));
  const sellable=player.inventory.filter(i=>i&&i.sellPrice&&!equippedItems.has(i));
  if(!sellable.length) return;
  const total=sellable.reduce((s,i)=>s+Math.round((i.sellPrice||0)*.4),0);
  sellable.forEach(item=>{const idx=player.inventory.indexOf(item);if(idx>-1)player.inventory.splice(idx,1);});
  player.gold+=total;
  document.getElementById('gm-gold').textContent=player.gold;
  const msg=document.getElementById('gm-msg');
  msg.style.color='#4ec94e';msg.textContent=`Sold ${sellable.length} item${sellable.length>1?'s':''} for ${total}💰 total.`;
  updateHUD();
  renderGmSellList();
}

function closeGraveyardMerchant(){document.getElementById('graveyard-merchant-modal').classList.add('hidden');}

function buildPrepareShop(){
  document.getElementById('prepare-gold').textContent=player.gold;
  const grid=document.getElementById('prepare-grid');grid.innerHTML='';
  const items=CONSUMABLES.map(c=>({...c,rarity:'common',isConsumable:true,id:uid()}));
  renderShopGrid(grid,items,'prepare-gold');
}

function showPrepareModal(){
  buildPrepareShop();
  document.getElementById('prepare-modal').classList.remove('hidden');
}
function closePrepareModal(){
  document.getElementById('prepare-modal').classList.add('hidden');
  startFloor();
}

function renderShopGrid(grid,items,goldId){
  items.forEach(item=>{
    const price=item.sellPrice||20;
    const d=document.createElement('div');d.className='merchant-item';
    const rColor=RARITIES[item.rarity]?.color||'#fff';
    const weapSvg=(!item.isConsumable&&item.slot==='weapon')?`<div style="display:flex;justify-content:center;margin-bottom:4px;">${drawWeaponSVG(item.typeName||item.name,getWeaponColor(item.rarity),18)}</div>`:`<div class="merchant-icon">${item.icon}</div>`;
    const desc=item.isConsumable?item.desc:`${item.stat?.toUpperCase()} ${item.minVal}–${item.maxVal||item.value}`;
    d.innerHTML=`${weapSvg}<div class="merchant-name" style="color:${rColor}">${item.name}</div><div class="merchant-desc">${desc}</div><div class="merchant-price">${price}💰</div>`;
    d.onclick=()=>{
      if(player.gold<price){log('Not enough gold!','log-system');return;}
      if(player.inventory.filter(i=>i).length>=(player.inventoryMax||8)){log('Inventory full!','log-system');return;}
      player.gold-=price;player.inventory.push(item);
      document.getElementById(goldId).textContent=player.gold;
      d.style.opacity='.25';d.style.pointerEvents='none';updateHUD();
    };
    grid.appendChild(d);
  });
}

function showGraveyard(){showScreen('graveyard-screen');renderGraveyard();}
function renderGraveyard(){
  const row=document.getElementById('tombstone-row');
  const sceneEmpty=document.getElementById('graveyard-scene-empty');
  row.innerHTML='';
  if(!gameState.graves.length){
    if(sceneEmpty) sceneEmpty.style.display='block';
    row.style.display='none';
    return;
  }
  if(sceneEmpty) sceneEmpty.style.display='none';
  row.style.display='flex';
  gameState.graves.forEach((g,idx)=>{
    const stone=document.createElement('div');stone.className='tombstone purchasable';
    const hasItems=Object.values(g.equipped).some(v=>v!==null);
    if(hasItems){const b=document.createElement('div');b.className='tomb-badge';b.textContent='LOOT';stone.appendChild(b);}
    stone.innerHTML+=`${renderTombSVG(g)}<div class="tomb-name">${g.name}</div><div class="tomb-depth">B${g.floor} — ${g.killedBy}</div>`;
    stone.onclick=()=>showTombModal(g,idx);row.appendChild(stone);
  });
}
function renderTombSVG(g){
  const w=g.equipped.weapon,sh=g.equipped.shield,bo=g.equipped.boots,gl=g.equipped.gloves;
  return`<svg class="tomb-svg" viewBox="0 0 80 100"><rect x="5" y="78" width="70" height="6" rx="2" fill="#2a2010" stroke="#3a3020"/><rect x="15" y="62" width="50" height="20" rx="2" fill="#3a3520" stroke="#5a5040" stroke-width="1.5"/><rect x="22" y="20" width="36" height="46" rx="3" fill="#3a3520" stroke="#5a5040" stroke-width="1.5"/><path d="M22,35 Q22,8 40,8 Q58,8 58,35" fill="#3a3520" stroke="#5a5040" stroke-width="1.5"/><text x="40" y="45" text-anchor="middle" font-size="14">💀</text><line x1="40" y1="52" x2="43" y2="62" stroke="#5a5040" stroke-width="1"/>${w?`<text x="13" y="70" font-size="12" transform="rotate(-15,13,70)">${w.icon}</text>`:''}${sh?`<text x="58" y="70" font-size="12" transform="rotate(15,58,70)">${sh.icon}</text>`:''}${bo?`<text x="20" y="88" font-size="10">${bo.icon}</text>`:''}${gl?`<text x="52" y="88" font-size="10">${gl.icon}</text>`:''}</svg>`;
}
function showTombModal(g,idx){
  const items=Object.entries(g.equipped).filter(([k,v])=>v!==null).map(([slot,item])=>({slot,item}));
  let html=`<p style="text-align:center;font-style:italic;color:rgba(255,255,255,.5);margin-bottom:12px;">Here lies <b>${g.name}</b>, fallen on B${g.floor}.<br>Slain by ${g.killedBy}.</p>`;
  if(!items.length) html+=`<p style="text-align:center;color:rgba(255,255,255,.3);font-style:italic;">Nothing remains...</p>`;
  else items.forEach(({slot,item})=>{
    const price=item.sellPrice*2; // 2× sell price buyback
    const can=player.gold>=price;
    html+=`<div class="tomb-item-row"><span><span style="font-size:18px;margin-right:7px;">${item.icon}</span>${item.name} <span style="color:rgba(255,255,255,.35);font-size:11px;">${item.rarity}</span></span><button class="btn" style="font-size:10px;padding:5px 9px;" ${can?'':'disabled'} onclick="buyGraveItem(${idx},'${slot}')">Buy ${price}💰</button></div>`;
  });
  document.getElementById('tomb-modal-content').innerHTML=html;
  document.getElementById('tomb-modal').classList.remove('hidden');
}
function buyGraveItem(graveIdx,slot){
  const g=gameState.graves[graveIdx];const item=g.equipped[slot];if(!item) return;
  const price=item.sellPrice*2;
  if(player.gold<price){log('Not enough gold!','log-system');return;}
  if(player.inventory.filter(i=>i).length>=(player.inventoryMax||8)){log('Inventory full!','log-system');return;}
  player.gold-=price;player.inventory.push(item);g.equipped[slot]=null;
  log(`🪦 Recovered <b>${item.name}</b> for ${price}💰`,'log-loot');
  showTombModal(g,graveIdx);updateHUD();
}
function closeTombModal(){document.getElementById('tomb-modal').classList.add('hidden');}

// =====================================================
// FLOW
// =====================================================
