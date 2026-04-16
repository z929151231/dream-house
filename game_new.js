// ============================================================
// 梦想小屋 - 真正的3D渲染系统 (Canvas路径绘制)
// ============================================================

// ---- 区域定义 ----
const ZONES = [
    { id:0, name:'庄园基地', cost:0, row0:3, col0:3, w:3, h:3, isBase:true },
    { id:1, name:'阳光花园', cost:80, row0:0, col0:0, w:3, h:3, isBase:false },
    { id:2, name:'宁静池塘', cost:150, row0:0, col0:6, w:3, h:3, isBase:false },
    { id:3, name:'森林深处', cost:280, row0:3, col0:0, w:3, h:3, isBase:false },
    { id:4, name:'星空露台', cost:450, row0:3, col0:6, w:3, h:3, isBase:false },
    { id:5, name:'梦幻庭院', cost:700, row0:6, col0:3, w:3, h:3, isBase:false },
];

// ---- 植物/装饰定义 (带颜色) ----
const SHOP_ITEMS = [
    { id:'rose', name:'玫瑰', price:20, growth:8, type:'flower', colors:{petal:'#e91e63', center:'#ffeb3b'} },
    { id:'sunf', name:'向日葵', price:15, growth:6, type:'flower', colors:{petal:'#ffc107', center:'#5d4037'} },
    { id:'tulip', name:'郁金香', price:15, growth:6, type:'flower', colors:{petal:'#e91e63', center:'#ffeb3b'} },
    { id:'lavnd', name:'薰衣草', price:25, growth:8, type:'flower', colors:{petal:'#9c27b0', center:'#ffeb3b'} },
    { id:'hydra', name:'绣球', price:35, growth:10, type:'flower', colors:{petal:'#2196f3', center:'#fff'} },
    { id:'butrf', name:'蝴蝶兰', price:30, growth:8, type:'flower', colors:{petal:'#e1bee7', center:'#fff176'} },
    { id:'sakura', name:'樱花树', price:30, growth:10, type:'tree', colors:{trunk:'#5d4037', canopy:'#f8bbd9'} },
    { id:'pine', name:'松树', price:80, growth:20, type:'tree', colors:{trunk:'#4e342e', canopy:'#1b5e20'} },
    { id:'maple', name:'枫树', price:25, growth:12, type:'tree', colors:{trunk:'#5d4037', canopy:'#ff5722'} },
    { id:'willow', name:'垂柳', price:60, growth:15, type:'tree', colors:{trunk:'#5d4037', canopy:'#81c784'} },
    { id:'bush', name:'灌木', price:25, growth:8, type:'tree', colors:{trunk:'#3e2723', canopy:'#388e3c'} },
    { id:'pond', name:'池塘', price:150, growth:0, type:'water', colors:{water:'#4fc3f7', stone:'#78909c'} },
    { id:'fount', name:'喷泉', price:200, growth:0, type:'water', colors:{water:'#4fc3f7', stone:'#90a4ae'} },
    { id:'rock', name:'石头', price:10, growth:0, type:'deco', colors:{main:'#9e9e9e', shadow:'#616161'} },
    { id:'fence', name:'栅栏', price:15, growth:0, type:'deco', colors:{main:'#8d6e63', shadow:'#5d4037'} },
    { id:'lamp', name:'路灯', price:50, growth:0, type:'deco', colors:{pole:'#424242', light:'#fff59d'} },
    { id:'bench', name:'长椅', price:40, growth:0, type:'deco', colors:{main:'#6d4c41', shadow:'#4e342e'} },
    { id:'cat', name:'猫咪', price:120, growth:0, type:'deco', colors:{body:'#ff9800', face:'#fff'} },
    { id:'bunny', name:'兔子', price:90, growth:0, type:'deco', colors:{body:'#fafafa', face:'#f5f5f5'} },
    { id:'butter', name:'蝴蝶', price:60, growth:0, type:'deco', colors:{wing:'#e91e63', body:'#424242'} },
    { id:'frog', name:'青蛙', price:70, growth:0, type:'deco', colors:{body:'#4caf50', belly:'#c8e6c9'} },
    { id:'bird', name:'小鸟', price:55, growth:0, type:'deco', colors:{body:'#2196f3', wing:'#1976d2'} },
    { id:'duck', name:'鸭子', price:85, growth:0, type:'deco', colors:{body:'#fff9c4', bill:'#ff9800'} },
    { id:'hedge', name:'树篱', price:35, growth:0, type:'deco', colors:{main:'#388e3c', shadow:'#1b5e20'} },
    { id:'snail', name:'蜗牛', price:45, growth:0, type:'deco', colors:{shell:'#795548', body:'#a1887f'} },
    { id:'angelf', name:'天使像', price:180, growth:0, type:'deco', colors:{main:'#f5f5f5', wing:'#fff'} },
    { id:'gnotice', name:'告示牌', price:25, growth:0, type:'deco', colors:{main:'#8d6e63', board:'#d7ccc8'} },
    { id:'windmill', name:'风车', price:160, growth:0, type:'deco', colors:{main:'#8d6e63', blade:'#f5f5f5'} },
    { id:'grass', name:'草坪', price:10, growth:3, type:'ground', colors:{main:'#4caf50'} },
    { id:'step', name:'石板', price:5, growth:0, type:'ground', colors:{main:'#9e9e9e'} },
];

const HOUSE_LEVELS = [
    { level:1, name:'破旧小屋', wallH:40, roofH:30, colors:{wall:'#8d6e63', roof:'#5d4037', window:'#424242'} },
    { level:2, name:'木屋', wallH:50, roofH:35, colors:{wall:'#a1887f', roof:'#6d4c41', window:'#795548'} },
    { level:3, name:'砖房', wallH:60, roofH:40, colors:{wall:'#d84315', roof:'#bf360c', window:'#fff176'} },
    { level:4, name:'别墅', wallH:75, roofH:50, colors:{wall:'#fafafa', roof:'#37474f', window:'#4fc3f7'} },
    { level:5, name:'城堡', wallH:95, roofH:70, colors:{wall:'#90a4ae', roof:'#455a64', window:'#fff59d'} },
];

const gameState = {
    money: 9999,
    totalEarned: 0,
    zones: ZONES.map(z => ({...z, unlocked: z.id === 0, garden: []})),
    selectedZone: 0,
    selectedItem: null,
    timeOfDay: 0.42,
    toastMsg: '',
    toastTimer: 0,
    house: { level: 1 },
};

let canvas, ctx, UI = {}, toastTimer = 0;

function init() {
    canvas = wx.createCanvas();
    ctx = canvas.getContext('2d');
    const info = wx.getSystemInfoSync();
    UI.w = info.windowWidth;
    UI.h = info.windowHeight;
    UI.s = Math.min(UI.w / 400, 1.3);
    const dpr = info.pixelRatio || 1;
    canvas.width = UI.w * dpr;
    canvas.height = UI.h * dpr;
    ctx.scale(dpr, dpr);
    wx.onTouchStart(onTouchStart);
    gameLoop();
}

function isoProject(col, row) {
    const s = UI.s;
    const tileW = 55 * s, tileH = 30 * s;
    const centerX = UI.w / 2, centerY = UI.h * 0.42;
    const x = centerX + (col - 1) * tileW * 0.5 - (row - 1) * tileW * 0.5;
    const y = centerY + (col - 1) * tileH * 0.5 + (row - 1) * tileH * 0.5;
    return { x, y, tileW, tileH };
}

function screenToIso(sx, sy) {
    const s = UI.s;
    const tileW = 55 * s, tileH = 30 * s;
    const centerX = UI.w / 2, centerY = UI.h * 0.42;
    const dx = sx - centerX, dy = sy - centerY;
    const col = (dx / (tileW * 0.5) + dy / (tileH * 0.5)) / 2 + 1;
    const row = (dy / (tileH * 0.5) - dx / (tileW * 0.5)) / 2 + 1;
    return { col: Math.floor(col), row: Math.floor(row) };
}

function getSky(t) {
    if (t < 0.15) return { top: '#0a0a1e', mid: '#1a1a3a', bot: '#0d1f0d', name: '深夜', night: true };
    if (t < 0.25) return { top: '#ff7043', mid: '#ffab91', bot: '#4a3728', name: '黎明', night: false };
    if (t < 0.5) return { top: '#4fc3f7', mid: '#81d4fa', bot: '#a5d6a7', name: '白天', night: false };
    if (t < 0.75) return { top: '#ff8a65', mid: '#ffab91', bot: '#8d6e63', name: '黄昏', night: false };
    return { top: '#1a237e', mid: '#283593', bot: '#1a3a1a', name: '夜晚', night: true };
}

function shadeColor(color, percent) {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.max(0, Math.min(255, (num >> 16) + amt));
    const G = Math.max(0, Math.min(255, (num >> 8 & 0x00FF) + amt));
    const B = Math.max(0, Math.min(255, (num & 0x0000FF) + amt));
    return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
}

function render() {
    const s = UI.s, w = UI.w, h = UI.h;
    const sky = getSky(gameState.timeOfDay);
    
    // 天空
    const skyGrd = ctx.createLinearGradient(0, 0, 0, h * 0.5);
    skyGrd.addColorStop(0, sky.top);
    skyGrd.addColorStop(0.5, sky.mid);
    skyGrd.addColorStop(1, sky.bot);
    ctx.fillStyle = skyGrd;
    ctx.fillRect(0, 0, w, h);
    
    // 星星
    if (sky.night) {
        for (let i = 0; i < 60; i++) {
            const x = (i * 47 + Date.now() * 0.001) % w;
            const y = (i * 31) % (h * 0.35);
            const twinkle = Math.sin(Date.now() * 0.003 + i) * 0.3 + 0.7;
            ctx.fillStyle = 'rgba(255,255,240,' + twinkle + ')';
            ctx.beginPath();
            ctx.arc(x, y, 1.2 * s, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    // 山丘
    ctx.fillStyle = sky.night ? '#1a2a1a' : '#66bb6a';
    ctx.beginPath();
    ctx.moveTo(0, h * 0.35);
    ctx.bezierCurveTo(w * 0.2, h * 0.22, w * 0.35, h * 0.18, w * 0.5, h * 0.28);
    ctx.bezierCurveTo(w * 0.7, h * 0.38, w * 0.85, h * 0.25, w, h * 0.32);
    ctx.lineTo(w, h * 0.5);
    ctx.lineTo(0, h * 0.5);
    ctx.closePath();
    ctx.fill();
    
    renderZone(s, w, h, sky);
    renderTopBar(s, w, h, sky);
    renderZoneSelector(s, w, h, sky);
    renderShop(s, w, h, sky);
    renderToast(s, w, h);
}

function renderZone(s, w, h, sky) {
    const zone = gameState.zones[gameState.selectedZone];
    const night = sky.night;
    
    // 地面
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.beginPath();
    ctx.ellipse(w / 2 + 6 * s, h * 0.43 + 6 * s, 130 * s, 70 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    
    const grd = ctx.createRadialGradient(w / 2, h * 0.43, 0, w / 2, h * 0.43, 140 * s);
    grd.addColorStop(0, night ? '#2a4a2a' : '#4caf50');
    grd.addColorStop(0.7, night ? '#1a3a1a' : '#388e3c');
    grd.addColorStop(1, night ? '#0d1f0d' : '#1b5e20');
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.ellipse(w / 2, h * 0.43, 125 * s, 65 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    
    if (!zone.unlocked) {
        renderLockedZone(s, w, h, zone, night);
        return;
    }
    
    // 格子
    for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
            renderTile(col, row, s, zone, night);
        }
    }
    
    // 物体
    const drawables = [];
    if (zone.isBase) drawables.push({ kind: 'house', row: 1, col: 1 });
    zone.garden.forEach(cell => {
        const lCol = cell.col - zone.col0;
        const lRow = cell.row - zone.row0;
        if (lCol >= 0 && lCol < 3 && lRow >= 0 && lRow < 3) {
            drawables.push({ kind: 'plant', row: lRow, col: lCol, cell });
        }
    });
    drawables.sort((a, b) => a.row !== b.row ? a.row - b.row : a.col - b.col);
    
    drawables.forEach(d => {
        if (d.kind === 'house') renderHouse(s, zone, night);
        else renderPlant(d.cell, s, zone, night);
    });
}

function renderTile(col, row, s, zone, night) {
    const { x, y, tileW, tileH } = isoProject(col, row);
    const wCol = zone.col0 + col, wRow = zone.row0 + row;
    const existing = zone.garden.find(g => g.col === wCol && g.row === wRow);
    
    ctx.beginPath();
    ctx.moveTo(x, y - tileH);
    ctx.lineTo(x + tileW / 2, y);
    ctx.lineTo(x, y + tileH);
    ctx.lineTo(x - tileW / 2, y);
    ctx.closePath();
    
    let fillColor;
    if (existing && existing.plant.type === 'water') {
        fillColor = night ? '#1565c0' : '#4fc3f7';
    } else if (existing && existing.plant.type === 'ground') {
        fillColor = existing.plant.id === 'step' ? (night ? '#424242' : '#9e9e9e') : (night ? '#2a5a2a' : '#66bb6a');
    } else {
        const even = (col + row) % 2 === 0;
        fillColor = night ? (even ? '#2a4a2a' : '#1f3a1f') : (even ? '#81c784' : '#66bb6a');
    }
    
    ctx.fillStyle = fillColor;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    ctx.stroke();
}

function renderHouse(s, zone, night) {
    const { x, y } = isoProject(1, 1);
    const lvl = HOUSE_LEVELS[gameState.house.level - 1];
    const wallW = 50 * s, wallH = lvl.wallH * s, roofH = lvl.roofH * s;
    
    // 阴影
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath();
    ctx.ellipse(x + 4 * s, y + 4 * s, wallW * 0.7, wallW * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // 底座
    ctx.fillStyle = night ? '#2a2a2a' : '#78909c';
    ctx.beginPath();
    ctx.ellipse(x, y, wallW * 0.6, wallW * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // 墙体
    ctx.fillStyle = shadeColor(lvl.colors.wall, night ? -40 : 0);
    ctx.beginPath();
    ctx.moveTo(x - wallW * 0.5, y);
    ctx.lineTo(x - wallW * 0.25, y - wallH * 0.5);
    ctx.lineTo(x - wallW * 0.25, y - wallH);
    ctx.lineTo(x - wallW * 0.5, y - wallH * 0.5);
    ctx.closePath();
    ctx.fill();
    
    ctx.fillStyle = shadeColor(lvl.colors.wall, night ? -20 : 15);
    ctx.beginPath();
    ctx.moveTo(x + wallW * 0.5, y);
    ctx.lineTo(x + wallW * 0.25, y - wallH * 0.5);
    ctx.lineTo(x + wallW * 0.25, y - wallH);
    ctx.lineTo(x + wallW * 0.5, y - wallH * 0.5);
    ctx.closePath();
    ctx.fill();
    
    const frontGrd = ctx.createLinearGradient(x - wallW * 0.25, y - wallH, x + wallW * 0.25, y);
    frontGrd.addColorStop(0, shadeColor(lvl.colors.wall, night ? -30 : 10));
    frontGrd.addColorStop(1, shadeColor(lvl.colors.wall, night ? -50 : -10));
    ctx.fillStyle = frontGrd;
    ctx.fillRect(x - wallW * 0.25, y - wallH, wallW * 0.5, wallH * 0.5);
    
    // 屋顶
    const roofY = y - wallH - roofH * 0.5;
    ctx.fillStyle = shadeColor(lvl.colors.roof, night ? -30 : 0);
    ctx.beginPath();
    ctx.moveTo(x, roofY - roofH * 0.8);
    ctx.lineTo(x + wallW * 0.55, roofY + roofH * 0.2);
    ctx.lineTo(x - wallW * 0.55, roofY + roofH * 0.2);
    ctx.closePath();
    ctx.fill();
    
    // 窗户
    const winY = y - wallH * 0.75;
    if (night) {
        const winGrd = ctx.createRadialGradient(x, winY, 0, x, winY, wallW * 0.4);
        winGrd.addColorStop(0, 'rgba(255,200,50,0.4)');
        winGrd.addColorStop(1, 'rgba(255,150,0,0)');
        ctx.fillStyle = winGrd;
        ctx.fillRect(x - wallW * 0.5, winY - wallW * 0.4, wallW, wallW * 0.8);
    }
    ctx.fillStyle = night ? lvl.colors.window : shadeColor(lvl.colors.window, -20);
    ctx.fillRect(x - wallW * 0.15, winY - wallH * 0.12, wallW * 0.3, wallH * 0.24);
    ctx.strokeStyle = night ? '#424242' : '#5d4037';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x - wallW * 0.15, winY - wallH * 0.12, wallW * 0.3, wallH * 0.24);
    
    // 门
    const doorY = y - wallH * 0.35;
    ctx.fillStyle = night ? '#3e2723' : '#6d4c41';
    ctx.fillRect(x - wallW * 0.08, doorY - wallH * 0.25, wallW * 0.16, wallH * 0.25);
}

function renderPlant(cell, s, zone, night) {
    const lCol = cell.col - zone.col0, lRow = cell.row - zone.row0;
    const { x, y, tileW } = isoProject(lCol, lRow);
    const plant = cell.plant;
    const growthFactor = plant.growth > 0 ? Math.min(1, ((Date.now() - cell.plantedAt) / 1000) / plant.growth) : 1;
    
    if (plant.type === 'tree') {
        const size = (0.5 + growthFactor * 0.5) * s * 25;
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.beginPath();
        ctx.ellipse(x + 3 * s, y + 3 * s, size * 1.2, size * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // 树干
        ctx.fillStyle = shadeColor(plant.colors.trunk, night ? -20 : 0);
        ctx.fillRect(x - size * 0.12, y - size * 1.5, size * 0.24, size * 1.5);
        
        // 树冠
        const canopyY = y - size * 1.5 - size * 0.5;
        for (let i = 2; i >= 0; i--) {
            const r = size * (0.7 + i * 0.2);
            const cx = x + (i - 1) * size * 0.25;
            const cy = canopyY + i * size * 0.15;
            const canopyGrd = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, 0, cx, cy, r);
            canopyGrd.addColorStop(0, shadeColor(plant.colors.canopy, night ? -10 : 30));
            canopyGrd.addColorStop(1, shadeColor(plant.colors.canopy, night ? -50 : -20));
            ctx.fillStyle = canopyGrd;
            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
            ctx.fill();
        }
    } else if (plant.type === 'flower') {
        const size = (0.4 + growthFactor * 0.6) * s * 20;
        
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.beginPath();
        ctx.ellipse(x + 2 * s, y + 2 * s, size * 0.6, size * 0.3, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // 茎
        ctx.strokeStyle = night ? '#2a5a2a' : '#4caf50';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.quadraticCurveTo(x + size * 0.1, y - size * 0.5, x, y - size);
        ctx.stroke();
        
        // 花瓣
        const petalY = y - size * 1.1;
        const petalR = size * 0.35;
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const px = x + Math.cos(angle) * petalR * 0.8;
            const py = petalY + Math.sin(angle) * petalR * 0.6;
            const petalGrd = ctx.createRadialGradient(px, py, 0, px, py, petalR);
            petalGrd.addColorStop(0, shadeColor(plant.colors.petal, night ? -10 : 20));
            petalGrd.addColorStop(1, shadeColor(plant.colors.petal, night ? -30 : -10));
            ctx.fillStyle = petalGrd;
            ctx.beginPath();
            ctx.ellipse(px, py, petalR, petalR * 0.7, angle, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // 花心
        ctx.fillStyle = plant.colors.center;
        ctx.beginPath();
        ctx.arc(x, petalY, petalR * 0.35, 0, Math.PI * 2);
        ctx.fill();
    } else if (plant.type === 'water') {
        const size = s * 30;
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.beginPath();
        ctx.ellipse(x + 3 * s, y + 3 * s, size, size * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = night ? '#424242' : plant.colors.stone;
        ctx.beginPath();
        ctx.ellipse(x, y, size * 1.1, size * 0.55, 0, 0, Math.PI * 2);
        ctx.fill();
        
        const waterGrd = ctx.createRadialGradient(x - size * 0.3, y - size * 0.2, 0, x, y, size);
        waterGrd.addColorStop(0, night ? '#1565c0' : '#81d4fa');
        waterGrd.addColorStop(0.5, night ? '#0d47a1' : plant.colors.water);
        waterGrd.addColorStop(1, night ? '#0a3d91' : '#29b6f6');
        ctx.fillStyle = waterGrd;
        ctx.beginPath();
        ctx.ellipse(x, y, size * 0.95, size * 0.48, 0, 0, Math.PI * 2);
        ctx.fill();
    } else if (plant.type === 'deco') {
        const size = s * 12;
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.beginPath();
        ctx.ellipse(x + 2 * s, y + 2 * s, size * 0.8, size * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = plant.colors.main || '#888';
        ctx.beginPath();
        ctx.arc(x, y - size * 0.5, size * 0.6, 0, Math.PI * 2);
        ctx.fill();
    }
}

function renderTopBar(s, w, h, sky) {
    const barGrd = ctx.createLinearGradient(0, 0, 0, 50 * s);
    barGrd.addColorStop(0, 'rgba(20,30,20,0.9)');
    barGrd.addColorStop(1, 'rgba(10,20,10,0.85)');
    ctx.fillStyle = barGrd;
    ctx.beginPath();
    ctx.roundRect(10 * s, 8 * s, w - 20 * s, 42 * s, 12 * s);
    ctx.fill();
    
    ctx.strokeStyle = 'rgba(255,215,0,0.3)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(10 * s, 8 * s, w - 20 * s, 42 * s, 12 * s);
    ctx.stroke();
    
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold ' + (12 * s) + 'px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(sky.name, 20 * s, 32 * s);
    
    ctx.textAlign = 'center';
    ctx.font = 'bold ' + (18 * s) + 'px sans-serif';
    ctx.fillText('💰 ' + gameState.money, w / 2, 34 * s);
    
    ctx.textAlign = 'right';
    ctx.font = (10 * s) + 'px sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.fillText('总收益:' + gameState.totalEarned, w - 20 * s, 26 * s);
}

function renderZoneSelector(s, w, h, sky) {
    const night = sky.night;
    const barY = 58 * s, btnW = 40 * s, btnH = 36 * s, gap = 6 * s;
    const totalW = ZONES.length * (btnW + gap) - gap;
    const startX = (w - totalW) / 2;
    
    ZONES.forEach((z, idx) => {
        const bx = startX + idx * (btnW + gap);
        const isSelected = idx === gameState.selectedZone;
        const isUnlocked = z.unlocked;
        
        if (isSelected) {
            ctx.fillStyle = 'rgba(255,215,0,0.2)';
            ctx.beginPath();
            ctx.roundRect(bx - 3 * s, barY - btnH / 2 - 3 * s, btnW + 6 * s, btnH + 6 * s, 10 * s);
            ctx.fill();
        }
        
        const btnGrd = ctx.createLinearGradient(bx, barY - btnH / 2, bx, barY + btnH / 2);
        if (isUnlocked) {
            btnGrd.addColorStop(0, night ? 'rgba(50,80,50,0.9)' : 'rgba(76,175,80,0.9)');
            btnGrd.addColorStop(1, night ? 'rgba(30,50,30,0.95)' : 'rgba(56,142,60,0.95)');
        } else {
            btnGrd.addColorStop(0, 'rgba(60,60,60,0.8)');
            btnGrd.addColorStop(1, 'rgba(40,40,40,0.9)');
        }
        ctx.fillStyle = btnGrd;
        ctx.beginPath();
        ctx.roundRect(bx, barY - btnH / 2, btnW, btnH, 8 * s);
        ctx.fill();
        
        if (isSelected) {
            ctx.strokeStyle = '#ffd700';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.roundRect(bx, barY - btnH / 2, btnW, btnH, 8 * s);
            ctx.stroke();
        }
        
        ctx.fillStyle = isUnlocked ? '#fff' : 'rgba(150,150,150,0.5)';
        ctx.font = 'bold ' + (9 * s) + 'px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(z.name.slice(0, 3), bx + btnW / 2, barY + 3 * s);
        
        if (!isUnlocked) {
            ctx.fillStyle = '#f87171';
            ctx.font = (8 * s) + 'px sans-serif';
            ctx.fillText('🔒' + z.cost, bx + btnW / 2, barY + btnH / 2 + 10 * s);
        }
    });
}

function renderShop(s, w, h, sky) {
    const night = sky.night;
    const shopY = h - 115 * s, shopH = 108 * s;
    
    const shopGrd = ctx.createLinearGradient(0, shopY, 0, shopY + shopH);
    shopGrd.addColorStop(0, night ? 'rgba(20,35,20,0.92)' : 'rgba(30,60,30,0.92)');
    shopGrd.addColorStop(1, night ? 'rgba(10,20,10,0.95)' : 'rgba(20,40,20,0.95)');
    ctx.fillStyle = shopGrd;
    ctx.beginPath();
    ctx.roundRect(8 * s, shopY, w - 16 * s, shopH, 14 * s);
    ctx.fill();
    
    ctx.strokeStyle = 'rgba(255,215,0,0.25)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(8 * s, shopY, w - 16 * s, shopH, 14 * s);
    ctx.stroke();
    
    ctx.fillStyle = '#fff';
    ctx.font = 'bold ' + (11 * s) + 'px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('🛒 商店', 16 * s, shopY + 16 * s);
    
    ctx.textAlign = 'right';
    ctx.fillStyle = '#ffd700';
    ctx.fillText('💰' + gameState.money, w - 16 * s, shopY + 16 * s);
    
    const cols = 8;
    const itemW = (w - 24 * s) / cols - 2 * s;
    const itemH = (shopH - 34 * s) / 2;
    
    SHOP_ITEMS.forEach((item, idx) => {
        const col = idx % cols;
        const row = Math.floor(idx / cols);
        if (row > 1) return;
        
        const ix = 12 * s + col * (itemW + 2 * s);
        const iy = shopY + 22 * s + row * (itemH + 2 * s);
        
        const sel = gameState.selectedItem?.id === item.id;
        const canAfford = gameState.money >= item.price;
        
        ctx.fillStyle = sel ? 'rgba(76,175,80,0.4)' : 'rgba(255,255,255,0.08)';
        ctx.beginPath();
        ctx.roundRect(ix, iy, itemW, itemH, 5 * s);
        ctx.fill();
        
        if (sel) {
            ctx.strokeStyle = '#4caf50';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.roundRect(ix, iy, itemW, itemH, 5 * s);
            ctx.stroke();
        }
        
        ctx.fillStyle = item.colors ? (item.colors.petal || item.colors.canopy || item.colors.main || '#888') : '#888';
        ctx.beginPath();
        ctx.arc(ix + itemW / 2, iy + itemH / 2 - 4 * s, itemW * 0.28, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = canAfford ? '#ffd700' : '#666';
        ctx.font = (7 * s) + 'px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(item.price + '', ix + itemW / 2, iy + itemH - 4 * s);
    });
}

function renderToast(s, w, h) {
    if (toastTimer <= 0) return;
    const alpha = Math.min(0.9, toastTimer / 30);
    ctx.fillStyle = 'rgba(0,0,0,' + alpha + ')';
    ctx.beginPath();
    ctx.roundRect(w / 2 - 100 * s, h / 2 - 20 * s, 200 * s, 36 * s, 18 * s);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = (12 * s) + 'px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(gameState.toastMsg, w / 2, h / 2 + 5 * s);
}

function renderLockedZone(s, w, h, zone, night) {
    const { x, y } = isoProject(1, 1);
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.beginPath();
    ctx.ellipse(x, y, 90 * s, 50 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold ' + (36 * s) + 'px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🔒', x, y - 15 * s);
    
    ctx.font = 'bold ' + (14 * s) + 'px sans-serif';
    ctx.fillText(zone.name, x, y - 50 * s);
    
    const canAfford = gameState.money >= zone.cost;
    ctx.fillStyle = canAfford ? '#4ade80' : '#f87171';
    ctx.font = (12 * s) + 'px sans-serif';
    ctx.fillText('解锁: ' + zone.cost + ' 💰', x, y + 10 * s);
    
    if (canAfford) {
        ctx.fillStyle = '#4caf50';
        ctx.beginPath();
        ctx.roundRect(x - 40 * s, y + 25 * s, 80 * s, 28 * s, 10 * s);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = 'bold ' + (10 * s) + 'px sans-serif';
        ctx.fillText('点此解锁', x, y + 44 * s);
    }
}

function updatePlants() {
    const now = Date.now();
    gameState.zones.forEach(zone => {
        zone.garden.forEach(cell => {
            if (cell.plant.growth === 0) { cell.stage = 2; return; }
            const age = (now - cell.plantedAt) / 1000;
            if (age < cell.plant.growth * 0.5) cell.stage = 0;
            else if (age < cell.plant.growth) cell.stage = 1;
            else cell.stage = 2;
        });
    });
}

function showToast(msg) { gameState.toastMsg = msg; toastTimer = 120; }

function cycleTime() {
    const times = [0.1, 0.35, 0.55, 0.75, 0.9];
    const idx = times.findIndex(t => Math.abs(t - gameState.timeOfDay) < 0.15);
    gameState.timeOfDay = times[(idx + 1) % times.length];
}

function onTouchStart(e) {
    const x = e.touches[0].clientX;
    const y = e.touches[0].clientY;
    const s = UI.s, w = UI.w, h = UI.h;
    const zone = gameState.zones[gameState.selectedZone];
    
    const barY = 58 * s, btnW = 40 * s, gap = 6 * s;
    const totalW = ZONES.length * (btnW + gap) - gap;
    const startX = (w - totalW) / 2;
    
    if (y >= barY - 20 * s && y <= barY + 40 * s) {
        ZONES.forEach((z, idx) => {
            const bx = startX + idx * (btnW + gap);
            if (x >= bx && x <= bx + btnW) {
                if (z.unlocked) { gameState.selectedZone = idx; }
                else if (gameState.money >= z.cost) {
                    gameState.money -= z.cost;
                    z.unlocked = true;
                    gameState.selectedZone = idx;
                    showToast('🎉 解锁 ' + z.name + '！');
                } else { showToast('🔒 需要 ' + z.cost + ' 💰'); }
            }
        });
        return;
    }
    
    if (y < 50 * s && x > w - 80 * s) { cycleTime(); return; }
    
    const shopY = h - 115 * s;
    if (y > shopY) {
        const cols = 8;
        const itemW = (w - 24 * s) / cols - 2 * s;
        const itemH = (108 * s - 34 * s) / 2;
        SHOP_ITEMS.forEach((item, idx) => {
            const col = idx % cols;
            const row = Math.floor(idx / cols);
            if (row > 1) return;
            const ix = 12 * s + col * (itemW + 2 * s);
            const iy = shopY + 22 * s + row * (itemH + 2 * s);
            if (x >= ix && x <= ix + itemW && y >= iy && y <= iy + itemH) {
                if (gameState.money >= item.price) {
                    gameState.selectedItem = item;
                    showToast('已选: ' + item.name);
                } else { showToast('💰 金币不足'); }
            }
        });
        return;
    }
    
    if (zone.unlocked && y > 100 * s && y < h - 120 * s) {
        const iso = screenToIso(x, y);
        if (iso.col >= 0 && iso.col < 3 && iso.row >= 0 && iso.row < 3) {
            const wCol = zone.col0 + iso.col, wRow = zone.row0 + iso.row;
            const existing = zone.garden.find(g => g.col === wCol && g.row === wRow);
            if (existing) {
                showToast(existing.plant.name + (existing.stage === 2 ? ' ⭐' : ''));
            } else if (gameState.selectedItem) {
                zone.garden.push({
                    col: wCol, row: wRow,
                    plant: gameState.selectedItem,
                    stage: gameState.selectedItem.growth === 0 ? 2 : 0,
                    plantedAt: Date.now(),
                });
                gameState.money -= gameState.selectedItem.price;
                showToast('🌱 放置成功！');
                gameState.selectedItem = null;
            }
        }
    }
}

function gameLoop() {
    updatePlants();
    render();
    if (toastTimer > 0) { toastTimer--; gameState.toastTimer = toastTimer; }
    gameState.timeOfDay = (gameState.timeOfDay + 0.00008) % 1;
    requestAnimationFrame(gameLoop);
}

init();
