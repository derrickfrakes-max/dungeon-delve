// =====================================================
function pickRarity(floor){
  const b=Math.floor(floor/3);
  const lp=player?player.perks.find(p=>p.effects.luckBonus):null;
  const luck=lp?lp.effects.luckBonus:0;
  let w={common:Math.max(10,60-b*2-luck*3),uncommon:25+b,rare:12+Math.floor(b/2)+luck*2,legendary:3+Math.floor(b/4)+luck};
  const t=Object.values(w).reduce((a,x)=>a+x,0);
  let r=Math.random()*t;for(const[k,v]of Object.entries(w)){r-=v;if(r<=0)return k;}return'common';
}

function generateItem(floor,forceConsumable=false,forceBlankSlate=false){
  // Blank Slate check (1% natural drop chance if not forced)
  if(forceBlankSlate||Math.random()<0.01){
    return generateBlankSlate(floor);
  }
  if(forceConsumable||Math.random()<0.22){
    const c=CONSUMABLES[rand(0,CONSUMABLES.length-1)];
    return{...c,rarity:'common',isConsumable:true,id:uid()};
  }
  const rarity=pickRarity(floor);
  const isArmor=Math.random()<0.4;
  const typePool=isArmor?ARMOR_TYPES:WEAPON_TYPES;
  const type=typePool[rand(0,typePool.length-1)];
  const pfx=isArmor?AP[rand(0,AP.length-1)]:WP[rand(0,WP.length-1)];
  const useSfx=rarity!=='common'&&Math.random()<0.55;
  const sfx=useSfx?(isArmor?AS:WS)[rand(0,isArmor?AS.length-1:WS.length-1)]:'';
  const rm={common:1,uncommon:1.35,rare:1.8,legendary:2.6}[rarity];
  const base=Math.round((7+floor*2.2)*rm);
  const rw=RARITIES[rarity].rangeWidth;
  const minVal=Math.max(1,Math.round(base*(1-rw)));
  const maxVal=Math.round(base*(1+rw));
  const sp=Math.round(base*{common:3,uncommon:7,rare:14,legendary:28}[rarity]);

  let affixes=[];
  if(!isArmor){
    // AoE weapons always get their signature affix
    if(type.aoeAffix){
      const a=ALL_AFFIXES.find(x=>x.id===type.aoeAffix);
      if(a) affixes.push(a);
    }
    // Additional affixes based on rarity
    const maxExtra={common:1,uncommon:1,rare:2,legendary:3}[rarity];
    const affixChance={common:.2,uncommon:.5,rare:.8,legendary:1}[rarity];
    for(let i=0;i<maxExtra;i++){
      if(Math.random()<affixChance){
        const pool=ALL_AFFIXES.filter(a=>!affixes.find(x=>x.id===a.id));
        if(pool.length) affixes.push(pool[rand(0,pool.length-1)]);
      }
    }
    if(!affixes.length&&type.heavy&&Math.random()<0.6) affixes.push(ALL_AFFIXES.find(a=>a.id==='heavy'));
  }

  const chestResist=(isArmor&&type.slot==='chest')?{common:10,uncommon:20,rare:35,legendary:55}[rarity]||0:0;
  return{id:uid(),name:`${pfx} ${type.name}${sfx?' '+sfx:''}`,icon:type.icon,typeName:type.name,rarity,isConsumable:false,
    slot:type.slot||'weapon',stat:isArmor?type.stat:'atk',minVal,maxVal,value:base,affixes,sellPrice:sp,fastBonus:type.fastBonus||0,chestResist};
}

function generateBlankSlate(floor){
  const template=BLANK_SLATE_NAMES[rand(0,BLANK_SLATE_NAMES.length-1)];
  const wType=WEAPON_TYPES.find(w=>w.name===template.type)||WEAPON_TYPES[0];
  // Start below legendary — power comes from the 7 affix slots
  const base=Math.round((7+floor*2.2)*1.4);
  return{
    id:uid(),name:template.name,icon:wType.icon,typeName:wType.name,rarity:'blankslate',isConsumable:false,
    slot:'weapon',stat:'atk',minVal:Math.round(base*.9),maxVal:Math.round(base*1.1),
    value:base,affixes:[],maxAffixes:7,sellPrice:Math.round(base*50),fastBonus:wType.fastBonus||0,
    lore:`A weapon of unknown origin. Its surface is smooth, waiting to be written.`,
  };
}

// =====================================================
// ITEM DISPLAY HELPERS
// =====================================================
function buildItemDisplay(item){
  const rColor=RARITIES[item.rarity]?.color||'#fff';
  const weapSvg=(!item.isConsumable&&item.slot==='weapon')
    ?`<div style="display:flex;justify-content:center;margin-bottom:8px;">${drawWeaponSVG(item.typeName||item.name,getWeaponColor(item.rarity),32)}</div>`:'';
  const iconHtml=item.isConsumable
    ?`<div style="font-size:36px;margin-bottom:6px;">${item.icon}</div>`
    :(item.slot!=='weapon'?`<div style="font-size:36px;margin-bottom:6px;">${item.icon}</div>`:weapSvg);

  let stats='';
  if(item.isConsumable) stats=`<div style="font-size:13px;opacity:.8;">${item.desc}</div>`;
  else if(item.isBackpack){
    stats=`<div style="font-size:13px;color:#d888d8;margin-bottom:8px;">📦 Inventory +${item.inventoryBonus} slots</div>`;
    stats+=`<div style="font-size:11px;color:rgba(255,255,255,.45);font-style:italic;">${item.desc}</div>`;
    stats+=`<div style="font-size:10px;color:rgba(255,255,255,.25);margin-top:6px;">Unique — Magma Demon drop · One time use</div>`;
  } else if(item.slot==='amulet'&&item.bonusPerks){
    stats=`<div style="font-size:11px;color:rgba(255,255,255,.45);margin-bottom:8px;font-style:italic;">${item.desc.split('.')[0]}.</div>`;
    stats+=item.bonusPerks.map(p=>`<div class="affix-row affix-pos">✦ ${p.label}: ${p.desc}</div>`).join('');
    stats+=`<div style="font-size:10px;color:rgba(255,255,255,.25);margin-top:6px;">Unique — Bone Lord drop</div>`;
  } else if(item.isPickpocket){
    stats=`<div style="font-size:13px;color:#d888d8;margin-bottom:6px;">🫳 On Crit: Steal item from enemy</div>`;
    stats+=`<div style="font-size:11px;margin-bottom:4px;">ATK bonus: <b>+${item.minVal}</b> &nbsp;·&nbsp; <span style="color:${rColor}">Legendary</span></div>`;
    stats+=`<div style="font-size:11px;color:rgba(255,255,255,.45);font-style:italic;margin-bottom:6px;">${item.desc}</div>`;
    stats+=`<div class="affix-row affix-pos">✦ Steal chance: 70% → decreases each steal per room</div>`;
    stats+=`<div style="font-size:10px;color:rgba(255,255,255,.25);margin-top:6px;">Unique · Starting relic</div>`;
  }
  else if(item.rarity==='blankslate'){
    const filledSlots=item.affixes.length;
    const totalSlots=item.maxAffixes||7;
    stats=`<div style="font-size:12px;margin-bottom:6px;">ATK range: <b>${item.minVal}–${item.maxVal}</b> &nbsp;·&nbsp; <span style="color:var(--blankslate)">Blank Slate</span></div>`;
    stats+=`<div style="font-size:11px;color:rgba(255,255,255,.5);margin-bottom:6px;">${item.lore}</div>`;
    stats+=`<div style="font-size:11px;margin-bottom:4px;">Affix slots: <span style="color:var(--blankslate)">${filledSlots}/${totalSlots}</span></div>`;
    if(item.affixes.length) item.affixes.forEach(a=>{stats+=`<div class="affix-row ${a.positive?'affix-pos':'affix-neg'}">${a.label}: ${a.desc}</div>`;});
    else stats+=`<div style="font-size:11px;color:rgba(255,255,255,.3);font-style:italic;">No affixes yet. Use the Weapon Shrine.</div>`;
  } else {
    stats=`<div style="font-size:12px;margin-bottom:4px;">${item.stat?.toUpperCase()} range: <b>${item.minVal}–${item.maxVal||item.value}</b> &nbsp;·&nbsp; <span style="color:${rColor}">${RARITIES[item.rarity].name}</span></div>`;
    if(item.chestResist) stats+=`<div style="font-size:11px;color:#88aaff;margin-bottom:3px;">🛡 Status Resist: ${item.chestResist}%</div>`;
    if(item.affixes?.length) item.affixes.forEach(a=>{stats+=`<div class="affix-row ${a.positive?'affix-pos':'affix-neg'}">${a.label}: ${a.desc}</div>`;});
  }

  return`<div>${iconHtml}<div class="loot-name ${item.rarity}">${item.name}</div>${stats}</div>`;
}

// =====================================================
// DERIVED STATS
