function rollWeaponDmg(){
  const w=player.equipped.weapon;
  if(!w||w.isConsumable) return rand(getPlayerAtk()-3,getPlayerAtk()+4);
  return rand(w.minVal,w.maxVal);
}
function calcDmgAfterDef(raw,def){return Math.max(1,raw-Math.floor(def*.55));}

function calcPlayerDmg(target){
  let base=rollWeaponDmg();
  const affixes=getAllAffixes();
  let hits=1;
  if(affixes.find(a=>a.id==='doublehit')&&Math.random()<.20) hits=2;
  const isCrit=Math.random()*100<getCrit();

  // Executioner perk
  let execBonus=0;
  const execP=player.perks.find(p=>p.effects.executioner);
  if(execP&&target&&target.hp/target.maxHp<.25) execBonus=Math.round(base*execP.effects.executioner/100);

  let fire=0;
  if(affixes.find(a=>a.id==='burning')&&Math.random()<.30) fire=rand(4,8);
  let total=base*hits;
  if(isCrit) total=Math.round(total*1.5);
  total+=fire+execBonus;
  return{total:Math.max(1,total),isCrit,hits,fire,execBonus};
}

function calcEnemyDmg(e){const v=Math.floor(e.atk*.3);return Math.max(1,rand(e.atk-v,e.atk+v));}

function checkInitiative(){
  const alive=enemies.filter(e=>e.hp>0);
  const avgSpd=alive.reduce((s,e)=>s+e.spd,0)/alive.length;
  const dep=Math.floor(currentFloor/8)*.03;
  const enemyWins=Math.random()<(.35+dep-(getPlayerSpd()-avgSpd)*.025);
  showInitBanner(!enemyWins);
  if(enemyWins){log('⚡ <span class="log-enemy">Enemies strike first!</span>','log-enemy');return'enemy';}
  log('⚡ <span class="log-player">You have initiative!</span>','log-player');return'player';
}

function showInitBanner(pw){
  const b=document.getElementById('initiative-banner');
  b.textContent=pw?'⚡ YOU HAVE INITIATIVE':'⚡ ENEMIES STRIKE FIRST';
  b.className=pw?'player':'enemy';b.style.display='block';
  setTimeout(()=>{b.style.display='none';},2200);
}

function startFloor(){
  battleOver=false;playerTurn=true;selectedEnemy=null;
  enemies=generateEnemies(currentFloor);player.tempBuffs={atk:0,def:0};player.stealCount=0;
  const isBoss=currentFloor%5===0;
  if(isBoss&&isStaffEquipped()){
    showArcaneFont(()=>_startFloorInner(isBoss));
  } else {
    _startFloorInner(isBoss);
  }
}
function _startFloorInner(isBoss){
  showScreen('game-screen');
  document.getElementById('combat-log').innerHTML='';
  if(isBoss) log(`⚠️ <b>BOSS — Floor B${currentFloor}!</b>`,'log-death');
  else log(`<span class="log-floor">— Room ${currentFloor} —</span>`,'log-floor');
  enemies.forEach(e=>log(`👁 <span class="log-enemy">${e.name}</span> appears! HP:${e.hp} ATK:${e.atk} DEF:${e.def}`,'log-enemy'));
  renderPlayerChar();renderEnemies();setActionButtons(true);updateHUD();
  selectedEnemy=0;renderEnemies();
  const rp=player.perks.find(p=>p.effects.regenPerFloor);
  if(rp){player.hp=Math.min(getEffectiveMaxHp(),player.hp+rp.effects.regenPerFloor);log(`💚 Regen: +${rp.effects.regenPerFloor} HP`,'log-perk');updateHUD();}
  setTimeout(()=>{const init=checkInitiative();if(init==='enemy'){playerTurn=false;setActionButtons(false);setTimeout(enemyTurns,1500);}},300);
}

function playerAttack(){
  if(!playerTurn||battleOver) return;
  if(selectedEnemy===null||!enemies[selectedEnemy]||enemies[selectedEnemy].hp<=0){
    const f=enemies.findIndex(e=>e.hp>0);if(f===-1) return;selectedEnemy=f;renderEnemies();
  }
  const target=enemies[selectedEnemy];
  if(!target||target.hp<=0) return;
  const affixes=getAllAffixes();

  // AoE attacks
  const isCleave=affixes.find(a=>a.id==='cleave');
  const isLashAll=affixes.find(a=>a.id==='lashall');
  const isMultiArrow=affixes.find(a=>a.id==='multiarrow')&&Math.random()<.35;
  const isChainSplash=affixes.find(a=>a.id==='chainsplash');

  if(isCleave||isLashAll){
    // Hit all enemies
    const mult=isLashAll?0.5:0.70;
    const dmgInfo=calcPlayerDmg(target);
    enemies.filter(e=>e.hp>0).forEach((e,i)=>{
      const raw=Math.max(1,Math.round(dmgInfo.total*mult));
      const dmg=calcDmgAfterDef(raw,e.def);
      e.hp=Math.max(0,e.hp-dmg);
      const sl=document.getElementById(`enemy-slot-${i}`);
      if(sl) showFloater(sl,`-${dmg}`,isCleave?'#ff9944':'#ffcc44');
      if(e.hp<=0) killEnemy(i);
    });
    log(`${isCleave?'⚔⚔ <b>CLEAVE!</b>':'〰 <b>LASH ALL!</b>'} Hit all enemies for ${Math.round(dmgInfo.total*mult*100/dmgInfo.total)}% damage!`,'log-player');
  } else if(isMultiArrow){
    const arrowCount=rand(2,3);
    log(`🏹 <b>Multi-Arrow!</b> ${arrowCount} arrows fly!`,'log-player');
    for(let i=0;i<arrowCount;i++){
      const aliveIdx=enemies.reduce((acc,e,i)=>{if(e.hp>0)acc.push(i);return acc;},[]);
      if(!aliveIdx.length) break;
      const tIdx=aliveIdx[rand(0,aliveIdx.length-1)];
      const t2=enemies[tIdx];
      const d=calcPlayerDmg(t2);
      const dmg=calcDmgAfterDef(d.total,t2.def);
      t2.hp=Math.max(0,t2.hp-dmg);
      const sl=document.getElementById(`enemy-slot-${tIdx}`);
      if(sl) showFloater(sl,`-${dmg}`,'#88ccff');
      if(t2.hp<=0) killEnemy(tIdx);
    }
  } else {
    // Normal single target attack
    const{total:rawDmg,isCrit,hits,fire,execBonus}=calcPlayerDmg(target);
    const dmg=calcDmgAfterDef(rawDmg,target.def);
    target.hp=Math.max(0,target.hp-dmg);
    let msg=`⚔ <span class="log-player">${player.name}</span> hits <b>${target.name}</b> for <b>${dmg}</b>`;
    if(isCrit) msg+=` <span style="color:#f0c060">CRIT!</span>`;
    if(hits>1) msg+=` (double!)`;
    if(fire) msg+=` +${fire}🔥`;
    if(execBonus) msg+=` <span style="color:#ff4444">+${execBonus} EXECUTE!</span>`;
    log(msg,'log-player');
    // Pickpocket gloves — steal attempt on crit
    if(isCrit&&player.equipped.gloves?.isPickpocket&&target.hp>0){
      const sc=player.stealCount||0;
      // Base 70% chance, drops 12% per successful steal, floor of 10%
      const stealChance=Math.max(0.10, 0.70 - sc*0.12);
      const stealRoll=Math.random();
      const pctDisplay=Math.round(stealChance*100);
      if(stealRoll<stealChance){
        const stolen=generateItem(currentFloor);
        player.stealCount=(player.stealCount||0)+1;
        if(player.inventory.length<(player.inventoryMax||8)){
          player.inventory.push(stolen);
          log(`🫳 <span style="color:#d888d8">Wraithfingers snatch a ${stolen.name} from ${target.name}! (${pctDisplay}% chance)</span>`,'log-legendary');
        } else {
          // Pack full — show loot modal mid-combat so player can swap or drop
          log(`🫳 <span style="color:#d888d8">Wraithfingers snatch a ${stolen.name}! Pack full — manage your items. (${pctDisplay}%)</span>`,'log-legendary');
          pendingLoot=stolen;
          // Pause and show loot modal; combat resumes after player dismisses it
          setActionButtons(false);
          showLootModal(stolen);
        }
      } else {
        log(`🫳 <span style="color:rgba(255,255,255,.35)">Wraithfingers grasp at nothing... (${pctDisplay}% chance)</span>`,'log-system');
      }
    }
    if(isChainSplash){
      enemies.filter((e,i)=>e.hp>0&&i!==selectedEnemy).forEach((e,i)=>{
        const splash=calcDmgAfterDef(Math.round(dmg*.4),e.def);
        e.hp=Math.max(0,e.hp-splash);
        const sl=document.getElementById(`enemy-slot-${e.id}`);
        if(sl) showFloater(sl,`-${splash}`,'#ffaa44');
        if(e.hp<=0) killEnemy(e.id);
      });
      log(`⛓ Chain Splash hits adjacent enemies!`,'log-player');
    }
    const slot=document.getElementById(`enemy-slot-${selectedEnemy}`);
    if(slot) showFloater(slot,`-${dmg}${isCrit?'!':''}`,isCrit?'#f0c060':'#ff6666');
    if(target.hp<=0) killEnemy(selectedEnemy);
  }

  // Lifesteal
  const ls=getLS();
  if(ls>0){const h=Math.max(1,Math.round(rollWeaponDmg()*ls/100));player.hp=Math.min(getEffectiveMaxHp(),player.hp+h);log(`🩸 Lifesteal +${h} HP`,'log-player');}

  // Poison affix
  if(affixes.find(a=>a.id==='poison')&&Math.random()<.25&&target&&target.hp>0&&!target.statusEffects.includes('poison')){
    target.statusEffects.push('poison');log(`☠ ${target.name} is poisoned!`,'log-poison');
  }

  renderPlayerChar();renderEnemies();updateHUD();
  const alive=enemies.filter(e=>e.hp>0).length;
  if(alive===0){setTimeout(()=>battleWon(),700);return;}
  if(enemies[selectedEnemy]?.hp<=0){selectedEnemy=enemies.findIndex(e=>e.hp>0);renderEnemies();}
  playerTurn=false;setActionButtons(false);setTimeout(enemyTurns,900);
}

function generateMagmaBackpack(){
  return {
    id:uid(),
    name:"Scorched Expedition Pack",
    icon:"🎒",
    slot:'backpack',
    rarity:'legendary',
    isConsumable:false,
    isBackpack:true,
    inventoryBonus:4,
    desc:'A fire-hardened pack stripped from the Magma Demon\'s hoard. Expands your carry capacity by 4 slots.',
    affixes:[],
    value:0,
    sellPrice:150,
  };
}

function applyBackpack(item){
  if(!item.isBackpack) return;
  player.inventoryMax=(player.inventoryMax||8)+item.inventoryBonus;
  log(`🎒 <span style="color:#d888d8">Scorched Expedition Pack equipped! Inventory expanded to ${player.inventoryMax} slots.</span>`,'log-legendary');
  updateHUD();
}

function generateBoneLordAmulet(){
  const perkPool=[
    {label:'Bone-Forged HP',   stat:'maxHp',        value:20, desc:'+20 Max HP'},
    {label:'Cursed Strength',  stat:'atk',           value:4,  desc:'+4 ATK'},
    {label:'Death\'s Caress',  stat:'critBonus',     value:8,  desc:'+8% Crit'},
    {label:'Tomb Ward',        stat:'def',            value:3,  desc:'+3 DEF'},
    {label:'Grave Luck',       stat:'luckBonus',     value:1,  desc:'+1 Luck'},
    {label:'Undying Speed',    stat:'spd',           value:2,  desc:'+2 SPD'},
    {label:'Soul Siphon',      stat:'lifestealBonus',value:5,  desc:'+5% Lifesteal'},
    {label:'Marrow Mana',      stat:'maxManaBonus',  value:10, desc:'+10 Max Mana'},
    {label:'Iron Bones',       stat:'def',            value:5,  desc:'+5 DEF'},
    {label:'Reaper\'s Focus',  stat:'critBonus',     value:6,  desc:'+6% Crit'},
  ];
  // Pick 4 random unique perks
  const chosen=[...perkPool].sort(()=>Math.random()-.5).slice(0,4);
  const descLines=chosen.map(p=>p.desc).join(', ');
  return {
    id:uid(),
    name:'Bone Lord\'s Amulet',
    icon:'📿',
    slot:'amulet',
    rarity:'legendary',
    isConsumable:false,
    desc:`Forged from the shattered crown of the Bone Lord. ${descLines}.`,
    bonusPerks:chosen,
    value:200,
    sellPrice:80,
    affixes:[],
  };
}

function applyAmuletStats(){
  // Called in getPlayerAtk/Def/Spd and updateHUD to apply amulet bonuses
  // Returns object of bonus stats from equipped amulet
  const am=player.equipped.amulet;
  if(!am||!am.bonusPerks) return {};
  const out={};
  am.bonusPerks.forEach(p=>{out[p.stat]=(out[p.stat]||0)+p.value;});
  return out;
}

function killEnemy(idx){
  const e=enemies[idx];if(!e||e.hp>0) return; // guard against double-kill
  log(`💀 <b>${e.name}</b> slain!`,'log-system');
  player.enemiesKilled++;gainXP(e.xp);
  const lp=player.perks.find(p=>p.effects.luckBonus);
  const gm=lp?1+lp.effects.luckBonus*.1:1;
  const g=Math.round(rand(e.gold[0],e.gold[1])*gm);
  player.gold+=g;log(`💰 +${g} gold`,'log-system');
  // 1% blank slate, otherwise normal drop
  const dropRoll=Math.random();
  const dropChance=.5+(lp?lp.effects.luckBonus*.05:0);
  if(dropRoll<.01){pendingLoot=generateItem(currentFloor,false,true);}
  else if(dropRoll<dropChance){pendingLoot=generateItem(currentFloor);}
}

function enemyTurns(){
  if(battleOver) return;
  const alive=enemies.filter(e=>e.hp>0);let delay=0;
  alive.forEach(enemy=>{
    setTimeout(()=>{
      if(battleOver||player.hp<=0) return;
      // Enemy poison tick
      if(enemy.statusEffects?.includes('poison')){
        enemy.hp=Math.max(0,enemy.hp-3);log(`☠ ${enemy.name} takes 3 poison dmg`,'log-poison');
        if(enemy.hp<=0){killEnemy(enemy.id);renderEnemies();updateHUD();return;}
      }
      const sl=document.getElementById(`enemy-slot-${enemy.id}`);
      if(sl){sl.classList.add('attacking');setTimeout(()=>sl.classList.remove('attacking'),350);}
      const rawDmg=calcEnemyDmg(enemy);
      const dmg=calcDmgAfterDef(rawDmg,getPlayerDef());
      player.hp=Math.max(0,player.hp-dmg);
      tryInflictStatus(enemy);
      log(`🗡 <span class="log-enemy">${enemy.name}</span> attacks for <b>${dmg}</b>`,'log-enemy');
      const pc=document.getElementById('player-char');pc.classList.add('hit');setTimeout(()=>pc.classList.remove('hit'),300);
      updateHUD();renderPlayerChar();
      if(player.hp<=0){setTimeout(()=>playerDied(enemy.name),300);}
    },delay);
    delay+=650;
  });
  setTimeout(()=>{
    if(!battleOver&&player.hp>0){
      tickStatusEffects();
      if(player.hp<=0){playerDied('status effects');return;}
      playerTurn=true;setActionButtons(true);
    }
  },delay+200);
}

const FLEE_SUCCESS_STORIES=[
  {floor:[1,3], tales:[
    `__NAME__ spots a crumbling wall, hurls themselves through it, and tumbles down a refuse pile — right back at the graveyard entrance.`,
    `Dodging between the enemy's legs, __NAME__ sprints for a rusted grate, wrenches it open, and crawls through a drainage tunnel that deposits them, damp and gasping, outside.`,
    `__NAME__ hurls a torch at the nearest skeleton and bolts for the door, never looking back.`,
  ]},
  {floor:[4,9], tales:[
    `__NAME__ kicks over a brazier, plunging the corridor into chaos, and vaults through a broken window — scaling the outer wall hand-over-hand back to the surface.`,
    `A lucky stumble sends __NAME__ crashing through a rotten floor panel, landing in a forgotten passage that winds all the way back to the graveyard.`,
    `__NAME__ shouts "NOT TODAY!" and leaps from a balcony, grabbing a tattered tapestry to slow the fall, landing in a heap at the dungeon's mouth.`,
  ]},
  {floor:[10,19], tales:[
    `__NAME__ triggers an old trap intentionally — the swinging blade opens a hidden escape hatch. Battered but alive, they crawl back to daylight.`,
    `Summoning the last dregs of speed, __NAME__ outruns every pursuing horror and bursts through the dungeon gates like a cork from a bottle.`,
    `__NAME__ dives into a river of slime that carries them helplessly — but safely — back out through the dungeon's drainage system.`,
  ]},
  {floor:[20,99], tales:[
    `The deep dungeon holds secrets. __NAME__ whispers a forbidden word read from a wall and is teleported in a flash of sickly light back to the surface.`,
    `__NAME__ tears a glowing rune-stone from the wall and crushes it underfoot. The magic explosion sends them rocketing upward through six floors of stone, landing at the graveyard.`,
    `Even in these depths, survival instinct takes over. __NAME__ collapses a ceiling section, rides the rubble up a ventilation shaft, and emerges in the graveyard, covered in dust.`,
  ]},
];

const FLEE_FAIL_MESSAGES={
  'The Bone Lord': `The Bone Lord's fleshless hand shoots out and seizes your collar — its speed is supernatural. It hurls you back into the fight and rakes you with its claws!`,
  'Magma Demon': `The Magma Demon's volcanic arm slams the exit shut in a wall of fire. The heat alone drives you back and scorches your skin!`,
  'Ancient Lich': `The Ancient Lich utters a single syllable and your legs simply stop moving. You hover for a moment, then crash to the floor as it floats toward you.`,
  'Shadow Titan': `The Shadow Titan is already at the exit before you blink. It blocks the doorway entirely — you are running into a wall of muscle and shadow that strikes back instantly.`,
  'Goblin': `The goblin, surprisingly nimble, cackles and trips you from behind!`,
  'Vampire': `The Vampire blurs across the room in a heartbeat and bars the exit, smiling coldly. Its speed is simply inhuman.`,
  'Stone Golem': `Somehow the Stone Golem's massive fist is already in your path. It doesn't even look like it moved — it just... appeared there. It punches you back.`,
  'Wraith': `The Wraith drifts through the wall and materialises directly between you and the door, screaming in your face as it strikes.`,
};

function getFleeSuccessStory(){
  const f=currentFloor;
  const bracket=FLEE_SUCCESS_STORIES.find(b=>f>=b.floor[0]&&f<=b.floor[1])||FLEE_SUCCESS_STORIES[0];
  const tale=bracket.tales[rand(0,bracket.tales.length-1)];
  return tale.replace(/__NAME__/g, player.name);
}

function getFleeFailMsg(){
  const alive=enemies.filter(e=>e.hp>0);
  for(const e of alive){
    if(FLEE_FAIL_MESSAGES[e.name]) return `<b>${e.name}</b>: ${FLEE_FAIL_MESSAGES[e.name]}`;
  }
  const generic=[
    `The exit is cut off — a blade catches you across the back as you're forced to turn and fight!`,
    `You trip on uneven stone. The monsters are on you before you can recover!`,
    `A locked iron door bars your path. There's no way out.`,
    `Your enemy anticipated the retreat. You're surrounded.`,
  ];
  return generic[rand(0,generic.length-1)];
}

function attemptFlee(){
  if(!playerTurn||battleOver) return;
  const alive=enemies.filter(e=>e.hp>0);
  const avg=alive.reduce((s,e)=>s+e.spd,0)/alive.length;
  const chance=Math.min(.80,Math.max(.15,.45+(getPlayerSpd()-avg)*.05));
  if(Math.random()<chance){
    battleOver=true;
    player.statusEffects=[];
    const story=getFleeSuccessStory();
    const t=document.getElementById('floor-transition');
    t.innerHTML=`<span style="font-size:20px;margin-bottom:12px;">🏃 Escaped!</span><span style="font-size:13px;opacity:.8;letter-spacing:1px;max-width:500px;text-align:center;line-height:1.6;">${story}</span><span style="font-size:11px;opacity:.4;margin-top:10px;letter-spacing:2px;">— Gold, gear, and grit intact —</span><button class="btn" style="margin-top:24px;font-size:13px;padding:12px 32px;letter-spacing:3px;" onclick="finishFlee()">Return to Graveyard</button>`;
    t.classList.add('show');
  } else {
    const failMsg=getFleeFailMsg();
    log(`🏃 <span class="log-enemy">Escape failed!</span> ${failMsg}`,'log-enemy');
    playerTurn=false;setActionButtons(false);setTimeout(enemyTurns,700);
  }
}

function finishFlee(){
  const t=document.getElementById('floor-transition');
  t.classList.remove('show');
  currentFloor=1;
  updateHUD();
  showGraveyard();
}

function useItemFromBattle(){
  if(!playerTurn||battleOver) return;
  const cons=player.inventory.filter(i=>i&&i.isConsumable);
  if(!cons.length){log('No consumables!','log-system');return;}
  const list=document.getElementById('consumable-list');list.innerHTML='';
  cons.forEach(item=>{
    const b=document.createElement('button');b.className='btn';
    b.style.cssText='width:100%;text-align:left;font-size:12px;padding:10px 14px;letter-spacing:1px;';
    b.innerHTML=`${item.icon} ${item.name} <span style="color:rgba(255,255,255,.4);float:right">${item.desc}</span>`;
    b.onclick=()=>{applyConsumable(item);player.inventory.splice(player.inventory.indexOf(item),1);closeConsumableModal();updateHUD();playerTurn=false;setActionButtons(false);setTimeout(enemyTurns,700);};
    list.appendChild(b);
  });
  document.getElementById('consumable-modal').classList.remove('hidden');
}
function closeConsumableModal(){document.getElementById('consumable-modal').classList.add('hidden');}

function applyConsumable(item){
  switch(item.effect){
    case'heal':{const h=Math.min(item.value,player.maxHp-player.hp);player.hp+=h;log(`🧪 ${item.name}: +${h} HP`,'log-loot');break;}
    case'buff_atk':player.tempBuffs.atk+=item.value;log(`⚗️ ${item.name}: ATK +${item.value}`,'log-loot');break;
    case'buff_def':player.tempBuffs.def+=item.value;log(`🫙 ${item.name}: DEF +${item.value}`,'log-loot');break;
    case'cure':player.statusEffects=player.statusEffects.filter(s=>s.type!=='poison');log(`🍶 Poison cured!`,'log-loot');break;
    case'cure_burn':player.statusEffects=player.statusEffects.filter(s=>s.type!=='burn');log(`🧯 Burn cured!`,'log-burn');break;
    case'cure_slow':player.statusEffects=player.statusEffects.filter(s=>s.type!=='slow');log(`💨 Slow cured!`,'log-rare');break;
    case'restore_mana':{const m=Math.min(item.value,(player.maxMana||30)-(player.mana||0));player.mana=(player.mana||0)+m;log(`🔵 Mana Vial: +${m} mana`,'log-rare');break;}
  }
  renderPlayerChar();updateHUD();
}

let pendingLevelUpPerks=0;

function gainXP(amt){
  player.xp+=amt;
  while(player.xp>=player.xpToNext){
    player.xp-=player.xpToNext;player.level++;player.xpToNext=Math.round(player.xpToNext*1.45);
    log(`✨ <b>LEVEL UP! Now level ${player.level}!</b> Choose your attribute.`,'log-legendary');
    pendingLevelUpPerks++;
  }
}

function drainLevelUpPerks(afterCb){
  if(pendingLevelUpPerks<=0){afterCb();return;}
  pendingLevelUpPerks--;
  showLevelUpChoice(()=>drainLevelUpPerks(afterCb));
}

function showLevelUpChoice(afterCb){
  const modal=document.getElementById('levelup-modal');
  document.getElementById('levelup-title').textContent=`⬆ LEVEL ${player.level}`;
  document.getElementById('levelup-subtitle').textContent='You grow stronger. Invest your point.';

  // Current stats display
  const lp=player.perks.find(p=>p.effects.luckBonus);
  const luck=lp?lp.effects.luckBonus:0;
  document.getElementById('levelup-stats').innerHTML=`
    <div style="text-align:center;"><div style="font-size:9px;color:rgba(255,255,255,.35);letter-spacing:1px;">HP</div><div style="font-size:14px;color:#e88;">${player.maxHp}</div></div>
    <div style="text-align:center;"><div style="font-size:9px;color:rgba(255,255,255,.35);letter-spacing:1px;">ATK</div><div style="font-size:14px;color:var(--gold2);">${player.atk}</div></div>
    <div style="text-align:center;"><div style="font-size:9px;color:rgba(255,255,255,.35);letter-spacing:1px;">DEF</div><div style="font-size:14px;color:var(--gold2);">${player.def}</div></div>
    <div style="text-align:center;"><div style="font-size:9px;color:rgba(255,255,255,.35);letter-spacing:1px;">SPD</div><div style="font-size:14px;color:var(--gold2);">${player.spd}</div></div>
    <div style="text-align:center;"><div style="font-size:9px;color:rgba(255,255,255,.35);letter-spacing:1px;">CRIT</div><div style="font-size:14px;color:var(--gold2);">${getCrit()}%</div></div>
    <div style="text-align:center;"><div style="font-size:9px;color:rgba(255,255,255,.35);letter-spacing:1px;">LUCK</div><div style="font-size:14px;color:var(--gold2);">${luck>0?'+'+luck:luck}</div></div>`;

  // Attribute options — pick 4 random from full pool each level
  const allAttrs=[
    {icon:'❤️', name:'Vitality',    desc:`Max HP +20, heal +10 now`,  apply:()=>{player.maxHp+=20;player.hp=Math.min(getEffectiveMaxHp(),player.hp+10);log(`❤️ Vitality up! Max HP +20.`,'log-perk');}},
    {icon:'⚔️', name:'Strength',    desc:`ATK +4`,                    apply:()=>{player.atk+=4;log(`⚔️ Strength up! ATK +4.`,'log-perk');}},
    {icon:'🛡️', name:'Fortitude',   desc:`DEF +3`,                    apply:()=>{player.def+=3;log(`🛡️ Fortitude up! DEF +3.`,'log-perk');}},
    {icon:'💨', name:'Agility',     desc:`SPD +3`,                    apply:()=>{player.spd+=3;log(`💨 Agility up! SPD +3.`,'log-perk');}},
    {icon:'🍀', name:'Fortune',     desc:`Luck +1 (better drops & gold)`, apply:()=>{
      const lp=player.perks.find(p=>p.effects.luckBonus);
      if(lp) lp.effects.luckBonus++;
      else player.perks.push({id:'lucky_lvl',name:"Fortune's Favor",desc:'Better loot and more gold.',effects:{luckBonus:1}});
      log(`🍀 Fortune up! Luck +1.`,'log-perk');}},
    {icon:'🎯', name:'Precision',   desc:`Crit chance +5%`,           apply:()=>{
      const cp=player.perks.find(p=>p.effects.critBonus);
      if(cp) cp.effects.critBonus+=5;
      else player.perks.push({id:'crit_lvl',name:'Precision',desc:'Crit chance bonus.',effects:{critBonus:5}});
      log(`🎯 Precision up! Crit +5%.`,'log-perk');}},
    {icon:'🔮', name:'Arcana',      desc:`Max Mana +10`,              apply:()=>{player.maxMana=(player.maxMana||30)+10;player.mana=Math.min(player.mana||0,player.maxMana);log(`🔮 Arcana up! Max Mana +10.`,'log-perk');}},
    {icon:'🩸', name:'Lifetap',     desc:`Lifesteal +3%`,             apply:()=>{
      const lsp=player.perks.find(p=>p.effects.lifestealBonus);
      if(lsp) lsp.effects.lifestealBonus+=3;
      else player.perks.push({id:'ls_lvl',name:'Lifetap',desc:'Lifesteal bonus.',effects:{lifestealBonus:3}});
      log(`🩸 Lifetap up! Lifesteal +3%.`,'log-perk');}},
  ];

  // Pick 4 random unique options
  const shuffled=[...allAttrs].sort(()=>Math.random()-.5).slice(0,4);
  const cont=document.getElementById('levelup-choices');cont.innerHTML='';
  shuffled.forEach(attr=>{
    const d=document.createElement('div');
    d.className='perk-choice';
    d.style.cssText='display:flex;align-items:center;gap:12px;padding:10px 14px;';
    d.innerHTML=`<span style="font-size:28px;flex-shrink:0;">${attr.icon}</span>
      <span>
        <div style="font-family:'Cinzel',serif;font-size:13px;color:var(--gold2);">${attr.name}</div>
        <div style="font-size:11px;color:rgba(255,255,255,.5);margin-top:2px;">${attr.desc}</div>
      </span>`;
    d.querySelectorAll('*').forEach(el=>el.style.pointerEvents='none');
    d.onclick=()=>{
      attr.apply();
      updateHUD();
      modal.classList.add('hidden');
      afterCb();
    };
    cont.appendChild(d);
  });

  modal.classList.remove('hidden');
}

function getMaxMana(){
  let v=30;
  for(const p of player.perks){if(p.effects.maxManaBonus)v+=p.effects.maxManaBonus;}
  const am=applyAmuletStats();if(am.maxManaBonus) v+=am.maxManaBonus;
  return v;
}
function getEffectiveMaxHp(){
  const am=applyAmuletStats();
  return player.maxHp+(am.maxHp||0);
}

function isStaffEquipped(){const w=player.equipped.weapon;return w&&(w.typeName==='Staff'||w.typeName==='Wand'||w.name.toLowerCase().includes('staff')||w.name.toLowerCase().includes('wand'));}

function getSpellFromWeapon(){
  const w=player.equipped.weapon;if(!w) return null;
  const n=(w.name||'').toLowerCase();const t=(w.typeName||'').toLowerCase();
  if(n.includes('fire')||n.includes('infernal')) return{name:'Fireball',mana:10,icon:'🔥',desc:'AoE 90% dmg + 30% burn'};
  if(n.includes('frost')||n.includes('cracked')) return{name:'Ice Lance',mana:8,icon:'❄',desc:'Single target, ignore 60% DEF, Slow'};
  if(n.includes('shadow')||n.includes('void')) return{name:'Soul Drain',mana:12,icon:'🌑',desc:'Single target, steal 30% dmg as HP'};
  if(n.includes('storm')||n.includes('runed')) return{name:'Chain Lightning',mana:10,icon:'⚡',desc:'Bounces all enemies decreasing dmg'};
  return{name:'Arcane Bolt',mana:8,icon:'✨',desc:'Single target, ignore 40% DEF'};
}

function castSpell(){
  if(!playerTurn||battleOver) return;
  if(!isStaffEquipped()){log('Equip a staff to cast spells!','log-system');return;}
  const spell=getSpellFromWeapon();
  if(!spell) return;
  if((player.mana||0)<spell.mana){log(`Not enough mana! Need ${spell.mana}, have ${player.mana||0}.`,'log-system');return;}
  if(selectedEnemy===null||!enemies[selectedEnemy]||enemies[selectedEnemy].hp<=0){
    const f=enemies.findIndex(e=>e.hp>0);if(f===-1) return;selectedEnemy=f;renderEnemies();
  }
  const target=enemies[selectedEnemy];
  if(!target||target.hp<=0) return;
  player.mana=Math.max(0,(player.mana||0)-spell.mana);
  const baseAtk=getPlayerAtk();
  switch(spell.name){
    case'Fireball':{
      const aoeRaw=Math.round(baseAtk*.9);
      enemies.filter(e=>e.hp>0).forEach((e,i)=>{
        const dmg=calcDmgAfterDef(aoeRaw,e.def);
        e.hp=Math.max(0,e.hp-dmg);
        const sl=document.getElementById(`enemy-slot-${i}`);
        if(sl) showFloater(sl,`-${dmg}`,'#ff6622');
        if(Math.random()<.3&&!e.statusEffects.includes('burn')) e.statusEffects.push('burn');
        if(e.hp<=0) killEnemy(i);
      });
      log(`🔥 <b>Fireball!</b> AoE hit all enemies for ~${aoeRaw} + burn chance!`,'log-player');
      break;
    }
    case'Ice Lance':{
      const rawDmg=Math.round(baseAtk*1.2);
      const effDef=Math.round(target.def*.4);
      const dmg=calcDmgAfterDef(rawDmg,effDef);
      target.hp=Math.max(0,target.hp-dmg);
      const sl2=document.getElementById(`enemy-slot-${selectedEnemy}`);
      if(sl2) showFloater(sl2,`-${dmg}`,'#88ccff');
      if(!target.statusEffects.includes('slow')) target.statusEffects.push('slow');
      log(`❄ <b>Ice Lance!</b> ${target.name} takes ${dmg} (ignores DEF) + Slowed!`,'log-player');
      if(target.hp<=0) killEnemy(selectedEnemy);
      break;
    }
    case'Soul Drain':{
      const rawDmg2=baseAtk;
      const dmg2=calcDmgAfterDef(rawDmg2,target.def);
      target.hp=Math.max(0,target.hp-dmg2);
      const heal=Math.round(dmg2*.3);
      player.hp=Math.min(getEffectiveMaxHp(),player.hp+heal);
      const sl3=document.getElementById(`enemy-slot-${selectedEnemy}`);
      if(sl3) showFloater(sl3,`-${dmg2}`,'#cc44cc');
      log(`🌑 <b>Soul Drain!</b> ${target.name} takes ${dmg2}, healed ${heal} HP.`,'log-player');
      if(target.hp<=0) killEnemy(selectedEnemy);
      break;
    }
    case'Chain Lightning':{
      let dmgChain=Math.round(baseAtk*1.1);
      let first=true;
      enemies.filter(e=>e.hp>0).forEach((e,i)=>{
        const d=calcDmgAfterDef(dmgChain,e.def);
        e.hp=Math.max(0,e.hp-d);
        const sl4=document.getElementById(`enemy-slot-${i}`);
        if(sl4) showFloater(sl4,`-${d}`,'#ffffaa');
        if(e.hp<=0) killEnemy(i);
        dmgChain=Math.round(dmgChain*.65);
      });
      log(`⚡ <b>Chain Lightning!</b> Bounced through all enemies!`,'log-player');
      break;
    }
    default:{
      const rawArc=Math.round(baseAtk*1.1);
      const effDefArc=Math.round(target.def*.6);
      const dmgArc=calcDmgAfterDef(rawArc,effDefArc);
      target.hp=Math.max(0,target.hp-dmgArc);
      const slArc=document.getElementById(`enemy-slot-${selectedEnemy}`);
      if(slArc) showFloater(slArc,`-${dmgArc}`,'#aaddff');
      log(`✨ <b>Arcane Bolt!</b> ${target.name} takes ${dmgArc} (ignores DEF).`,'log-player');
      if(target.hp<=0) killEnemy(selectedEnemy);
    }
  }
  renderPlayerChar();renderEnemies();updateHUD();
  const alive=enemies.filter(e=>e.hp>0).length;
  if(alive===0){setTimeout(()=>battleWon(),700);return;}
  playerTurn=false;setActionButtons(false);setTimeout(enemyTurns,900);
}

function showArcaneFont(afterCb){
  window._arcaneFontCb=afterCb;
  document.getElementById('arcane-font-modal').classList.remove('hidden');
}
function acceptArcaneFont(){
  player.mana=player.maxMana||30;
  log('🌀 Mana fully restored by the Arcane Font!','log-rare');
  document.getElementById('arcane-font-modal').classList.add('hidden');
  updateHUD();
  if(window._arcaneFontCb){window._arcaneFontCb();window._arcaneFontCb=null;}
}
function closeArcaneFont(){
  document.getElementById('arcane-font-modal').classList.add('hidden');
  if(window._arcaneFontCb){window._arcaneFontCb();window._arcaneFontCb=null;}
}

function setActionButtons(on){
  ['btn-attack','btn-item','btn-flee'].forEach(id=>{const b=document.getElementById(id);if(b)b.classList.toggle('disabled',!on);});
  const bm=document.getElementById('btn-magic');
  if(bm) bm.classList.toggle('disabled',!on);
  updateMagicButton();
}

function updateMagicButton(){
  const bm=document.getElementById('btn-magic');
  if(!bm) return;
  const staffOn=isStaffEquipped();
  bm.style.display=staffOn?'':'none';
  if(staffOn){
    const spell=getSpellFromWeapon();
    bm.textContent=spell?`${spell.icon} ${spell.name} (${spell.mana}✦)`:'✨ Magic';
  }
  const manaSection=document.getElementById('hud-mana-section');
  if(manaSection) manaSection.style.display=staffOn?'':'none';
}

function battleWon(){
  battleOver=true;player.tempBuffs={atk:0,def:0};player.floorsCleared++;
  player.deepestFloor=Math.max(player.deepestFloor,currentFloor);
  log(`🏆 <b>Victory!</b>`,'log-floor');setActionButtons(false);
  const isBoss=currentFloor%5===0;
  if(isBoss){
    player.mana=player.maxMana||30;log('🌀 Mana fully restored after boss kill!','log-rare');
    // Floor 5 Bone Lord drops the unique amulet
    if(currentFloor===5) pendingLoot=generateBoneLordAmulet();
    // Floor 10 Magma Demon drops the Scorched Backpack
    if(currentFloor===10) pendingLoot=generateMagmaBackpack();
  } else{const restore=Math.round((player.maxMana||30)*.25);player.mana=Math.min(player.maxMana||30,(player.mana||0)+restore);log(`🌀 Mana +${restore}`,'log-system');}
  updateHUD();
  setTimeout(()=>{
    const afterReward=()=>{
      if(isBoss) showWeaponShrine(()=>{if(currentFloor%7===0) showMerchant();else showPostRoomReward(false);});
      else if(currentFloor%7===0) showMerchant();
      else showPostRoomReward(false);
    };
    const afterLevelPerks=()=>{
      if(pendingLoot){
        pendingRewardAfterLoot=afterReward;
        showLootModal(pendingLoot);
      } else {
        afterReward();
      }
    };
    if(pendingLevelUpPerks>0){
      drainLevelUpPerks(afterLevelPerks);
    } else {
      afterLevelPerks();
    }
  },1000);
}

function playerDied(killedBy){
  battleOver=true;setActionButtons(false);
  gameState.graves.push({name:player.name,floor:currentFloor,killedBy,equipped:{...player.equipped},timestamp:Date.now(),id:uid()});
  showScreen('death-screen');
  document.getElementById('death-subtitle').textContent=`Slain by ${killedBy} on Floor B${currentFloor}`;
  document.getElementById('death-stats').innerHTML=`Floor Reached: <b>B${currentFloor}</b><br>Level: <b>${player.level}</b><br>Enemies Slain: <b>${player.enemiesKilled}</b><br>Gold: <b>${player.gold}</b>`;
}

// =====================================================
// WEAPON SHRINE
