// ============================================================
// 梦想小屋 - 高级花园版 v3
// Features: 动态天空/粒子动画/水池波光/植物生长/昼夜循环
// ============================================================

// ---- 游戏状态 ----
const GRID_COLS = 9;
const GRID_ROWS = 7;
const gameState = {
    money: 1000,
    level: 1,
    garden: [],        // {col, row, plant, stage, plantedAt, rippled:[]}
    selectedPlant: null,
    timeOfDay: 0.4,   // 0~1，白天下午4点
    particles: [],    // 蝴蝶/萤火虫/花瓣
    clouds: [],       // 飘动云朵
    timeFlow: 0,      // 时间流逝累计
};

// ---- 植物定义 ----
// stage: 0=种子 1=幼苗 2=成熟
// growthTime: 从stage0到stage2的秒数
const PLANTS = [
    { id:'rose',    name:'玫瑰',     emoji:'🌹', emoji2:'🌷', emoji0:'🌱', price:20,  growth:8,  type:'flower' },
    { id:'sunf',    name:'向日葵',   emoji:'🌻', emoji2:'🌻', emoji0:'🌱', price:15,  growth:6,  type:'flower' },
    { id:'tulip',   name:'郁金香',   emoji:'🌷', emoji2:'🌷', emoji0:'🌱', price:15,  growth:6,  type:'flower' },
    { id:'sakura',  name:'樱花树',   emoji:'🌸', emoji2:'🌸', emoji0:'🌱', price:30,  growth:10, type:'tree'   },
    { id:'maple',   name:'枫树',     emoji:'🍁', emoji2:'🍁', emoji0:'🌱', price:25,  growth:12, type:'tree'   },
    { id:'pine',    name:'松树',     emoji:'🌲', emoji2:'🌲', emoji0:'🌱', price:80,  growth:20, type:'tree'   },
    { id:'willow',  name:'垂柳',     emoji:'🌿', emoji2:'🌿', emoji0:'🌱', price:60,  growth:15, type:'tree'   },
    { id:'lavnd',   name:'薰衣草',   emoji:'💜', emoji2:'💜', emoji0:'🌱', price:25,  growth:8,  type:'flower' },
    { id:'hydra',   name:'绣球',     emoji:'💐', emoji2:'💐', emoji0:'🌱', price:35,  growth:10, type:'flower' },
    { id:'grass',   name:'草坪',     emoji:'🌿', emoji2:'🌿', emoji0:'🌿', price:10,  growth:3,  type:'ground' },
    { id:'bush',    name:'灌木球',   emoji:'🌳', emoji2:'🌳', emoji0:'🌱', price:25,  growth:8,  type:'tree'   },
    { id:'fence',   name:'木栅栏',   emoji:'🪵', emoji2:'🪵', emoji0:'🪵', price:15,  growth:0,  type:'deco'   },
    { id:'rock',    name:'石头',     emoji:'🪨', emoji2:'🪨', emoji0:'🪨', price:10,  growth:0,  type:'deco'   },
    { id:'lamp',    name:'花园灯',   emoji:'🏮', emoji2:'🏮', emoji0:'🏮', price:50,  growth:0,  type:'deco'   },
    { id:'pond',    name:'水池',     emoji:'💧', emoji2:'💧', emoji0:'💧', price:150, growth:0,  type:'water'  },
    { id:'fount',   name:'喷泉',     emoji:'⛲', emoji2:'⛲', emoji0:'⛲', price:200, growth:0,  type:'water'  },
    { id:'lantern', name:'石灯笼',   emoji:'🏮', emoji2:'🏮', emoji0:'🏮', price:45,  growth:0,  type:'deco'   },
    { id:'bench',   name:'长椅',     emoji:'🪑', emoji2:'🪑', emoji0:'🪑', price:40,  growth:0,  type:'deco'   },
    { id:'step',    name:'石板路',   emoji:'⬜', emoji2:'⬜', emoji0:'⬜', price:5,   growth:0,  type:'deco'   },
];

// ---- 全局变量 ----
let canvas, ctx;
let UI = {};
let toastMsg = '', toastTimer = 0;
let gridCellSize = 0, gridOX = 0, gridOY = 0;
let rippleList = []; // 水面涟漪 {cx,cy,r,t,maxR}

// ---- 时间/天空系统 ----
// timeOfDay: 0=深夜 0.25=黎明 0.5=正午 0.75=黄昏 1=深夜
function getSkyColors(t) {
    if (t < 0.15) return { top:'#0a0a2e', bot:'#1a1a4e', name:'深夜' };
    if (t < 0.25) return { top:'#ff7e5f', bot:'#feb47b', name:'黎明' };
    if (t < 0.35) return { top:'#4facfe', bot:'#00f2fe', name:'清晨' };
    if (t < 0.45) return { top:'#56CCF2', bot:'#2F80ED', name:'上午' };
    if (t < 0.55) return { top:'#5B86E5', bot:'#36D1DC', name:'正午' };
    if (t < 0.65) return { top:'#2196F3', bot:'#64B5F6', name:'午后' };
    if (t < 0.75) return { top:'#f7797d', bot:'#FBD786', name:'黄昏' };
    if (t < 0.85) return { top:'#c94b4b', bot:'#4b134f', name:'傍晚' };
    return { top:'#0a0a2e', bot:'#1a1a4e', name:'深夜' };
}

function getStarAlpha(t) {
    if (t < 0.15) return 1;
    if (t < 0.25) return Math.max(0, 1 - (t - 0.15) / 0.10);
    if (t > 0.75) return Math.min(1, (t - 0.75) / 0.10);
    return 0;
}

function isNight(t) { return t < 0.2 || t > 0.82; }
function isDusk(t)  { return (t > 0.7 && t <= 0.82) || (t >= 0.15 && t < 0.25); }

// ---- 粒子系统 ----
function spawnButterfly() {
    const PLANT_EMOJIS = ['🦋','🐝','🪲','🦗'];
    const emoji = PLANT_EMOJIS[Math.floor(Math.random() * PLANT_EMOJIS.length)];
    const col = Math.random() * GRID_COLS;
    const row = Math.random() * GRID_ROWS;
    gameState.particles.push({
        type: 'butterfly',
        emoji,
        cx: gridOX + col * gridCellSize + gridCellSize / 2,
        cy: gridOY + row * gridCellSize + gridCellSize / 2,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.2,
        age: 0,
        maxAge: 300 + Math.random() * 300,
        scale: 0.7 + Math.random() * 0.5,
        wing: 0, // 翅膀扑动相位
    });
}

function spawnFirefly() {
    gameState.particles.push({
        type: 'firefly',
        cx: gridOX + Math.random() * GRID_COLS * gridCellSize,
        cy: gridOY + Math.random() * GRID_ROWS * gridCellSize,
        vx: (Math.random() - 0.5) * 0.4,
        vy: -0.1 - Math.random() * 0.2,
        age: 0,
        maxAge: 400 + Math.random() * 400,
        glow: Math.random(),
        glowDir: 1,
    });
}

function spawnPetal() {
    const petEmojis = ['🌸', '🍂', '🍃'];
    gameState.particles.push({
        type: 'petal',
        emoji: petEmojis[Math.floor(Math.random() * petEmojis.length)],
        cx: gridOX + Math.random() * GRID_COLS * gridCellSize,
        cy: gridOY - 20,
        vx: 0.3 + Math.random() * 0.5,
        vy: 0.5 + Math.random() * 0.8,
        age: 0,
        maxAge: 200,
        rot: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.1,
    });
}

function updateParticles() {
    for (let i = gameState.particles.length - 1; i >= 0; i--) {
        const p = gameState.particles[i];
        p.age++;
        if (p.age >= p.maxAge) { gameState.particles.splice(i, 1); continue; }
        if (p.type === 'butterfly') {
            p.wing += 0.3;
            p.vx += (Math.random() - 0.5) * 0.15;
            p.vy += (Math.random() - 0.5) * 0.12;
            p.vx *= 0.97; p.vy *= 0.97;
            p.cx += p.vx;
            p.cy += p.vy;
            // 边界反弹
            if (p.cx < gridOX || p.cx > gridOX + GRID_COLS * gridCellSize) p.vx *= -1;
            if (p.cy < gridOY || p.cy > gridOY + GRID_ROWS * gridCellSize) p.vy *= -1;
        } else if (p.type === 'firefly') {
            p.glow += p.glowDir * 0.04;
            if (p.glow > 1 || p.glow < 0) p.glowDir *= -1;
            p.cx += p.vx + Math.sin(p.age * 0.05) * 0.3;
            p.cy += p.vy;
            if (p.cy < gridOY) {
                gameState.particles.splice(i, 1);
                continue;
            }
        } else if (p.type === 'petal') {
            p.rot += p.rotSpeed;
            p.cx += p.vx + Math.sin(p.age * 0.08) * 0.4;
            p.cy += p.vy;
            if (p.cy > gridOY + GRID_ROWS * gridCellSize + 30) {
                gameState.particles.splice(i, 1);
            }
        }
    }
    // 保持粒子数量
    const butterflies = gameState.particles.filter(p => p.type === 'butterfly').length;
    const fireflies  = gameState.particles.filter(p => p.type === 'firefly').length;
    const petals     = gameState.particles.filter(p => p.type === 'petal').length;
    if (butterflies < 3) spawnButterfly();
    if (isNight(gameState.timeOfDay) && fireflies < 8) spawnFirefly();
    if (gameState.timeOfDay > 0.2 && gameState.timeOfDay < 0.8 && petals < 4) spawnPetal();
}

function drawParticles() {
    const night = isNight(gameState.timeOfDay);
    gameState.particles.forEach(p => {
        if (p.type === 'butterfly') {
            const alpha = 1;
            ctx.font = `${gridCellSize * 0.45 * p.scale}px sans-serif`;
            ctx.textAlign = 'center';
            const wx = Math.abs(Math.sin(p.wing)) * 0.3;
            // 左翅
            ctx.save();
            ctx.globalAlpha = alpha * (1 - wx);
            ctx.fillText(p.emoji, p.cx - gridCellSize * 0.15, p.cy + gridCellSize * 0.1);
            // 右翅
            ctx.globalAlpha = alpha * (1 - wx);
            ctx.fillText(p.emoji, p.cx + gridCellSize * 0.15, p.cy + gridCellSize * 0.1);
            ctx.restore();
            ctx.globalAlpha = 1;
        } else if (p.type === 'firefly') {
            const g = ctx.createRadialGradient(p.cx, p.cy, 0, p.cx, p.cy, 8);
            g.addColorStop(0, `rgba(255, 255, 100, ${p.glow * 0.9})`);
            g.addColorStop(0.5, `rgba(150, 255, 50, ${p.glow * 0.4})`);
            g.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.arc(p.cx, p.cy, 8, 0, Math.PI * 2);
            ctx.fill();
        } else if (p.type === 'petal') {
            ctx.save();
            ctx.translate(p.cx, p.cy);
            ctx.rotate(p.rot);
            ctx.font = `${gridCellSize * 0.3}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.globalAlpha = Math.min(1, (p.maxAge - p.age) / 30);
            ctx.fillText(p.emoji, 0, 0);
            ctx.restore();
            ctx.globalAlpha = 1;
        }
    });
}

// ---- 涟漪系统 ----
function addRipple(cx, cy) {
    rippleList.push({ cx, cy, r: 2, t: 1, maxR: gridCellSize * 0.8 });
}
function updateRipples() {
    for (let i = rippleList.length - 1; i >= 0; i--) {
        const rip = rippleList[i];
        rip.r += 0.4;
        rip.t -= 0.025;
        if (rip.t <= 0) rippleList.splice(i, 1);
    }
}

// ---- 云朵 ----
function initClouds() {
    gameState.clouds = [];
    for (let i = 0; i < 5; i++) {
        gameState.clouds.push({
            x: Math.random() * UI.w,
            y: 20 + Math.random() * 60,
            speed: 0.08 + Math.random() * 0.12,
            scale: 0.5 + Math.random() * 0.8,
            opacity: 0.4 + Math.random() * 0.4,
        });
    }
}
function updateClouds() {
    const dusk = isDusk(gameState.timeOfDay);
    gameState.clouds.forEach(c => {
        c.x += c.speed;
        if (c.x > UI.w + 100) c.x = -120;
    });
}

// ---- 星星 ----
const stars = [];
function initStars() {
    for (let i = 0; i < 80; i++) {
        stars.push({
            x: Math.random() * 100, // 百分比
            y: Math.random() * 60,
            size: 0.5 + Math.random() * 1.5,
            twinkle: Math.random() * Math.PI * 2,
        });
    }
}

// ---- 核心 ----
function init() {
    canvas = wx.createCanvas();
    ctx = canvas.getContext('2d');
    const info = wx.getSystemInfoSync();
    UI.w = info.windowWidth;
    UI.h = info.windowHeight;
    UI.s = Math.min(UI.w / 375, 1.5);
    canvas.width  = UI.w  * info.pixelRatio;
    canvas.height = UI.h * info.pixelRatio;
    ctx.scale(info.pixelRatio, info.pixelRatio);

    initStars();
    initClouds();

    // 随机放几株初始植物
    [[3,3,'rose'],[5,2,'sunf'],[2,5,'grass']].forEach(([col,row,pid]) => {
        const plant = PLANTS.find(p => p.id === pid);
        if (plant) gameState.garden.push({ col, row, plant, stage: 2, plantedAt: -60 });
    });

    wx.onTouchStart(onTouchStart);
    wx.onTouchMove(onTouchMove);
    wx.onTouchEnd(onTouchEnd);
    gameLoop();
}

// ---- 时间流逝 ----
function updateTime(dt) {
    gameState.timeFlow += dt;
    // 10秒 = 时间走0.1（白天到夜晚需要约100秒）
    if (gameState.timeFlow > 10) {
        gameState.timeFlow = 0;
        gameState.timeOfDay = (gameState.timeOfDay + 0.05) % 1;
    }
}

// ---- 植物状态更新 ----
function updatePlants(dt) {
    const now = Date.now();
    gameState.garden.forEach(cell => {
        if (cell.plant.growth === 0) return;
        const age = (now - cell.plantedAt) / 1000; // 秒
        if (age < cell.plant.growth * 0.5) cell.stage = 0;
        else if (age < cell.plant.growth) cell.stage = 1;
        else cell.stage = 2;
    });
}

// ---- 触摸处理 ----
let lastTouchX = 0, lastTouchY = 0;
let isDragging = false;

function onTouchStart(e) {
    const x = e.touches[0].clientX;
    const y = e.touches[0].clientY;
    lastTouchX = x; lastTouchY = y;
    isDragging = false;
    handleTap(x, y);
}

function onTouchMove(e) {
    const x = e.touches[0].clientX;
    const y = e.touches[0].clientY;
    if (Math.abs(x - lastTouchX) > 5 || Math.abs(y - lastTouchY) > 5) isDragging = true;
    lastTouchX = x; lastTouchY = y;
}

function onTouchEnd() { isDragging = false; }

function handleTap(x, y) {
    const shopY = UI.h - 115 * UI.s;
    const plantBtnY = shopY - 50 * UI.s;

    // 商店区域
    if (y > shopY) {
        const idx = Math.floor((x - 10 * UI.s) / (52 * UI.s));
        if (idx >= 0 && idx < PLANTS.length) {
            const plant = PLANTS[idx];
            if (gameState.money >= plant.price) {
                gameState.selectedPlant = plant;
                showToast(`已选 ${plant.emoji} ${plant.name}，点击格子放置`);
            } else {
                showToast('💰 金币不足');
            }
        }
        return;
    }

    // 植物按钮区域（当前选中查看）
    if (y > plantBtnY && y < shopY) {
        const idx = Math.floor((x - 10 * UI.s) / (52 * UI.s));
        if (idx >= 0 && idx < PLANTS.length) {
            const plant = PLANTS[idx];
            showToast(`${plant.emoji} ${plant.name} 💰${plant.price}`);
        }
        return;
    }

    // 花园格子区域
    if (x >= gridOX && x <= gridOX + GRID_COLS * gridCellSize &&
        y >= gridOY && y <= gridOY + GRID_ROWS * gridCellSize) {
        const col = clamp(Math.floor((x - gridOX) / gridCellSize), 0, GRID_COLS - 1);
        const row = clamp(Math.floor((y - gridOY) / gridCellSize), 0, GRID_ROWS - 1);

        // 已有格子 → 显示信息或覆盖
        const existing = gameState.garden.find(g => g.col === col && g.row === row);
        if (existing) {
            showToast(`${existing.emoji} ${existing.plant.name} (${existing.stage === 0 ? '种子' : existing.stage === 1 ? '幼苗' : '成熟'})`);
            return;
        }

        // 放置新植物
        if (gameState.selectedPlant) {
            gameState.garden.push({
                col, row,
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
    if (x > UI.w - 90 * UI.s && y < 50 * UI.s) {
        sellGarden();
    }

    // 日历/时间按钮（左上角）
    if (x < 80 * UI.s && y < 50 * UI.s) {
        cycleTime();
    }
}

function clamp(v, mn, mx) { return Math.max(mn, Math.min(mx, v)); }

function cycleTime() {
    // 手动切换时段
    const times = [0.1, 0.35, 0.55, 0.73, 0.9];
    const labels = ['🌙 深夜', '🌅 清晨', '☀️ 正午', '🌇 黄昏', '🌃 夜晚'];
    const idx = times.findIndex(t => Math.abs(t - gameState.timeOfDay) < 0.15);
    gameState.timeOfDay = times[(idx + 1) % times.length];
    showToast(labels[(idx + 1) % labels.length]);
}

function sellGarden() {
    const val = gameState.garden.reduce((s, g) => s + g.plant.price * 0.8, 0);
    const bonus = Math.floor(val + 200);
    gameState.money += bonus;
    gameState.garden = [];
    showToast(`🏡 出售花园 +${bonus} 金币`);
    checkLevelUp();
}

function checkLevelUp() {
    const next = gameState.level + 1;
    if (gameState.money >= next * 1200) {
        gameState.level = next;
        showToast(`⬆️ 升级！现在是 ${next} 级`);
    }
}

function showToast(msg) {
    toastMsg = msg;
    toastTimer = 150;
}

// ---- 游戏循环 ----
let lastTime = Date.now();
function gameLoop() {
    const now = Date.now();
    const dt = (now - lastTime) / 1000;
    lastTime = now;

    updateTime(dt);
    updatePlants(dt);
    updateParticles();
    updateRipples();
    updateClouds();
    render();
    if (toastTimer > 0) toastTimer--;

    requestAnimationFrame(gameLoop);
}

// ---- 渲染 ----
function render() {
    const s = UI.s, w = UI.w, h = UI.h;
    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, w, h);

    // 计算网格尺寸
    const gridW = Math.min(w - 20 * s, (h - 220 * s) / GRID_ROWS * GRID_COLS);
    gridCellSize = gridW / GRID_COLS;
    const totalGridH = GRID_ROWS * gridCellSize;
    gridOX = (w - gridW) / 2;
    gridOY = 65 * s;

    const sky = getSkyColors(gameState.timeOfDay);
    const night = isNight(gameState.timeOfDay);
    const dusk  = isDusk(gameState.timeOfDay);

    // ---- 天空背景 ----
    const skyGrd = ctx.createLinearGradient(0, 0, 0, h);
    skyGrd.addColorStop(0, sky.top);
    skyGrd.addColorStop(1, sky.bot);
    ctx.fillStyle = skyGrd;
    ctx.fillRect(0, 0, w, h);

    // 星星
    const starAlpha = getStarAlpha(gameState.timeOfDay);
    if (starAlpha > 0) {
        stars.forEach(star => {
            const tw = Math.sin(star.twinkle + Date.now() * 0.002) * 0.5 + 0.5;
            ctx.fillStyle = `rgba(255,255,255,${starAlpha * tw})`;
            ctx.beginPath();
            ctx.arc(star.x / 100 * w, star.y / 100 * h, star.size * s, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    // 云朵
    if (!night) {
        gameState.clouds.forEach(c => {
            ctx.save();
            ctx.globalAlpha = c.opacity * (dusk ? 0.5 : 0.8);
            ctx.fillStyle = dusk ? '#f0a0a0' : '#fff';
            // 画云朵形状（多个圆叠在一起）
            const oy = c.y * s;
            const ox = c.x;
            const sc = c.scale * s;
            ctx.beginPath();
            ctx.arc(ox, oy, 18 * sc, 0, Math.PI * 2);
            ctx.arc(ox + 22 * sc, oy - 8 * sc, 14 * sc, 0, Math.PI * 2);
            ctx.arc(ox + 40 * sc, oy, 16 * sc, 0, Math.PI * 2);
            ctx.arc(ox + 60 * sc, oy - 4 * sc, 12 * sc, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });
    }

    // ---- 地面 ----
    // 外围草地
    ctx.fillStyle = night ? '#0d2b0d' : '#2d6a2d';
    ctx.fillRect(0, gridOY - 8 * s, w, totalGridH + 16 * s);

    // 花园地块
    const gridBgGrd = ctx.createLinearGradient(gridOX, gridOY, gridOX, gridOY + totalGridH);
    if (night) {
        gridBgGrd.addColorStop(0, '#1a3d1a');
        gridBgGrd.addColorStop(1, '#0f2b0f');
    } else {
        gridBgGrd.addColorStop(0, '#3a8a3a');
        gridBgGrd.addColorStop(1, '#2d6a2d');
    }
    ctx.fillStyle = gridBgGrd;
    ctx.fillRect(gridOX - 3 * s, gridOY - 3 * s, GRID_COLS * gridCellSize + 6 * s, totalGridH + 6 * s);

    // ---- 格子 ----
    for (let row = 0; row < GRID_ROWS; row++) {
        for (let col = 0; col < GRID_COLS; col++) {
            const cx = gridOX + col * gridCellSize;
            const cy = gridOY + row * gridCellSize;
            const even = (row + col) % 2 === 0;

            if (night) {
                ctx.fillStyle = even ? '#1a3d1a' : '#153015';
            } else {
                ctx.fillStyle = even ? '#4a9a4a' : '#3d8a3d';
            }
            ctx.fillRect(cx + 1, cy + 1, gridCellSize - 2, gridCellSize - 2);

            // 格子草地纹理
            if (!night) {
                ctx.fillStyle = even ? 'rgba(100,200,100,0.15)' : 'rgba(80,180,80,0.15)';
                ctx.fillRect(cx + 1, cy + 1, gridCellSize - 2, gridCellSize - 2);
            }
        }
    }

    // ---- 花园格子内元素（绘制排序） ----
    // 排序：地面类 → 花草 → 树 → 水
    const sorted = [...gameState.garden].sort((a, b) => {
        const order = { ground: 0, flower: 1, tree: 2, deco: 3, water: 4 };
        return (order[a.plant.type] || 0) - (order[b.plant.type] || 0);
    });

    sorted.forEach(cell => {
        const cx = gridOX + cell.col * gridCellSize + gridCellSize / 2;
        const cy = gridOY + cell.row * gridCellSize + gridCellSize / 2;
        const sz  = gridCellSize * 0.72;

        // 水池效果
        if (cell.plant.type === 'water') {
            const rippleColor = night ? 'rgba(100,200,255,0.3)' : 'rgba(100,200,255,0.5)';
            // 水底
            ctx.fillStyle = night ? '#1a4a6e' : '#4fc3f7';
            ctx.fillRect(cx - sz / 2, cy - sz / 2, sz, sz);
            // 水波光
            const waveOffset = Date.now() * 0.002;
            for (let i = 0; i < 3; i++) {
                const wx = cx - sz / 2 + (Math.sin(waveOffset + i) * 0.3 + 0.5) * sz;
                const wy = cy - sz / 2 + (Math.cos(waveOffset * 1.3 + i) * 0.3 + 0.5) * sz;
                ctx.fillStyle = 'rgba(255,255,255,0.3)';
                ctx.beginPath();
                ctx.ellipse(wx, wy, sz * 0.15, sz * 0.06, waveOffset, 0, Math.PI * 2);
                ctx.fill();
            }
            // 涟漪
            rippleList.forEach(rip => {
                if (Math.abs(rip.cx - cx) < sz && Math.abs(rip.cy - cy) < sz) {
                    ctx.strokeStyle = `rgba(255,255,255,${rip.t * 0.6})`;
                    ctx.lineWidth = 1.5;
                    ctx.beginPath();
                    ctx.arc(rip.cx, rip.cy, rip.r, 0, Math.PI * 2);
                    ctx.stroke();
                }
            });
            // 喷泉
            if (cell.plant.id === 'fount') {
                ctx.font = `${sz}px sans-serif`;
                ctx.textAlign = 'center';
                ctx.fillText('⛲', cx, cy + sz * 0.35);
                // 喷泉粒子
                for (let j = 0; j < 5; j++) {
                    const t = ((Date.now() * 0.003 + j * 0.2) % 1);
                    const px = cx + Math.sin(j + Date.now() * 0.002) * sz * 0.25;
                    const py = cy - t * sz * 0.6;
                    ctx.fillStyle = `rgba(173,216,230,${1 - t})`;
                    ctx.beginPath();
                    ctx.arc(px, py, 2 * s, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
            return;
        }

        // 选中格子高亮
        if (gameState.selectedPlant) {
            const col0 = Math.floor((lastTouchX - gridOX) / gridCellSize);
            const row0 = Math.floor((lastTouchY - gridOY) / gridCellSize);
            if (col === col0 && row === row0) {
                ctx.fillStyle = 'rgba(100,255,150,0.25)';
                ctx.fillRect(cx - sz / 2, cy - sz / 2, sz, sz);
            }
        }

        // 地面类
        if (cell.plant.type === 'ground') {
            ctx.font = `${sz}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.fillText(cell.plant.emoji, cx, cy + sz * 0.35);
            return;
        }

        // 栅栏/小路（作为地面装饰，不盖住其他）
        if (cell.plant.id === 'fence' || cell.plant.id === 'step') {
            ctx.font = `${sz * 0.8}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.fillText(cell.plant.emoji, cx, cy + sz * 0.35);
            return;
        }

        // 阴影
        const shadowAlpha = night ? 0.2 : 0.25;
        ctx.font = `${sz * 0.9}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillStyle = `rgba(0,0,0,${shadowAlpha})`;
        ctx.fillText(getPlantEmoji(cell), cx + 3 * s, cy + sz * 0.38 + 3 * s);

        // 植物本体
        ctx.fillStyle = night ? '#c0d8c0' : '#fff';
        ctx.fillText(getPlantEmoji(cell), cx, cy + sz * 0.38);

        // 装饰物（灯/灯笼/石头/长椅）
        if (cell.plant.type === 'deco') {
            if (cell.plant.id === 'lamp' || cell.plant.id === 'lantern') {
                // 夜晚发光效果
                if (night) {
                    const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, gridCellSize * 1.2);
                    grd.addColorStop(0, 'rgba(255, 200, 50, 0.5)');
                    grd.addColorStop(1, 'rgba(255, 200, 50, 0)');
                    ctx.fillStyle = grd;
                    ctx.fillRect(cx - gridCellSize * 1.2, cy - gridCellSize * 1.2, gridCellSize * 2.4, gridCellSize * 2.4);
                }
            }
        }
    });

    // ---- 粒子 ----
    drawParticles();

    // ---- 顶部状态栏 ----
    renderTopBar(s, w, h, sky, night);

    // ---- 商店 ----
    renderShop(s, w, h, night);

    // ---- Toast ----
    renderToast(s, w, h);
}

function getPlantEmoji(cell) {
    if (cell.stage === 0) return cell.plant.emoji0 || '🌱';
    if (cell.stage === 1) return cell.plant.emoji2 || cell.plant.emoji;
    return cell.plant.emoji;
}

function renderTopBar(s, w, h, sky, night) {
    // 毛玻璃顶栏
    ctx.fillStyle = night ? 'rgba(0,0,20,0.6)' : 'rgba(255,255,255,0.15)';
    roundRect(ctx, 8 * s, 8 * s, w - 16 * s, 48 * s, 14 * s);
    ctx.fill();
    if (!night) {
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.lineWidth = 1;
        ctx.stroke();
    }

    // 时间切换按钮
    ctx.font = `${12 * s}px sans-serif`;
    ctx.textAlign = 'left';
    ctx.fillStyle = night ? '#ffd700' : '#fff';
    ctx.fillText(getSkyColors(gameState.timeOfDay).name + ' 🌄', 18 * s, 35 * s);

    // 金币
    ctx.font = `bold ${15 * s}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffd700';
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 3;
    ctx.fillText(`💰 ${gameState.money}`, w / 2, 36 * s);
    ctx.shadowBlur = 0;

    // 等级
    ctx.font = `${13 * s}px sans-serif`;
    ctx.textAlign = 'right';
    ctx.fillStyle = '#aaffaa';
    ctx.fillText(`Lv.${gameState.level}`, w - 100 * s, 36 * s);

    // 出售按钮
    ctx.fillStyle = night ? 'rgba(255,80,80,0.8)' : 'rgba(255,80,80,0.9)';
    roundRect(ctx, w - 90 * s, 14 * s, 80 * s, 28 * s, 14 * s);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = `bold ${11 * s}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('🏡 出售', w - 50 * s, 33 * s);

    // 选中提示
    if (gameState.selectedPlant) {
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        roundRect(ctx, w / 2 - 80 * s, 60 * s, 160 * s, 28 * s, 12 * s);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = `${12 * s}px sans-serif`;
        ctx.fillText(`已选 ${gameState.selectedPlant.emoji} ${gameState.selectedPlant.name}`, w / 2, 79 * s);
    }
}

function renderShop(s, w, h, night) {
    const shopY = h - 115 * s;
    const shopH = 105 * s;

    // 毛玻璃商店背景
    ctx.fillStyle = night ? 'rgba(0,10,20,0.75)' : 'rgba(255,255,255,0.15)';
    roundRect(ctx, 8 * s, shopY, w - 16 * s, shopH, 16 * s);
    ctx.fill();
    if (!night) {
        ctx.strokeStyle = 'rgba(255,255,255,0.25)';
        ctx.lineWidth = 1;
        ctx.stroke();
    }

    // 商店标签
    ctx.fillStyle = night ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.7)';
    ctx.font = `bold ${11 * s}px sans-serif`;
    ctx.textAlign = 'left';
    ctx.fillText('🌱 花园商店', 18 * s, shopY + 16 * s);

    // 物品数量
    ctx.textAlign = 'right';
    ctx.fillText(`${gameState.garden.length} 株植物`, w - 18 * s, shopY + 16 * s);

    // 物品网格（两行）
    const ITEM_W = 50 * s;
    const ITEM_H = 34 * s;
    const itemStartX = 10 * s;
    const itemStartY = shopY + 22 * s;
    const COLS = Math.ceil(w / (ITEM_W + 4 * s));

    PLANTS.forEach((plant, i) => {
        const col = i % COLS;
        const row = Math.floor(i / COLS);
        const ix = itemStartX + col * (ITEM_W + 4 * s);
        const iy = itemStartY + row * (ITEM_H + 3 * s);

        if (iy + ITEM_H > shopY + shopH - 4 * s) return; // 超出

        const canAfford = gameState.money >= plant.price;
        const selected  = gameState.selectedPlant?.id === plant.id;

        ctx.fillStyle = selected
            ? (night ? 'rgba(100,255,150,0.3)' : 'rgba(100,255,150,0.4)')
            : (night ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.2)');
        roundRect(ctx, ix, iy, ITEM_W, ITEM_H, 8 * s);
        ctx.fill();
        if (selected) {
            ctx.strokeStyle = '#4ade80';
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        // 植物图标
        ctx.font = `${18 * s}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(canAfford ? plant.emoji : '🔒', ix + ITEM_W / 2, iy + 16 * s);

        // 价格
        ctx.font = `${9 * s}px sans-serif`;
        ctx.fillStyle = canAfford ? '#ffd700' : '#666';
        ctx.fillText(canAfford ? `💰${plant.price}` : '不足', ix + ITEM_W / 2, iy + 30 * s);
    });
}

function renderToast(s, w, h) {
    if (toastTimer <= 0) return;
    const alpha = Math.min(0.9, toastTimer / 40);
    ctx.fillStyle = `rgba(0,0,0,${alpha})`;
    roundRect(ctx, w / 2 - 90 * s, h / 2 - 20 * s, 180 * s, 36 * s, 18 * s);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = `${13 * s}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(toastMsg, w / 2, h / 2 + 6 * s);
}

// ---- 工具函数 ----
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
