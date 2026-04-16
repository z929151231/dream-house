// ============================================================
// 梦想小屋 - 正面2.5D视角花园
// ============================================================

// ---- 植物/物品定义 ----
const PLANTS = [
    { id:'grass',   name:'草坪',     emoji:'🌿', emoji0:'🌿', emoji1:'🌿', emoji2:'🌿', price:10,  growth:3,  type:'ground', bodyH:0,  stackable:true  },
    { id:'rose',    name:'玫瑰',     emoji:'🌹', emoji0:'🌱', emoji1:'🌷', emoji2:'🌹', price:20,  growth:8,  type:'flower',  bodyH:18, stackable:false },
    { id:'sunf',    name:'向日葵',   emoji:'🌻', emoji0:'🌱', emoji1:'🌻', emoji2:'🌻', price:15,  growth:6,  type:'flower',  bodyH:20, stackable:false },
    { id:'tulip',   name:'郁金香',   emoji:'🌷', emoji0:'🌱', emoji1:'🌷', emoji2:'🌷', price:15,  growth:6,  type:'flower',  bodyH:16, stackable:false },
    { id:'lavnd',   name:'薰衣草',   emoji:'💜', emoji0:'🌱', emoji1:'💜', emoji2:'💜', price:25,  growth:8,  type:'flower',  bodyH:18, stackable:false },
    { id:'sakura',  name:'樱花树',   emoji:'🌸', emoji0:'🌱', emoji1:'🌸', emoji2:'🌸', price:30,  growth:10, type:'tree',    bodyH:52, stackable:false },
    { id:'pine',    name:'松树',     emoji:'🌲', emoji0:'🌱', emoji1:'🌲', emoji2:'🌲', price:80,  growth:20, type:'tree',    bodyH:58, stackable:false },
    { id:'maple',   name:'枫树',     emoji:'🍁', emoji0:'🌱', emoji1:'🍁', emoji2:'🍁', price:25,  growth:12, type:'tree',    bodyH:50, stackable:false },
    { id:'willow',  name:'垂柳',     emoji:'🌿', emoji0:'🌱', emoji1:'🌿', emoji2:'🌿', price:60,  growth:15, type:'tree',    bodyH:55, stackable:false },
    { id:'bush',    name:'灌木球',   emoji:'🌳', emoji0:'🌱', emoji1:'🌳', emoji2:'🌳', price:25,  growth:8,  type:'tree',    bodyH:30, stackable:false },
    { id:'hydra',   name:'绣球',     emoji:'💐', emoji0:'🌱', emoji1:'💐', emoji2:'💐', price:35,  growth:10, type:'flower',  bodyH:22, stackable:false },
    { id:'pond',    name:'水池',     emoji:'🪷', emoji0:'💧', emoji1:'🪷', emoji2:'🪷', price:150, growth:0,  type:'water',   bodyH:8,  stackable:false },
    { id:'fount',   name:'喷泉',     emoji:'⛲', emoji0:'💧', emoji1:'⛲', emoji2:'⛲', price:200, growth:0,  type:'water',   bodyH:28, stackable:false },
    { id:'rock',    name:'石头',     emoji:'🪨', emoji0:'🪨', emoji1:'🪨', emoji2:'🪨', price:10,  growth:0,  type:'deco',    bodyH:12, stackable:false },
    { id:'fence',   name:'木栅栏',   emoji:'🪵', emoji0:'🪵', emoji1:'🪵', emoji2:'🪵', price:15,  growth:0,  type:'deco',    bodyH:20, stackable:false },
    { id:'lamp',    name:'花园灯',   emoji:'🏮', emoji0:'🏮', emoji1:'🏮', emoji2:'🏮', price:50,  growth:0,  type:'deco',    bodyH:28, stackable:false },
    { id:'lantern', name:'石灯笼',   emoji:'🏮', emoji0:'🏮', emoji1:'🏮', emoji2:'🏮', price:45,  growth:0,  type:'deco',    bodyH:26, stackable:false },
    { id:'bench',   name:'长椅',     emoji:'🪑', emoji0:'🪑', emoji1:'🪑', emoji2:'🪑', price:40,  growth:0,  type:'deco',    bodyH:18, stackable:false },
    { id:'step',    name:'石板路',   emoji:'⬜', emoji0:'⬜', emoji1:'⬜', emoji2:'⬜', price:5,   growth:0,  type:'ground',  bodyH:0,  stackable:true  },
    { id:'butrf',   name:'蝴蝶兰',   emoji:'🦋', emoji0:'🌱', emoji1:'🦋', emoji2:'🦋', price:30,  growth:8,  type:'flower',  bodyH:20, stackable:false },
];

// ---- 房屋等级定义 ----
const HOUSE_LEVELS = [
    { level:1, name:'破房子',   emoji:'🏚️', bodyH:30, styles:null },
    { level:2, name:'小木屋',   emoji:'🛖',  bodyH:38, styles:null },
    { level:3, name:'砖瓦房',   emoji:'🏠',  bodyH:46, styles:[
        { id:'cottage',   name:'温馨小屋',  emoji:'🏡', desc:'温馨舒适的乡村小居' },
        { id:'bungalow',   name:'平房',      emoji:'🏠', desc:'简洁实用的单层住宅' },
        { id:'farmhouse', name:'农舍',      emoji:'🌾', desc:'带谷仓的田园农舍' },
    ]},
    { level:4, name:'别墅',     emoji:'🏡',  bodyH:56, styles:[
        { id:'modern',   name:'现代别墅',  emoji:'🏢', desc:'极简现代风格' },
        { id:'japanese', name:'日式庭院',  emoji:'🏯', desc:'日式枯山水庭院' },
        { id:'european', name:'欧式庄园',  emoji:'🏰', desc:'典雅欧式城堡风' },
    ]},
    { level:5, name:'城堡',     emoji:'🏰',  bodyH:72, styles:null },
];

// ---- 游戏状态 ----
const GRID_COLS = 9;
const GRID_ROWS = 9;
const HOUSE_COL = 4;
const HOUSE_ROW = 4;
const gameState = {
    money: 1200,
    level: 1,
    garden: [],
    selectedPlant: null,
    timeOfDay: 0.4,
    timeFlow: 0,
    particles: [],
    house: { level:1, style:null },
};

// ---- 透视网格变量 ----
let maxTileW = 48, rowH = 50, gridTop = 90, screenCX = 200;

// ---- 全局 ----
let canvas, ctx;
let UI = {};
let toastMsg = '', toastTimer = 0;
let rippleList = [];
let houseModal = null;
let lastTX = 0, lastTY = 0, tapped = false;

// ============================================================
// 核心初始化
// ============================================================
function init() {
    canvas = wx.createCanvas();
    ctx = canvas.getContext('2d');
    const info = wx.getSystemInfoSync();
    UI.w = info.windowWidth;
    UI.h = info.windowHeight;
    UI.s = Math.min(UI.w / 400, 1.4);
    const dpr = info.pixelRatio || 1;
    canvas.width  = UI.w  * dpr;
    canvas.height = UI.h * dpr;
    ctx.scale(dpr, dpr);
    recalcGrid();
    initParticles();
    wx.onTouchStart(onTouchStart);
    wx.onTouchMove(onTouchMove);
    wx.onTouchEnd(onTouchEnd);
    gameLoop();
}

function recalcGrid() {
    const s = UI.s;
    maxTileW = Math.min((UI.w - 20 * s) / GRID_COLS, 50 * s);
    gridTop = 90 * s;
    const gridBottom = UI.h - 118 * s;
    rowH = (gridBottom - gridTop) / GRID_ROWS;
    screenCX = UI.w / 2;
}

// ============================================================
// 透视坐标转换
// ============================================================
// col,row → 屏幕坐标（格子中心点）
function gridToScreen(col, row) {
    const t = (row + 0.5) / GRID_ROWS;  // 0=最里排，1=最前排
    const scale = 0.6 + 0.4 * t;           // 后排0.6倍，前排1.0倍
    const tileW = maxTileW * scale;
    const tileH = tileW * 0.65;
    const y = gridTop + (row + 0.5) * rowH;
    const x = screenCX + (col - (GRID_COLS - 1) / 2) * tileW;
    return { x, y, scale, tileW, tileH };
}

// 屏幕 → 最近的 (col, row)
function screenToGrid(sx, sy) {
    let bestCol = -1, bestRow = -1, bestDist = Infinity;
    for (let row = 0; row < GRID_ROWS; row++) {
        for (let col = 0; col < GRID_COLS; col++) {
            const { x, y } = gridToScreen(col, row);
            const dist = Math.hypot(sx - x, sy - y);
            if (dist < bestDist) { bestDist = dist; bestCol = col; bestRow = row; }
        }
    }
    const ref = gridToScreen(0, 0);
    if (bestDist < ref.tileW * 0.65) return { col: bestCol, row: bestRow };
    return { col: -1, row: -1 };
}

// ============================================================
// 粒子系统
// ============================================================
function initParticles() {
    for (let i = 0; i < 4; i++) spawnButterfly();
}

function spawnButterfly() {
    if (gameState.particles.filter(p => p.type === 'butterfly').length >= 5) return;
    const emojis = ['🦋', '🐝', '🪲', '🦗'];
    const row = Math.random() * GRID_ROWS;
    const col = Math.random() * GRID_COLS;
    const { x, y } = gridToScreen(col, row);
    gameState.particles.push({
        type: 'butterfly',
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
        x, y,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.0,
        wing: Math.random() * Math.PI * 2,
        life: 0,
        maxLife: 400 + Math.random() * 300,
    });
}

function spawnFirefly() {
    if (gameState.particles.filter(p => p.type === 'firefly').length >= 10) return;
    const { y: gy } = gridToScreen(0, GRID_ROWS - 1);
    const { y: ty } = gridToScreen(0, 0);
    gameState.particles.push({
        type: 'firefly',
        x: 20 + Math.random() * (UI.w - 40),
        y: ty + Math.random() * (gy - ty),
        phase: Math.random() * Math.PI * 2,
        life: 0,
        maxLife: 500 + Math.random() * 400,
    });
}

function spawnPetal() {
    const topY = gridTop;
    const emojis = ['🌸', '🍂', '🍃', '🌺'];
    gameState.particles.push({
        type: 'petal',
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
        x: 20 + Math.random() * (UI.w - 40),
        y: topY - 10,
        rot: Math.random() * Math.PI * 2,
        rotSpd: (Math.random() - 0.5) * 0.08,
        vx: 0.4 + Math.random() * 0.6,
        vy: 0.6 + Math.random() * 0.8,
        life: 0,
        maxLife: 250,
    });
}

function updateParticles(dt) {
    const night = isNight();
    for (let i = gameState.particles.length - 1; i >= 0; i--) {
        const p = gameState.particles[i];
        p.life += dt * 60;
        if (p.life >= p.maxLife) { gameState.particles.splice(i, 1); continue; }
        if (p.type === 'butterfly') {
            p.wing += 0.25;
            p.vx += (Math.random() - 0.5) * 0.12;
            p.vy += (Math.random() - 0.5) * 0.1;
            p.vx *= 0.95; p.vy *= 0.95;
            p.x += p.vx; p.y += p.vy;
            // 限制在花园范围内
            const { y: gy } = gridToScreen(0, GRID_ROWS - 1);
            const { y: ty } = gridToScreen(0, 0);
            if (p.x < 15) { p.x = 15; p.vx = Math.abs(p.vx); }
            if (p.x > UI.w - 15) { p.x = UI.w - 15; p.vx = -Math.abs(p.vx); }
            if (p.y < ty - 20) { p.y = ty - 20; p.vy = Math.abs(p.vy); }
            if (p.y > gy + 20) { p.y = gy + 20; p.vy = -Math.abs(p.vy); }
        } else if (p.type === 'firefly') {
            p.x += Math.sin(p.life * 0.03 + p.phase) * 0.5;
            p.y += Math.sin(p.life * 0.05 + p.phase) * 0.3 - 0.1;
        } else if (p.type === 'petal') {
            p.rot += p.rotSpd;
            p.x += p.vx + Math.sin(p.life * 0.05) * 0.3;
            p.y += p.vy;
            if (p.y > UI.h + 30) { gameState.particles.splice(i, 1); continue; }
        }
    }
    if (gameState.particles.filter(p => p.type === 'butterfly').length < 3 && Math.random() < 0.02) spawnButterfly();
    if (night && gameState.particles.filter(p => p.type === 'firefly').length < 8 && Math.random() < 0.03) spawnFirefly();
    if (gameState.timeOfDay > 0.25 && gameState.timeOfDay < 0.78 && gameState.particles.filter(p => p.type === 'petal').length < 4 && Math.random() < 0.015) spawnPetal();
}

// ============================================================
// 天空系统
// ============================================================
function getSky(t) {
    if (t < 0.15) return { top:'#04041a', bot:'#0a0a2e', name:'🌙 深夜', night:true };
    if (t < 0.25) return { top:'#c96b4b', bot:'#f4a460', name:'🌅 黎明', night:false };
    if (t < 0.38) return { top:'#74b9ff', bot:'#a8e6cf', name:'🌤️ 清晨', night:false };
    if (t < 0.50) return { top:'#56CCF2', bot:'#2F80ED', name:'☀️ 正午', night:false };
    if (t < 0.65) return { top:'#2196F3', bot:'#64B5F6', name:'🌤️ 午后', night:false };
    if (t < 0.76) return { top:'#e17055', bot:'#fdcb6e', name:'🌇 黄昏', night:false };
    if (t < 0.86) return { top:'#6c3483', bot:'#c0392b', name:'🌆 傍晚', night:true };
    return              { top:'#04041a', bot:'#0a0a2e', name:'🌃 夜晚', night:true };
}

function isNight()  { return gameState.timeOfDay < 0.2 || gameState.timeOfDay > 0.83; }
function isDusk()   { return (gameState.timeOfDay > 0.7 && gameState.timeOfDay <= 0.83) || (gameState.timeOfDay >= 0.15 && gameState.timeOfDay < 0.25); }

const stars = Array.from({length: 100}, () => ({
    x: Math.random(), y: Math.random() * 0.65,
    size: 0.5 + Math.random() * 1.5,
    phase: Math.random() * Math.PI * 2,
}));

// ============================================================
// 涟漪
// ============================================================
function addRipple(x, y) { rippleList.push({ x, y, r: 3, t: 1 }); }

function updateRipples() {
    for (let i = rippleList.length - 1; i >= 0; i--) {
        rippleList[i].r += 0.5;
        rippleList[i].t -= 0.025;
        if (rippleList[i].t <= 0) rippleList.splice(i, 1);
    }
}

// ============================================================
// 植物状态
// ============================================================
function addGardenItem(col, row, plantId, instant) {
    const plant = PLANTS.find(p => p.id === plantId);
    if (!plant) return;
    gameState.garden.push({
        col, row, plant,
        stage: plant.growth === 0 ? 2 : (instant ? 2 : 0),
        plantedAt: Date.now() - (instant ? 99999 : 0),
    });
}

function updatePlants() {
    const now = Date.now();
    gameState.garden.forEach(cell => {
        if (cell.plant.growth === 0) { cell.stage = 2; return; }
        const age = (now - cell.plantedAt) / 1000;
        if (age < cell.plant.growth * 0.5) cell.stage = 0;
        else if (age < cell.plant.growth) cell.stage = 1;
        else cell.stage = 2;
    });
}

function getPlantEmoji(cell) {
    if (cell.stage === 0) return cell.plant.emoji0 || '🌱';
    if (cell.stage === 1) return cell.plant.emoji1 || cell.plant.emoji;
    return cell.plant.emoji;
}

// ============================================================
// 触摸
// ============================================================
function onTouchStart(e) {
    lastTX = e.touches[0].clientX;
    lastTY = e.touches[0].clientY;
    tapped = true;
    handleTap(lastTX, lastTY);
}

function onTouchMove(e) {
    const x = e.touches[0].clientX, y = e.touches[0].clientY;
    if (Math.abs(x - lastTX) > 6 || Math.abs(y - lastTY) > 6) tapped = false;
    lastTX = x; lastTY = y;
}

function onTouchEnd() { tapped = false; }

function openUpgradeMenu() {
    const h = gameState.house;
    if (h.level >= HOUSE_LEVELS.length) { showToast('🏰 已达最高等级！'); return; }
    const next = HOUSE_LEVELS[h.level];
    if (next.styles) {
        houseModal = { type:'chooseStyle', styles:next.styles, callback:(chosen)=>{
            h.style = chosen; h.level++;
            showToast('🏠 升级到 ' + HOUSE_LEVELS[h.level-1].name + '！');
            houseModal = null;
        }};
    } else {
        h.level++;
        showToast('🏠 升级到 ' + HOUSE_LEVELS[h.level-1].name + '！');
    }
}

function handleModalTap(x, y) {
    if (!houseModal) return;
    const m = houseModal;
    const cols = 2, itemH = 72*UI.s, itemW = (UI.w - 44*UI.s) / cols - 10*UI.s;
    const gapX = 10*UI.s, gapY = 10*UI.s, my = UI.h/2 - 160*UI.s;
    if (m.styles) {
        m.styles.forEach((item, i) => {
            const col = i % cols, row = Math.floor(i / cols);
            const ix = 22*UI.s + col*(itemW+gapX), iy = my + 52*UI.s + row*(itemH+gapY);
            if (x>=ix && x<=ix+itemW && y>=iy && y<=iy+itemH) { m.callback(item); houseModal=null; }
        });
    }
    const closeX = UI.w/2 - 50*UI.s, closeY = my + 318*UI.s;
    if (x>=closeX && x<=closeX+100*UI.s && y>=closeY && y<=closeY+38*UI.s) houseModal = null;
}

function handleTap(x, y) {
    if (houseModal) { handleModalTap(x, y); return; }

    if (y < 58*UI.s && y > 10*UI.s) {
        if (x > UI.w - 100*UI.s) { openUpgradeMenu(); return; }
        if (x < 90*UI.s) { cycleTime(); return; }
        return;
    }

    const shopY = UI.h - 110 * UI.s;
    if (y > shopY) {
        const idx = Math.floor((x - 10 * UI.s) / (53 * UI.s));
        if (idx >= 0 && idx < PLANTS.length) {
            const plant = PLANTS[idx];
            if (gameState.money >= plant.price) {
                gameState.selectedPlant = plant;
                showToast('已选 ' + plant.emoji + ' ' + plant.name + '，点击格子放置');
            } else {
                showToast('💰 金币不足');
            }
        }
        return;
    }

    const iso = screenToGrid(x, y);
    if (iso.col >= 0 && iso.col < GRID_COLS && iso.row >= 0 && iso.row < GRID_ROWS) {
        if (iso.col === HOUSE_COL && iso.row === HOUSE_ROW) {
            const h = gameState.house;
            const lvl = HOUSE_LEVELS[h.level-1];
            const emoji = h.style ? h.style.emoji : lvl.emoji;
            const name = h.style ? h.style.name : lvl.name;
            const next = h.level < HOUSE_LEVELS.length ? ' → ' + HOUSE_LEVELS[h.level].name : '（最高级）';
            showToast(emoji + ' ' + name + next);
            return;
        }
        const existing = gameState.garden.find(g => g.col === iso.col && g.row === iso.row);
        if (existing) {
            const stageNames = ['🌱 种子', '🌿 幼苗', existing.plant.emoji + ' 成熟'];
            showToast(getPlantEmoji(existing) + ' ' + existing.plant.name + ' (' + stageNames[existing.stage] + ')');
            return;
        }
        if (gameState.selectedPlant) {
            gameState.garden.push({
                col: iso.col, row: iso.row,
                plant: gameState.selectedPlant,
                stage: gameState.selectedPlant.growth === 0 ? 2 : 0,
                plantedAt: Date.now(),
            });
            gameState.money -= gameState.selectedPlant.price;
            gameState.selectedPlant = null;
            showToast('🌱 种植成功！');
            checkLevelUp();
        }
    }
    if (x > UI.w - 92 * UI.s && y < 55 * UI.s) sellGarden();
}

function cycleTime() {
    const times = [0.08, 0.32, 0.52, 0.72, 0.92];
    const labels = ['🌙 深夜', '🌤️ 清晨', '☀️ 正午', '🌇 黄昏', '🌃 夜晚'];
    const idx = times.findIndex(t => Math.abs(t - gameState.timeOfDay) < 0.14);
    gameState.timeOfDay = times[(idx + 1) % times.length];
    showToast(labels[(idx + 1) % labels.length]);
}

function sellGarden() {
    const val = gameState.garden.reduce((s, g) => s + g.plant.price * 0.7, 0);
    const bonus = Math.floor(val + 300);
    gameState.money += bonus;
    gameState.garden = [];
    showToast('🏡 出售花园 +' + bonus + ' 💰');
    checkLevelUp();
}

function checkLevelUp() {
    const next = gameState.level + 1;
    if (gameState.money >= next * 1500) {
        gameState.level = next;
        showToast('⬆️ 升级！现在是 ' + next + ' 级');
    }
}

function showToast(msg) { toastMsg = msg; toastTimer = 150; }

// ============================================================
// 时间系统
// ============================================================
function updateTime(dt) {
    gameState.timeFlow += dt;
    if (gameState.timeFlow > 12) {
        gameState.timeFlow = 0;
        gameState.timeOfDay = (gameState.timeOfDay + 0.05) % 1;
    }
}

// ============================================================
// 游戏循环
// ============================================================
let lastTime = Date.now();
function gameLoop() {
    const now = Date.now();
    const dt = Math.min((now - lastTime) / 1000, 0.1);
    lastTime = now;
    updateTime(dt);
    updatePlants();
    updateParticles(dt);
    updateRipples();
    render();
    if (toastTimer > 0) toastTimer--;
    requestAnimationFrame(gameLoop);
}

// ============================================================
// 渲染
// ============================================================
function render() {
    recalcGrid();
    const s = UI.s, w = UI.w, h = UI.h;
    ctx.clearRect(0, 0, w, h);
    const sky = getSky(gameState.timeOfDay);
    const night = sky.night;
    const dusk  = isDusk();

    // 天空背景
    const skyGrd = ctx.createLinearGradient(0, 0, 0, h);
    skyGrd.addColorStop(0, sky.top);
    skyGrd.addColorStop(1, sky.bot);
    ctx.fillStyle = skyGrd;
    ctx.fillRect(0, 0, w, h);

    // 星星
    if (night || gameState.timeOfDay > 0.83 || gameState.timeOfDay < 0.2) {
        const sa = night ? 1 : Math.max(0, 1 - (gameState.timeOfDay - 0.83) / 0.12);
        stars.forEach(st => {
            const tw = Math.sin(st.phase + Date.now() * 0.002) * 0.5 + 0.5;
            ctx.fillStyle = 'rgba(255,255,240,' + (sa * tw) + ')';
            ctx.beginPath();
            ctx.arc(st.x * w, st.y * h, st.size * s, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    // 远景山丘
    renderHills(s, w, h, sky, night);

    // 花园背景（透视梯形底）
    renderGardenGround(s, w, h, night, dusk);

    // 所有地面格子（按深度：后排先画）
    for (let row = 0; row < GRID_ROWS; row++) {
        for (let col = 0; col < GRID_COLS; col++) {
            renderTile(col, row, s, night, dusk);
        }
    }

    // 涟漪（地面层）
    renderRipples(s, night);

    // 所有物体（收集后按深度排序）
    const drawables = [];

    // 房屋
    drawables.push({ kind:'house', row: HOUSE_ROW, col: HOUSE_COL });

    // 植物
    gameState.garden.forEach(cell => {
        drawables.push({ kind:'plant', row: cell.row, col: cell.col, cell });
    });

    // 按深度排序：row 小（后排）先画，col 小（左边）先画
    drawables.sort((a, b) => {
        if (a.row !== b.row) return a.row - b.row;
        return a.col - b.col;
    });

    drawables.forEach(d => {
        if (d.kind === 'house') renderHouse(s, night, dusk);
        else renderCellItem(d.cell, s, night, dusk);
    });

    // 粒子
    renderParticles(s, night);

    // UI
    renderTopBar(s, w, h, sky);
    renderShop(s, w, h, night);
    renderToast(s, w, h);
    renderHouseModal(s, w, h);
}

// ============================================================
// 远景山丘
// ============================================================
function renderHills(s, w, h, sky, night) {
    const dusk = isDusk();
    const hillY = gridTop - 5 * s;
    ctx.fillStyle = night ? 'rgba(20,30,20,0.8)' : (dusk ? 'rgba(150,80,80,0.35)' : 'rgba(80,140,80,0.25)');
    ctx.beginPath();
    ctx.moveTo(0, hillY);
    ctx.bezierCurveTo(w * 0.2, hillY - 80 * s, w * 0.35, hillY - 120 * s, w * 0.5, hillY - 90 * s);
    ctx.bezierCurveTo(w * 0.65, hillY - 60 * s, w * 0.8, hillY - 110 * s, w, hillY - 70 * s);
    ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.closePath();
    ctx.fill();
}

// ============================================================
// 花园地面（透视梯形背景）
// ============================================================
function renderGardenGround(s, w, h, night, dusk) {
    const back = gridToScreen(0, 0);
    const front = gridToScreen(0, GRID_ROWS - 1);
    const backW = back.tileW * GRID_COLS + 8 * s;
    const frontW = front.tileW * GRID_COLS + 8 * s;

    if (night) {
        ctx.fillStyle = '#1a3a1a';
    } else if (dusk) {
        ctx.fillStyle = '#2a5a2a';
    } else {
        ctx.fillStyle = '#2a6a28';
    }

    ctx.beginPath();
    ctx.moveTo(screenCX - backW / 2, gridTop - back.tileH / 2 - 6 * s);
    ctx.lineTo(screenCX + backW / 2, gridTop - back.tileH / 2 - 6 * s);
    ctx.lineTo(screenCX + frontW / 2, gridTop + GRID_ROWS * rowH + front.tileH / 2 + 6 * s);
    ctx.lineTo(screenCX - frontW / 2, gridTop + GRID_ROWS * rowH + front.tileH / 2 + 6 * s);
    ctx.closePath();
    ctx.fill();
}

// ============================================================
// 地面格子
// ============================================================
function renderTile(col, row, s, night, dusk) {
    const { x, y, scale, tileW, tileH } = gridToScreen(col, row);
    const even = (col + row) % 2 === 0;
    const pad = 1.5;

    const iso = screenToGrid(lastTX, lastTY);
    const isHover = iso.col === col && iso.row === row;
    const cell = gameState.garden.find(g => g.col === col && g.row === row);
    const hasPlant = !!cell;
    const isHouse = col === HOUSE_COL && row === HOUSE_ROW;

    // 地板颜色
    let topColor, frontColor;
    if (cell && cell.plant.id === 'step') {
        topColor = night ? '#3a3a3a' : '#b0a090';
        frontColor = night ? '#2a2a2a' : '#908070';
    } else if (isHouse) {
        topColor = night ? '#2a2010' : '#c4a870';
        frontColor = night ? '#1a1008' : '#a08850';
    } else if (night) {
        topColor = even ? '#1d4a1d' : '#173d17';
        frontColor = even ? '#143a14' : '#103010';
    } else if (dusk) {
        topColor = even ? '#4a8a5a' : '#3d7a4d';
        frontColor = even ? '#3a7a4a' : '#2d6a3d';
    } else {
        topColor = even ? '#52b855' : '#46a048';
        frontColor = even ? '#3da040' : '#35903a';
    }

    if (isHover && gameState.selectedPlant && !hasPlant && !isHouse) {
        topColor = night ? '#3a7a3a' : '#80d080';
        frontColor = night ? '#2a6a2a' : '#60b060';
    }

    // 正面（底边加厚条）
    const fh = Math.max(2, 3 * scale);
    ctx.fillStyle = frontColor;
    ctx.fillRect(x - tileW / 2 + pad, y + tileH / 2 - fh - pad, tileW - pad * 2, fh);

    // 顶面
    ctx.fillStyle = topColor;
    roundRect(ctx, x - tileW / 2 + pad, y - tileH / 2 + pad, tileW - pad * 2, tileH - fh - pad * 2, 2 * scale);
    ctx.fill();

    // 水面效果
    if (cell && cell.plant.type === 'water') {
        ctx.fillStyle = night ? 'rgba(20,60,100,0.45)' : 'rgba(70,160,220,0.28)';
        roundRect(ctx, x - tileW / 2 + pad, y - tileH / 2 + pad, tileW - pad * 2, tileH - fh - pad * 2, 2 * scale);
        ctx.fill();

        if (!night) {
            const wave = Math.sin(Date.now() * 0.003 + col + row) * 0.3 + 0.3;
            ctx.fillStyle = 'rgba(255,255,255,' + (wave * 0.3) + ')';
            ctx.beginPath();
            ctx.ellipse(x, y, tileW * 0.22, tileH * 0.13, 0, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // 选中边框
    if (isHover && gameState.selectedPlant && !hasPlant && !isHouse) {
        ctx.strokeStyle = night ? '#80ff80' : '#00e676';
        ctx.lineWidth = 2;
        roundRect(ctx, x - tileW / 2 + pad, y - tileH / 2 + pad, tileW - pad * 2, tileH - fh - pad * 2, 2 * scale);
        ctx.stroke();
    }
}

// ============================================================
// 房屋
// ============================================================
function renderHouse(s, night, dusk) {
    const { x, y, scale, tileW, tileH } = gridToScreen(HOUSE_COL, HOUSE_ROW);
    const h = gameState.house;
    const lvl = HOUSE_LEVELS[h.level - 1];
    const emoji = h.style ? h.style.emoji : lvl.emoji;
    const houseSize = tileW * (1.6 + h.level * 0.18);
    const houseY = y - tileH * 0.2;

    // 阴影
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    ctx.beginPath();
    ctx.ellipse(x, y + tileH * 0.22, houseSize * 0.52, tileH * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();

    // 夜晚发光
    if (night) {
        const grd = ctx.createRadialGradient(x, houseY, 0, x, houseY, houseSize * 1.5);
        grd.addColorStop(0, 'rgba(255,200,60,0.4)');
        grd.addColorStop(0.5, 'rgba(255,140,30,0.15)');
        grd.addColorStop(1, 'rgba(255,80,0,0)');
        ctx.fillStyle = grd;
        ctx.fillRect(x - houseSize * 1.5, houseY - houseSize * 1.5, houseSize * 3, houseSize * 3);
    }

    // emoji 阴影
    ctx.font = houseSize + 'px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(0,0,0,0.28)';
    ctx.fillText(emoji, x + 2 * s, houseY + 2 * s);

    // emoji 本体
    ctx.fillStyle = night ? '#ffe080' : '#ffffff';
    ctx.fillText(emoji, x, houseY);
}

// ============================================================
// 格子内物体
// ============================================================
function renderCellItem(cell, s, night, dusk) {
    const { x, y, scale, tileW, tileH } = gridToScreen(cell.col, cell.row);
    const emoji = getPlantEmoji(cell);

    // ground 类型只改变地板颜色，不需要额外绘制
    if (cell.plant.type === 'ground') return;

    const isTree = cell.plant.type === 'tree';
    const isWater = cell.plant.type === 'water';
    const isDeco = cell.plant.type === 'deco';
    const isFlower = cell.plant.type === 'flower';

    const emojiSize = isTree ? tileW * 0.88 : (isDeco ? tileW * 0.78 : tileW * 0.72);
    const emojiY = isTree ? y - tileH * 0.25 : y - tileH * 0.08;

    // 阴影
    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    ctx.beginPath();
    const shadowW = isTree ? tileW * 0.42 : tileW * 0.28;
    const shadowH = isTree ? tileH * 0.22 : tileH * 0.15;
    ctx.ellipse(x, y + tileH * 0.18, shadowW, shadowH, 0, 0, Math.PI * 2);
    ctx.fill();

    // 水体特效
    if (isWater) {
        if (cell.plant.id === 'fount') {
            const now = Date.now();
            for (let j = 0; j < 5; j++) {
                const t = ((now * 0.004 + j * 0.2) % 1);
                const px = x + Math.sin(j * 1.1 + now * 0.002) * tileW * 0.18 * (1 - t);
                const py = y - tileH * 0.3 - t * tileH * 0.55;
                const alpha = (1 - t) * 0.7;
                ctx.fillStyle = 'rgba(173,216,230,' + alpha + ')';
                ctx.beginPath();
                ctx.arc(px, py, (1 - t) * 3 * s, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }

    // 夜晚灯类发光
    if (night && (cell.plant.id === 'lamp' || cell.plant.id === 'lantern')) {
        const grd = ctx.createRadialGradient(x, emojiY, 0, x, emojiY, tileW * 1.3);
        grd.addColorStop(0, 'rgba(255,200,50,0.55)');
        grd.addColorStop(0.5, 'rgba(255,150,30,0.18)');
        grd.addColorStop(1, 'rgba(255,100,0,0)');
        ctx.fillStyle = grd;
        ctx.fillRect(x - tileW * 1.3, emojiY - tileW * 1.3, tileW * 2.6, tileW * 2.6);
    }

    // emoji 阴影
    ctx.font = emojiSize + 'px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(0,0,0,0.22)';
    ctx.fillText(emoji, x + 1.5 * s, emojiY + 1.5 * s);

    // emoji 本体
    ctx.fillStyle = night ? '#d0e8d0' : '#ffffff';
    ctx.fillText(emoji, x, emojiY);

    // 成熟植物光点
    if (cell.stage === 2 && !night) {
        const sparkle = Math.sin(Date.now() * 0.003 + cell.col * 2 + cell.row) * 0.5 + 0.5;
        ctx.fillStyle = 'rgba(255,255,255,' + (sparkle * 0.45) + ')';
        ctx.beginPath();
        ctx.arc(x + tileW * 0.18, emojiY - emojiSize * 0.22, 2 * s, 0, Math.PI * 2);
        ctx.fill();
    }
}

// ============================================================
// 涟漪
// ============================================================
function renderRipples(s, night) {
    rippleList.forEach(rip => {
        ctx.strokeStyle = 'rgba(100,200,255,' + (rip.t * 0.5) + ')';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.ellipse(rip.x, rip.y, rip.r, rip.r * 0.4, 0, 0, Math.PI * 2);
        ctx.stroke();
    });
}

// ============================================================
// 粒子
// ============================================================
function renderParticles(s, night) {
    gameState.particles.forEach(p => {
        if (p.type === 'butterfly') {
            const wx = Math.abs(Math.sin(p.wing)) * 0.35;
            ctx.globalAlpha = 0.9;
            ctx.font = tileW * 0.25 + 'px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = night ? '#aaffaa' : '#fff';
            ctx.fillText(p.emoji, x - tileW * 0.1, p.y);
            ctx.fillText(p.emoji, x + tileW * 0.1, p.y);
            ctx.globalAlpha = 1;
        } else if (p.type === 'firefly') {
            const glow = Math.sin(p.life * 0.06 + p.phase) * 0.5 + 0.5;
            const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 10);
            grd.addColorStop(0, 'rgba(255,255,100,' + (glow * 0.9) + ')');
            grd.addColorStop(0.4, 'rgba(150,255,50,' + (glow * 0.4) + ')');
            grd.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = grd;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 10, 0, Math.PI * 2);
            ctx.fill();
        } else if (p.type === 'petal') {
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rot);
            ctx.font = tileW * 0.22 + 'px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.globalAlpha = Math.min(1, (p.maxLife - p.life) / 40);
            ctx.fillStyle = night ? '#aaaaff' : '#ffccdd';
            ctx.fillText(p.emoji, 0, 0);
            ctx.restore();
            ctx.globalAlpha = 1;
        }
    });
}

// ============================================================
// UI
// ============================================================
function renderTopBar(s, w, h, sky) {
    ctx.fillStyle='rgba(0,0,0,0.3)'; roundRect(ctx,10*s,10*s,w-20*s,50*s,14*s); ctx.fill();

    ctx.fillStyle='rgba(255,255,255,0.85)'; roundRect(ctx,14*s,14*s,78*s,28*s,12*s); ctx.fill();
    ctx.font=(11*s)+'px sans-serif'; ctx.textAlign='left'; ctx.fillStyle='#ffd700';
    ctx.fillText(sky.name+' 🌄',22*s,33*s);

    ctx.font='bold '+(16*s)+'px sans-serif'; ctx.textAlign='center'; ctx.fillStyle='#ffd700';
    ctx.shadowColor='rgba(0,0,0,0.6)'; ctx.shadowBlur=4;
    ctx.fillText('💰 '+gameState.money,w/2,37*s); ctx.shadowBlur=0;

    ctx.font=(13*s)+'px sans-serif'; ctx.textAlign='right'; ctx.fillStyle='#aaffaa';
    ctx.fillText('Lv.'+gameState.level,w-100*s,37*s);

    const h2 = gameState.house;
    const lvl = HOUSE_LEVELS[h2.level-1];
    const isMax = h2.level >= HOUSE_LEVELS.length;
    ctx.fillStyle = isMax ? 'rgba(100,100,100,0.6)' : 'rgba(80,200,255,0.9)';
    roundRect(ctx,w-92*s,14*s,80*s,28*s,12*s); ctx.fill();
    ctx.fillStyle='#fff'; ctx.font='bold '+(11*s)+'px sans-serif'; ctx.textAlign='center';
    const btnEmoji = h2.style ? h2.style.emoji : lvl.emoji;
    ctx.fillText(isMax ? '🏰 MAX' : btnEmoji+' 升级',w-52*s,33*s);

    const houseName = h2.style ? h2.style.name : lvl.name;
    ctx.font=(10*s)+'px sans-serif'; ctx.textAlign='left'; ctx.fillStyle='#aaffaa';
    ctx.fillText('🏠 '+houseName,20*s,53*s);

    if (gameState.selectedPlant) {
        ctx.fillStyle='rgba(0,0,0,0.45)'; roundRect(ctx,w/2-85*s,58*s,170*s,28*s,12*s); ctx.fill();
        ctx.fillStyle='#fff'; ctx.font=(12*s)+'px sans-serif'; ctx.textAlign='center';
        ctx.fillText('已选 '+gameState.selectedPlant.emoji+' '+gameState.selectedPlant.name,w/2,77*s);
    }
}

function renderShop(s, w, h, night) {
    const shopY = h - 110 * s;
    const shopH = 102 * s;
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    roundRect(ctx,10*s,shopY,w-20*s,shopH,16*s); ctx.fill();

    ctx.fillStyle='rgba(255,255,255,0.6)';
    ctx.font='bold '+(11*s)+'px sans-serif'; ctx.textAlign='left';
    ctx.fillText('🌱 花园商店',18*s,shopY+16*s);
    ctx.textAlign='right'; ctx.fillText(gameState.garden.length+' 株',w-18*s,shopY+16*s);

    const ITEM_W=50*s, ITEM_H=34*s;
    const COLS=Math.floor((w-20*s)/(ITEM_W+4*s));
    const GAP=(w-20*s-COLS*ITEM_W)/(COLS+1);

    PLANTS.forEach((plant,i)=>{
        const col=i%COLS, row=Math.floor(i/COLS);
        if (row>1) return;
        const ix=10*s+GAP+col*(ITEM_W+GAP), iy=shopY+22*s+row*(ITEM_H+4*s);
        const sel=gameState.selectedPlant?.id===plant.id;
        const canAfford=gameState.money>=plant.price;
        ctx.fillStyle=sel?(night?'rgba(80,255,120,0.35)':'rgba(80,255,120,0.4)'):(night?'rgba(255,255,255,0.07)':'rgba(255,255,255,0.15)');
        roundRect(ctx,ix,iy,ITEM_W,ITEM_H,8*s); ctx.fill();
        if (sel){ctx.strokeStyle='#4ade80'; ctx.lineWidth=2; roundRect(ctx,ix,iy,ITEM_W,ITEM_H,8*s); ctx.stroke();}
        ctx.font=(18*s)+'px sans-serif'; ctx.textAlign='center';
        ctx.fillText(canAfford?plant.emoji:'🔒',ix+ITEM_W/2,iy+16*s);
        ctx.font=(9*s)+'px sans-serif'; ctx.fillStyle=canAfford?'#ffd700':'#666';
        ctx.fillText(canAfford?''+plant.price:'不足',ix+ITEM_W/2,iy+30*s);
    });
}

function renderToast(s, w, h) {
    if (toastTimer<=0) return;
    const alpha=Math.min(0.9,toastTimer/40);
    ctx.fillStyle='rgba(0,0,0,'+alpha+')';
    roundRect(ctx,w/2-95*s,h/2-22*s,190*s,38*s,19*s); ctx.fill();
    ctx.fillStyle='#fff'; ctx.font=(13*s)+'px sans-serif'; ctx.textAlign='center';
    ctx.fillText(toastMsg,w/2,h/2+6*s);
}

function renderHouseModal(s, w, h) {
    if (!houseModal) return;
    const m = houseModal;
    const my = h/2 - 160*s;
    ctx.fillStyle='rgba(0,0,0,0.6)'; ctx.fillRect(0,0,w,h);
    ctx.fillStyle='rgba(20,30,50,0.95)'; roundRect(ctx,10*s,my,w-20*s,360*s,18*s); ctx.fill();
    ctx.strokeStyle='rgba(255,255,255,0.2)'; ctx.lineWidth=2; roundRect(ctx,10*s,my,w-20*s,360*s,18*s); ctx.stroke();
    ctx.fillStyle='#ffd700'; ctx.font='bold '+(16*s)+'px sans-serif'; ctx.textAlign='center';
    ctx.fillText('选择房屋风格',w/2,my+28*s);

    if (m.styles) {
        const cols=2, itemH=72*s, itemW=(w-44*s)/cols-10*s;
        const gapX=10*s, gapY=10*s;
        m.styles.forEach((item,i)=>{
            const col=i%cols, row=Math.floor(i/cols);
            const ix=22*s+col*(itemW+gapX), iy=my+50*s+row*(itemH+gapY);
            ctx.fillStyle='rgba(255,255,255,0.1)'; roundRect(ctx,ix,iy,itemW,itemH,12*s); ctx.fill();
            ctx.strokeStyle='rgba(255,255,255,0.2)'; ctx.lineWidth=1; roundRect(ctx,ix,iy,itemW,itemH,12*s); ctx.stroke();
            ctx.font=(28*s)+'px sans-serif'; ctx.textAlign='center'; ctx.fillStyle='#fff';
            ctx.fillText(item.emoji,ix+itemW/2,iy+30*s);
            ctx.font='bold '+(12*s)+'px sans-serif'; ctx.fillStyle='#ffd700';
            ctx.fillText(item.name,ix+itemW/2,iy+50*s);
            ctx.font=(9*s)+'px sans-serif'; ctx.fillStyle='rgba(255,255,255,0.6)';
            ctx.fillText(item.desc,ix+itemW/2,iy+64*s);
        });
    }
    ctx.fillStyle='rgba(255,255,255,0.15)'; roundRect(ctx,w/2-50*s,my+318*s,100*s,38*s,12*s); ctx.fill();
    ctx.fillStyle='rgba(255,255,255,0.7)'; ctx.font=(12*s)+'px sans-serif'; ctx.textAlign='center';
    ctx.fillText('取消',w/2,my+343*s);
}

function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y);
    ctx.quadraticCurveTo(x+w,y,x+w,y+r);
    ctx.lineTo(x+w,y+h-r); ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
    ctx.lineTo(x+r,y+h); ctx.quadraticCurveTo(x,y+h,x,y+h-r);
    ctx.lineTo(x,y+r); ctx.quadraticCurveTo(x,y,x+r,y);
    ctx.closePath();
}

init();
