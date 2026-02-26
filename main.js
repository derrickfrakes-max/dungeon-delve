function showScreen(id){document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));document.getElementById(id).classList.add('active');}
// =====================================================
// SAVE / LOAD SYSTEM
// =====================================================
const SAVE_KEY='dungeon_delve_save';

function saveGame(manual=false){
  if(!player) return;
  const saveData={
    version:'0.7',
    timestamp:Date.now(),
    floor:currentFloor,
    altarPurchasedCount,
    gameState,
    player:JSON.parse(JSON.stringify(player)),
  };
  try{
    localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
    const ind=document.getElementById('save-indicator');
    if(ind){
      const t=new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});
      ind.textContent=`Saved ${t}`;
      if(manual){ind.style.color='rgba(201,168,76,.6)';setTimeout(()=>ind.style.color='rgba(255,255,255,.2)',2000);}
    }
  } catch(e){console.warn('Save failed:',e);}
}

function loadGame(){
  try{
    const raw=localStorage.getItem(SAVE_KEY);
    if(!raw) return;
    const data=JSON.parse(raw);
    player=data.player;
    currentFloor=data.floor||1;
    altarPurchasedCount=data.altarPurchasedCount||0;
    if(data.gameState) Object.assign(gameState, data.gameState);
    // Restore pouch as plain array if needed
    if(!Array.isArray(player.pouch)) player.pouch=[null,null,null];
    if(!player.stealCount) player.stealCount=0;
    showGraveyard();
  } catch(e){console.warn('Load failed:',e);}
}

function deleteSave(){
  if(!confirm('Delete saved game? This cannot be undone.')) return;
  localStorage.removeItem(SAVE_KEY);
  document.getElementById('continue-block').style.display='none';
}

function checkForSave(){
  try{
    const raw=localStorage.getItem(SAVE_KEY);
    if(!raw) return;
    const data=JSON.parse(raw);
    if(!data.player) return;
    const cb=document.getElementById('continue-block');
    const ci=document.getElementById('continue-info');
    if(cb&&ci){
      const d=new Date(data.timestamp);
      const dateStr=d.toLocaleDateString([],{month:'short',day:'numeric'});
      const timeStr=d.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});
      ci.textContent=`${data.player.name}  ·  Floor B${data.floor}  ·  Level ${data.player.level}  ·  ${dateStr} ${timeStr}`;
      cb.style.display='block';
    }
  } catch(e){}
}

function startGame(){
  const name=document.getElementById('player-name-input').value.trim()||'Adventurer';
  player=createPlayer(name);currentFloor=1;altarPurchasedCount=0;
  showGraveyard();
}

function respawn(){
  // Wipe save on death — roguelike tradition
  localStorage.removeItem(SAVE_KEY);
  player=createPlayer(player.name);currentFloor=1;altarPurchasedCount=0;
  showGraveyard();
}

// Check on page load
window.addEventListener('DOMContentLoaded', checkForSave);

function enterDungeon(){currentFloor=1;startFloor();}
showScreen('title-screen');
