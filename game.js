document.addEventListener('DOMContentLoaded', () => {

// --- 1. COSTANTI E STATO GLOBALE ---
const GRID_SIZE = 50, PLAYER_SIZE = 48, MOVE_COOLDOWN = 200, VIEW_RADIUS = 8;
const WORLD_WIDTH_CELLS = 30, WORLD_HEIGHT_CELLS = 40;
const TILE_VOID = 0;
const TILE_WALL = 1;
const TILE_FLOOR = 2;

let state = {
  map: [],
  objects: [],
  enemies: [],
  party: [],
  exploredTiles: [],
  currentVisibleTiles: null,
  missionData: { map: [], objects: [], enemies: [] },
  hiredParty: ['tristano'],
  currentTool: 'path',
  activeHeroId: null,
  isMoving: false,
  isDrawing: false,
  draggedItemInfo: null,
  movingItemInfo: null,
};

// --- 2. DATABASE STATISTICHE E IMMAGINI ---
const weaponStats = {
  'Mani nude': 8, 'lancia': 20, 'clava': 12, 'mazza': 16,
  'ascia bipenne': 24, 'Ascia bipenne': 24, 'Martello da guerra': 20,
  'Spada lunga': 20, 'Bastone': 12, 'Spada corta': 16,
  'pugnale': 12, 'Pugnale': 12,
  'arco': 12, 'Arco corto': 12, 
  'balestra': 16, 'Balestra': 16, 
  'Falce': 10
};

const armorStats = {
  'toga': 0, 'Toga': 0, 'abiti': 0,
  'Armatura di cuoio': 5, 'Pelliccia': 5, 'Veste di pelle': 5,
  'Armatura di piastre': 8, 'cotta di maglia': 8, 'Cotta di maglia': 8,
  'Armatura di bronzo': 10,
  'Veste Nera': 5
};

const shieldStats = {
  'Scudo di cuoio': 3, 'scudo piccolo': 3, 'Scudo piccolo': 3,
  'scudo di ferro': 5, 'Scudo medio': 5, 'scudo borchiato': 5,
  'Scudo di bronzo': 6, 'Scudo torre': 6, 'Scudo a torre': 6,
  'Scudo rotondo': 6, 
  'Nessuno': 0,
  'Nessuno scudo': 0 // NUOVO OGGETTO
};

const weaponImages = {
  'Mani nude': 'https://ste388.github.io/liberato/armi/pugno.png',
  'Arco corto': 'https://ste388.github.io/liberato/armi/arco.png',
  'arco': 'https://ste388.github.io/liberato/armi/arco.png',
  'Ascia bipenne': 'https://ste388.github.io/liberato/armi/mazzaBipenne.png',
  'Spada lunga': 'https://ste388.github.io/liberato/armi/SpadaLunga.png',
  'Bastone': 'https://ste388.github.io/liberato/armi/bastone.png',
  'Martello da guerra': 'https://ste388.github.io/liberato/armi/martelloDaGuerra.png',
  'balestra': 'https://ste388.github.io/liberato/armi/balestra.png',
  'Balestra': 'https://ste388.github.io/liberato/armi/balestra.png',
  'Pugnale': 'https://ste388.github.io/liberato/armi/pugnale.png',
  'pugnale': 'https://ste388.github.io/liberato/armi/pugnale.png'
};

const rangedWeapons = ['arco', 'Arco corto', 'balestra', 'Balestra'];

const allHeroes = {
  'tristano': {
    name: 'Tristano', hp: 50, maxHp: 50,
    attack: 'Spada lunga', attackImg: weaponImages['Spada lunga'],
    defense: 'Armatura di cuoio', defenseImg: 'https://ste388.github.io/liberato/armature/ArmaturaCuoio.png',
    shield: 'Scudo piccolo', shieldImg: 'https://ste388.github.io/liberato/armature/ScudoPiccolo.png',
    sprites: {
      down: 'https://ste388.github.io/liberato/PG/Tristano1.png',
      up: 'https://ste388.github.io/liberato/PG/Tristano3.png',
      right: 'https://ste388.github.io/liberato/PG/Tristano2.png',
      left: 'https://ste388.github.io/liberato/PG/Tristano1.png'
    }
  },
  'amazzone': {
    name: 'Amazzone', hp: 40, maxHp: 40,
    attack: 'Arco corto', attackImg: weaponImages['Arco corto'],
    defense: 'Veste di pelle', defenseImg: 'https://ste388.github.io/liberato/armature/VestePelle.png',
    shield: 'Nessuno', shieldImg: null,
    sprites: {
      down: 'https://ste388.github.io/liberato/PG/amazzone1.png',
      up: 'https://ste388.github.io/liberato/PG/amazzone3.png',
      right: 'https://ste388.github.io/liberato/PG/amazzone2.png',
      left: 'https://ste388.github.io/liberato/PG/amazzone1.png'
    }
  },
  'barbaro': {
    name: 'Barbaro', hp: 60, maxHp: 60,
    attack: 'Ascia bipenne', attackImg: weaponImages['Ascia bipenne'],
    defense: 'Pelliccia', defenseImg: 'https://ste388.github.io/liberato/armature/ArmaturaPelliccia.png',
    shield: 'Nessuno', shieldImg: null,
    sprites: {
      down: 'https://ste388.github.io/liberato/PG/barbaro1.png',
      up: 'https://ste388.github.io/liberato/PG/barbaro3.png',
      right: 'https://ste388.github.io/liberato/PG/barbaro2.png',
      left: 'https://ste388.github.io/liberato/PG/barbaro1.png'
    }
  },
  'paladino': {
    name: 'Paladino', hp: 55, maxHp: 55,
    attack: 'Spada lunga', attackImg: weaponImages['Spada lunga'],
    defense: 'Armatura di piastre', defenseImg: 'https://ste388.github.io/liberato/armature/ArmaturaPiastre.png',
    shield: 'Scudo a torre', shieldImg: 'https://ste388.github.io/liberato/armature/ScudoTorre.png',
    sprites: {
      down: 'https://ste388.github.io/liberato/PG/paladino1.png',
      up: 'https://ste388.github.io/liberato/PG/paladino3.png',
      right: 'https://ste388.github.io/liberato/PG/paladino2.png',
      left: 'https://ste388.github.io/liberato/PG/paladino1.png'
    }
  },
  'mago': {
    name: 'Mago', hp: 30, maxHp: 30,
    attack: 'Bastone', attackImg: weaponImages['Bastone'],
    defense: 'Toga', defenseImg: 'https://ste388.github.io/liberato/armature/toga.png',
    shield: 'Nessuno', shieldImg: null,
    sprites: {
      down: 'https://ste388.github.io/liberato/PG/mago1.png',
      up: 'https://ste388.github.io/liberato/PG/mago3.png',
      right: 'https://ste388.github.io/liberato/PG/mago2.png',
      left: 'https://ste388.github.io/liberato/PG/mago1.png'
    }
  },
  'nano': {
    name: 'Nano', hp: 50, maxHp: 50,
    attack: 'Martello da guerra', attackImg: weaponImages['Martello da guerra'],
    defense: 'Cotta di maglia', defenseImg: 'https://ste388.github.io/liberato/armature/CottaMaglia.png',
    shield: 'Scudo rotondo', shieldImg: 'https://ste388.github.io/liberato/armature/ScudoBronzo.png',
    sprites: {
      down: 'https://ste388.github.io/liberato/PG/nano1.png',
      up: 'https://ste388.github.io/liberato/PG/nano3.png',
      right: 'https://ste388.github.io/liberato/PG/nano2.png',
      left: 'https://ste388.github.io/liberato/PG/nano1.png'
    }
  }
};

const enemyTypes = {
  'orchetto1': { name: 'Orchetto', hp: 15, maxHp: 15, attack: 'clava', defense: 'Pelliccia', shield: 'Nessuno' },
  'gnomo1': { name: 'Gnomo', hp: 10, maxHp: 10, attack: 'pugnale', defense: 'abiti', shield: 'Nessuno' },
  'miliziano1': { name: 'Miliziano', hp: 20, maxHp: 20, attack: 'Spada corta', defense: 'Armatura di cuoio', shield: 'Scudo piccolo' },
  'troll1': { name: 'Troll', hp: 30, maxHp: 30, attack: 'mazza', defense: 'Pelliccia', shield: 'Nessuno' },
  'stregone1': { name: 'Stregone', hp: 12, maxHp: 12, attack: 'Bastone', defense: 'toga', shield: 'Nessuno' },
  'goblin1': { name: 'Goblin', hp: 12, maxHp: 12, attack: 'pugnale', defense: 'Armatura di cuoio', shield: 'Scudo di cuoio' },
  'guerr_goblin1': { name: 'Guerriero Goblin', hp: 18, maxHp: 18, attack: 'Spada corta', defense: 'cotta di maglia', shield: 'scudo borchiato' },
  'morte': { name: 'Morte', hp: 45, maxHp: 45, attack: 'Falce', defense: 'toga', shield: 'Nessuno' }
};

const DOM = {
  world: document.getElementById('world'),
  gameWorld: document.getElementById('game-world'),
  heroSelector: document.getElementById('hero-selector'),
  minimapCanvas: document.getElementById('minimap-canvas'),
  minimapCtx: document.getElementById('minimap-canvas').getContext('2d')
};

let fogCtx = null;

// --- 3. FUNZIONI DI SUPPORTO ---
function getItemType(name) {
  if (weaponStats.hasOwnProperty(name)) return 'weapon';
  if (armorStats.hasOwnProperty(name)) return 'armor';
  if (shieldStats.hasOwnProperty(name)) return 'shield';
  return 'item';
}

function addLog(message, color = 'white') {
  let logContainer = document.getElementById('battle-log');
  if (!logContainer) {
    const gameUI = document.getElementById('game-ui');
    if (gameUI) {
      logContainer = document.createElement('div');
      logContainer.id = 'battle-log';
      logContainer.style.cssText = `
        margin-top: 15px; height: 150px; overflow-y: auto;
        background: rgba(0,0,0,0.6); border: 1px solid #666;
        padding: 5px; font-size: 12px; font-family: monospace; color: #ccc;
      `;
      gameUI.appendChild(logContainer);
    } else return;
  }
  const entry = document.createElement('div');
  entry.style.color = color;
  entry.style.marginBottom = '4px';
  entry.style.borderBottom = '1px solid #333';
  entry.innerHTML = message;
  logContainer.insertBefore(entry, logContainer.firstChild);
}

// --- 4. GESTIONE VISTE E MENU ---
function switchView(view) { document.body.dataset.view = view; }

function goToCastle() {
  state.missionData = {
    map: JSON.parse(JSON.stringify(state.map)),
    objects: JSON.parse(JSON.stringify(state.objects)),
    enemies: JSON.parse(JSON.stringify(state.enemies))
  };
  switchView('castle');
}

function startGame() {
  const finalParty = [];
  document.querySelectorAll('#hired-party-list .hired-hero').forEach((div, i) => {
    const key = div.dataset.heroKey;
    const customName = div.querySelector('input').value;
    const heroData = { 
      ...allHeroes[key], 
      name: customName || allHeroes[key].name, 
      id: i + 1, 
      pos: null, 
      inventory: { coins: 0, items: [] }, 
      isDead: false,
      arrows: 0,
      bolts: 0
    };
    
    // AGGIUNTO EQUIPAGGIAMENTO BASE PER TUTTI
    heroData.inventory.items.push('Mani nude');
    heroData.inventory.items.push('abiti');
    heroData.inventory.items.push('Nessuno scudo');

    const weaponName = heroData.attack.toLowerCase();
    if (weaponName.includes('arco')) heroData.arrows = 10;
    else if (weaponName.includes('balestra')) {
      heroData.bolts = 10;
      heroData.attackImg = weaponImages['balestra'];
    }
    finalParty.push(heroData);
  });

  if (finalParty.length === 0) {
    alert('Devi assoldare almeno un personaggio!');
    return;
  }

  state.party = finalParty;
  state.exploredTiles = Array.from({ length: WORLD_HEIGHT_CELLS }, () => Array(WORLD_WIDTH_CELLS).fill(false));
  state.currentVisibleTiles = Array.from({ length: WORLD_HEIGHT_CELLS }, () => Array(WORLD_WIDTH_CELLS).fill(false));
  state.activeHeroId = state.party[0].id;

  switchView('game');
  refreshGameView();
  placePartyOnMap();
  refreshGameView();
  populateHeroSelector();
  setActiveHero(state.activeHeroId);
  const log = document.getElementById('battle-log');
  if(log) log.innerHTML = '';
}

function returnToEditor() {
  buildWorld(DOM.world, state);
  switchView('editor');
}

// --- 5. INIZIALIZZAZIONE E LISTENER ---
function initialize() {
  attachEditorListeners();
  attachCastleListeners();
  attachGameListeners();
  state.map = Array.from({ length: WORLD_HEIGHT_CELLS }, () => Array(WORLD_WIDTH_CELLS).fill(TILE_FLOOR));
  buildWorld(DOM.world, state);
}

function attachCastleListeners() {
  document.getElementById('open-taverna-btn').onclick = () => document.getElementById('taverna-modal').style.display = 'flex';
  document.getElementById('taverna-modal').querySelector('.close-btn').onclick = () => document.getElementById('taverna-modal').style.display = 'none';
  document.getElementById('start-mission-btn').onclick = startGame;
  renderRecruitableHeroes();
  renderHiredParty();
}

function attachEditorListeners() {
  document.getElementById('go-to-castle-btn').addEventListener('click', goToCastle);
  document.querySelectorAll('#editor-ui .tool-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      if (btn.id === 'export-map-btn' || btn.id === 'go-to-castle-btn') return;
      document.querySelector('#editor-ui .tool-btn.active')?.classList.remove('active');
      e.currentTarget.classList.add('active');
      state.currentTool = e.currentTarget.dataset.tool;
    });
  });
  document.getElementById('export-map-btn').addEventListener('click', exportMapData);
  document.getElementById('close-modal-btn').addEventListener('click', () => document.getElementById('export-modal').style.display = 'none');

  DOM.world.addEventListener('mousedown', handleEditorMouseDown);
  DOM.world.addEventListener('mousemove', handleEditorMouseMove);
  DOM.world.addEventListener('mouseup', handleEditorMouseUp);
  DOM.world.addEventListener('contextmenu', handleEditorContextMenu);
  DOM.world.addEventListener('dragover', (e) => e.preventDefault());
  DOM.world.addEventListener('drop', handleEditorDrop);

  document.getElementById('palette-container').addEventListener('dragstart', (e) => {
    const item = e.target.closest('.palette-item');
    if (item) {
      state.draggedItemInfo = {
        ...item.dataset,
        blocking: item.dataset.blocking === 'true',
        category: item.dataset.category
      };
    }
  });
}

function attachGameListeners() {
  document.getElementById('return-to-editor-btn').addEventListener('click', returnToEditor);
  document.addEventListener('keydown', handleKeyPress);
  DOM.heroSelector.addEventListener('change', (e) => setActiveHero(parseInt(e.target.value)));
  document.getElementById('inventory-btn').onclick = () => {
    updateInventoryDisplay();
    document.getElementById('inventory-modal').style.display = 'flex';
  };
  document.getElementById('close-inventory-btn').onclick = () => document.getElementById('inventory-modal').style.display = 'none';
  document.getElementById('close-chest-modal-btn').onclick = () => document.getElementById('chest-modal').style.display = 'none';

  DOM.gameWorld.addEventListener('click', (e) => {
    if (document.body.dataset.view !== 'game') return;
    const itemEl = e.target.closest('.placed-item');
    if (itemEl && itemEl.dataset.category === 'object') {
      const obj = state.missionData.objects.find(o => o.id === parseInt(itemEl.dataset.id));
      if (obj) {
        if (obj.type.startsWith('baule')) openChest(obj);
        else if (obj.type.startsWith('porta')) openDoor(obj);
      }
    }
  });
  DOM.gameWorld.addEventListener('mousemove', handleEnemyHover);
  DOM.gameWorld.addEventListener('click', handleEnemyClick);
}

// --- 6. LOGICA DI GIOCO E COMBATTIMENTO ---
function openChest(c) {
  if (c.isOpen) return;
  c.isOpen = true;
  c.blocking = false;
  if (!c.contents) c.contents = { coins: Math.floor(Math.random() * 50) + 10, items: ['Pozione'] };
  const h = state.party.find(x => x.id === state.activeHeroId);
  let msgText = '';
  if (h) {
    h.inventory.coins += c.contents.coins;
    h.inventory.items.push(...c.contents.items);
    msgText = `${h.name} trova ${c.contents.coins} monete e: ${c.contents.items.join(', ')}`;
  }
  document.getElementById('chest-message').textContent = msgText;
  document.getElementById('chest-modal').style.display = 'flex';
  addLog(msgText, 'gold');
  refreshGameView();
}

function openDoor(d) {
  d.isOpen = true;
  d.blocking = false;
  addLog("Hai aperto una porta.", '#aaa');
  refreshGameView();
}

function handleEnemyHover(e) {
  if (document.body.dataset.view !== 'game') return;
  const enemyEl = e.target.closest('.enemy-item');
  let tooltip = document.getElementById('enemy-tooltip');
  if (tooltip) tooltip.remove();
  if (!enemyEl) { DOM.gameWorld.style.cursor = 'default'; return; }
  const enemy = state.missionData.enemies.find(en => en.id === parseInt(enemyEl.dataset.id));
  if (!enemy || enemy.isDead) { DOM.gameWorld.style.cursor = 'default'; return; }
  if (!state.currentVisibleTiles || !state.currentVisibleTiles[enemy.y]?.[enemy.x]) { DOM.gameWorld.style.cursor = 'default'; return; }

  const hero = state.party.find(h => h.id === state.activeHeroId);
  if (!hero || hero.isDead) return;

  const isRanged = rangedWeapons.includes(hero.attack);
  const isAdjacent = Math.abs(hero.pos.x - enemy.x) + Math.abs(hero.pos.y - enemy.y) === 1;
  const weaponName = hero.attack.toLowerCase();
  const hasAmmo = (weaponName.includes('arco') && hero.arrows > 0) || (weaponName.includes('balestra') && hero.bolts > 0);
  const canAttack = isAdjacent || (isRanged && hasAmmo);
  
  DOM.gameWorld.style.cursor = canAttack ? 'crosshair' : 'default';

  if (canAttack) {
    tooltip = document.createElement('div');
    tooltip.id = 'enemy-tooltip';
    tooltip.className = 'enemy-tooltip';
    const att = weaponStats[enemy.attack] || 0;
    const def = (armorStats[enemy.defense] || 0) + (shieldStats[enemy.shield] || 0);
    tooltip.innerHTML = `
      <div><strong>${enemy.name}</strong> (PF: ${enemy.hp}/${enemy.maxHp})</div>
      <div>Attacco: ${enemy.attack} (val: ${att})</div>
      <div>Difesa Totale: ${enemy.defense}/${enemy.shield} (val: ${def})</div>
    `;
    tooltip.style.left = (e.clientX + 15) + 'px';
    tooltip.style.top = (e.clientY + 15) + 'px';
    document.body.appendChild(tooltip);
  }
}

function handleEnemyClick(e) {
  if (document.body.dataset.view !== 'game') return;
  const enemyEl = e.target.closest('.enemy-item');
  if (!enemyEl) return;
  const enemy = state.missionData.enemies.find(en => en.id === parseInt(enemyEl.dataset.id));
  const hero = state.party.find(h => h.id === state.activeHeroId);
  if (!enemy || enemy.isDead || !hero || hero.isDead) return;
  
  const isRanged = rangedWeapons.includes(hero.attack);
  const isAdjacent = Math.abs(hero.pos.x - enemy.x) + Math.abs(hero.pos.y - enemy.y) === 1;

  if (isAdjacent) performCombat(hero, enemy);
  else if (isRanged && state.currentVisibleTiles[enemy.y]?.[enemy.x]) performRangedAttack(hero, enemy);
}

function performRangedAttack(hero, targetEnemy) {
  const isCrossbow = hero.attack.toLowerCase().includes('balestra');
  const ammoType = isCrossbow ? 'bolts' : 'arrows';
  const ammoName = isCrossbow ? 'Dardi' : 'Frecce';

  if (!hero[ammoType] || hero[ammoType] <= 0) {
    showCombatMessage(`Nessun ${isCrossbow ? 'Dardo' : 'Freccia'}!`);
    return;
  }
  hero[ammoType]--;

  const path = getLinePoints(hero.pos.x, hero.pos.y, targetEnemy.x, targetEnemy.y);
  const targets = [];
  path.forEach(point => {
    const enemy = state.missionData.enemies.find(e => !e.isDead && e.x === point.x && e.y === point.y);
    if (enemy) targets.push(enemy);
    const ally = state.party.find(p => !p.isDead && p.id !== hero.id && p.pos && p.pos.x === point.x && p.pos.y === point.y);
    if (ally) targets.push(ally);
  });

  const attMax = weaponStats[hero.attack] || 0;
  
  targets.forEach(target => {
    const defMax = (armorStats[target.defense] || 0) + (shieldStats[target.shield] || 0);
    const rollAtt = Math.floor(Math.random() * (attMax + 1));
    const rollDef = Math.floor(Math.random() * (defMax + 1));
    const damage = Math.max(0, rollAtt - rollDef);
    
    if (damage > 0) {
      target.hp = Math.max(0, target.hp - damage);
      if (target.hp <= 0) {
        target.hp = 0;
        target.isDead = true;
        showCombatMessage(`${hero.name} uccide ${target.name}!`);
        addLog(`${hero.name} uccide ${target.name} con ${ammoName}! (${damage} danni)`, '#ff5555');
      } else {
        showCombatMessage(`${hero.name} colpisce ${target.name} (${damage})`);
        addLog(`${hero.name} colpisce ${target.name}: <b>${damage} Danni</b> (Att: ${rollAtt} - Dif: ${rollDef})`, '#ffaa55');
      }
    } else {
      showCombatMessage(`${hero.name} manca ${target.name}!`);
      addLog(`${hero.name} manca ${target.name} (Att: ${rollAtt} - Dif: ${rollDef})`, '#888');
    }
  });

  refreshGameView();
  updateHeroStatsDisplay();
  drawArrow(hero.pos, { x: targetEnemy.x, y: targetEnemy.y });
}

function getLinePoints(x0, y0, x1, y1) {
  const points = [];
  const dx = Math.abs(x1 - x0), dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;
  let x = x0, y = y0;
  while (true) {
    if (!(x === x0 && y === y0)) points.push({ x, y });
    if (x === x1 && y === y1) break;
    const e2 = 2 * err;
    if (e2 > -dy) { err -= dy; x += sx; }
    if (e2 < dx) { err += dx; y += sy; }
  }
  return points;
}

function drawArrow(from, to) {
  const canvas = document.createElement('canvas');
  canvas.id = 'arrow-canvas';
  canvas.style.position = 'absolute';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '150';
  canvas.width = WORLD_WIDTH_CELLS * GRID_SIZE;
  canvas.height = WORLD_HEIGHT_CELLS * GRID_SIZE;
  DOM.gameWorld.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  const startX = (from.x + 0.5) * GRID_SIZE;
  const startY = (from.y + 0.5) * GRID_SIZE;
  const endX = (to.x + 0.5) * GRID_SIZE;
  const endY = (to.y + 0.5) * GRID_SIZE;
  ctx.strokeStyle = '#444444';
  ctx.lineWidth = 3;
  ctx.setLineDash([10, 5]);
  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.lineTo(endX, endY);
  ctx.stroke();
  setTimeout(() => canvas.remove(), 500);
}

function performCombat(attacker, defender) {
  const attMax = weaponStats[attacker.attack] || 0;
  const defMax = (armorStats[defender.defense] || 0) + (shieldStats[defender.shield] || 0);
  const rollAtt = Math.floor(Math.random() * (attMax + 1));
  const rollDef = Math.floor(Math.random() * (defMax + 1));
  const damage = Math.max(0, rollAtt - rollDef);

  if (damage > 0) {
    defender.hp = Math.max(0, defender.hp - damage);
    if (defender.hp <= 0) {
      defender.hp = 0;
      defender.isDead = true;
      showCombatMessage(`${attacker.name} uccide ${defender.name}!`);
      addLog(`${attacker.name} uccide ${defender.name}! (Att: ${rollAtt} - Dif: ${rollDef})`, '#ff5555');
      refreshGameView();
    } else {
      showCombatMessage(`${attacker.name} infligge ${damage} danni!`);
      addLog(`${attacker.name} attacca ${defender.name}: <b>${damage} Danni</b> (Att: ${rollAtt} - Dif: ${rollDef})`, '#ffaa55');
    }
    if (!defender.isDead && defender.attack) setTimeout(() => enemyCounterattack(defender, attacker), 600);
  } else {
    showCombatMessage(`${attacker.name} manca il bersaglio!`);
    addLog(`${attacker.name} attacca ${defender.name} ma manca (Att: ${rollAtt} - Dif: ${rollDef})`, '#888');
    if (!defender.isDead && defender.attack) setTimeout(() => enemyCounterattack(defender, attacker), 600);
  }
  updateHeroStatsDisplay();
}

function enemyCounterattack(enemy, hero) {
  if (enemy.isDead || hero.isDead) return;
  const attMax = weaponStats[enemy.attack] || 0;
  const defMax = (armorStats[hero.defense] || 0) + (shieldStats[hero.shield] || 0);
  const rollAtt = Math.floor(Math.random() * (attMax + 1));
  const rollDef = Math.floor(Math.random() * (defMax + 1));
  const damage = Math.max(0, rollAtt - rollDef);

  if (damage > 0) {
    hero.hp = Math.max(0, hero.hp - damage);
    if (hero.hp <= 0) {
      hero.hp = 0;
      hero.isDead = true;
      showCombatMessage(`${enemy.name} ti ha ucciso!`);
      addLog(`${enemy.name} uccide ${hero.name}! (Att: ${rollAtt} - Dif: ${rollDef})`, '#ff0000');
      refreshGameView();
    } else {
      showCombatMessage(`${enemy.name} ti infligge ${damage} danni!`);
      addLog(`${enemy.name} colpisce ${hero.name}: <b>${damage} Danni</b> (Att: ${rollAtt} - Dif: ${rollDef})`, '#ff5500');
    }
  } else {
    showCombatMessage(`${enemy.name} ti manca!`);
    addLog(`${enemy.name} manca ${hero.name} (Att: ${rollAtt} - Dif: ${rollDef})`, '#aaa');
  }
  updateHeroStatsDisplay();
  renderHeroes();
}

function showCombatMessage(msg) {
  const el = document.getElementById('combat-message');
  el.textContent = msg;
  el.style.display = 'block';
  setTimeout(() => (el.style.display = 'none'), 1500);
}

// --- 7. INVENTARIO ED EQUIPAGGIAMENTO ---
function equipItem(itemIndex) {
  const h = state.party.find(x => x.id === state.activeHeroId);
  if (!h) return;
  const newItemName = h.inventory.items[itemIndex];
  const type = getItemType(newItemName);
  let oldItem = null;

  if (type === 'weapon') {
    oldItem = h.attack;
    h.attack = newItemName;
    if (weaponImages[newItemName]) h.attackImg = weaponImages[newItemName];
  } else if (type === 'armor') {
    oldItem = h.defense;
    h.defense = newItemName;
  } else if (type === 'shield') {
    oldItem = h.shield;
    if (oldItem === 'Nessuno') oldItem = null; 
    h.shield = newItemName;
  } else {
    alert("Questo oggetto non può essere equipaggiato.");
    return;
  }

  h.inventory.items.splice(itemIndex, 1);
  // RIMETTE SEMPRE L'OGGETTO VECCHIO IN INVENTARIO, NESSUNA ESCLUSIONE
  if (oldItem) {
    h.inventory.items.push(oldItem);
  }
  updateInventoryDisplay();
  updateHeroStatsDisplay();
  addLog(`${h.name} equipaggia ${newItemName}.`, '#88ff88');
}

function updateHeroStatsDisplay() {
  const h = state.party.find(x => x.id === state.activeHeroId);
  if (!h) return;
  const icon = (u) => (u ? `<img src="${u}" class="stat-icon">` : '');
  const attackVal = weaponStats[h.attack] || 0;
  const defenseVal = armorStats[h.defense] || 0;
  const shieldVal = shieldStats[h.shield] || 0;
  const attackImage = weaponImages[h.attack] || h.attackImg || '';

  document.getElementById('hero-hp').textContent = `PF: ${h.hp}/${h.maxHp}`;
  document.getElementById('hero-attack').innerHTML = `Attacco: ${h.attack} ${icon(attackImage)} (att: ${attackVal})`;
  document.getElementById('hero-defense').innerHTML = `Difesa: ${h.defense} ${icon(h.defenseImg)} (dif: ${defenseVal})`;
  document.getElementById('hero-shield').innerHTML = `Scudo: ${h.shield} ${icon(h.shieldImg)} (dif: ${shieldVal})`;
  
  const arrowsDiv = document.getElementById('hero-arrows');
  if (rangedWeapons.includes(h.attack)) {
    if (!arrowsDiv) {
      const div = document.createElement('div');
      div.id = 'hero-arrows';
      document.getElementById('game-ui').insertBefore(div, document.getElementById('inventory-btn'));
    }
    const ammoType = h.attack.toLowerCase().includes('balestra') ? 'Dardi' : 'Frecce';
    const ammoCount = h.attack.toLowerCase().includes('balestra') ? (h.bolts||0) : (h.arrows||0);
    document.getElementById('hero-arrows').textContent = `${ammoType}: ${ammoCount}`;
  } else {
    if (arrowsDiv) arrowsDiv.remove();
  }
}

function updateInventoryDisplay() {
  const h = state.party.find(x => x.id === state.activeHeroId);
  if (!h) return;
  document.getElementById('wallet-display').textContent = `Monete: ${h.inventory.coins}`;
  const grid = document.getElementById('inventory-grid');
  grid.innerHTML = '';
  
  const attackVal = weaponStats[h.attack] || 0;
  const defenseVal = armorStats[h.defense] || 0;
  const shieldVal = shieldStats[h.shield] || 0;
  let ammoText = '';
  if(rangedWeapons.includes(h.attack)) {
     const isCrossbow = h.attack.toLowerCase().includes('balestra');
     ammoText = `<div>${isCrossbow ? 'Dardi' : 'Frecce'}: ${isCrossbow ? (h.bolts||0) : (h.arrows||0)}</div>`;
  }

  const eq = document.createElement('div');
  eq.className = 'inventory-equipment';
  eq.innerHTML =
    `<div>Arma: ${h.attack} (att: ${attackVal}) <span style="color:#0f0; font-size:0.8em;">[In Uso]</span></div>` +
    `<div>Armatura: ${h.defense} (dif: ${defenseVal}) <span style="color:#0f0; font-size:0.8em;">[In Uso]</span></div>` +
    `<div>Scudo: ${h.shield} (dif: ${shieldVal}) <span style="color:#0f0; font-size:0.8em;">[In Uso]</span></div>` +
    ammoText;
  grid.appendChild(eq);
  
  h.inventory.items.forEach((item, index) => {
    const r = document.createElement('div');
    r.className = 'inventory-item-row';
    r.style.display = 'flex';
    r.style.justifyContent = 'space-between';
    r.style.alignItems = 'center';

    let statInfo = '';
    let canEquip = false;
    const iType = getItemType(item);

    if (iType === 'weapon') { statInfo = `(att: ${weaponStats[item]})`; canEquip = true; }
    else if (iType === 'armor') { statInfo = `(dif: ${armorStats[item]})`; canEquip = true; }
    else if (iType === 'shield') { statInfo = `(dif: ${shieldStats[item]})`; canEquip = true; }

    const nameSpan = document.createElement('span');
    nameSpan.textContent = `${item} ${statInfo}`;
    r.appendChild(nameSpan);

    if (canEquip) {
      const btn = document.createElement('button');
      btn.textContent = 'Usa';
      btn.style.cssText = "background:#006600; color:white; border:1px solid #0f0; border-radius:3px; cursor:pointer; padding:2px 6px;";
      btn.onclick = () => equipItem(index);
      r.appendChild(btn);
    }
    grid.appendChild(r);
  });
}

// --- 8. EDITOR E MONDO ---
function buildWorld(container, data) {
  container.innerHTML = '';
  container.style.width = WORLD_WIDTH_CELLS * GRID_SIZE + 'px';
  container.style.height = WORLD_HEIGHT_CELLS * GRID_SIZE + 'px';
  const fragment = document.createDocumentFragment();

  data.map.forEach((row, y) => {
    row.forEach((tile, x) => {
      const cell = document.createElement('div');
      cell.className = tile === TILE_WALL ? 'cell wall' : `cell floor-${(x + y) % 5 + 1}`;
      cell.style.cssText = `left:${x * GRID_SIZE}px;top:${y * GRID_SIZE}px;width:${GRID_SIZE}px;height:${GRID_SIZE}px`;
      cell.dataset.x = x;
      cell.dataset.y = y;
      fragment.appendChild(cell);
    });
  });

  [...data.objects, ...data.enemies].forEach(item => {
    const div = document.createElement('div');
    div.className = 'placed-item';
    if (item.category === 'enemy') {
      const className = item.isDead ? 'type-dead' : `type-${item.type}`;
      div.classList.add('enemy-item', className);
    } else {
      if (item.isOpen) {
        if (item.type.startsWith('porta')) div.classList.add('object-item', `type-${item.type}_aperta`);
        else div.classList.add('object-item', `type-${item.type}_Aperto`);
      } else {
        div.classList.add('object-item', `type-${item.type}`);
      }
    }
    div.style.cssText = `left:${item.x * GRID_SIZE}px;top:${item.y * GRID_SIZE}px;width:${(item.width || 1) * GRID_SIZE}px;height:${(item.height || 1) * GRID_SIZE}px;z-index:${item.blocking ? 5 : 2}`;
    Object.assign(div.dataset, { id: item.id, category: item.category, type: item.type });
    fragment.appendChild(div);
  });
  container.appendChild(fragment);
}

function editCell(target) {
  if (!target.classList.contains('cell')) return;
  const x = parseInt(target.dataset.x);
  const y = parseInt(target.dataset.y);
  let nv = state.currentTool === 'path' ? TILE_FLOOR : state.currentTool === 'wall' ? TILE_WALL : -1;
  if (nv !== -1 && state.map[y][x] !== nv) {
    state.map[y][x] = nv;
    buildWorld(DOM.world, state);
  }
}

function handleEditorMouseDown(e) {
  if (e.button !== 0) return;
  if (state.currentTool === 'manage-objects' && e.target.classList.contains('placed-item')) {
    state.movingItemInfo = { element: e.target, id: parseInt(e.target.dataset.id), category: e.target.dataset.category };
    e.target.style.pointerEvents = 'none';
  } else if (e.target.classList.contains('cell')) {
    state.isDrawing = true;
    editCell(e.target);
  }
}

function handleEditorMouseMove(e) {
  if (state.isDrawing && e.buttons === 1) editCell(e.target);
  if (state.movingItemInfo) {
    const el = state.movingItemInfo.element;
    const rect = DOM.world.getBoundingClientRect();
    el.style.left = e.clientX - rect.left - el.offsetWidth / 2 + DOM.world.parentElement.scrollLeft + 'px';
    el.style.top = e.clientY - rect.top - el.offsetHeight / 2 + DOM.world.parentElement.scrollTop + 'px';
  }
}

function handleEditorMouseUp(e) {
  if (state.movingItemInfo) {
    const { id, category, element } = state.movingItemInfo;
    const rect = DOM.world.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left + DOM.world.parentElement.scrollLeft) / GRID_SIZE);
    const y = Math.floor((e.clientY - rect.top + DOM.world.parentElement.scrollTop) / GRID_SIZE);
    const arr = category === 'object' ? state.objects : state.enemies;
    const it = arr.find(i => i.id === id);
    if (it) { it.x = x; it.y = y; }
    element.style.pointerEvents = 'auto';
    buildWorld(DOM.world, state);
  }
  state.isDrawing = false;
  state.movingItemInfo = null;
}

function handleEditorDrop(e) {
  e.preventDefault();
  if (!state.draggedItemInfo) return;
  const rect = DOM.world.getBoundingClientRect();
  const x = Math.floor((e.clientX - rect.left + DOM.world.parentElement.scrollLeft) / GRID_SIZE);
  const y = Math.floor((e.clientY - rect.top + DOM.world.parentElement.scrollTop) / GRID_SIZE);
  const width = parseInt(state.draggedItemInfo.width) || 1;
  const height = parseInt(state.draggedItemInfo.height) || 1;
  const data = { ...state.draggedItemInfo, id: Date.now(), x, y, width, height };
  if (data.category === 'enemy') Object.assign(data, enemyTypes[data.type] || {});
  (data.category === 'object' ? state.objects : state.enemies).push(data);
  state.draggedItemInfo = null;
  buildWorld(DOM.world, state);
}

function handleEditorContextMenu(e) {
  e.preventDefault();
  if (state.currentTool !== 'manage-objects') return;
  const t = e.target.closest('.placed-item');
  if (!t) return;
  const id = parseInt(t.dataset.id);
  if (t.dataset.category === 'object') state.objects = state.objects.filter(o => o.id !== id);
  else state.enemies = state.enemies.filter(en => en.id !== id);
  buildWorld(DOM.world, state);
}

function exportMapData() {
  document.getElementById('map-output-textarea').value = JSON.stringify({ map: state.map, objects: state.objects, enemies: state.enemies }, null, 2);
  document.getElementById('export-modal').style.display = 'flex';
}

function renderRecruitableHeroes() {
  const g = document.getElementById('hero-selection-grid');
  g.innerHTML = '';
  Object.keys(allHeroes).filter(k => k !== 'tristano').forEach(k => {
    const h = allHeroes[k];
    const d = document.createElement('div');
    d.className = 'hero-card';
    d.innerHTML = `<img src="${h.sprites.down}"><div class="hero-name">${h.name}</div><div class="hero-stats">PF: ${h.hp}</div><div class="hero-stats">Att: ${weaponStats[h.attack]}</div>`;
    d.onclick = () => {
      if (!state.hiredParty.includes(k)) {
        state.hiredParty.push(k);
        renderHiredParty();
      }
    };
    g.appendChild(d);
  });
}

function renderHiredParty() {
  const mainList = document.getElementById('hired-party-list');
  mainList.innerHTML = '';
  const modalList = document.getElementById('hired-party-list-modal');
  if (modalList) modalList.innerHTML = '';
  state.hiredParty.forEach(k => {
    const hero = allHeroes[k];
    const removeBtn = k !== 'tristano' ? `<button class="remove-btn" onclick="removeHero('${k}')" style="margin-left:10px; background:#c00; color:white; border:none; border-radius:50%; width:25px; height:25px; cursor:pointer;">X</button>` : '';
    const htmlContent = `<img src="${hero.sprites.down}"><input value="${hero.name}" readonly style="border:none; background:transparent; color:white; font-weight:bold;">${removeBtn}`;
    const d1 = document.createElement('div');
    d1.className = 'hired-hero';
    d1.dataset.heroKey = k;
    d1.innerHTML = htmlContent;
    mainList.appendChild(d1);
    if (modalList) {
      const d2 = document.createElement('div');
      d2.className = 'hired-hero';
      d2.dataset.heroKey = k;
      d2.innerHTML = htmlContent;
      modalList.appendChild(d2);
    }
  });
}

window.removeHero = function (key) {
  state.hiredParty = state.hiredParty.filter(k => k !== key);
  renderHiredParty();
};

function populateHeroSelector() {
  const s = DOM.heroSelector;
  s.innerHTML = '';
  state.party.forEach(p => {
    const o = document.createElement('option');
    o.value = p.id;
    o.textContent = p.name;
    s.appendChild(o);
  });
}

// --- 9. MOVIMENTO E VISUALI ---
function refreshGameView() {
  buildWorld(DOM.gameWorld, state.missionData);
  setupGameLayers();
  renderHeroes();
  initFogCanvas();
  updateAllGameVisuals();
}

function setupGameLayers() {
  let playersContainer = document.getElementById('players-container');
  if (!playersContainer) {
    playersContainer = document.createElement('div');
    playersContainer.id = 'players-container';
    DOM.gameWorld.appendChild(playersContainer);
  }
  let fogCanvas = document.getElementById('fog-canvas');
  if (!fogCanvas) {
    fogCanvas = document.createElement('canvas');
    fogCanvas.id = 'fog-canvas';
    DOM.gameWorld.appendChild(fogCanvas);
  }
}

function placePartyOnMap() {
  for (let y = 1; y < WORLD_HEIGHT_CELLS - 1; y++) {
    for (let x = 1; x < WORLD_WIDTH_CELLS - 1; x++) {
      if (state.missionData.map[y][x] === TILE_FLOOR) {
        const hasBlockingObject = state.missionData.objects.some(o => o.blocking && o.x === x && o.y === y);
        if (!hasBlockingObject) {
          let canPlaceAll = true;
          for (let i = 0; i < state.party.length; i++) {
            const checkX = x + i;
            if (checkX >= WORLD_WIDTH_CELLS || state.missionData.map[y][checkX] !== TILE_FLOOR) { canPlaceAll = false; break; }
            if (state.missionData.objects.some(o => o.blocking && o.x === checkX && o.y === y)) { canPlaceAll = false; break; }
          }
          if (canPlaceAll) {
            state.party.forEach((h, i) => (h.pos = { x: x + i, y }));
            return;
          }
        }
      }
    }
  }
}

function isOccupied(x, y, excludeHeroId = null) {
  if (state.missionData.map[y][x] !== TILE_FLOOR) return true;
  if (state.missionData.objects.some(o => o.blocking && x >= o.x && x < o.x + (o.width || 1) && y >= o.y && y < o.y + (o.height || 1))) return true;
  if (state.missionData.enemies.some(e => !e.isDead && e.x === x && e.y === y)) return true;
  if (state.party.some(h => h.id !== excludeHeroId && !h.isDead && h.pos && h.pos.x === x && h.pos.y === y)) return true;
  return false;
}

function renderHeroes() {
  const c = document.getElementById('players-container');
  if (!c) return;
  c.innerHTML = '';
  state.party.forEach(h => {
    if (!h.pos) return;
    const d = document.createElement('div');
    d.id = `hero-${h.id}`;
    d.className = 'player-character';
    d.style.cssText = `left:${h.pos.x * GRID_SIZE}px;top:${h.pos.y * GRID_SIZE}px;width:${PLAYER_SIZE}px;height:${PLAYER_SIZE}px;`;
    d.style.backgroundImage = h.isDead ? 'url("https://ste388.github.io/liberato/Sfondo/morte.png")' : `url(${h.sprites.down})`;
    d.onclick = () => setActiveHero(h.id);
    c.appendChild(d);
  });
}

function handleKeyPress(e) {
  if (document.body.dataset.view !== 'game' || state.isMoving) return;
  const h = state.party.find(x => x.id === state.activeHeroId);
  if (!h || h.isDead) return;
  let dx = 0, dy = 0, dir = 'down';
  if (e.key === 'ArrowUp') { dy = -1; dir = 'up'; }
  else if (e.key === 'ArrowDown') { dy = 1; dir = 'down'; }
  else if (e.key === 'ArrowLeft') { dx = -1; dir = 'left'; }
  else if (e.key === 'ArrowRight') { dx = 1; dir = 'right'; }
  else return;

  const nx = h.pos.x + dx, ny = h.pos.y + dy;
  if (!isOccupied(nx, ny, h.id)) {
    h.pos = { x: nx, y: ny };
    state.isMoving = true;
    const el = document.getElementById(`hero-${h.id}`);
    el.style.left = nx * GRID_SIZE + 'px';
    el.style.top = ny * GRID_SIZE + 'px';
    el.style.backgroundImage = `url(${h.sprites[dir]})`;
    requestAnimationFrame(updateAllGameVisuals);
    setTimeout(() => (state.isMoving = false), MOVE_COOLDOWN);
  }
}

function setActiveHero(id) {
  state.activeHeroId = id;
  document.querySelectorAll('.player-character').forEach(el => el.classList.remove('active'));
  document.getElementById(`hero-${id}`)?.classList.add('active');
  if (DOM.heroSelector) DOM.heroSelector.value = id;
  updateAllGameVisuals();
}

function updateAllGameVisuals() {
  const h = state.party.find(x => x.id === state.activeHeroId);
  if (h && h.pos) {
    DOM.gameWorld.style.transform = `translate(${-h.pos.x * GRID_SIZE + window.innerWidth / 2}px, ${-h.pos.y * GRID_SIZE + window.innerHeight / 2}px)`;
  }
  updateHeroStatsDisplay();
  updateFogOfWar();
  updateMinimap();
}

function isOpaqueForVision(x, y) {
  if (x < 0 || y < 0 || x >= WORLD_WIDTH_CELLS || y >= WORLD_HEIGHT_CELLS) return true;
  if (state.missionData.map[y][x] === TILE_WALL) return true;
  const door = state.missionData.objects.find(o => o.type && o.type.startsWith('porta') && x >= o.x && x < o.x + (o.width || 1) && y >= o.y && y < o.y + (o.height || 1));
  return door && !door.isOpen;
}

function updateFogOfWar() {
  if (!fogCtx) initFogCanvas();
  const hero = state.party.find(x => x.id === state.activeHeroId);
  if (!hero || !hero.pos) return;
  const wPx = WORLD_WIDTH_CELLS * GRID_SIZE;
  const hPx = WORLD_HEIGHT_CELLS * GRID_SIZE;
  fogCtx.clearRect(0, 0, wPx, hPx);
  state.currentVisibleTiles = Array.from({ length: WORLD_HEIGHT_CELLS }, () => Array(WORLD_WIDTH_CELLS).fill(false));
  const queue = [];
  const visited = Array.from({ length: WORLD_HEIGHT_CELLS }, () => Array(WORLD_WIDTH_CELLS).fill(false));
  
  if (hero.pos.x >= 0 && hero.pos.y >= 0 && hero.pos.x < WORLD_WIDTH_CELLS && hero.pos.y < WORLD_HEIGHT_CELLS) {
    queue.push({ x: hero.pos.x, y: hero.pos.y, dist: 0 });
    visited[hero.pos.y][hero.pos.x] = true;
  }

  while (queue.length > 0) {
    const { x, y, dist } = queue.shift();
    state.currentVisibleTiles[y][x] = true;
    state.exploredTiles[y][x] = true;
    if (dist >= VIEW_RADIUS) continue;
    if (isOpaqueForVision(x, y) && !(x === hero.pos.x && y === hero.pos.y)) continue;
    const neighbors = [{nx:x+1,ny:y},{nx:x-1,ny:y},{nx:x,ny:y+1},{nx:x,ny:y-1}];
    for (const { nx, ny } of neighbors) {
      if (nx>=0 && ny>=0 && nx<WORLD_WIDTH_CELLS && ny<WORLD_HEIGHT_CELLS && !visited[ny][nx]) {
        visited[ny][nx] = true;
        queue.push({ x: nx, y: ny, dist: dist + 1 });
      }
    }
  }

  fogCtx.globalCompositeOperation = 'source-over';
  for (let y = 0; y < WORLD_HEIGHT_CELLS; y++) {
    for (let x = 0; x < WORLD_WIDTH_CELLS; x++) {
      if (state.currentVisibleTiles[y][x]) continue;
      fogCtx.fillStyle = state.exploredTiles[y][x] ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.95)';
      fogCtx.fillRect(x * GRID_SIZE, y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
    }
  }
}

function initFogCanvas() {
  const c = document.getElementById('fog-canvas');
  if (c) {
    c.width = WORLD_WIDTH_CELLS * GRID_SIZE;
    c.height = WORLD_HEIGHT_CELLS * GRID_SIZE;
    fogCtx = c.getContext('2d');
  }
}

function updateMinimap() {
  const ctx = DOM.minimapCtx;
  const cw = DOM.minimapCanvas.width / WORLD_WIDTH_CELLS;
  const ch = DOM.minimapCanvas.height / WORLD_HEIGHT_CELLS;
  ctx.clearRect(0, 0, 200, 266);
  for (let y = 0; y < WORLD_HEIGHT_CELLS; y++) {
    for (let x = 0; x < WORLD_WIDTH_CELLS; x++) {
      if (state.exploredTiles[y][x]) {
        ctx.fillStyle = state.missionData.map[y][x] === TILE_WALL ? '#555' : '#aaa';
        ctx.fillRect(x * cw, y * ch, cw, ch);
      }
    }
  }
  state.missionData.objects.forEach(obj => {
    if (state.exploredTiles[obj.y]?.[obj.x]) {
      ctx.fillStyle = '#FFD700';
      ctx.beginPath(); ctx.arc((obj.x + 0.5) * cw, (obj.y + 0.5) * ch, Math.max(2, cw / 3), 0, Math.PI * 2); ctx.fill();
    }
  });
  state.missionData.enemies.forEach(enemy => {
    if (state.exploredTiles[enemy.y]?.[enemy.x]) {
      ctx.fillStyle = enemy.isDead ? '#444444' : '#FF0000';
      ctx.beginPath(); ctx.arc((enemy.x + 0.5) * cw, (enemy.y + 0.5) * ch, Math.max(2, cw / 3), 0, Math.PI * 2); ctx.fill();
    }
  });
  state.party.forEach(p => {
    if (p.pos && !p.isDead) {
      ctx.fillStyle = 'blue';
      ctx.fillRect(p.pos.x * cw, p.pos.y * ch, cw, ch);
    }
  });
}

// --- START ---
initialize();

});
