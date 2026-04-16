// ============================================================
// 梦想小屋 - 2.5D 等距视角花园
// ============================================================

// ---- 植物/物品定义 ----
const PLANTS = [
    // type: ground=地面装饰, flower=花, tree=树, water=水池, deco=装饰
    { id:'grass',   name:'草坪',     emoji:'🌿', emoji0:'🌿', emoji1:'🌿', emoji2:'🌿', price:10,  growth:3,  type:'ground', bodyH:4,  stackable:true  },
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
    { id:'step',    name:'石板路',   emoji:'⬜', emoji0:'⬜', emoji1:'⬜', emoji2:'⬜', price:5,   growth:0,  type:'ground',  bodyH:4,  stackable:true  },
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
    garden: [],         // {col, row, plant, stage, plantedAt}
    selectedPlant: null,
    timeOfDay: 0.4,      // 0~1
    timeFlow: 0,
    particles: [],       // 蝴蝶/萤火虫/花瓣
    house: { level:1, style:null },
};

// ---- 等距坐标常量 ----
let TILE_W = 80;   // 菱形宽度
let TILE_H = 40;   // 菱形半高
let ORIGIN_X = 0;  // 屏幕原点 x（菱形网格顶部顶点）
let ORIGIN_Y = 0;  // 屏幕原点 y

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

    recalcIso();
    initParticles();

    // 初始只有房子，花园是空的
    wx.onTouchStart(onTouchStart);
    wx.onTouchMove(onTouchMove);
    wx.onTouchEnd(onTouchEnd);
    gameLoop();
}

function recalcIso() {
    TILE_W = Math.max(56, Math.min(80, (UI.w - 30) / (GRID_COLS + GRID_ROWS + 2)));
    TILE_H = TILE_W / 2;
    ORIGIN_X = UI.w / 2;
    ORIGIN_Y = 90 * UI.s;
}

// ============================================================
// 等距坐标转换
// ============================================================
// col,row → 屏幕中心点（菱形顶部）
function isoToScreen(col, row) {
    const x = ORIGIN_X + (col - row) * (TILE_W / 2);
    const y = ORIGIN_Y + (col + row) * (TILE_H / 2);
    return { x, y };
}

// 屏幕 → 最近的 (col, row)
function screenToIso(sx, sy) {
    // 反变换
    // sx - OX = (col - row) * TW/2
    // sy - OY = (col + row) * TH/2
    const tw2 = TILE_W / 2;
    const th2 = TILE_H / 2;
    const col = Math.round((sx - ORIGIN_X) / tw2 + (sy - ORIGIN_Y) / th2) / 2;
    const row = Math.round((sy - ORIGIN_Y) / th2 - (sx - ORIGIN_X) / tw2) / 2;
    return { col: Math.floor(col), row: Math.floor(row) };
}

// ============================================================
// 粒子系统
// ============================================================
function initParticles() {
    for (let i = 0; i < 4; i++) spawnButterfly();
}

function spawnButterfly() {
    const butterflies = gameState.particles.filter(p => p.type === 'butterfly');
    if (butterflies.length >= 5) return;
    const emojis = ['🦋', '🐝', '🪲', '🦗'];
    const col = Math.floor(Math.random() * GRID_COLS);
    const row = Math.floor(Math.random() * GRID_ROWS);
    const pos = isoToScreen(col + 0.5, row + 0.5);
    gameState.particles.push({
        type: 'butterfly',
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
        x: pos.x + (Math.random() - 0.5) * TILE_W,
        y: pos.y + (Math.random() - 0.5) * TILE_H,
        vx: (Math.random() - 0.5) * 1.2,
        vy: (Math.random() - 0.5) * 0.8,
        wing: Math.random() * Math.PI * 2,
        life: 0,
        maxLife: 400 + Math.random() * 300,
        depth: col + row,
    });
}

function spawnFirefly() {
    const fireflies = gameState.particles.filter(p => p.type === 'firefly');
    if (fireflies.length >= 10) return;
    const col = Math.floor(Math.random() * GRID_COLS);
    const row = Math.floor(Math.random() * GRID_ROWS);
    const pos = isoToScreen(col + 0.5, row + 0.5);
    gameState.particles.push({
        type: 'firefly',
        x: pos.x + (Math.random() - 0.5) * TILE_W * GRID_COLS * 0.5,
        y: pos.y + (Math.random() - 0.5) * TILE_H * GRID_ROWS * 0.5,
        phase: Math.random() * Math.PI * 2,
        life: 0,
        maxLife: 500 + Math.random() * 400,
        depth: Math.random() * (GRID_COLS + GRID_ROWS),
    });
}

function spawnPetal() {
    const pos = isoToScreen(GRID_COLS / 2, -1);
    const emojis = ['🌸', '🍂', '🍃', '🌺'];
    gameState.particles.push({
        type: 'petal',
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
        x: pos.x + (Math.random() - 0.5) * TILE_W * GRID_COLS * 0.8,
        y: pos.y - 20,
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
            p.vx += (Math.random() - 0.5) * 0.1;
            p.vy += (Math.random() - 0.5) * 0.08;
            p.vx *= 0.96; p.vy *= 0.96;
            p.x += p.vx; p.y += p.vy;
            p.depth = p.x; // approximate
        } else if (p.type === 'firefly') {
            p.x += Math.sin(p.life * 0.03 + p.phase) * 0.5;
            p.y += Math.sin(p.life * 0.05 + p.phase) * 0.3 - 0.1;
            if (p.y < 20) { gameState.particles.splice(i, 1); continue; }
        } else if (p.type === 'petal') {
            p.rot += p.rotSpd;
            p.x += p.vx + Math.sin(p.life * 0.05) * 0.3;
            p.y += p.vy;
            if (p.y > UI.h + 30) { gameState.particles.splice(i, 1); continue; }
        }
    }
    // 补充粒子
    const bCnt = gameState.particles.filter(p => p.type === 'butterfly').length;
    if (bCnt < 3 && Math.random() < 0.02) spawnButterfly();
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
function isDusk()    { return (gameState.timeOfDay > 0.7 && gameState.timeOfDay <= 0.83) || (gameState.timeOfDay >= 0.15 && gameState.timeOfDay < 0.25); }

const stars = Array.from({length: 100}, () => ({
    x: Math.random(), y: Math.random() * 0.65,
    size: 0.5 + Math.random() * 1.5,
    phase: Math.random() * Math.PI * 2,
}));

// ============================================================
// 涟漪
// ============================================================
function addRipple(x, y) {
    rippleList.push({ x, y, r: 3, t: 1 });
}
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
        col, row,
        plant,
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
    const s = cell.stage;
    if (s === 0) return cell.plant.emoji0 || '🌱';
    if (s === 1) return cell.plant.emoji1 || cell.plant.emoji;
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
            h.style = chosen;
            h.level++;
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

    // 顶栏按钮
    if (y < 58*UI.s && y > 10*UI.s) {
        if (x > UI.w - 100*UI.s) { openUpgradeMenu(); return; }
        if (x < 90*UI.s) { cycleTime(); return; }
        return;
    }

    const shopY = UI.h - 110 * UI.s;
    const btnH  = 42 * UI.s;

    // 商店按钮区域
    if (y > shopY) {
        const idx = Math.floor((x - 10 * UI.s) / (53 * UI.s));
        if (idx >= 0 && idx < PLANTS.length) {
            const plant = PLANTS[idx];
            if (gameState.money >= plant.price) {
                gameState.selectedPlant = plant;
                showToast(`已选 ${plant.emoji} ${plant.name}，点击格子放置`);
            } else {
                showToast(`💰 金币不足`);
            }
        }
        return;
    }

    // 花园区域
    const iso = screenToIso(x, y);
    if (iso.col >= 0 && iso.col < GRID_COLS && iso.row >= 0 && iso.row < GRID_ROWS) {
        // 点击房屋格子
        if (iso.col === HOUSE_COL && iso.row === HOUSE_ROW) {
            const h = gameState.house;
            const lvl = HOUSE_LEVELS[h.level-1];
            const emoji = h.style ? h.style.emoji : lvl.emoji;
            const name = h.style ? h.style.name : lvl.name;
            const next = h.level < HOUSE_LEVELS.length ? ' → ' + HOUSE_LEVELS[h.level].name : '（最高级）';
            showToast(emoji + ' ' + name + next);
            return;
        }
        // 点击已有格子
        const existing = gameState.garden.find(g => g.col === iso.col && g.row === iso.row);
        if (existing) {
            const stageNames = ['🌱 种子', '🌿 幼苗', existing.plant.emoji + ' 成熟'];
            showToast(getPlantEmoji(existing) + ' ' + existing.plant.name + ' (' + stageNames[existing.stage] + ')');
            return;
        }
        // 放置新植物
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

    // 出售按钮（右上角）
    if (x > UI.w - 92 * UI.s && y < 55 * UI.s) {
        sellGarden();
    }

    // 时间切换（左上角）
    if (x < 85 * UI.s && y < 55 * UI.s) {
        cycleTime();
    }
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
    showToast(`🏡 出售花园 +${bonus} 💰`);
    checkLevelUp();
}

function checkLevelUp() {
    const next = gameState.level + 1;
    if (gameState.money >= next * 1500) {
        gameState.level = next;
        showToast(`⬆️ 升级！现在是 ${next} 级`);
    }
}

function showToast(msg) {
    toastMsg = msg; toastTimer = 150;
}

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
    const s = UI.s, w = UI.w, h = UI.h;
    recalcIso();
    ctx.clearRect(0, 0, w, h);

    const sky = getSky(gameState.timeOfDay);
    const night = sky.night;
    const dusk  = isDusk();

    // ---- 天空背景 ----
    const skyGrd = ctx.createLinearGradient(0, 0, 0, h);
    skyGrd.addColorStop(0, sky.top);
    skyGrd.addColorStop(1, sky.bot);
    ctx.fillStyle = skyGrd;
    ctx.fillRect(0, 0, w, h);

    // 星星
    if (night || (gameState.timeOfDay > 0.83 || gameState.timeOfDay < 0.2)) {
        const sa = night ? 1 : Math.max(0, 1 - (gameState.timeOfDay - 0.83) / 0.12);
        stars.forEach(st => {
            const tw = Math.sin(st.phase + Date.now() * 0.002) * 0.5 + 0.5;
            ctx.fillStyle = `rgba(255,255,240,${sa * tw})`;
            ctx.beginPath();
            ctx.arc(st.x * w, st.y * h, st.size * s, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    // 远景山丘（背景）
    renderHills(s, w, h, sky, night);

    // ---- 等距地面网格 ----
    // 按深度排序：col+row 小的先画（后面），大的后画（前面）
    for (let sum = 0; sum < GRID_COLS + GRID_ROWS - 1; sum++) {
        for (let col = 0; col <= sum; col++) {
            const row = sum - col;
            if (col >= GRID_COLS || row >= GRID_ROWS || col < 0 || row < 0) continue;
            renderTile(col, row, s, night, dusk, sky);
        }
    }

    // ---- 房屋（地面之后、花园物体之前）----
    renderHouse(s, night, dusk);

    // ---- 格子内物体（同样按深度排序） ----
    // 先画矮的（花、草），再画高的（树、水）
    const sortOrder = { ground:0, flower:1, deco:2, tree:3, water:4 };
    const sorted = [...gameState.garden].sort((a, b) => {
        const da = a.col + a.row, db = b.col + b.row;
        if (da !== db) return da - db;
        return (sortOrder[a.plant.type] || 0) - (sortOrder[b.plant.type] || 0);
    });

    for (const cell of sorted) {
        renderCellItem(cell, s, night, dusk);
    }

    // 涟漪
    renderRipples(s, night);

    // 粒子
    renderParticles(s, night);

    // ---- UI ----
    renderTopBar(s, w, h, sky);
    renderShop(s, w, h, night);
    renderToast(s, w, h);
    renderHouseModal(s, w, h);
}

// ============================================================
// 房屋渲染
// ============================================================
function renderHouse(s, night, dusk) {
    const h = gameState.house;
    const lvl = HOUSE_LEVELS[h.level-1];
    const emoji = h.style ? h.style.emoji : lvl.emoji;
    const {x:cx, y:cy} = isoToScreen(HOUSE_COL+0.5, HOUSE_ROW+0.5);
    const bh = lvl.bodyH * s;
    
    // 参考树的画法
    const tile_hw = TILE_W/2, tile_hh = TILE_H/2;
    const hw = tile_hw * 0.45;  // 房子宽度
    const hh = tile_hh * 0.45;  // 房子深度
    
    // 3D 主体颜色
    const bodyColor = night?'#4a3a2a':(dusk?'#a07848':'#d4b87a');
    const bodyDark  = night?'#2a1a0a':(dusk?'#7a5830':'#b89860');
    const bodyTop   = night?'#5a4a3a':(dusk?'#b08850':'#e4c880');
    const baseColor = night?'#3a2a1a':(dusk?'#7a5a3a':'#b89860');

    // 房子底座（和树冠底部一样，贴在格子上遮住缝隙）
    ctx.fillStyle = baseColor;
    ctx.beginPath();
    ctx.moveTo(cx, cy - hh);         // 上顶点
    ctx.lineTo(cx + hw, cy);         // 右顶点
    ctx.lineTo(cx, cy + hh);         // 下顶点
    ctx.lineTo(cx - hw, cy);         // 左顶点
    ctx.closePath();
    ctx.fill();

    // 左侧面：从底座往上延伸
    ctx.fillStyle = bodyDark;
    ctx.beginPath();
    ctx.moveTo(cx-hw, cy);           // 底座左顶点
    ctx.lineTo(cx, cy+hh);           // 底座下顶点
    ctx.lineTo(cx, cy+hh-bh);        // 上顶点往上
    ctx.lineTo(cx-hw, cy-bh);        // 左顶点往上
    ctx.closePath();
    ctx.fill();

    // 右侧面：从底座往上延伸
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.moveTo(cx+hw, cy);           // 底座右顶点
    ctx.lineTo(cx, cy+hh);           // 底座下顶点
    ctx.lineTo(cx, cy+hh-bh);        // 上顶点往上
    ctx.lineTo(cx+hw, cy-bh);        // 右顶点往上
    ctx.closePath();
    ctx.fill();

    // 顶面
    ctx.fillStyle = bodyTop;
    ctx.beginPath();
    ctx.moveTo(cx, cy-bh-hh);        // 顶面上顶点
    ctx.lineTo(cx+hw, cy-bh);        // 顶面右顶点
    ctx.lineTo(cx, cy-bh+hh);        // 顶面下顶点
    ctx.lineTo(cx-hw, cy-bh);        // 顶面左顶点
    ctx.closePath();
    ctx.fill();

    // 屋顶
    const roofH = bh * 0.55;
    ctx.fillStyle = night?'#3a2010':(dusk?'#704020':'#a05830');
    ctx.beginPath();
    ctx.moveTo(cx-hw*1.05, cy-bh);
    ctx.lineTo(cx, cy-bh-roofH);
    ctx.lineTo(cx, cy-bh);
    ctx.closePath();
    ctx.fill();
    
    ctx.fillStyle = night?'#5a3a2a':(dusk?'#a06030':'#c07840');
    ctx.beginPath();
    ctx.moveTo(cx+hw*1.05, cy-bh);
    ctx.lineTo(cx, cy-bh-roofH);
    ctx.lineTo(cx, cy-bh);
    ctx.closePath();
    ctx.fill();

    // 门窗
    if (!night) {
        ctx.fillStyle='#6a9fd4'; ctx.fillRect(cx-5*s,cy-bh*0.2,6*s,bh*0.35);
        ctx.fillStyle='#f0d080'; ctx.fillRect(cx+3*s,cy-bh*0.45,5*s,5*s);
    } else {
        ctx.fillStyle='#f8d060'; ctx.fillRect(cx-5*s,cy-bh*0.2,6*s,bh*0.35);
        ctx.fillStyle='#f8d060'; ctx.fillRect(cx+3*s,cy-bh*0.45,5*s,5*s);
    }

    // emoji
    const emojiSize = Math.max(20, TILE_W*0.48);
    ctx.fillStyle='rgba(0,0,0,'+(night?0.4:0.2)+')';
    ctx.font=emojiSize+'px sans-serif'; ctx.textAlign='center';
    ctx.fillText(emoji,cx+2*s,cy-bh+emojiSize*0.1+2*s);

    // 夜晚发光
    if (night) {
        const grd=ctx.createRadialGradient(cx,cy-bh*0.3,0,cx,cy-bh*0.3,TILE_W*0.9);
        grd.addColorStop(0,'rgba(255,200,60,0.5)'); grd.addColorStop(0.5,'rgba(255,140,30,0.2)'); grd.addColorStop(1,'rgba(255,80,0,0)');
        ctx.fillStyle=grd; ctx.fillRect(cx-TILE_W*0.9,cy-bh-TILE_W*0.9,TILE_W*1.8,TILE_W*1.8);
    }

    ctx.fillStyle=night?'#ffe080':'#ffffff';
    ctx.fillText(emoji,cx,cy-bh+emojiSize*0.1);
}


// ============================================================
// 风格选择模态框
// ============================================================
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

// ---- 远景山丘 ----
function renderHills(s, w, h, sky, night) {
    const dusk = isDusk();
    const hillY = ORIGIN_Y + (GRID_COLS + GRID_ROWS) * TILE_H / 2;
    // 背景山
    ctx.fillStyle = night ? 'rgba(20,30,20,0.8)' : (dusk ? 'rgba(150,80,80,0.35)' : 'rgba(80,140,80,0.25)');
    ctx.beginPath();
    ctx.moveTo(0, hillY);
    ctx.bezierCurveTo(w * 0.2, hillY - 80 * s, w * 0.35, hillY - 120 * s, w * 0.5, hillY - 90 * s);
    ctx.bezierCurveTo(w * 0.65, hillY - 60 * s, w * 0.8, hillY - 110 * s, w, hillY - 70 * s);
    ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.closePath();
    ctx.fill();
}

// ---- 单个等距格子 ----
function renderTile(col, row, s, night, dusk, sky) {
    const { x: cx, y: cy } = isoToScreen(col + 0.5, row + 0.5);
    const hw = TILE_W / 2, hh = TILE_H / 2;

    // 选中高亮
    const iso = screenToIso(lastTX, lastTY);
    const isHover = iso.col === col && iso.row === row;
    const hasPlant = gameState.garden.some(g => g.col === col && g.row === row);
    const isHouse = col === HOUSE_COL && row === HOUSE_ROW;

    // 格子颜色
    let topColor, leftColor, rightColor;
    const even = (col + row) % 2 === 0;

    if (night) {
        topColor  = even ? '#1d4a1d' : '#173d17';
        leftColor = even ? '#173d17' : '#143214';
        rightColor = even ? '#205020' : '#1a4a1a';
    } else if (dusk) {
        topColor  = even ? '#4a8a5a' : '#3d7a4d';
        leftColor = even ? '#3d7a4d' : '#357045';
        rightColor = even ? '#5a9a6a' : '#4d8a5d';
    } else {
        topColor  = even ? '#52b855' : '#46a048';
        leftColor = even ? '#46a048' : '#3d8f3d';
        rightColor = even ? '#5fc860' : '#52b855';
    }

    // 格子悬停高亮
    if (isHover && gameState.selectedPlant && !hasPlant && !isHouse) {
        topColor = night ? '#3a7a3a' : '#80d080';
    }

    // 绘制菱形四个顶点: 左上(x-hw,cy) 右上(x+hw,cy) 右下(x,cy+hh) 左下(x,cy+hh)
    // 顶面
    ctx.fillStyle = topColor;
    ctx.beginPath();
    ctx.moveTo(cx, cy - hh);
    ctx.lineTo(cx + hw, cy);
    ctx.lineTo(cx, cy + hh);
    ctx.lineTo(cx - hw, cy);
    ctx.closePath();
    ctx.fill();

    // 左侧面（暗面）
    ctx.fillStyle = leftColor;
    ctx.beginPath();
    ctx.moveTo(cx - hw, cy);
    ctx.lineTo(cx, cy + hh);
    ctx.lineTo(cx, cy + hh + 5 * s);
    ctx.lineTo(cx - hw, cy + 5 * s);
    ctx.closePath();
    ctx.fill();

    // 右侧面（亮面）
    ctx.fillStyle = rightColor;
    ctx.beginPath();
    ctx.moveTo(cx + hw, cy);
    ctx.lineTo(cx, cy + hh);
    ctx.lineTo(cx, cy + hh + 5 * s);
    ctx.lineTo(cx + hw, cy + 5 * s);
    ctx.closePath();
    ctx.fill();

    // 格子顶部纹理（斜线）
    ctx.strokeStyle = night ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.07)';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(cx - hw + 4, cy - hh + 2);
    ctx.lineTo(cx - hw + 4, cy);
    ctx.stroke();

    // 选中边框
    if (isHover && gameState.selectedPlant && !hasPlant && !isHouse) {
        ctx.strokeStyle = night ? '#80ff80' : '#00e676';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx, cy - hh);
        ctx.lineTo(cx + hw, cy);
        ctx.lineTo(cx, cy + hh);
        ctx.lineTo(cx - hw, cy);
        ctx.closePath();
        ctx.stroke();
    }
}

// ---- 格子内的物体 ----
function renderCellItem(cell, s, night, dusk) {
    const { x: cx, y: cy } = isoToScreen(cell.col + 0.5, cell.row + 0.5);
    const bh = cell.plant.bodyH * s;  // 物体高度
    const hw = TILE_W / 2, hh = TILE_H / 2;
    const emoji = getPlantEmoji(cell);
    const emojiSize = Math.max(16, TILE_W * 0.45);

    // === 水 ===
    if (cell.plant.type === 'water') {
        const wave = Math.sin(Date.now() * 0.003 + cell.col * 0.5) * 2;
        // 水坑底色（比格子更蓝）
        ctx.fillStyle = night ? '#1a4a6e' : '#4fc3f7';
        ctx.beginPath();
        ctx.moveTo(cx, cy - hh + 2);
        ctx.lineTo(cx + hw - 2, cy);
        ctx.lineTo(cx, cy + hh - 2);
        ctx.lineTo(cx - hw + 2, cy);
        ctx.closePath();
        ctx.fill();

        // 水面波光
        if (!night) {
            ctx.fillStyle = 'rgba(255,255,255,0.35)';
            for (let wi = 0; wi < 3; wi++) {
                const wx = cx + Math.sin(Date.now() * 0.002 + cell.col + wi) * hw * 0.25;
                const wy = cy + Math.cos(Date.now() * 0.0015 + cell.row + wi) * hh * 0.25;
                ctx.beginPath();
                ctx.ellipse(wx, wy, hw * 0.2, hh * 0.15, Date.now() * 0.001, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // 涟漪
        rippleList.forEach(rip => {
            ctx.strokeStyle = `rgba(255,255,255,${rip.t * 0.5})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.ellipse(rip.x, rip.y, rip.r, rip.r * 0.5, 0, 0, Math.PI * 2);
            ctx.stroke();
        });

        // 喷泉
        if (cell.plant.id === 'fount') {
            // 喷泉柱
            ctx.fillStyle = night ? '#5a8a9e' : '#90caf9';
            ctx.beginPath();
            ctx.moveTo(cx - 4 * s, cy);
            ctx.lineTo(cx + 4 * s, cy);
            ctx.lineTo(cx + 3 * s, cy - 18 * s);
            ctx.lineTo(cx - 3 * s, cy - 18 * s);
            ctx.closePath();
            ctx.fill();

            // 喷泉水粒
            const now = Date.now();
            for (let j = 0; j < 6; j++) {
                const t = ((now * 0.004 + j * 0.166) % 1);
                const px = cx + Math.sin(j * 1.1 + now * 0.002) * 8 * s * (1 - t);
                const py = cy - 18 * s - t * 25 * s;
                const alpha = (1 - t) * 0.8;
                ctx.fillStyle = `rgba(173,216,230,${alpha})`;
                ctx.beginPath();
                ctx.arc(px, py, (1 - t) * 3 * s, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // 睡莲/荷花
        if (cell.plant.id === 'pond') {
            ctx.font = `${TILE_W * 0.4}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.fillStyle = night ? '#c0c0ff' : '#fff';
            ctx.fillText('🪷', cx, cy + hh * 0.3);
        }
        return;
    }

    // === 物体主体（柱子/立体） ===
    if (bh > 0) {
        const bodyColor = night ? '#1a2e1a' : (dusk ? '#2d4a2d' : '#2a5a28');
        const bodyShade = night ? '#0f1f0f' : (dusk ? '#1d3a1d' : '#1a4a1a');

        if (cell.plant.type === 'tree') {
            // 树干
            ctx.fillStyle = night ? '#2d1a0f' : '#5d3a1a';
            ctx.beginPath();
            ctx.moveTo(cx - 4 * s, cy);
            ctx.lineTo(cx + 4 * s, cy);
            ctx.lineTo(cx + 3 * s, cy - bh * 0.6);
            ctx.lineTo(cx - 3 * s, cy - bh * 0.6);
            ctx.closePath();
            ctx.fill();

            // 树冠底部（落在格子上）
            ctx.fillStyle = night ? '#1a3a1a' : '#2a6a28';
            ctx.beginPath();
            ctx.moveTo(cx, cy - hh);
            ctx.lineTo(cx + hw - 2, cy);
            ctx.lineTo(cx, cy + hh - 2);
            ctx.lineTo(cx - hw + 2, cy);
            ctx.closePath();
            ctx.fill();

            // 树冠本体（比格子大，有3D厚度感）
            const canopyTop = cy - bh;
            const canopyW = TILE_W * 0.7;
            const canopyH = TILE_H * 0.8;

            // 树冠侧边（深色）
            ctx.fillStyle = night ? '#1a3a1a' : '#2a6a28';
            ctx.beginPath();
            ctx.ellipse(cx, canopyTop + canopyH * 0.4, canopyW * 0.5, canopyH * 0.4, 0, 0, Math.PI * 2);
            ctx.fill();

            // 树冠顶面（亮色）
            ctx.fillStyle = night ? '#2a5a2a' : (dusk ? '#3a7a38' : '#3a8a38');
            ctx.beginPath();
            ctx.ellipse(cx, canopyTop + canopyH * 0.2, canopyW * 0.5, canopyH * 0.4, 0, 0, Math.PI * 2);
            ctx.fill();

        } else if (cell.plant.type === 'flower') {
            // 花茎
            ctx.fillStyle = night ? '#1a3a1a' : '#3a8a38';
            ctx.fillRect(cx - 2 * s, cy - bh * 0.5, 4 * s, bh * 0.5);

            // 花朵底座（贴在格子上，遮住缝隙）
            ctx.fillStyle = night ? '#2a4a2a' : '#3a7a3a';
            ctx.beginPath();
            ctx.moveTo(cx, cy - hh);
            ctx.lineTo(cx + hw - 2, cy);
            ctx.lineTo(cx, cy + hh - 2);
            ctx.lineTo(cx - hw + 2, cy);
            ctx.closePath();
            ctx.fill();

        } else if (cell.plant.type === 'deco') {
            // 装饰物底部
            ctx.fillStyle = night ? '#2a3a2a' : '#4a6a3a';
            ctx.beginPath();
            ctx.moveTo(cx, cy - hh);
            ctx.lineTo(cx + hw - 2, cy);
            ctx.lineTo(cx, cy + hh - 2);
            ctx.lineTo(cx - hw + 2, cy);
            ctx.closePath();
            ctx.fill();
        }
    }

    // === emoji 图标 ===
    // 阴影
    ctx.fillStyle = `rgba(0,0,0,${night ? 0.3 : 0.2})`;
    ctx.font = `${emojiSize}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(emoji, cx + 2 * s, cy - bh + emojiSize * 0.1 + 2 * s);

    // 发光（夜间灯类）
    if (night && (cell.plant.id === 'lamp' || cell.plant.id === 'lantern')) {
        const grd = ctx.createRadialGradient(cx, cy - bh, 0, cx, cy - bh, TILE_W * 1.2);
        grd.addColorStop(0, 'rgba(255, 200, 50, 0.6)');
        grd.addColorStop(0.5, 'rgba(255, 150, 30, 0.2)');
        grd.addColorStop(1, 'rgba(255, 100, 0, 0)');
        ctx.fillStyle = grd;
        ctx.fillRect(cx - TILE_W * 1.2, cy - bh - TILE_W * 1.2, TILE_W * 2.4, TILE_W * 2.4);
    }

    // emoji 本体
    ctx.fillStyle = night ? '#d0e8d0' : '#ffffff';
    ctx.fillText(emoji, cx, cy - bh + emojiSize * 0.1);

    // 花朵/树叶粒子（成熟时）
    if (cell.stage === 2 && (cell.plant.type === 'flower' || cell.plant.type === 'tree') && !night) {
        const flowerParticles = [
            { ox: -hw * 0.5, oy: -hh * 0.5, phase: 0 },
            { ox:  hw * 0.4, oy: -hh * 0.3, phase: 1.2 },
        ];
        flowerParticles.forEach(fp => {
            const t = Math.sin(Date.now() * 0.002 + fp.phase) * 0.1;
            ctx.fillStyle = 'rgba(255,255,255,0.3)';
            ctx.beginPath();
            ctx.arc(cx + fp.ox + t * 10, cy - bh + fp.oy, 2 * s, 0, Math.PI * 2);
            ctx.fill();
        });
    }
}

function renderRipples(s, night) {
    rippleList.forEach(rip => {
        ctx.strokeStyle = `rgba(100,200,255,${rip.t * 0.5})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.ellipse(rip.x, rip.y, rip.r, rip.r * 0.4, 0, 0, Math.PI * 2);
        ctx.stroke();
    });
}

function renderParticles(s, night) {
    const night2 = night || isNight();
    gameState.particles.forEach(p => {
        if (p.type === 'butterfly') {
            const wx = Math.abs(Math.sin(p.wing)) * 0.35;
            ctx.globalAlpha = 0.9;
            ctx.font = `${TILE_W * 0.25}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.fillStyle = night2 ? '#aaffaa' : '#fff';
            // 左翅
            ctx.globalAlpha = 0.9 * (1 - wx);
            ctx.fillText(p.emoji, p.x - TILE_W * 0.1, p.y);
            // 右翅
            ctx.globalAlpha = 0.9 * (1 - wx);
            ctx.fillText(p.emoji, p.x + TILE_W * 0.1, p.y);
            ctx.globalAlpha = 1;
        } else if (p.type === 'firefly') {
            const glow = (Math.sin(p.life * 0.06 + p.phase) * 0.5 + 0.5);
            const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 10);
            grd.addColorStop(0, `rgba(255,255,100,${glow * 0.9})`);
            grd.addColorStop(0.4, `rgba(150,255,50,${glow * 0.4})`);
            grd.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = grd;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 10, 0, Math.PI * 2);
            ctx.fill();
        } else if (p.type === 'petal') {
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rot);
            ctx.font = `${TILE_W * 0.22}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.globalAlpha = Math.min(1, (p.maxLife - p.life) / 40);
            ctx.fillStyle = night2 ? '#aaaaff' : '#ffccdd';
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

    // 时间按钮
    ctx.fillStyle='rgba(255,255,255,0.85)'; roundRect(ctx,14*s,14*s,78*s,28*s,12*s); ctx.fill();
    ctx.font=(11*s)+'px sans-serif'; ctx.textAlign='left'; ctx.fillStyle='#ffd700';
    ctx.fillText(sky.name+' 🌄',22*s,33*s);

    // 金币
    ctx.font='bold '+(16*s)+'px sans-serif'; ctx.textAlign='center'; ctx.fillStyle='#ffd700';
    ctx.shadowColor='rgba(0,0,0,0.6)'; ctx.shadowBlur=4;
    ctx.fillText('💰 '+gameState.money,w/2,37*s); ctx.shadowBlur=0;

    // 等级
    ctx.font=(13*s)+'px sans-serif'; ctx.textAlign='right'; ctx.fillStyle='#aaffaa';
    ctx.fillText('Lv.'+gameState.level,w-100*s,37*s);

    // 升级按钮
    const h2 = gameState.house;
    const lvl = HOUSE_LEVELS[h2.level-1];
    const isMax = h2.level >= HOUSE_LEVELS.length;
    ctx.fillStyle = isMax ? 'rgba(100,100,100,0.6)' : 'rgba(80,200,255,0.9)';
    roundRect(ctx,w-92*s,14*s,80*s,28*s,12*s); ctx.fill();
    ctx.fillStyle='#fff'; ctx.font='bold '+(11*s)+'px sans-serif'; ctx.textAlign='center';
    const btnEmoji = h2.style ? h2.style.emoji : lvl.emoji;
    ctx.fillText(isMax ? '🏰 MAX' : btnEmoji+' 升级',w-52*s,33*s);

    // 房屋名称
    const houseName = h2.style ? h2.style.name : lvl.name;
    ctx.font=(10*s)+'px sans-serif'; ctx.textAlign='left'; ctx.fillStyle='#aaffaa';
    ctx.fillText('🏠 '+houseName, 20*s, 53*s);

    // 选中提示
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
    roundRect(ctx, 10 * s, shopY, w - 20 * s, shopH, 16 * s);
    ctx.fill();

    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = `bold ${11 * s}px sans-serif`;
    ctx.textAlign = 'left';
    ctx.fillText('🌱 花园商店', 18 * s, shopY + 16 * s);
    ctx.textAlign = 'right';
    ctx.fillText(`${gameState.garden.length} 株`, w - 18 * s, shopY + 16 * s);

    const ITEM_W = 50 * s, ITEM_H = 34 * s;
    const COLS = Math.floor((w - 20 * s) / (ITEM_W + 4 * s));
    const GAP = (w - 20 * s - COLS * ITEM_W) / (COLS + 1);

    PLANTS.forEach((plant, i) => {
        const col = i % COLS;
        const row = Math.floor(i / COLS);
        if (row > 1) return;
        const ix = 10 * s + GAP + col * (ITEM_W + GAP);
        const iy = shopY + 22 * s + row * (ITEM_H + 4 * s);
        const sel = gameState.selectedPlant?.id === plant.id;
        const canAfford = gameState.money >= plant.price;

        ctx.fillStyle = sel
            ? (night ? 'rgba(80,255,120,0.35)' : 'rgba(80,255,120,0.4)')
            : (night ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.15)');
        roundRect(ctx, ix, iy, ITEM_W, ITEM_H, 8 * s);
        ctx.fill();
        if (sel) {
            ctx.strokeStyle = '#4ade80';
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        ctx.font = `${18 * s}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(canAfford ? plant.emoji : '🔒', ix + ITEM_W / 2, iy + 16 * s);
        ctx.font = `${9 * s}px sans-serif`;
        ctx.fillStyle = canAfford ? '#ffd700' : '#666';
        ctx.fillText(canAfford ? `${plant.price}` : '不足', ix + ITEM_W / 2, iy + 30 * s);
    });
}

function renderToast(s, w, h) {
    if (toastTimer <= 0) return;
    const alpha = Math.min(0.9, toastTimer / 40);
    ctx.fillStyle = `rgba(0,0,0,${alpha})`;
    roundRect(ctx, w / 2 - 95 * s, h / 2 - 22 * s, 190 * s, 38 * s, 19 * s);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = `${13 * s}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(toastMsg, w / 2, h / 2 + 6 * s);
}

function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
}

init();
