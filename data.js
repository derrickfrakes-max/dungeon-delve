// =====================================================
// SVG WEAPON GRAPHICS
// =====================================================
function drawWeaponSVG(type, color='#a0a0a0', size=40) {
  const c = color;
  const s = size;
  switch(type) {
    case 'Sword': case 'Rapier':
      return `<svg width="${s}" height="${s*2.2}" viewBox="0 0 20 44"><rect x="9" y="2" width="2" height="30" fill="${c}" rx="1"/><rect x="5" y="30" width="10" height="2.5" fill="${c}" rx="1"/><rect x="9" y="32" width="2" height="8" fill="#8a7040" rx="1"/><ellipse cx="10" cy="40" rx="2" ry="2" fill="#6a5030"/></svg>`;
    case 'Greatsword':
      return `<svg width="${s*0.8}" height="${s*2.8}" viewBox="0 0 18 56"><rect x="8" y="1" width="2.5" height="38" fill="${c}" rx="1"/><rect x="3" y="37" width="12" height="3" fill="${c}" rx="1"/><rect x="8" y="40" width="2.5" height="12" fill="#8a7040" rx="1"/><ellipse cx="9" cy="52" rx="2.5" ry="2.5" fill="#6a5030"/><line x1="9" y1="1" x2="6" y2="14" stroke="${c}" stroke-width="1.5" opacity=".5"/><line x1="9" y1="1" x2="12" y2="14" stroke="${c}" stroke-width="1.5" opacity=".5"/></svg>`;
    case 'Axe': case 'Battle Axe':
      return `<svg width="${s*1.1}" height="${s*2}" viewBox="0 0 24 40"><rect x="11" y="10" width="2.5" height="28" fill="#8a7040" rx="1"/><path d="M13,10 C20,6 22,14 13,18 Z" fill="${c}"/><path d="M11,10 C4,6 2,14 11,18 Z" fill="${c}" opacity=".7"/><ellipse cx="12" cy="37" rx="2" ry="2" fill="#6a5030"/></svg>`;
    case 'Warhammer': case 'Mace':
      return `<svg width="${s*0.9}" height="${s*2}" viewBox="0 0 20 40"><rect x="9" y="14" width="2.5" height="24" fill="#8a7040" rx="1"/><rect x="4" y="4" width="12" height="12" fill="${c}" rx="2"/><rect x="5" y="2" width="10" height="3" fill="${c}" opacity=".7" rx="1"/><rect x="5" y="14" width="10" height="3" fill="${c}" opacity=".7" rx="1"/><ellipse cx="10" cy="37" rx="2" ry="2" fill="#6a5030"/></svg>`;
    case 'Staff':
      return `<svg width="${s*0.6}" height="${s*2.5}" viewBox="0 0 14 50"><rect x="6" y="10" width="2" height="36" fill="#7a5a30" rx="1"/><ellipse cx="7" cy="7" rx="5" ry="5" fill="none" stroke="${c}" stroke-width="1.5"/><circle cx="7" cy="7" r="2.5" fill="${c}" opacity=".8"/><circle cx="7" cy="7" r="1" fill="#fff" opacity=".6"/><ellipse cx="7" cy="45" rx="2" ry="2" fill="#6a5030"/></svg>`;
    case 'Dagger':
      return `<svg width="${s*0.6}" height="${s*1.6}" viewBox="0 0 12 32"><polygon points="6,2 8,18 6,20 4,18" fill="${c}"/><rect x="3" y="19" width="6" height="2" fill="#8a8080" rx="1"/><rect x="5" y="21" width="2" height="9" fill="#8a7040" rx="1"/><ellipse cx="6" cy="30" rx="1.5" ry="1.5" fill="#6a5030"/></svg>`;
    case 'Bow':
      return `<svg width="${s*1.2}" height="${s*2.4}" viewBox="0 0 26 48"><path d="M8,2 Q2,24 8,46" fill="none" stroke="#8a6030" stroke-width="2.5" stroke-linecap="round"/><line x1="8" y1="3" x2="8" y2="45" stroke="#c0a060" stroke-width=".8" stroke-dasharray="2,3"/><line x1="13" y1="10" x2="21" y2="24" stroke="${c}" stroke-width="1.5"/><line x1="13" y1="24" x2="21" y2="24" stroke="#8a6030" stroke-width="1"/><polygon points="21,24 18,21 18,27" fill="${c}"/></svg>`;
    case 'Whip':
      return `<svg width="${s*1.4}" height="${s*1.4}" viewBox="0 0 30 30"><path d="M3,3 C10,3 8,15 15,15 C22,15 22,25 28,27" fill="none" stroke="#8a6030" stroke-width="2.5" stroke-linecap="round"/><circle cx="3" cy="3" r="2.5" fill="#6a5030"/><circle cx="28" cy="27" r="1.5" fill="${c}"/></svg>`;
    case 'Flail':
      return `<svg width="${s*1.2}" height="${s*2}" viewBox="0 0 24 40"><rect x="10" y="2" width="2.5" height="16" fill="#8a7040" rx="1"/><line x1="11.5" y1="18" x2="14" y2="26" stroke="#8a8080" stroke-width="1.5"/><circle cx="14" cy="28" r="5" fill="${c}" opacity=".9"/><line x1="14" y1="23" x2="9" y2="20" stroke="${c}" stroke-width="1"/><line x1="14" y1="23" x2="19" y2="20" stroke="${c}" stroke-width="1"/><line x1="14" y1="33" x2="9" y2="36" stroke="${c}" stroke-width="1"/></svg>`;
    default:
      return `<svg width="${s*0.8}" height="${s*2}" viewBox="0 0 18 40"><rect x="8" y="2" width="2" height="28" fill="${c}" rx="1"/><rect x="4" y="28" width="10" height="2.5" fill="${c}" rx="1"/><rect x="8" y="30" width="2" height="8" fill="#8a7040" rx="1"/></svg>`;
  }
}

function getWeaponColor(rarity) {
  return {common:'#a0a0a0',uncommon:'#4ec94e',rare:'#7aaae8',legendary:'#d888d8',blankslate:'#d0d8ff'}[rarity]||'#a0a0a0';
}

// =====================================================
// DATA
// =====================================================
const RARITIES={
  common:   {name:'Common',   color:'#a0a0a0',rangeWidth:.15},
  uncommon: {name:'Uncommon', color:'#4ec94e',rangeWidth:.28},
  rare:     {name:'Rare',     color:'#4e7ec9',rangeWidth:.42},
  legendary:{name:'Legendary',color:'#c94ec9',rangeWidth:.60},
  blankslate:{name:'Blank Slate',color:'#e8e8ff',rangeWidth:.05},
};

const ALL_AFFIXES=[
  {id:'lifesteal', label:'Lifesteal',      desc:'Heal 15% of damage dealt',                    positive:true, statMod:{}},
  {id:'poison',    label:'Poisoned Blade', desc:'25% chance to poison enemy (3 dmg/turn)',     positive:true, statMod:{}},
  {id:'doublehit', label:'Swift Strikes',  desc:'20% chance to attack twice',                  positive:true, statMod:{}},
  {id:'burning',   label:'Burning',        desc:'30% chance +4–8 fire damage',                 positive:true, statMod:{}},
  {id:'keen',      label:'Keen Edge',      desc:'Crit chance +15%',                             positive:true, statMod:{}},
  {id:'vampiric',  label:'Vampiric',       desc:'Heal 20% of damage dealt',                    positive:true, statMod:{}},
  {id:'cleave',    label:'Cleave',         desc:'Attacks ALL enemies for 70% damage each',     positive:true, statMod:{}},
  {id:'multiarrow',label:'Multi-Arrow',    desc:'35% chance to fire 2–3 arrows at random foes',positive:true, statMod:{}},
  {id:'lashall',   label:'Lash All',       desc:'Always hits all enemies for 50% damage',      positive:true, statMod:{}},
  {id:'chainsplash',label:'Chain Splash',  desc:'Adjacent enemies take 40% splash damage',     positive:true, statMod:{}},
  {id:'heavy',     label:'Heavy',          desc:'SPD -3 while equipped',                        positive:false,statMod:{spd:-3}},
  {id:'brittle',   label:'Brittle',        desc:'DEF -4 while equipped',                        positive:false,statMod:{def:-4}},
  {id:'cursed',    label:'Cursed',         desc:'HP -10 on equip, but ATK range +4',           positive:false,statMod:{},onEquip:(p)=>{p.hp=Math.max(1,p.hp-10);}},
  {id:'fragile',   label:'Fragile',        desc:'Wide damage range but DEF -2',                positive:false,statMod:{def:-2}},
  {id:'sluggish',  label:'Sluggish',       desc:'SPD -5, DEF -2. Massive damage.',             positive:false,statMod:{spd:-5,def:-2}},
];

const WEAPON_TYPES=[
  {name:'Sword',      icon:'⚔️',  slot:'weapon',heavy:false},
  {name:'Greatsword', icon:'🗡️',  slot:'weapon',heavy:true, aoeAffix:'cleave'},
  {name:'Axe',        icon:'🪓',  slot:'weapon',heavy:true},
  {name:'Dagger',     icon:'🔪',  slot:'weapon',heavy:false,fastBonus:3},
  {name:'Staff',      icon:'🪄',  slot:'weapon',heavy:false},
  {name:'Mace',       icon:'🔨',  slot:'weapon',heavy:true},
  {name:'Rapier',     icon:'⚔️',  slot:'weapon',heavy:false,fastBonus:1},
  {name:'Warhammer',  icon:'🔨',  slot:'weapon',heavy:true},
  {name:'Bow',        icon:'🏹',  slot:'weapon',heavy:false,fastBonus:1,aoeAffix:'multiarrow'},
  {name:'Whip',       icon:'〰️', slot:'weapon',heavy:false,aoeAffix:'lashall'},
  {name:'Flail',      icon:'⛓️',  slot:'weapon',heavy:true, aoeAffix:'chainsplash'},
];
const ARMOR_TYPES=[
  {name:'Shield',     icon:'🛡️',stat:'def',slot:'shield'},
  {name:'Helm',       icon:'⛑️', stat:'def',slot:'helm'},
  {name:'Boots',      icon:'👢', stat:'spd',slot:'boots'},
  {name:'Gloves',     icon:'🥊', stat:'atk',slot:'gloves'},
  {name:'Chestplate', icon:'🦺', stat:'def',slot:'chest'},
];
const WP=['Iron','Steel','Shadow','Cursed','Ancient','Runed','Bone','Obsidian','Silver','Cracked','Blessed','Infernal','Void','Storm','Frost'];
const WS=['of Might','of Slaying','of the Hunt','of Fury','the Relentless','of Ruin','of Shadows','of the Deep','of Carnage','the Unyielding'];
const AP=['Leather','Chain','Plate','Blessed','Runed','Shadow','Hollow','Tempered','Ancient','Tattered','Voidforged'];
const AS=['of Warding','of Endurance','of the Bear','of Fortitude','of Swiftness','of the Knight','of Resilience'];

// Blank Slate weapon names
const BLANK_SLATE_NAMES=[
  {name:'The Unnamed Blade',  type:'Greatsword'}, {name:'Void Axe',          type:'Axe'},
  {name:'The Blank Bow',      type:'Bow'},         {name:'The Hollow Mace',   type:'Mace'},
  {name:'Nameless Dagger',    type:'Dagger'},       {name:'The Empty Staff',   type:'Staff'},
  {name:'The Formless Flail', type:'Flail'},        {name:'The Unwritten Whip',type:'Whip'},
];

const CONSUMABLES=[
  {name:'Health Potion',  icon:'🧪',effect:'heal',    value:40, desc:'Restores 40 HP',      sellPrice:30},
  {name:'Greater Potion', icon:'💊',effect:'heal',    value:80, desc:'Restores 80 HP',      sellPrice:55},
  {name:'Elixir of Life', icon:'✨',effect:'heal',    value:150,desc:'Restores 150 HP',     sellPrice:90},
  {name:'Strength Brew',  icon:'⚗️',effect:'buff_atk',value:6,  desc:'ATK +6 this battle',  sellPrice:40},
  {name:'Iron Skin',      icon:'🫙',effect:'buff_def', value:6,  desc:'DEF +6 this battle',  sellPrice:40},
  {name:'Antidote',       icon:'🍶',effect:'cure',    value:0,  desc:'Cures poison',         sellPrice:25},
  {name:'Flame Ward',     icon:'🧯',effect:'cure_burn',value:0, desc:'Cures burning',        sellPrice:30},
  {name:'Speed Draught',  icon:'💨',effect:'cure_slow',value:0, desc:'Cures slow',           sellPrice:30},
  {name:'Mana Vial',      icon:'🔵',effect:'restore_mana',value:15,desc:'Restores 15 mana',   sellPrice:35},
];

const ENEMY_TYPES=[
  {name:'Skeleton',    icon:'💀',baseHp:22, baseAtk:6, baseDef:2, baseSpd:4, xp:18,gold:[3,10]},
  {name:'Goblin',      icon:'👺',baseHp:18, baseAtk:7, baseDef:1, baseSpd:8, xp:16,gold:[5,14]},
  {name:'Zombie',      icon:'🧟',baseHp:42, baseAtk:5, baseDef:4, baseSpd:2, xp:22,gold:[2,8],  inflict:'poison',  inflictChance:.2},
  {name:'Orc',         icon:'👹',baseHp:50, baseAtk:10,baseDef:5, baseSpd:3, xp:32,gold:[8,20]},
  {name:'Vampire',     icon:'🧛',baseHp:38, baseAtk:13,baseDef:3, baseSpd:9, xp:38,gold:[10,24],inflict:'drain',   inflictChance:.3},
  {name:'Stone Golem', icon:'🗿',baseHp:75, baseAtk:8, baseDef:13,baseSpd:1, xp:48,gold:[5,14], inflict:'slow',    inflictChance:.4},
  {name:'Wraith',      icon:'👻',baseHp:32, baseAtk:16,baseDef:2, baseSpd:10,xp:44,gold:[8,20], inflict:'curse',   inflictChance:.35},
  {name:'Demon',       icon:'😈',baseHp:60, baseAtk:14,baseDef:7, baseSpd:6, xp:55,gold:[12,28]},
  {name:'Dragon Whelp',icon:'🐉',baseHp:95, baseAtk:18,baseDef:8, baseSpd:6, xp:75,gold:[20,48],inflict:'burn',    inflictChance:.4},
];
const BOSS_TYPES=[
  {name:'The Bone Lord',  icon:'💀',baseHp:90,baseAtk:9,baseDef:4, baseSpd:5, xp:150,gold:[30,60], inflict:'curse', inflictChance:.3},
  {name:'Magma Demon',    icon:'😈',baseHp:210,baseAtk:22,baseDef:10,baseSpd:7, xp:200,gold:[40,80], inflict:'burn',  inflictChance:.4},
  {name:'Ancient Lich',   icon:'🧙',baseHp:260,baseAtk:26,baseDef:12,baseSpd:8, xp:300,gold:[60,100],inflict:'drain', inflictChance:.35},
  {name:'Shadow Titan',   icon:'🌑',baseHp:320,baseAtk:30,baseDef:15,baseSpd:6, xp:400,gold:[80,140],inflict:'slow',  inflictChance:.5},
];

const SHRINE_PERKS=[
  {id:'berserker',name:"Berserker's Rage",  desc:'ATK soars, defense crumbles.',           effects:{atk:10,def:-5}},
  {id:'stoneskin', name:'Stone Skin',        desc:'Flesh hardens like bedrock. Slow but unbreakable.',effects:{def:12,spd:-4}},
  {id:'swiftness', name:'Swiftness',         desc:'Your feet become like wind.',            effects:{spd:8}},
  {id:'bloodpact', name:'Blood Pact',        desc:'Trade vitality for raw power.',          effects:{atk:14,maxHp:-25}},
  {id:'regen',     name:'Regeneration',      desc:'Heal 8 HP each floor descended.',        effects:{regenPerFloor:8}},
  {id:'lucky',     name:"Fortune's Favor",   desc:'Better loot and more gold.',             effects:{luckBonus:2}},
  {id:'iron',      name:'Iron Will',         desc:'Max HP surges.',                          effects:{maxHp:30}},
  {id:'precision', name:'Precision Strike',  desc:'Crit chance +15%.',                      effects:{critBonus:15}},
  {id:'vampiric',  name:'Vampiric Touch',    desc:'Every kill restores life.',              effects:{lifestealBonus:10}},
  {id:'giant',     name:"Giant's Strength",  desc:'Devastating ATK, move like a boulder.', effects:{atk:18,spd:-6}},
  {id:'glass',     name:'Glass Cannon',      desc:'Devastating offense, paper defense.',    effects:{atk:12,def:-8}},
  {id:'durable',   name:'Durable',           desc:'Armor improves permanently.',            effects:{def:8}},
  {id:'statusimmune',name:'Iron Constitution',desc:'50% chance to resist status effects.',  effects:{statusResist:50}},
  {id:'executor',  name:'Executor',          desc:'Bonus 30% damage vs enemies below 25% HP.',effects:{executioner:30}},
  {id:'manawell',  name:'Mana Well',          desc:'Max mana increased by 15.',               effects:{maxManaBonus:15}},
];

// Perk Altar — purchasable perks (same pool but gold-gated)
const ALTAR_PERK_COSTS=[50,150,400,900,2000];

const FLOOR_EVENTS=[
  {text:'You find a hidden alcove with a small offering.',         type:'gold',     value:[10,25]},
  {text:'A shrine radiates faint healing.',                        type:'heal',     value:[15,30]},
  {text:'Ancient power seeps from the walls.',                     type:'buff_atk', value:2},
  {text:'You find discarded armor still wearable.',               type:'buff_def', value:2},
  {text:'The damp air feels unusually swift in here.',            type:'buff_spd', value:1},
  {text:'Echoes of battle harden your resolve.',                   type:'buff_atk', value:3},
  {text:'A glittering chest sits unattended...',                  type:'chest'},
  {text:'Bone dust and silence. Nothing of value here.',           type:'nothing'},
  {text:'A faded inscription on the wall. You memorize it.',      type:'xp',       value:[8,15]},
  {text:'Scattered coins from a long-dead adventurer.',           type:'gold',     value:[5,15]},
];

