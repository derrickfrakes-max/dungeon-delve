// =====================================================
// STATUS EFFECTS
// =====================================================
const STATUS_DURATIONS={poison:3,burn:3,slow:2,curse:3,drain:2};

function tryInflictStatus(enemy){
  if(!enemy.inflict||Math.random()>enemy.inflictChance) return;
  const resist=getStatusResist();
  if(Math.random()*100<resist){log(`🛡 Resisted ${enemy.inflict}!`,'log-system');return;}
  if(player.statusEffects.find(s=>s.type===enemy.inflict)) return; // already active
  const dur=STATUS_DURATIONS[enemy.inflict]||2;
  player.statusEffects.push({type:enemy.inflict,turns:dur});
  const msgs={poison:'☠ You have been poisoned!',burn:'🔥 You are burning!',slow:'❄ You have been slowed!',curse:'💀 You are cursed!',drain:'🩸 Your strength is being drained!'};
  const classes={poison:'log-poison',burn:'log-burn',slow:'log-rare',curse:'log-legendary',drain:'log-death'};
  log(msgs[enemy.inflict]||'A status was inflicted!',classes[enemy.inflict]||'log-system');
  updateHUD();
}

function tickStatusEffects(){
  let msgs=[];
  player.statusEffects=player.statusEffects.filter(s=>{
    switch(s.type){
      case'poison':{const d=rand(2,5);player.hp=Math.max(1,player.hp-d);msgs.push(`☠ Poison: -${d} HP`);break;}
      case'burn':  {const d=rand(3,7);player.hp=Math.max(1,player.hp-d);msgs.push(`🔥 Burn: -${d} HP`);break;}
      case'drain': {msgs.push(`🩸 Drain active: ATK reduced`);break;}
      case'slow':  {msgs.push(`❄ Slowed: SPD halved`);break;}
      case'curse': {const d=rand(1,4);player.hp=Math.max(1,player.hp-d);msgs.push(`💀 Curse: -${d} HP`);break;}
    }
    s.turns--;return s.turns>0;
  });
  msgs.forEach(m=>log(m,'log-poison'));
  if(msgs.length) updateHUD();
}

// =====================================================
// ENEMIES
// =====================================================
function generateEnemies(floor){
  const isBoss=floor%5===0;
  if(isBoss){
    const bt=BOSS_TYPES[Math.min(Math.floor(floor/5)-1,BOSS_TYPES.length-1)];
    const s=1+(floor-1)*.2;
    return[{...bt,hp:Math.round(bt.baseHp*s),maxHp:Math.round(bt.baseHp*s),atk:Math.round(bt.baseAtk*s),def:Math.round(bt.baseDef*s),spd:bt.baseSpd,isBoss:true,id:0,statusEffects:[]}];
  }
  const count=Math.min(3,1+Math.floor(floor/3));
  const s=1+(floor-1)*.18;
  const pool=ENEMY_TYPES.slice(0,Math.min(2+Math.floor(floor/2),ENEMY_TYPES.length));
  return Array.from({length:count},(_,i)=>{
    const t=pool[rand(0,pool.length-1)];
    const v=.85+Math.random()*.3;
    return{...t,hp:Math.round(t.baseHp*s*v),maxHp:Math.round(t.baseHp*s*v),atk:Math.round(t.baseAtk*s*v),def:Math.round(t.baseDef*s*v),spd:t.baseSpd,id:i,statusEffects:[]};
  });
}

// =====================================================
// COMBAT
// =====================================================
