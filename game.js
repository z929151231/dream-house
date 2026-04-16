// ============================================================
// 梦想小屋 - 区域解锁装修系统
// ============================================================

// ---- 区域定义 ----
const ZONES = [
    { id:0, name:'庄园基地',  emoji:'🏡', cost:0,   row0:3, col0:3, w:3, h:3, isBase:true  },
    { id:1, name:'阳光花园区', emoji:'🌸', cost:80,  row0:0, col0:0, w:3, h:3, isBase:false },
    { id:2, name:'宁静池塘区', emoji:'🪷', cost:150, row0:0, col0:6, w:3, h:3, isBase:false },
    { id:3, name:'森林深处区', emoji:'🌲', cost:280, row0:3, col0:0, w:3, h:3, isBase:false },
    { id:4, name:'星空露台区', emoji:'🌙', cost:450, row0:3, col0:6, w:3, h:3, isBase:false },
    { id:5, name:'梦幻庭院区', emoji:'💐', cost:700, row0:6, col0:3, w:3, h:3, isBase:false },
];
const GRID_COLS = 9;
const GRID_ROWS = 9;

// ---- 植物/装饰定义 ----
const SHOP_ITEMS = [
    { id:'rose',    name:'玫瑰',     emoji:'🌹', emoji0:'🌱', emoji1:'🌷', emoji2:'🌹', price:20,  growth:8,  type:'flower',  bh:18, stackable:false },
    { id:'sunf',    name:'向日葵',   emoji:'🌻', emoji0:'🌱', emoji1:'🌻', emoji2:'🌻', price:15,  growth:6,  type:'flower',  bh:20, stackable:false },
    { id:'tulip',   name:'郁金香',   emoji:'🌷', emoji0:'🌱', emoji1:'🌷', emoji2:'🌷', price:15,  growth:6,  type:'flower',  bh:16, stackable:false },
    { id:'lavnd',   name:'薰衣草',   emoji:'💜', emoji0:'🌱', emoji1:'💜', emoji2:'💜', price:25,  growth:8,  type:'flower',  bh:18, stackable:false },
    { id:'sakura',  name:'樱花树',   emoji:'🌸', emoji0:'🌱', emoji1:'🌸', emoji2:'🌸', price:30,  growth:10, type:'tree',    bh:52, stackable:false },
    { id:'pine',    name:'松树',     emoji:'🌲', emoji0:'🌱', emoji1:'🌲', emoji2:'🌲', price:80,  growth:20, type:'tree',    bh:58, stackable:false },
    { id:'maple',   name:'枫树',     emoji:'🍁', emoji0:'🌱', emoji1:'🍁', emoji2:'🍁', price:25,  growth:12, type:'tree',    bh:50, stackable:false },
    { id:'willow',  name:'垂柳',     emoji:'🌿', emoji0:'🌱', emoji1:'🌿', emoji2:'🌿', price:60,  growth:15, type:'tree',    bh:55, stackable:false },
    { id:'bush',    name:'灌木球',   emoji:'🌳', emoji0:'🌱', emoji1:'🌳', emoji2:'🌳', price:25,  growth:8,  type:'tree',    bh:30, stackable:false },
    { id:'hydra',   name:'绣球',     emoji:'💐', emoji0:'🌱', emoji1:'💐', emoji2:'💐', price:35,  growth:10, type:'flower',  bh:22, stackable:false },
    { id:'butrf',   name:'蝴蝶兰',   emoji:'🦋', emoji0:'🌱', emoji1:'🦋', emoji2:'🦋', price:30,  growth:8,  type:'flower',  bh:20, stackable:false },
    { id:'pond',    name:'水池',     emoji:'🪷', emoji0:'💧', emoji1:'🪷', emoji2:'🪷', price:150, growth:0,  type:'water',   bh:8,  stackable:false },
    { id:'fount',   name:'喷泉',     emoji:'⛲', emoji0:'💧', emoji1:'⛲', emoji2:'⛲', price:200, growth:0,  type:'water',   bh:28, stackable:false },
    { id:'rock',    name:'石头',     emoji:'🪨', emoji0:'🪨', emoji1:'🪨', emoji2:'🪨', price:10,  growth:0,  type:'deco',    bh:12, stackable:false },
    { id:'fence',   name:'木栅栏',   emoji:'🪵', emoji0:'🪵', emoji1:'🪵', emoji2:'🪵', price:15,  growth:0,  type:'deco',    bh:20, stackable:false },
    { id:'lamp',    name:'花园灯',   emoji:'🏮', emoji0:'🏮', emoji1:'🏮', emoji2:'🏮', price:50,  growth:0,  type:'deco',    bh:28, stackable:false },
    { id:'bench',   name:'长椅',     emoji:'🪑', emoji0:'🪑', emoji1:'🪑', emoji2:'🪑', price:40,  growth:0,  type:'deco',    bh:18, stackable:false },
    { id:'grass',   name:'草坪',     emoji:'🌿', emoji0:'🌿', emoji1:'🌿', emoji2:'🌿', price:10,  growth:3,  type:'ground',  bh:0,  stackable:true  },
    { id:'step',    name:'石板路',   emoji:'⬜', emoji0:'⬜', emoji1:'⬜', emoji2:'⬜', price:5,   growth:0,  type:'ground',  bh:0,  stackable:true  },
    { id:'cat',     name:'猫咪',     emoji:'🐱', emoji0:'🐱', emoji1:'🐱', emoji2:'🐱', price:120, growth:0,  type:'deco',    bh:16, stackable:false },
    { id:'bunny',   name:'兔子',     emoji:'🐰', emoji0:'🐰', emoji1:'🐰', emoji2:'🐰', price:90,  growth:0,  type:'deco',    bh:14, stackable:false },
    { id:'butter',  name:'蝴蝶',     emoji:'🦋', emoji0:'🦋', emoji1:'🦋', emoji2:'🦋', price:60,  growth:0,  type:'deco',    bh:12, stackable:false },
    { id:'frog',    name:'青蛙',     emoji:'🐸', emoji0:'🐸', emoji1:'🐸', emoji2:'🐸', price:70,  growth:0,  type:'deco',    bh:14, stackable:false },
    { id:'hedge',   name:'树篱',     emoji:'🌿', emoji0:'🌿', emoji1:'🌿', emoji2:'🌿', price:35,  growth:0,  type:'deco',    bh:24, stackable:false },
    { id:'bird',    name:'小鸟',     emoji:'🐦', emoji0:'🐦', emoji1:'🐦', emoji2:'🐦', price:55,  growth:0,  type:'deco',    bh:12, stackable:false },
    { id:'duck',    name:'鸭子',     emoji:'🦆', emoji0:'🦆', emoji1:'🦆', emoji2:'🦆', price:85,  growth:0,  type:'deco',    bh:14, stackable:false },
    { id:'snail',   name:'蜗牛',     emoji:'🐌', emoji0:'🐌', emoji1:'🐌', emoji2:'🐌', price:45,  growth:0,  type:'deco',    bh:8,  stackable:false },
    { id:'angelf',  name:'天使雕像', emoji:'👼', emoji0:'👼', emoji1:'👼', emoji2:'👼', price:180, growth:0,  type:'deco',    bh:30, stackable:false },
    { id:'gnotice', name:'告示牌',   emoji:'📋', emoji0:'📋', emoji1:'📋', emoji2:'📋', price:25,  growth:0,  type:'deco',    bh:22, stackable:false },
    { id:'windmill',name:'风车',     emoji:'🌀', emoji0:'🌀', emoji1:'🌀', emoji2:'🌀', price:160, growth:0,  type:'deco',    bh:36, stackable:false },
];

// ---- 游戏状态 ----
const gameState = {
    money: 0,
    totalEarned: 0,
    zones: ZONES.map(z => ({
        ...z,
        unlocked: z.id === 0,
        garden: [],       // 该区域的所有植物
    })),
    selectedZone: 0,    // 当前选中的区域
    selectedItem: null,  // 当前选中的装饰品
    earnTree: {         // 基地的赚钱树
        emoji: '🌳',
        lastEarn: Date.now(),
        count: 1,
    },
    timeOfDay: 0.42,
    timeFlow: 0,
    particles: [],
    toastMsg: '',
    toastTimer: 0,
    house: { level:1, style:null },
};

const HOUSE_LEVELS = [
    { level:1, name:'破房子',   emoji:'🏚️', bodyH:30, styles:null },
    { level:2, name:'小木屋',   emoji:'🛖',  bodyH:38, styles:null },
    { level:3, name:'砖瓦房',   emoji:'🏠',  bodyH:46, styles:[
        { id:'cottage', name:'温馨小屋', emoji:'🏡', desc:'温馨舒适的乡村小居' },
        { id:'bun',     name:'平房',     emoji:'🏠', desc:'简洁实用的单层住宅' },
    ]},
    { level:4, name:'别墅',     emoji:'🏡',  bodyH:56, styles:[
        { id:'modern',   name:'现代别墅', emoji:'🏢', desc:'极简现代风格' },
        { id:'japanese', name:'日式庭院', emoji:'🏯', desc:'日式枯山水庭院' },
    ]},
    { level:5, name:'城堡',     emoji:'🏰',  bodyH:72, styles:null },
];

// ---- 透视网格变量 ----
let maxTileW = 48, rowH = 50, gridTop = 90, screenCX = 200;

// ---- 全局 ----
let canvas, ctx;
let UI = {};
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
    // 根据当前选中的区域动态调整视野
    const zone = gameState.zones[gameState.selectedZone];
    const isBase = zone && zone.isBase;
    maxTileW = Math.min((UI.w - 20 * s) / (isBase ? 3 : 3), 54 * s);
    gridTop = 88 * s;
    const gridBottom = UI.h - 130 * s;
    rowH = (gridBottom - gridTop) / (isBase ? 3 : 3);
    screenCX = UI.w / 2;
}

// ============================================================
// 透视坐标（相对于选中区域的3x3子网格）
// ============================================================
function zoneGridToScreen(col, row, zone) {
    const t = (row + 0.5) / 3;
    const scale = 0.6 + 0.4 * t;
    const tileW = maxTileW * scale;
    const tileH = tileW * 0.65;
    const y = gridTop + (row + 0.5) * rowH;
    const x = screenCX + (col - 1) * tileW;  // 3列网格，中心在col=1
    return { x, y, scale, tileW, tileH };
}

// 世界坐标(全局9x9) → 屏幕坐标
function worldToScreen(wCol, wRow) {
    const zone = gameState.zones[gameState.selectedZone];
    const lCol = wCol - zone.col0;
    const lRow = wRow - zone.row0;
    return zoneGridToScreen(lCol, lRow, zone);
}

// 屏幕 → 选中区域的局部(col,row)
function screenToZoneGrid(sx, sy) {
    let bestCol = -1, bestRow = -1, bestDist = Infinity;
    const zone = gameState.zones[gameState.selectedZone];
    for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
            const { x, y } = zoneGridToScreen(col, row, zone);
            const dist = Math.hypot(sx - x, sy - y);
            if (dist < bestDist) { bestDist = dist; bestCol = col; bestRow = row; }
        }
    }
    const ref = zoneGridToScreen(0, 0, zone);
    if (bestDist < ref.tileW * 0.65) {
        return { col: bestCol + zone.col0, row: bestRow + zone.row0, lCol: bestCol, lRow: bestRow };
    }
    return { col: -1, row: -1 };
}

// ============================================================
// 粒子系统
// ============================================================
function initParticles() { for (let i = 0; i < 3; i++) spawnButterfly(); }

function spawnButterfly() {
    if (gameState.particles.filter(p => p.type === 'butterfly').length >= 5) return;
    const emojis = ['🦋','🐝','🪲','🦗'];
    const zone = gameState.zones[gameState.selectedZone];
    const lCol = Math.random() * 3, lRow = Math.random() * 3;
    const { x, y } = zoneGridToScreen(lCol, lRow, zone);
    gameState.particles.push({
        type:'butterfly', emoji:emojis[Math.floor(Math.random()*emojis.length)],
        x, y, vx:(Math.random()-0.5)*1.5, vy:(Math.random()-0.5)*1.0,
        wing:Math.random()*Math.PI*2, life:0, maxLife:400+Math.random()*300,
    });
}

function spawnFirefly() {
    if (gameState.particles.filter(p=>p.type==='firefly').length >= 8) return;
    gameState.particles.push({
        type:'firefly',
        x:20+Math.random()*(UI.w-40),
        y:gridTop+Math.random()*(rowH*3),
        phase:Math.random()*Math.PI*2, life:0, maxLife:500+Math.random()*400,
    });
}

function spawnPetal() {
    const emojis = ['🌸','🍂','🍃','🌺'];
    gameState.particles.push({
        type:'petal', emoji:emojis[Math.floor(Math.random()*emojis.length)],
        x:20+Math.random()*(UI.w-40), y:gridTop-10,
        rot:Math.random()*Math.PI*2, rotSpd:(Math.random()-0.5)*0.08,
        vx:0.4+Math.random()*0.6, vy:0.6+Math.random()*0.8,
        life:0, maxLife:250,
    });
}

function updateParticles(dt) {
    const night = isNight();
    for (let i = gameState.particles.length-1; i>=0; i--) {
        const p = gameState.particles[i];
        p.life += dt*60;
        if (p.life >= p.maxLife) { gameState.particles.splice(i,1); continue; }
        if (p.type==='butterfly') {
            p.wing += 0.25;
            p.vx += (Math.random()-0.5)*0.12; p.vy += (Math.random()-0.5)*0.1;
            p.vx *= 0.95; p.vy *= 0.95;
            p.x += p.vx; p.y += p.vy;
            const zone = gameState.zones[gameState.selectedZone];
            const topInfo = zoneGridToScreen(1, 0, zone);
            const botInfo = zoneGridToScreen(1, 2, zone);
            if (p.x<15) {p.x=15; p.vx=Math.abs(p.vx);}
            if (p.x>UI.w-15) {p.x=UI.w-15; p.vx=-Math.abs(p.vx);}
            if (p.y<topInfo.y-20) {p.y=topInfo.y-20; p.vy=Math.abs(p.vy);}
            if (p.y>botInfo.y+20) {p.y=botInfo.y+20; p.vy=-Math.abs(p.vy);}
        } else if (p.type==='firefly') {
            p.x += Math.sin(p.life*0.03+p.phase)*0.5;
            p.y += Math.sin(p.life*0.05+p.phase)*0.3 - 0.1;
        } else if (p.type==='petal') {
            p.rot += p.rotSpd;
            p.x += p.vx + Math.sin(p.life*0.05)*0.3;
            p.y += p.vy;
            if (p.y > UI.h+30) { gameState.particles.splice(i,1); continue; }
        }
    }
    if (gameState.particles.filter(p=>p.type==='butterfly').length<3 && Math.random()<0.02) spawnButterfly();
    if (night && gameState.particles.filter(p=>p.type==='firefly').length<8 && Math.random()<0.03) spawnFirefly();
    if (gameState.timeOfDay>0.25 && gameState.timeOfDay<0.78 && gameState.particles.filter(p=>p.type==='petal').length<4 && Math.random()<0.015) spawnPetal();
}

// ============================================================
// 天空系统
// ============================================================
function getSky(t) {
    if (t<0.15) return {top:'#04041a',bot:'#0a0a2e',name:'🌙 深夜',night:true};
    if (t<0.25) return {top:'#c96b4b',bot:'#f4a460',name:'🌅 黎明',night:false};
    if (t<0.38) return {top:'#74b9ff',bot:'#a8e6cf',name:'🌤️ 清晨',night:false};
    if (t<0.50) return {top:'#56CCF2',bot:'#2F80ED',name:'☀️ 正午',night:false};
    if (t<0.65) return {top:'#2196F3',bot:'#64B5F6',name:'🌤️ 午后',night:false};
    if (t<0.76) return {top:'#e17055',bot:'#fdcb6e',name:'🌇 黄昏',night:false};
    if (t<0.86) return {top:'#6c3483',bot:'#c0392b',name:'🌆 傍晚',night:true};
    return              {top:'#04041a',bot:'#0a0a2e',name:'🌃 夜晚',night:true};
}
function isNight()  { return gameState.timeOfDay<0.2 || gameState.timeOfDay>0.83; }
function isDusk()   { return (gameState.timeOfDay>0.7 && gameState.timeOfDay<=0.83) || (gameState.timeOfDay>=0.15 && gameState.timeOfDay<0.25); }

const stars = Array.from({length:100}, ()=>({x:Math.random(),y:Math.random()*0.65,size:0.5+Math.random()*1.5,phase:Math.random()*Math.PI*2}));

// ============================================================
// 涟漪
// ============================================================
function addRipple(x,y) { rippleList.push({x,y,r:3,t:1}); }
function updateRipples() {
    for (let i=rippleList.length-1; i>=0; i--) {
        rippleList[i].r += 0.5; rippleList[i].t -= 0.025;
        if (rippleList[i].t<=0) rippleList.splice(i,1);
    }
}

// ============================================================
// 植物状态
// ============================================================
function addGardenItem(zone, lCol, lRow, itemId) {
    const item = SHOP_ITEMS.find(p=>p.id===itemId);
    if (!item) return;
    zone.garden.push({
        col: zone.col0+lCol, row: zone.row0+lRow,
        plant:item, stage: item.growth===0 ? 2 : 0, plantedAt:Date.now(),
    });
}

function updatePlants() {
    const now = Date.now();
    gameState.zones.forEach(zone => {
        zone.garden.forEach(cell => {
            if (cell.plant.growth===0) { cell.stage=2; return; }
            const age=(now-cell.plantedAt)/1000;
            if (age<cell.plant.growth*0.5) cell.stage=0;
            else if (age<cell.plant.growth) cell.stage=1;
            else cell.stage=2;
        });
    });
}

function getPlantEmoji(cell) {
    if (cell.stage===0) return cell.plant.emoji0||'🌱';
    if (cell.stage===1) return cell.plant.emoji1||cell.plant.emoji;
    return cell.plant.emoji;
}

// ============================================================
// 赚金币
// ============================================================
function earnCoins() {
    const zone = gameState.zones[0]; // 基地
    const earned = zone.garden.reduce((s,g)=>{
        if (g.plant.type==='tree' && g.stage===2) return s+8;
        if (g.plant.type==='deco') return s+3;
        return s;
    }, 0) + 5;
    const bonus = zone.garden.length * 2 + 5;
    const total = earned + bonus;
    gameState.money += total;
    gameState.totalEarned += total;
    zone.garden.forEach(cell => {
        const {x,y} = worldToScreen(cell.col, cell.row);
        for (let k=0; k<3; k++) addRipple(x, y);
    });
    showToast('💰 +' + total + ' 金币！');
    // 刷新粒子位置
    gameState.particles.forEach(p=>{
        if (p.type==='butterfly') {
            const lCol=Math.random()*3, lRow=Math.random()*3;
            const info=zoneGridToScreen(lCol,lRow,zone);
            p.x=info.x; p.y=info.y;
        }
    });
}

// ============================================================
// 触摸
// ============================================================
function onTouchStart(e) {
    lastTX=e.touches[0].clientX; lastTY=e.touches[0].clientY; tapped=true;
    handleTap(lastTX, lastTY);
}
function onTouchMove(e) {
    const x=e.touches[0].clientX, y=e.touches[0].clientY;
    if (Math.abs(x-lastTX)>6||Math.abs(y-lastTY)>6) tapped=false;
    lastTX=x; lastTY=y;
}
function onTouchEnd() { tapped=false; }

function handleModalTap(x,y) {
    if (!houseModal) return;
    const m = houseModal;
    const my = UI.h/2 - 160*UI.s;
    if (m.styles) {
        const cols=2, itemH=72*UI.s, itemW=(UI.w-44*UI.s)/cols-10*UI.s, gapX=10*UI.s, gapY=10*UI.s;
        m.styles.forEach((item,i)=>{
            const col=i%cols, row=Math.floor(i/cols);
            const ix=22*UI.s+col*(itemW+gapX), iy=my+50*UI.s+row*(itemH+gapY);
            if (x>=ix && x<=ix+itemW && y>=iy && y<=iy+itemH) { m.callback(item); houseModal=null; }
        });
    }
    const closeX=UI.w/2-50*UI.s, closeY=my+318*UI.s;
    if (x>=closeX && x<=closeX+100*UI.s && y>=closeY && y<=closeY+38*UI.s) houseModal=null;
}

function handleTap(x, y) {
    if (houseModal) { handleModalTap(x,y); return; }
    const s = UI.s, w = UI.w, h = UI.h;

    // 区域选择器（顶部）
    if (y < 86*s && y > 52*s) {
        const zoneY = 60*s;
        const btnW = 44*s;
        const totalW = ZONES.length * (btnW + 4*s);
        const startX = (w - totalW) / 2 + 4*s;
        ZONES.forEach((z, idx) => {
            const bx = startX + idx*(btnW+4*s);
            if (x>=bx && x<=bx+btnW && y>=zoneY-btnW/2 && y<=zoneY+btnW/2) {
                if (z.unlocked) {
                    gameState.selectedZone = idx;
                    // 切换区域时更新粒子视野
                    recalcGrid();
                    // 刷新粒子到新区域位置
                    gameState.particles.forEach(p=>{
                        if (p.type==='butterfly') {
                            const zone2 = gameState.zones[idx];
                            const lCol=Math.random()*3, lRow=Math.random()*3;
                            const info=zoneGridToScreen(lCol,lRow,zone2);
                            p.x=info.x; p.y=info.y;
                        }
                    });
                } else {
                    // 解锁提示
                    showToast('🔒 需要 ' + z.emoji + ' ' + z.name + '（' + z.cost + '💰）');
                }
                return;
            }
        });
        // 赚金币按钮（基地区域左侧）
        const zone = gameState.zones[gameState.selectedZone];
        if (zone.isBase && x < 70*s && y < 86*s) {
            earnCoins();
        }
        return;
    }

    // 基地：赚金币区域（点击赚金币按钮）
    const zone = gameState.zones[gameState.selectedZone];
    if (zone.isBase && y > 58*s && y < 86*s && x > w - 90*s) {
        earnCoins(); return;
    }

    // 顶部栏
    if (y < 52*s) {
        if (x > w - 90*s) { cycleTime(); return; }
        if (x < 80*s) { sellZone(); return; }
        return;
    }

    // 商店
    const shopY = h - 126*s;
    if (y > shopY) {
        const itemW2 = (w - 20*s) / 8;
        const idx = Math.floor((x - 10*s) / itemW2);
        if (idx >= 0 && idx < SHOP_ITEMS.length) {
            const item = SHOP_ITEMS[idx];
            if (gameState.money >= item.price) {
                gameState.selectedItem = item;
                showToast('已选 ' + item.emoji + ' ' + item.name + '，点击格子放置');
            } else {
                showToast('💰 金币不足（需要' + item.price + '）');
            }
        }
        return;
    }

    // 地面格子
    if (y > gridTop && y < gridTop + rowH*3) {
        const iso = screenToZoneGrid(x, y);
        if (iso.col >= 0) {
            const wCol = iso.col, wRow = iso.row;
            const existing = zone.garden.find(g=>g.col===wCol && g.row===wRow);
            if (existing) {
                showToast(getPlantEmoji(existing) + ' ' + existing.plant.name + '（' + (existing.stage===2?'🌟成熟':existing.stage===1?'🌿幼苗':'🌱种子') + '）');
                return;
            }
            if (gameState.selectedItem) {
                zone.garden.push({
                    col:wCol, row:wRow, plant:gameState.selectedItem,
                    stage: gameState.selectedItem.growth===0 ? 2 : 0, plantedAt:Date.now(),
                });
                gameState.money -= gameState.selectedItem.price;
                gameState.selectedItem = null;
                showToast('🌱 放置成功！');
                return;
            } else {
                showToast('从下方商店选择装饰品');
            }
        }
        return;
    }
}

function cycleTime() {
    const times=[0.08,0.32,0.52,0.72,0.92], labels=['🌙 深夜','🌤️ 清晨','☀️ 正午','🌇 黄昏','🌃 夜晚'];
    const idx=times.findIndex(t=>Math.abs(t-gameState.timeOfDay)<0.14);
    gameState.timeOfDay=times[(idx+1)%times.length];
    showToast(labels[(idx+1)%labels.length]);
}

function sellZone() {
    const zone = gameState.zones[gameState.selectedZone];
    const val = Math.floor(zone.garden.reduce((s,g)=>s+g.plant.price*0.7,0));
    const bonus = Math.floor(val + zone.garden.length * 3);
    gameState.money += bonus;
    zone.garden = [];
    showToast('🏡 出售 ' + zone.name + ' +' + bonus + ' 💰');
}

function showToast(msg) { toastMsg=msg; toastTimer=150; }

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
    const dt = Math.min((now-lastTime)/1000, 0.1);
    lastTime = now;
    updateTime(dt);
    updatePlants();
    updateParticles(dt);
    updateRipples();
    render();
    if (toastTimer>0) toastTimer--;
    requestAnimationFrame(gameLoop);
}

// ============================================================
// 渲染
// ============================================================
function render() {
    recalcGrid();
    const s = UI.s, w = UI.w, h = UI.h;
    ctx.clearRect(0,0,w,h);
    const sky = getSky(gameState.timeOfDay);
    const night = sky.night, dusk = isDusk();

    // 天空
    const skyGrd = ctx.createLinearGradient(0,0,0,h);
    skyGrd.addColorStop(0, sky.top); skyGrd.addColorStop(1, sky.bot);
    ctx.fillStyle = skyGrd; ctx.fillRect(0,0,w,h);

    // 星星
    if (night || gameState.timeOfDay>0.83 || gameState.timeOfDay<0.2) {
        const sa = night ? 1 : Math.max(0,1-(gameState.timeOfDay-0.83)/0.12);
        stars.forEach(st=>{
            const tw=Math.sin(st.phase+Date.now()*0.002)*0.5+0.5;
            ctx.fillStyle='rgba(255,255,240,'+(sa*tw)+')';
            ctx.beginPath(); ctx.arc(st.x*w,st.y*h,st.size*s,0,Math.PI*2); ctx.fill();
        });
    }

    // 远景山丘
    renderHills(s,w,h,night);

    // 渲染选中区域
    renderZone(s,w,h,night,dusk);

    // 粒子
    renderParticles(s,night);

    // UI
    renderTopBar(s,w,h,sky);
    renderZoneSelector(s,w,h,night);
    renderShop(s,w,h,night);
    renderToast(s,w,h);
    renderHouseModal(s,w,h);
}

// ============================================================
// 远景山丘
// ============================================================
function renderHills(s,w,h,night) {
    const hillY = gridTop - 5*s;
    ctx.fillStyle = night ? 'rgba(20,30,20,0.8)' : 'rgba(80,140,80,0.25)';
    ctx.beginPath(); ctx.moveTo(0,hillY);
    ctx.bezierCurveTo(w*0.2,hillY-80*s,w*0.35,hillY-120*s,w*0.5,hillY-90*s);
    ctx.bezierCurveTo(w*0.65,hillY-60*s,w*0.8,hillY-110*s,w,hillY-70*s);
    ctx.lineTo(w,h); ctx.lineTo(0,h); ctx.closePath(); ctx.fill();
}

// ============================================================
// 渲染当前选中区域
// ============================================================
function renderZone(s,w,h,night,dusk) {
    const zone = gameState.zones[gameState.selectedZone];

    // 区域地面背景
    const tlInfo = zoneGridToScreen(0,0,zone);
    const brInfo = zoneGridToScreen(2,2,zone);
    const groundW = brInfo.x - tlInfo.x + maxTileW + 10*s;
    const groundH = brInfo.y - tlInfo.y + maxTileW*0.65 + 10*s;

    if (night) ctx.fillStyle='#1a3a1a';
    else if (dusk) ctx.fillStyle='#2a5a2a';
    else ctx.fillStyle='#2a6a28';

    const gx = w/2 - groundW/2;
    ctx.beginPath();
    ctx.roundRect(gx, gridTop-5*s, groundW, groundH, 12*s);
    ctx.fill();

    // 区域名称标签
    const labelY = gridTop - 16*s;
    ctx.fillStyle='rgba(0,0,0,0.35)';
    ctx.beginPath(); ctx.roundRect(w/2-60*s, labelY, 120*s, 20*s, 10*s); ctx.fill();
    ctx.fillStyle='#ffd700'; ctx.font='bold '+(11*s)+'px sans-serif'; ctx.textAlign='center';
    ctx.fillText(zone.emoji+' '+zone.name, w/2, labelY+14*s);

    if (!zone.unlocked) {
        // 锁定状态
        renderLockedZone(s,w,h,zone,night);
        return;
    }

    // 地面格子
    for (let row=0; row<3; row++) {
        for (let col=0; col<3; col++) {
            renderZoneTile(col,row,s,zone,night,dusk);
        }
    }

    // 涟漪
    rippleList.forEach(rip=>{
        ctx.strokeStyle='rgba(100,200,255,'+(rip.t*0.5)+')';
        ctx.lineWidth=1.5;
        ctx.beginPath(); ctx.ellipse(rip.x,rip.y,rip.r,rip.r*0.4,0,0,Math.PI*2); ctx.stroke();
    });

    // 物体（按深度排序）
    const drawables = [];
    // 基地有房子
    if (zone.isBase) drawables.push({kind:'house', lCol:1, lRow:1});

    zone.garden.forEach(cell => {
        const lCol = cell.col - zone.col0;
        const lRow = cell.row - zone.row0;
        if (lCol>=0 && lCol<3 && lRow>=0 && lRow<3) {
            drawables.push({kind:'plant', lCol, lRow, cell});
        }
    });

    drawables.sort((a,b)=>{
        if (a.lRow!==b.lRow) return a.lRow-b.lRow;
        return a.lCol-b.lCol;
    });

    drawables.forEach(d=>{
        if (d.kind==='house') renderZoneHouse(s,zone,night,dusk);
        else renderZonePlant(d.cell,s,zone,night,dusk);
    });

    // 基地专属：赚金币按钮
    if (zone.isBase) renderEarnButton(s,w,h,night);
}

// ============================================================
// 锁定区域
// ============================================================
function renderLockedZone(s,w,h,zone,night) {
    const tlInfo = zoneGridToScreen(0,0,zone);
    const brInfo = zoneGridToScreen(2,2,zone);
    const cx = w/2, cy = (tlInfo.y + brInfo.y) / 2;

    // 锁定遮罩
    ctx.fillStyle = night ? 'rgba(10,15,10,0.7)' : 'rgba(80,100,80,0.5)';
    ctx.beginPath();
    ctx.roundRect(tlInfo.x - maxTileW/2 - 4*s, tlInfo.y - maxTileW*0.65/2 - 4*s,
                  (brInfo.x - tlInfo.x) + maxTileW + 8*s, (brInfo.y - tlInfo.y) + maxTileW*0.65 + 8*s, 14*s);
    ctx.fill();

    // 大锁图标
    ctx.font = (50*s)+'px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillStyle='rgba(0,0,0,0.3)'; ctx.fillText('🔒', cx+2*s, cy+2*s);
    ctx.fillStyle=night?'rgba(255,200,100,0.9)':'rgba(255,220,100,0.9)'; ctx.fillText('🔒', cx, cy);

    // 区域名
    ctx.font='bold '+(14*s)+'px sans-serif';
    ctx.fillStyle='rgba(255,220,100,0.95)'; ctx.fillText(zone.emoji+' '+zone.name, cx, cy-40*s);

    // 解锁花费
    const canAfford = gameState.money >= zone.cost;
    ctx.font=(12*s)+'px sans-serif';
    ctx.fillStyle=canAfford?'#4ade80':'#f87171';
    ctx.fillText('🔓 解锁：'+zone.cost+' 💰', cx, cy-16*s);

    // 赚金币提示
    if (gameState.selectedZone===0) {
        ctx.font=(10*s)+'px sans-serif'; ctx.fillStyle='rgba(255,255,255,0.6)';
        ctx.fillText('先在基地赚金币', cx, cy+20*s);
    }

    // 解锁按钮
    if (canAfford) {
        const btnW=100*s, btnH=34*s;
        ctx.fillStyle='rgba(74,222,128,0.9)';
        ctx.beginPath(); ctx.roundRect(cx-btnW/2, cy+30*s, btnW, btnH, 12*s); ctx.fill();
        ctx.fillStyle='#fff'; ctx.font='bold '+(12*s)+'px sans-serif';
        ctx.fillText('✨ 点此解锁', cx, cy+52*s);
    }
}

// ============================================================
// 赚金币按钮
// ============================================================
function renderEarnButton(s,w,h,night) {
    const btnX = w - 90*s, btnY = 12*s, btnW=78*s, btnH=32*s;
    const pulse = Math.sin(Date.now()*0.003)*0.1+0.9;
    ctx.fillStyle = night ? 'rgba(255,180,50,0.9)' : 'rgba(255,200,0,0.95)';
    ctx.beginPath(); ctx.roundRect(btnX,btnY,btnW,btnH,12*s); ctx.fill();
    ctx.strokeStyle='rgba(255,255,255,0.4)'; ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.roundRect(btnX,btnY,btnW,btnH,12*s); ctx.stroke();
    ctx.fillStyle=night?'#1a0a00':'#5a3000'; ctx.font='bold '+(10*s)+'px sans-serif'; ctx.textAlign='center';
    ctx.fillText('💰 赚金币', btnX+btnW/2, btnY+12*s);
    ctx.font=(9*s)+'px sans-serif';
    ctx.fillText('+'+getZoneEarnRate()+'/次', btnX+btnW/2, btnY+24*s);
}

function getZoneEarnRate() {
    const zone = gameState.zones[0];
    const base = 5;
    const fromPlants = zone.garden.reduce((s,g)=>{
        if (g.plant.type==='tree'&&g.stage===2) return s+8;
        if (g.plant.type==='deco') return s+3;
        return s;
    },0);
    const bonus = zone.garden.length*2;
    return base+fromPlants+bonus;
}

// ============================================================
// 区域地面格子
// ============================================================
function renderZoneTile(lCol,lRow,s,zone,night,dusk) {
    const {x,y,scale,tileW,tileH} = zoneGridToScreen(lCol,lRow,zone);
    const even = (lCol+lRow)%2===0;
    const pad = 1.5;

    const iso = screenToZoneGrid(lastTX,lastTY);
    const wCol = zone.col0+lCol, wRow = zone.row0+lRow;
    const isHover = iso.col===wCol && iso.row===wRow;
    const existing = zone.garden.find(g=>g.col===wCol && g.row===wRow);
    const hasPlant = !!existing;

    let topColor, frontColor;
    if (existing && existing.plant.id==='step') {
        topColor=night?'#3a3a3a':'#b0a090'; frontColor=night?'#2a2a2a':'#908070';
    } else if (isHover && gameState.selectedItem && !hasPlant) {
        topColor=night?'#3a7a3a':'#80d080'; frontColor=night?'#2a6a2a':'#60b060';
    } else if (night) {
        topColor=even?'#1d4a1d':'#173d17'; frontColor=even?'#143a14':'#103010';
    } else if (dusk) {
        topColor=even?'#4a8a5a':'#3d7a4d'; frontColor=even?'#3a7a4a':'#2d6a3d';
    } else {
        topColor=even?'#52b855':'#46a048'; frontColor=even?'#3da040':'#35903a';
    }

    const fh = Math.max(2,3*scale);
    ctx.fillStyle=frontColor;
    ctx.fillRect(x-tileW/2+pad, y+tileH/2-fh-pad, tileW-pad*2, fh);
    ctx.fillStyle=topColor;
    ctx.beginPath(); ctx.roundRect(x-tileW/2+pad, y-tileH/2+pad, tileW-pad*2, tileH-fh-pad*2, 2*scale); ctx.fill();

    // 水面
    if (existing && existing.plant.type==='water') {
        ctx.fillStyle=night?'rgba(20,60,100,0.45)':'rgba(70,160,220,0.28)';
        ctx.beginPath(); ctx.roundRect(x-tileW/2+pad, y-tileH/2+pad, tileW-pad*2, tileH-fh-pad*2, 2*scale); ctx.fill();
        if (!night) {
            const wave=Math.sin(Date.now()*0.003+lCol+lRow)*0.3+0.3;
            ctx.fillStyle='rgba(255,255,255,'+(wave*0.3)+')';
            ctx.beginPath(); ctx.ellipse(x,y,tileW*0.22,tileH*0.13,0,0,Math.PI*2); ctx.fill();
        }
    }

    // 选中边框
    if (isHover && gameState.selectedItem && !hasPlant) {
        ctx.strokeStyle=night?'#80ff80':'#00e676'; ctx.lineWidth=2;
        ctx.beginPath(); ctx.roundRect(x-tileW/2+pad, y-tileH/2+pad, tileW-pad*2, tileH-fh-pad*2, 2*scale); ctx.stroke();
    }
}

// ============================================================
// 区域植物
// ============================================================
function renderZonePlant(cell,s,zone,night,dusk) {
    const lCol = cell.col - zone.col0;
    const lRow = cell.row - zone.row0;
    const {x,y,scale,tileW,tileH} = zoneGridToScreen(lCol,lRow,zone);
    const emoji = getPlantEmoji(cell);

    if (cell.plant.type==='ground') return;

    const isTree = cell.plant.type==='tree';
    const isWater = cell.plant.type==='water';
    const emojiSize = isTree ? tileW*0.88 : (cell.plant.type==='deco'?tileW*0.78:tileW*0.72);
    const emojiY = isTree ? y-tileH*0.25 : y-tileH*0.08;

    // 阴影
    ctx.fillStyle='rgba(0,0,0,0.12)';
    ctx.beginPath(); ctx.ellipse(x,y+tileH*0.18,tileW*(isTree?0.42:0.28),tileH*(isTree?0.22:0.15),0,0,Math.PI*2); ctx.fill();

    // 喷泉粒子
    if (isWater && cell.plant.id==='fount') {
        const now=Date.now();
        for (let j=0;j<5;j++) {
            const t=((now*0.004+j*0.2)%1);
            const px=x+Math.sin(j*1.1+now*0.002)*tileW*0.18*(1-t);
            const py=y-tileH*0.3-t*tileH*0.55;
            ctx.fillStyle='rgba(173,216,230,'+((1-t)*0.7)+')';
            ctx.beginPath(); ctx.arc(px,py,(1-t)*3*s,0,Math.PI*2); ctx.fill();
        }
    }

    // 夜晚灯发光
    if (night && (cell.plant.id==='lamp')) {
        const grd=ctx.createRadialGradient(x,emojiY,0,x,emojiY,tileW*1.3);
        grd.addColorStop(0,'rgba(255,200,50,0.55)'); grd.addColorStop(0.5,'rgba(255,150,30,0.18)'); grd.addColorStop(1,'rgba(255,100,0,0)');
        ctx.fillStyle=grd; ctx.fillRect(x-tileW*1.3,emojiY-tileW*1.3,tileW*2.6,tileW*2.6);
    }

    // emoji 阴影+本体
    ctx.font=emojiSize+'px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillStyle='rgba(0,0,0,0.22)'; ctx.fillText(emoji,x+1.5*s,emojiY+1.5*s);
    ctx.fillStyle=night?'#d0e8d0':'#ffffff'; ctx.fillText(emoji,x,emojiY);

    // 成熟光点
    if (cell.stage===2 && !night) {
        const sparkle=Math.sin(Date.now()*0.003+cell.col*2+cell.row)*0.5+0.5;
        ctx.fillStyle='rgba(255,255,255,'+(sparkle*0.45)+')';
        ctx.beginPath(); ctx.arc(x+tileW*0.18,emojiY-emojiSize*0.22,2*s,0,Math.PI*2); ctx.fill();
    }
}

// ============================================================
// 区域房子（基地）
// ============================================================
function renderZoneHouse(s,zone,night,dusk) {
    const {x,y,scale,tileW,tileH} = zoneGridToScreen(1,1,zone);
    const h2 = gameState.house;
    const lvl = HOUSE_LEVELS[h2.level-1];
    const emoji = h2.style ? h2.style.emoji : lvl.emoji;
    const houseSize = tileW*(1.6+h2.level*0.18);
    const houseY = y-tileH*0.2;

    ctx.fillStyle='rgba(0,0,0,0.18)';
    ctx.beginPath(); ctx.ellipse(x,y+tileH*0.22,houseSize*0.52,tileH*0.3,0,0,Math.PI*2); ctx.fill();

    if (night) {
        const grd=ctx.createRadialGradient(x,houseY,0,x,houseY,houseSize*1.5);
        grd.addColorStop(0,'rgba(255,200,60,0.4)'); grd.addColorStop(0.5,'rgba(255,140,30,0.15)'); grd.addColorStop(1,'rgba(255,80,0,0)');
        ctx.fillStyle=grd; ctx.fillRect(x-houseSize*1.5,houseY-houseSize*1.5,houseSize*3,houseSize*3);
    }

    ctx.font=houseSize+'px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillStyle='rgba(0,0,0,0.28)'; ctx.fillText(emoji,x+2*s,houseY+2*s);
    ctx.fillStyle=night?'#ffe080':'#ffffff'; ctx.fillText(emoji,x,houseY);
}

// ============================================================
// 区域选择器
// ============================================================
function renderZoneSelector(s,w,h,night) {
    const barY = 58*s;
    const btnW = 42*s, btnH = 42*s;
    const totalW = ZONES.length*(btnW+4*s);
    const startX = (w-totalW)/2;

    ZONES.forEach((z,idx)=>{
        const bx = startX+idx*(btnW+4*s);
        const by = barY - btnH/2;
        const isSelected = idx===gameState.selectedZone;
        const isUnlocked = z.unlocked;

        // 背景
        if (isSelected) {
            ctx.fillStyle='rgba(255,255,255,0.25)';
            ctx.beginPath(); ctx.roundRect(bx-3*s,by-3*s,btnW+6*s,btnH+6*s,14*s); ctx.fill();
            ctx.strokeStyle='rgba(255,220,100,0.8)'; ctx.lineWidth=2;
            ctx.beginPath(); ctx.roundRect(bx-3*s,by-3*s,btnW+6*s,btnH+6*s,14*s); ctx.stroke();
        }

        ctx.fillStyle = isUnlocked ? (night? 'rgba(60,100,60,0.8)' : 'rgba(60,130,60,0.85)')
                                  : (night? 'rgba(40,40,40,0.8)' : 'rgba(80,80,80,0.8)');
        ctx.beginPath(); ctx.roundRect(bx,by,btnW,btnH,10*s); ctx.fill();

        ctx.font=(20*s)+'px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
        ctx.fillStyle=isUnlocked?'#fff':'rgba(150,150,150,0.7)'; ctx.fillText(z.emoji,bx+btnW/2,by+btnH/2);

        // 解锁指示
        if (!isUnlocked) {
            ctx.font=(9*s)+'px sans-serif'; ctx.fillStyle='#f87171';
            ctx.fillText('🔒',bx+btnW/2,by+btnH+5*s);
        }
    });

    // 基地赚金币提示（左侧）
    const zone = gameState.zones[gameState.selectedZone];
    if (zone.isBase) {
        ctx.fillStyle='rgba(0,0,0,0.3)'; ctx.beginPath(); ctx.roundRect(8*s,barY-btnH/2-4*s,64*s,btnH+8*s,10*s); ctx.fill();
        ctx.font=(10*s)+'px sans-serif'; ctx.textAlign='center'; ctx.fillStyle='#ffd700';
        ctx.fillText('💰赚金币',8*s+32*s,barY+2*s);
        ctx.font=(9*s)+'px sans-serif'; ctx.fillStyle='rgba(255,220,100,0.8)';
        ctx.fillText('+'+getZoneEarnRate(),8*s+32*s,barY+15*s);
    }
}

// ============================================================
// 顶部栏
// ============================================================
function renderTopBar(s,w,h,sky) {
    ctx.fillStyle='rgba(0,0,0,0.3)'; ctx.beginPath(); ctx.roundRect(10*s,8*s,w-20*s,42*s,12*s); ctx.fill();
    ctx.fillStyle='rgba(255,255,255,0.7)'; ctx.beginPath(); ctx.roundRect(14*s,12*s,68*s,22*s,10*s); ctx.fill();
    ctx.font=(10*s)+'px sans-serif'; ctx.textAlign='left'; ctx.fillStyle='#ffd700';
    ctx.fillText(sky.name,w-160*s,23*s);
    ctx.font='bold '+(15*s)+'px sans-serif'; ctx.textAlign='center';
    ctx.shadowColor='rgba(0,0,0,0.5)'; ctx.shadowBlur=3;
    ctx.fillText('💰 '+gameState.money,w/2,27*s); ctx.shadowBlur=0;
    ctx.font=(10*s)+'px sans-serif'; ctx.textAlign='right'; ctx.fillStyle='rgba(255,255,255,0.6)';
    ctx.fillText('总收益:'+gameState.totalEarned+' | 区域:'+gameState.zones.filter(z=>z.unlocked).length+'/'+ZONES.length,w-14*s,27*s);
    ctx.fillStyle='rgba(255,255,255,0.35)'; ctx.font=(9*s)+'px sans-serif';
    ctx.fillText('🌅时间切换 | 🏠基地赚金币 | 💰商店购物',w/2,42*s);
}

// ============================================================
// 商店
// ============================================================
function renderShop(s,w,h,night) {
    const shopY = h - 126*s;
    const shopH = 118*s;
    ctx.fillStyle='rgba(0,0,0,0.35)';
    ctx.beginPath(); ctx.roundRect(8*s,shopY,w-16*s,shopH,14*s); ctx.fill();
    ctx.fillStyle='rgba(255,255,255,0.5)'; ctx.font='bold '+(10*s)+'px sans-serif'; ctx.textAlign='left';
    ctx.fillText('🛒 装饰商店',18*s,shopY+14*s);
    ctx.textAlign='right'; ctx.fillStyle='#ffd700';
    ctx.fillText('💰'+gameState.money, w-18*s, shopY+14*s);

    const COLS = 8, itemW2=(w-16*s)/COLS-2*s, itemH=(shopH-30*s);
    SHOP_ITEMS.forEach((item,idx)=>{
        const col=idx%COLS, row=Math.floor(idx/COLS);
        if (row>1) return;
        const ix=10*s+col*(itemW2+2*s), iy=shopY+20*s+row*(itemH/2+2*s);
        const sel=gameState.selectedItem?.id===item.id;
        const canAfford=gameState.money>=item.price;
        ctx.fillStyle=sel ? (night?'rgba(80,255,120,0.35)':'rgba(80,255,120,0.4)') : (night?'rgba(255,255,255,0.07)':'rgba(255,255,255,0.12)');
        ctx.beginPath(); ctx.roundRect(ix,iy,itemW2,itemH,6*s); ctx.fill();
        if (sel) { ctx.strokeStyle='#4ade80'; ctx.lineWidth=2; ctx.beginPath(); ctx.roundRect(ix,iy,itemW2,itemH,6*s); ctx.stroke(); }
        ctx.font=(itemW2*0.55)+'px sans-serif'; ctx.textAlign='center'; ctx.fillStyle=canAfford?'#fff':'rgba(100,100,100,0.5)';
        ctx.fillText(item.emoji,ix+itemW2/2,iy+itemH*0.55);
        ctx.font=(8*s)+'px sans-serif'; ctx.fillStyle=canAfford?'#ffd700':'#666';
        ctx.fillText(item.price+'',ix+itemW2/2,iy+itemH-3*s);
    });
}

// ============================================================
// Toast
// ============================================================
function renderToast(s,w,h) {
    if (toastTimer<=0) return;
    const alpha=Math.min(0.9,toastTimer/40);
    ctx.fillStyle='rgba(0,0,0,'+alpha+')';
    ctx.beginPath(); ctx.roundRect(w/2-100*s,h/2-22*s,200*s,38*s,19*s); ctx.fill();
    ctx.fillStyle='#fff'; ctx.font=(12*s)+'px sans-serif'; ctx.textAlign='center';
    ctx.fillText(toastMsg,w/2,h/2+6*s);
}

// ============================================================
// 房屋升级弹窗
// ============================================================
function renderHouseModal(s,w,h) {
    if (!houseModal) return;
    const m = houseModal;
    const my = h/2-160*s;
    ctx.fillStyle='rgba(0,0,0,0.6)'; ctx.fillRect(0,0,w,h);
    ctx.fillStyle='rgba(20,30,50,0.95)'; ctx.beginPath(); ctx.roundRect(10*s,my,w-20*s,360*s,18*s); ctx.fill();
    ctx.strokeStyle='rgba(255,255,255,0.2)'; ctx.lineWidth=2; ctx.beginPath(); ctx.roundRect(10*s,my,w-20*s,360*s,18*s); ctx.stroke();
    ctx.fillStyle='#ffd700'; ctx.font='bold '+(16*s)+'px sans-serif'; ctx.textAlign='center';
    ctx.fillText('🏠 装修风格',w/2,my+28*s);
    if (m.styles) {
        const cols=2, itemH=72*s, itemW=(w-44*s)/cols-10*s, gapX=10*s, gapY=10*s;
        m.styles.forEach((item,i)=>{
            const col=i%cols, row=Math.floor(i/cols);
            const ix=22*s+col*(itemW+gapX), iy=my+50*s+row*(itemH+gapY);
            ctx.fillStyle='rgba(255,255,255,0.1)'; ctx.beginPath(); ctx.roundRect(ix,iy,itemW,itemH,12*s); ctx.fill();
            ctx.strokeStyle='rgba(255,255,255,0.2)'; ctx.lineWidth=1; ctx.beginPath(); ctx.roundRect(ix,iy,itemW,itemH,12*s); ctx.stroke();
            ctx.font=(28*s)+'px sans-serif'; ctx.textAlign='center'; ctx.fillStyle='#fff';
            ctx.fillText(item.emoji,ix+itemW/2,iy+30*s);
            ctx.font='bold '+(12*s)+'px sans-serif'; ctx.fillStyle='#ffd700';
            ctx.fillText(item.name,ix+itemW/2,iy+50*s);
            ctx.font=(9*s)+'px sans-serif'; ctx.fillStyle='rgba(255,255,255,0.6)';
            ctx.fillText(item.desc,ix+itemW/2,iy+64*s);
        });
    }
    ctx.fillStyle='rgba(255,255,255,0.15)'; ctx.beginPath(); ctx.roundRect(w/2-50*s,my+318*s,100*s,38*s,12*s); ctx.fill();
    ctx.fillStyle='rgba(255,255,255,0.7)'; ctx.font=(12*s)+'px sans-serif'; ctx.textAlign='center';
    ctx.fillText('取消',w/2,my+343*s);
}

// ============================================================
// 粒子
// ============================================================
function renderParticles(s,night) {
    gameState.particles.forEach(p=>{
        if (p.type==='butterfly') {
            ctx.globalAlpha=0.9;
            ctx.font=maxTileW*0.28+'px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
            ctx.fillStyle=night?'#aaffaa':'#fff';
            ctx.fillText(p.emoji,p.x-maxTileW*0.08,p.y);
            ctx.fillText(p.emoji,p.x+maxTileW*0.08,p.y);
            ctx.globalAlpha=1;
        } else if (p.type==='firefly') {
            const glow=Math.sin(p.life*0.06+p.phase)*0.5+0.5;
            const grd=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,10);
            grd.addColorStop(0,'rgba(255,255,100,'+(glow*0.9)+')'); grd.addColorStop(0.4,'rgba(150,255,50,'+(glow*0.4)+')'); grd.addColorStop(1,'rgba(0,0,0,0)');
            ctx.fillStyle=grd; ctx.beginPath(); ctx.arc(p.x,p.y,10,0,Math.PI*2); ctx.fill();
        } else if (p.type==='petal') {
            ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.rot);
            ctx.font=maxTileW*0.22+'px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
            ctx.globalAlpha=Math.min(1,(p.maxLife-p.life)/40);
            ctx.fillStyle=night?'#aaaaff':'#ffccdd'; ctx.fillText(p.emoji,0,0);
            ctx.restore(); ctx.globalAlpha=1;
        }
    });
}

function roundRect(ctx,x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.quadraticCurveTo(x+w,y,x+w,y+r);ctx.lineTo(x+w,y+h-r);ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);ctx.lineTo(x+r,y+h);ctx.quadraticCurveTo(x,y+h,x,y+h-r);ctx.lineTo(x,y+r);ctx.quadraticCurveTo(x,y,x+r,y);ctx.closePath();}

init();
