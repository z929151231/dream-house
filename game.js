// ============================================================
// 梦想小屋 - 高级3D等距渲染系统
// 每个地砖都有厚度，所有物体都有3D立体感
// ============================================================

const ZONES = [
    { id:0, name:'庄园', cost:0, row0:3, col0:3, w:3, h:3, isBase:true },
    { id:1, name:'花园', cost:80, row0:0, col0:0, w:3, h:3 },
    { id:2, name:'池塘', cost:150, row0:0, col0:6, w:3, h:3 },
    { id:3, name:'森林', cost:280, row0:3, col0:0, w:3, h:3 },
    { id:4, name:'露台', cost:450, row0:3, col0:6, w:3, h:3 },
    { id:5, name:'庭院', cost:700, row0:6, col0:3, w:3, h:3 },
];

const SHOP_ITEMS = [
    // 树木（3D效果）
    { id:'sakura', name:'樱花树', price:30, growth:10, kind:'tree', h:55, w:40,
      c:{trunk:'#6d4c41', c1:'#f48fb1', c2:'#f06292', c3:'#ec407a', leaf:'#c8e6c9'} },
    { id:'pine', name:'松树', price:80, growth:20, kind:'tree', h:65, w:35,
      c:{trunk:'#5d4037', c1:'#1b5e20', c2:'#2e7d32', c3:'#388e3c', leaf:'#66bb6a'} },
    { id:'maple', name:'枫树', price:25, growth:12, kind:'tree', h:50, w:38,
      c:{trunk:'#5d4037', c1:'#ff7043', c2:'#ff5722', c3:'#f4511e', leaf:'#ffccbc'} },
    { id:'willow', name:'垂柳', price:60, growth:15, kind:'tree', h:60, w:45,
      c:{trunk:'#5d4037', c1:'#a5d6a7', c2:'#81c784', c3:'#66bb6a', leaf:'#c8e6c9'} },
    { id:'bush', name:'灌木', price:25, growth:8, kind:'tree', h:28, w:30,
      c:{trunk:'#4e342e', c1:'#388e3c', c2:'#43a047', c3:'#4caf50', leaf:'#a5d6a7'} },
    // 花朵（3D效果）
    { id:'rose', name:'玫瑰', price:20, growth:8, kind:'flower', h:22, w:18,
      c:{stem:'#2e7d32', p1:'#e91e63', p2:'#d81b60', p3:'#c2185b', center:'#ffd54f'} },
    { id:'sunf', name:'向日葵', price:15, growth:6, kind:'flower', h:28, w:22,
      c:{stem:'#388e3c', p1:'#ffc107', p2:'#ffb300', p3:'#ff8f00', center:'#5d4037'} },
    { id:'tulip', name:'郁金香', price:15, growth:6, kind:'flower', h:24, w:16,
      c:{stem:'#43a047', p1:'#e91e63', p2:'#d81b60', p3:'#c2185b', center:'#fff176'} },
    { id:'lavnd', name:'薰衣草', price:25, growth:8, kind:'flower', h:26, w:14,
      c:{stem:'#388e3c', p1:'#9c27b0', p2:'#7b1fa2', p3:'#6a1b9a', center:'#ce93d8'} },
    { id:'hydra', name:'绣球', price:35, growth:10, kind:'flower', h:20, w:20,
      c:{stem:'#2e7d32', p1:'#2196f3', p2:'#1976d2', p3:'#1565c0', center:'#fff9c4'} },
    { id:'butrf', name:'蝴蝶兰', price:30, growth:8, kind:'flower', h:22, w:18,
      c:{stem:'#388e3c', p1:'#e1bee7', p2:'#ce93d8', p3:'#ba68c8', center:'#fff176'} },
    // 水景
    { id:'pond', name:'池塘', price:150, kind:'water', h:12, w:40,
      c:{water:'#4fc3f7', deep:'#0288d1', edge:'#78909c', foam:'#b3e5fc'} },
    { id:'fount', name:'喷泉', price:200, kind:'water', h:35, w:30,
      c:{water:'#4fc3f7', stone:'#90a4ae', foam:'#e1f5fe'} },
    // 装饰（3D效果）
    { id:'rock', name:'石头', price:10, kind:'deco', h:18, w:22,
      c:{light:'#bdbdbd', mid:'#9e9e9e', dark:'#757575', highlight:'#f5f5f5'} },
    { id:'lamp', name:'路灯', price:50, kind:'deco', h:45, w:14,
      c:{pole:'#546e7a', metal:'#78909c', light:'#fff9c4', glow:'#fff176'} },
    { id:'bench', name:'长椅', price:40, kind:'deco', h:22, w:30,
      c:{wood:'#8d6e63', dark:'#6d4c41', metal:'#455a64', cushion:'#a1887f'} },
    { id:'fence', name:'栅栏', price:15, kind:'deco', h:18, w:22,
      c:{wood:'#a1887f', dark:'#8d6e63', light:'#bcaaa4'} },
    { id:'cat', name:'猫咪', price:120, kind:'deco', h:20, w:16,
      c:{body:'#ff9800', dark:'#f57c00', white:'#fff3e0', eye:'#1a1a1a'} },
    { id:'bunny', name:'兔子', price:90, kind:'deco', h:18, w:14,
      c:{body:'#fafafa', dark:'#eeeeee', pink:'#f8bbd9', eye:'#1a1a1a'} },
    { id:'frog', name:'青蛙', price:70, kind:'deco', h:14, w:16,
      c:{body:'#4caf50', belly:'#c8e6c9', dark:'#388e3c', eye:'#fdd835'} },
    { id:'hedge', name:'树篱', price:35, kind:'deco', h:24, w:30,
      c:{c1:'#388e3c', c2:'#2e7d32', c3:'#1b5e20', light:'#4caf50'} },
    { id:'angelf', name:'天使像', price:180, kind:'deco', h:40, w:20,
      c:{stone:'#eceff1', dark:'#cfd8dc', wing:'#ffffff', gold:'#ffd700'} },
    { id:'windmill', name:'风车', price:160, kind:'deco', h:48, w:18,
      c:{wood:'#8d6e63', dark:'#6d4c41', blade:'#fafafa', roof:'#bcaaa4'} },
    { id:'step', name:'石板', price:5, kind:'ground', h:4, w:20,
      c:{top:'#bdbdbd', side:'#9e9e9e', dark:'#757575'} },
    { id:'grass', name:'草坪', price:10, growth:3, kind:'ground', h:4, w:20,
      c:{top:'#4caf50', side:'#388e3c', dark:'#2e7d32'} },
];

const HOUSE_LEVELS = [
    { w:48, h:35, rh:22, colors:{wall:'#d7ccc8', wallD:'#bcaaa4', wallL:'#efebe9', roof:'#795548', roofD:'#5d4037', roofL:'#8d6e63', win:'#4fc3f7', winD:'#0288d1', door:'#6d4c41'} },
    { w:52, h:40, rh:26, colors:{wall:'#a1887f', wallD:'#8d6e63', wallL:'#bcaaa4', roof:'#6d4c41', roofD:'#5d4037', roofL:'#8d6e63', win:'#fff59d', winD:'#ffc107', door:'#5d4037'} },
    { w:58, h:48, rh:30, colors:{wall:'#ef9a9a', wallD:'#e57373', wallL:'#ffcdd2', roof:'#c62828', roofD:'#b71c1c', roofL:'#ef5350', win:'#fff176', winD:'#ffca28', door:'#4e342e'} },
    { w:65, h:58, rh:36, colors:{wall:'#f5f5f5', wallD:'#e0e0e0', wallL:'#ffffff', roof:'#37474f', roofD:'#263238', roofL:'#546e7a', win:'#4dd0e1', winD:'#00bcd4', door:'#37474f'} },
    { w:75, h:70, rh:45, colors:{wall:'#cfd8dc', wallD:'#b0bec5', wallL:'#eceff1', roof:'#37474f', roofD:'#263238', roofL:'#455a64', win:'#fff9c4', winD:'#ffee58', door:'#263238'} },
];

const gameState = {
    money: 9999, totalEarned: 0,
    zones: ZONES.map(z => ({...z, unlocked: z.id===0, garden:[]})),
    selectedZone: 0, selectedItem: null,
    timeOfDay: 0.42, toastMsg: '', toastTimer: 0,
    house: { level: 1 }, particles: [], rippleList: [],
};
let canvas, ctx, UI = {}, toastTimer = 0, frame = 0;

function init() {
    canvas = wx.createCanvas();
    ctx = canvas.getContext('2d');
    const info = wx.getSystemInfoSync();
    UI.w = info.windowWidth;
    UI.h = info.windowHeight;
    UI.s = Math.min(UI.w / 400, 1.4);
    const dpr = info.pixelRatio || 1;
    canvas.width = UI.w * dpr;
    canvas.height = UI.h * dpr;
    ctx.scale(dpr, dpr);
    wx.onTouchStart(onTouchStart);
    gameLoop();
}

// ============================================================
// 等距坐标系统（标准2:1比例）
// ============================================================
const TW = 72;   // 砖顶宽度(px)
const TH = 36;   // 砖顶高度(px)
const TSW = 12;  // 砖侧厚度(px)

function toScreen(col, row) {
    const s = UI.s;
    const cx = UI.w / 2;
    const cy = UI.h * 0.40;
    return {
        x: cx + (col - 1) * TW * s * 0.5 - (row - 1) * TW * s * 0.5,
        y: cy + (col - 1) * TH * s * 0.5 + (row - 1) * TH * s * 0.5,
        s
    };
}

function fromScreen(sx, sy) {
    const s = UI.s;
    const cx = UI.w / 2, cy = UI.h * 0.40;
    const dx = sx - cx, dy = sy - cy;
    return {
        col: Math.floor((dx / (TW*s*0.5) + dy / (TH*s*0.5)) / 2 + 1),
        row: Math.floor((dy / (TH*s*0.5) - dx / (TW*s*0.5)) / 2 + 1),
    };
}

// ============================================================
// 颜色工具
// ============================================================
function hex(c) {
    if (!c) return '#888';
    if (c.startsWith('#')) return c;
    return '#' + c;
}
function shade(c, amt) {
    if (!c || !c.startsWith('#') || c.length < 7) return c || '#888';
    let r = parseInt(c.slice(1,3),16), g = parseInt(c.slice(3,5),16), b = parseInt(c.slice(5,7),16);
    r = Math.max(0,Math.min(255,r+amt)); g = Math.max(0,Math.min(255,g+amt)); b = Math.max(0,Math.min(255,b+amt));
    return '#' + [r,g,b].map(v => v.toString(16).padStart(2,'0')).join('');
}
function alpha(c, a) {
    if (!c || !c.startsWith('#')) return c;
    let r = parseInt(c.slice(1,3),16), g = parseInt(c.slice(3,5),16), b = parseInt(c.slice(5,7),16);
    return 'rgba('+r+','+g+','+b+','+a+')';
}
function grad(ctx, x1,y1,c1,x2,y2,c2) {
    const g = ctx.createLinearGradient(x1,y1,x2,y2);
    g.addColorStop(0,c1); g.addColorStop(1,c2); return g;
}
function rgrad(ctx, cx,cy,ri,r,c1,c2) {
    // 防御：确保所有参数都是有效类型
    ri = (typeof ri === 'number' && ri >= 0) ? ri : 0;
    r  = (typeof r  === 'number' && r  >  0) ? r  : 1;
    c1 = (typeof c1 === 'string' && c1 !== '') ? c1 : 'rgba(128,128,128,0.5)';
    c2 = (typeof c2 === 'string' && c2 !== '') ? c2 : 'rgba(0,0,0,0)';
    const g = ctx.createRadialGradient(cx,cy,ri,cx,cy,r);
    g.addColorStop(0,c1); g.addColorStop(1,c2); return g;
}

// ============================================================
// 天空与氛围
// ============================================================
function skyOf(t) {
    if (t<0.15) return {t:'#0d1b4b',m:'#1a237e',b:'#1a3a1a',name:'深夜',n:true};
    if (t<0.25) return {t:'#ff7043',m:'#ff8a65',b:'#6d4c41',name:'黎明',n:false};
    if (t<0.5)  return {t:'#4fc3f7',m:'#81d4fa',b:'#a5d6a7',name:'白天',n:false};
    if (t<0.75) return {t:'#ff8a65',m:'#ffab91',b:'#8d6e63',name:'黄昏',n:false};
    return {t:'#1a237e',m:'#283593',b:'#1a3a1a',name:'夜晚',n:true};
}

// ============================================================
// 渲染入口
// ============================================================
function render() {
    const s = UI.s, w = UI.w, h = UI.h;
    const sky = skyOf(gameState.timeOfDay);
    frame++;
    
    // 天空渐变
    const sg = ctx.createLinearGradient(0,0,0,h*0.52);
    sg.addColorStop(0,sky.t); sg.addColorStop(0.55,sky.m); sg.addColorStop(1,sky.b);
    ctx.fillStyle = sg;
    ctx.fillRect(0,0,w,h);
    
    // 星星（夜晚）
    if (sky.n) {
        for (let i=0;i<80;i++) {
            const x=(i*53+frame*0.02)%w, y=(i*37)%(h*0.38);
            const tw=Math.sin(frame*0.04+i*2.3)*0.4+0.6;
            ctx.fillStyle='rgba(255,255,240,'+tw+')';
            ctx.beginPath(); ctx.arc(x,y,1.3,0,Math.PI*2); ctx.fill();
        }
    }
    
    // 云朵（白天）
    if (!sky.n) renderClouds(s, w, h);
    
    // 远景山丘
    renderHills(s, w, h, sky.n);
    
    // 游戏区域
    renderZone(s, w, h, sky);
    
    // 涟漪粒子
    renderRipples(s, w, h);
    
    // UI层
    renderTopBar(s, w, h, sky);
    renderZoneTabs(s, w, h, sky);
    renderShop(s, w, h, sky);
    renderToast(s, w, h);
}

function renderClouds(s, w, h) {
    for (let i=0;i<6;i++) {
        const cx=(i*150+frame*0.08*(i%3?1:-1)+w*0.3)%(w+200)-100;
        const cy=60*s+i*25*s;
        ctx.fillStyle='rgba(255,255,255,0.7)';
        [[cx,cy,40*s],[cx+30*s,cy-8*s,30*s],[cx-25*s,cy+5*s,28*s],[cx+55*s,cy+3*s,25*s]].forEach(([x,y,r])=>{
            ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill();
        });
    }
}

function renderHills(s, w, h, night) {
    // 远山
    const c1 = night?'#1a2f1a':'#66bb6a';
    const c2 = night?'#0d1f0d':'#43a047';
    ctx.fillStyle=c1;
    ctx.beginPath();
    ctx.moveTo(0,h*0.38);
    ctx.bezierCurveTo(w*0.2,h*0.25,w*0.38,h*0.20,w*0.55,h*0.30);
    ctx.bezierCurveTo(w*0.72,h*0.38,w*0.88,h*0.28,w,h*0.35);
    ctx.lineTo(w,h*0.50); ctx.lineTo(0,h*0.50); ctx.closePath(); ctx.fill();
    ctx.fillStyle=c2;
    ctx.beginPath();
    ctx.moveTo(0,h*0.43);
    ctx.bezierCurveTo(w*0.15,h*0.36,w*0.35,h*0.40,w*0.5,h*0.38);
    ctx.bezierCurveTo(w*0.68,h*0.36,w*0.82,h*0.42,w,h*0.40);
    ctx.lineTo(w,h*0.52); ctx.lineTo(0,h*0.52); ctx.closePath(); ctx.fill();
}

// ============================================================
// 区域渲染核心
// ============================================================
function renderZone(s, w, h, sky) {
    const zone = gameState.zones[gameState.selectedZone];
    const night = sky.n;
    
    // 地面阴影
    const gc = rgrad(ctx, w/2, h*0.40, 0, w/2, h*0.40, 140*s);
    gc.addColorStop(0, night?'rgba(30,60,30,0.6)':'rgba(50,100,50,0.4)');
    gc.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=gc;
    ctx.fillRect(0,0,w,h);
    
    if (!zone.unlocked) { renderLocked(s,w,h,zone,night); return; }
    
    // 收集所有可绘制物体（地砖+物体）
    const draws = [];
    
    // 地砖
    for (let row=0;row<3;row++) for (let col=0;col<3;col++) {
        draws.push({kind:'tile',row,col});
    }
    
    // 物体
    if (zone.isBase) draws.push({kind:'house',row:1,col:1});
    zone.garden.forEach(cell => {
        const lc=cell.col-zone.col0, lr=cell.row-zone.row0;
        if (lc>=0&&lc<3&&lr>=0&&lr<3) draws.push({kind:'obj',row:lr,col:lc,cell});
    });
    
    // 深度排序（行递增=越靠前）
    draws.sort((a,b)=>{
        if (a.row!==b.row) return a.row-b.row;
        if (a.col!==b.col) return a.col-b.col;
        return (a.kind==='tile'?0:a.kind==='house'?1:2)-(b.kind==='tile'?0:b.kind==='house'?1:2);
    });
    
    draws.forEach(d => {
        if (d.kind==='tile') renderTile(d.row,d.col,s,zone,night);
        else if (d.kind==='house') renderHouse(s,zone,night);
        else renderObj(d.cell,s,zone,night);
    });
}

// ============================================================
// 厚实地砖渲染（核心3D效果）
// ============================================================
function renderTile(row, col, s, zone, night) {
    const {x,y} = toScreen(col,row);
    const tw=TW*s, th=TH*s, tsw=TSW*s;
    const wc=zone.col0+col, wr=zone.row0+row;
    const cell=zone.garden.find(g=>g.col===wc&&g.row===wr);
    
    // 特殊处理：水面地砖
    if (cell&&cell.item.kind==='water') { renderWaterTile(x,y,tw,th,tsw,s,cell,night); return; }
    if (cell&&cell.item.kind==='ground') { renderGroundTile(x,y,tw,th,tsw,s,cell,night); return; }
    
    const even=(col+row)%2===0;
    const topC= night?(even?'#1a3a1a':'#152e15'):(even?'#81c784':'#66bb6a');
    const leftC=night?shade(topC,-25):shade(topC,-20);
    const rightC=night?shade(topC,-45):shade(topC,-35);
    
    // 侧边（左面 - 向左下）
    ctx.fillStyle=leftC;
    ctx.beginPath();
    ctx.moveTo(x-tw/2,y);
    ctx.lineTo(x,y+th);
    ctx.lineTo(x,y+th+tsw);
    ctx.lineTo(x-tw/2,y+tsw);
    ctx.closePath(); ctx.fill();
    
    // 侧边（右面 - 向右下）
    ctx.fillStyle=rightC;
    ctx.beginPath();
    ctx.moveTo(x+tw/2,y);
    ctx.lineTo(x,y+th);
    ctx.lineTo(x,y+th+tsw);
    ctx.lineTo(x+tw/2,y+tsw);
    ctx.closePath(); ctx.fill();
    
    // 顶面（菱形）
    ctx.fillStyle=topC;
    ctx.beginPath();
    ctx.moveTo(x,y-th);
    ctx.lineTo(x+tw/2,y);
    ctx.lineTo(x,y+th);
    ctx.lineTo(x-tw/2,y);
    ctx.closePath(); ctx.fill();
    
    // 顶面纹理线（草地感）
    if (!night) {
        ctx.strokeStyle=alpha(topC,0.15);
        ctx.lineWidth=0.8;
        // 对角纹理
        ctx.beginPath(); ctx.moveTo(x-tw*0.3,y-th*0.3); ctx.lineTo(x+tw*0.1,y+th*0.1); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x-tw*0.1,y-th*0.1); ctx.lineTo(x+tw*0.3,y+th*0.3); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x+tw*0.05,y-th*0.4); ctx.lineTo(x-tw*0.2,y+th*0.15); ctx.stroke();
    }
    
    // 顶面边缘高光
    ctx.strokeStyle=alpha('#fff',night?0.05:0.12);
    ctx.lineWidth=1;
    ctx.beginPath();
    ctx.moveTo(x,y-th); ctx.lineTo(x+tw/2,y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x,y-th); ctx.lineTo(x-tw/2,y);
    ctx.stroke();
}

function renderWaterTile(x, y, tw, th, tsw, s, cell, night) {
    const c=cell.item.c;
    // 侧边
    ctx.fillStyle=night?shade(c.edge,-30):shade(c.edge,-15);
    ctx.beginPath();
    ctx.moveTo(x-tw/2,y); ctx.lineTo(x,y+th); ctx.lineTo(x,y+th+tsw); ctx.lineTo(x-tw/2,y+tsw); ctx.closePath(); ctx.fill();
    ctx.fillStyle=night?shade(c.edge,-50):shade(c.edge,-35);
    ctx.beginPath();
    ctx.moveTo(x+tw/2,y); ctx.lineTo(x,y+th); ctx.lineTo(x,y+th+tsw); ctx.lineTo(x+tw/2,y+tsw); ctx.closePath(); ctx.fill();
    // 水面
    const wg = rgrad(ctx, x-tw*0.2, y-th*0.3, 0, x, y, tw*0.6);
    wg.addColorStop(0, night?c.deep:c.foam);
    wg.addColorStop(0.5, night?'#0d47a1':c.water);
    wg.addColorStop(1, night?'#01579b':'#0288d1');
    ctx.fillStyle=wg;
    ctx.beginPath();
    ctx.moveTo(x,y-th); ctx.lineTo(x+tw/2,y); ctx.lineTo(x,y+th); ctx.lineTo(x-tw/2,y); ctx.closePath(); ctx.fill();
    // 波纹
    const wave=(Math.sin(frame*0.05+cell.col)*0.5+0.5);
    ctx.strokeStyle=alpha(c.foam,night?0.1:wave*0.35);
    ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.ellipse(x, y, tw*0.3*(0.7+wave*0.3), th*0.15*(0.7+wave*0.3), 0, 0, Math.PI*2); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(x+tw*0.1, y-th*0.1, tw*0.15, th*0.08, 0.3, 0, Math.PI*2); ctx.stroke();
}

function renderGroundTile(x, y, tw, th, tsw, s, cell, night) {
    const c=cell.item.c;
    const topC=cell.item.id==='step'?(night?'#757575':'#bdbdbd'):(night?'#2a5a2a':'#66bb6a');
    ctx.fillStyle=night?shade(topC,-25):shade(topC,-20);
    ctx.beginPath();
    ctx.moveTo(x-tw/2,y); ctx.lineTo(x,y+th); ctx.lineTo(x,y+th+tsw); ctx.lineTo(x-tw/2,y+tsw); ctx.closePath(); ctx.fill();
    ctx.fillStyle=night?shade(topC,-45):shade(topC,-35);
    ctx.beginPath();
    ctx.moveTo(x+tw/2,y); ctx.lineTo(x,y+th); ctx.lineTo(x,y+th+tsw); ctx.lineTo(x+tw/2,y+tsw); ctx.closePath(); ctx.fill();
    ctx.fillStyle=topC;
    ctx.beginPath();
    ctx.moveTo(x,y-th); ctx.lineTo(x+tw/2,y); ctx.lineTo(x,y+th); ctx.lineTo(x-tw/2,y); ctx.closePath(); ctx.fill();
    // 石板纹理
    if (cell.item.id==='step') {
        ctx.strokeStyle=night?'rgba(0,0,0,0.2)':'rgba(0,0,0,0.1)';
        ctx.lineWidth=1;
        ctx.beginPath(); ctx.moveTo(x-tw*0.1,y-th*0.5); ctx.lineTo(x+tw*0.2,y+th*0.2); ctx.stroke();
    }
}

// ============================================================
// 3D房屋渲染
// ============================================================
function renderHouse(s, zone, night) {
    const {x,y} = toScreen(1,1);
    const lvl=HOUSE_LEVELS[gameState.house.level-1];
    const w=lvl.w*UI.s, h=lvl.h*UI.s, rh=lvl.rh*UI.s, tsw=TSW*UI.s;
    const hx=x, hy=y-TH*UI.s*0.5; // 房屋底部中心在砖顶面
    
    // 整体阴影
    ctx.fillStyle='rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.ellipse(hx+6*UI.s, hy+8*UI.s, w*0.8, w*0.35, 0, 0, Math.PI*2); ctx.fill();
    
    // === 房屋底座 ===
    const baseH=8*UI.s;
    ctx.fillStyle=night?shade('#78909c',-30):'#90a4ae';
    ctx.beginPath();
    ctx.moveTo(hx-w*0.55,hy);
    ctx.lineTo(hx,hy-h*0.3);
    ctx.lineTo(hx+w*0.55,hy);
    ctx.lineTo(hx,hy+h*0.3);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle=night?'#607d8b':'#78909c';
    ctx.beginPath();
    ctx.moveTo(hx-w*0.55,hy);
    ctx.lineTo(hx,hy+h*0.3);
    ctx.lineTo(hx,hy+h*0.3+baseH);
    ctx.lineTo(hx-w*0.55,hy+baseH); ctx.closePath(); ctx.fill();
    ctx.fillStyle=night?'#546e7a':'#607d8b';
    ctx.beginPath();
    ctx.moveTo(hx+w*0.55,hy);
    ctx.lineTo(hx,hy+h*0.3);
    ctx.lineTo(hx,hy+h*0.3+baseH);
    ctx.lineTo(hx+w*0.55,hy+baseH); ctx.closePath(); ctx.fill();
    
    // === 墙体 ===
    const wallTop=hy-h*0.3-baseH;
    const wallBottom=hy+h*0.3-baseH;
    // 左墙面
    const leftWallGrd=grad(ctx, hx-w*0.55,wallTop, shade(lvl.colors.wallL,-5), hx,wallBottom, lvl.colors.wallD);
    ctx.fillStyle=leftWallGrd;
    ctx.beginPath();
    ctx.moveTo(hx-w*0.55,hy);
    ctx.lineTo(hx,hy-h*0.3);
    ctx.lineTo(hx,wallTop);
    ctx.lineTo(hx-w*0.55,wallTop+h*0.3-baseH); ctx.closePath(); ctx.fill();
    // 右墙面
    const rightWallGrd=grad(ctx, hx+w*0.55,wallTop, shade(lvl.colors.wall,10), hx,wallBottom, shade(lvl.colors.wallD,-20));
    ctx.fillStyle=rightWallGrd;
    ctx.beginPath();
    ctx.moveTo(hx+w*0.55,hy);
    ctx.lineTo(hx,hy-h*0.3);
    ctx.lineTo(hx,wallTop);
    ctx.lineTo(hx+w*0.55,wallTop+h*0.3-baseH); ctx.closePath(); ctx.fill();
    
    // 门
    const doorW=w*0.18, doorH=h*0.28;
    const doorX=hx-w*0.05, doorY=wallBottom-doorH;
    ctx.fillStyle=night?'#3e2723':lvl.colors.door;
    ctx.beginPath();
    ctx.moveTo(doorX-doorW/2,doorY+doorH);
    ctx.lineTo(doorX,doorY+doorH-h*0.15);
    ctx.lineTo(doorX,doorY);
    ctx.lineTo(doorX-doorW/2,doorY+h*0.15-baseH); ctx.closePath(); ctx.fill();
    // 门把手
    ctx.fillStyle=night?'#ffd700':'#bcaaa4';
    ctx.beginPath(); ctx.arc(doorX+doorW*0.2,doorY+doorH*0.55,2*UI.s,0,Math.PI*2); ctx.fill();
    
    // 窗户（发光效果）
    const winW=w*0.16, winH=h*0.18;
    const winY1=wallTop+h*0.2, winY2=wallTop+h*0.45;
    [[hx-w*0.3,winY1],[hx+w*0.08,winY1],[hx-w*0.15,winY2]].forEach(([wx,wy])=>{
        if (night) {
            const glow=rgrad(ctx,wx,wy,0,wx,wy,w*0.5);
            glow.addColorStop(0,'rgba(255,220,80,0.5)');
            glow.addColorStop(1,'rgba(255,180,0,0)');
            ctx.fillStyle=glow;
            ctx.fillRect(wx-w*0.5,wy-winH*0.5,w,winH*1.5);
        }
        ctx.fillStyle=night?lvl.colors.win:lvl.colors.winD;
        ctx.fillRect(wx-winW/2,wy,winW,winH);
        ctx.strokeStyle=night?'#5d4037':'#bcaaa4'; ctx.lineWidth=1;
        ctx.strokeRect(wx-winW/2,wy,winW,winH);
        ctx.beginPath(); ctx.moveTo(wx,wy); ctx.lineTo(wx,wy+winH); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(wx-winW/2,wy+winH/2); ctx.lineTo(wx+winW/2,wy+winH/2); ctx.stroke();
    });
    
    // === 屋顶 ===
    const roofBaseY=wallTop;
    const roofTipY=roofBaseY-rh*1.1;
    // 屋顶左面
    const roofLGrd=grad(ctx, hx-w*0.6,roofBaseY, shade(lvl.colors.roof,15), hx,roofTipY, shade(lvl.colors.roofD,-10));
    ctx.fillStyle=roofLGrd;
    ctx.beginPath();
    ctx.moveTo(hx-w*0.55,roofBaseY+h*0.15-baseH);
    ctx.lineTo(hx-w*0.55,roofBaseY);
    ctx.lineTo(hx,roofTipY);
    ctx.lineTo(hx,roofBaseY+h*0.3-baseH); ctx.closePath(); ctx.fill();
    // 屋顶右面
    const roofRGrd=grad(ctx, hx+w*0.6,roofBaseY, shade(lvl.colors.roof,-15), hx,roofTipY, shade(lvl.colors.roofD,-25));
    ctx.fillStyle=roofRGrd;
    ctx.beginPath();
    ctx.moveTo(hx+w*0.55,roofBaseY+h*0.15-baseH);
    ctx.lineTo(hx+w*0.55,roofBaseY);
    ctx.lineTo(hx,roofTipY);
    ctx.lineTo(hx,roofBaseY+h*0.3-baseH); ctx.closePath(); ctx.fill();
    // 屋顶顶面
    ctx.fillStyle=lvl.colors.roofL;
    ctx.beginPath();
    ctx.moveTo(hx-w*0.55,roofBaseY);
    ctx.lineTo(hx,roofTipY);
    ctx.lineTo(hx+w*0.55,roofBaseY);
    ctx.lineTo(hx,roofBaseY-rh*0.2); ctx.closePath(); ctx.fill();
    // 烟囱
    if (gameState.house.level>=2) {
        const chx=hx+w*0.2, chy=roofTipY+rh*0.3;
        ctx.fillStyle=shade(lvl.colors.wallD,-10);
        ctx.fillRect(chx-w*0.05,chy,w*0.1,rh*0.5);
        ctx.fillStyle=shade(lvl.colors.wall,-15);
        ctx.fillRect(chx-w*0.06,chy,w*0.12,rh*0.08);
        // 烟雾
        if (!night) {
            for (let i=0;i<3;i++) {
                const sy=chy-i*8*UI.s-(frame*0.5)%20;
                const sx=chx+Math.sin(frame*0.03+i)*4*UI.s;
                ctx.fillStyle='rgba(200,200,200,'+(0.4-i*0.12)+')';
                ctx.beginPath(); ctx.arc(sx,sy,4*UI.s,0,Math.PI*2); ctx.fill();
            }
        }
    }
    // 屋顶瓦片纹理
    ctx.strokeStyle=alpha(shade(lvl.colors.roof,-30),0.3); ctx.lineWidth=0.8;
    for (let i=0;i<4;i++) {
        const ty=roofBaseY+(roofTipY-roofBaseY)*(i/4);
        ctx.beginPath(); ctx.moveTo(hx-w*0.55+i*2*UI.s,ty); ctx.lineTo(hx,ty+(roofTipY-roofBaseY)/4); ctx.stroke();
    }
}

// ============================================================
// 3D物体渲染
// ============================================================
function renderObj(cell, s, zone, night) {
    const lc=cell.col-zone.col0, lr=cell.row-zone.row0;
    const {x,y}=toScreen(lc,lr);
    const item=cell.item;
    const grow=item.growth>0?Math.min(1,((Date.now()-cell.plantedAt)/1000)/item.growth):1;
    
    if (item.kind==='tree') renderTree(x,y,s,item,grow,night,cell);
    else if (item.kind==='flower') renderFlower(x,y,s,item,grow,night);
    else if (item.kind==='water') renderWaterObj(x,y,s,item,night);
    else if (item.kind==='deco') renderDeco(x,y,s,item,night);
}

function renderTree(x, y, s, item, grow, night, cell) {
    const sc=UI.s;
    const tw=TW*sc, th=TH*sc;
    const sz=(0.5+grow*0.5)*sc*20;
    const trunkH=sz*1.8, trunkW=sz*0.28;
    const c=item.c;
    
    // 阴影
    ctx.fillStyle='rgba(0,0,0,0.28)';
    ctx.beginPath(); ctx.ellipse(x+5*sc,y+6*sc,sz*1.4,sz*0.5,0,0,Math.PI*2); ctx.fill();
    
    // 树干
    const tg=grad(ctx, x-trunkW, y, shade(c.trunk,night?-15:0), x+trunkW, y, shade(c.trunk,night?-35:-20));
    ctx.fillStyle=tg;
    ctx.fillRect(x-trunkW/2, y-trunkH, trunkW, trunkH);
    // 树干纹理
    ctx.strokeStyle=alpha(shade(c.trunk,-30),night?0.2:0.3); ctx.lineWidth=1.5;
    for (let i=0;i<3;i++) {
        const ty=y-trunkH*0.3-i*trunkH*0.2;
        ctx.beginPath(); ctx.moveTo(x-trunkW*0.3,ty); ctx.lineTo(x+trunkW*0.3,ty+sc); ctx.stroke();
    }
    
    // 3D树冠（多层球体，模拟3D体积感）
    const canopyBaseY=y-trunkH;
    const layers=[
        {ox:0,    oy:0,    r:sz*1.3, c1:c.c1, c2:c.c3},
        {ox:-sz*0.4, oy:sz*0.15, r:sz*0.9, c1:c.c2, c2:c.c3},
        {ox: sz*0.35, oy:sz*0.2, r:sz*0.85, c1:c.c1, c2:c.c3},
        {ox:0,    oy:-sz*0.3, r:sz*0.7, c1:c.c3, c2:c.c1},
        {ox:-sz*0.2, oy:sz*0.35, r:sz*0.6, c1:c.c2, c2:c.c1},
    ];
    
    layers.forEach(l=>{
        const cx=x+l.ox, cy=canopyBaseY+l.oy;
        const cg=rgrad(ctx, cx-sz*0.3, cy-sz*0.3, 0, cx, cy, l.r);
        cg.addColorStop(0, shade(c.c1,night?5:25));
        cg.addColorStop(0.6, shade(c.c2,night?-15:0));
        cg.addColorStop(1, shade(c.c3,night?-40:-25));
        ctx.fillStyle=cg;
        ctx.beginPath(); ctx.arc(cx,cy,l.r,0,Math.PI*2); ctx.fill();
        
        // 每层高光
        ctx.fillStyle=alpha('#fff',night?0.05:0.18);
        ctx.beginPath(); ctx.arc(cx-sz*0.25,cy-sz*0.25,l.r*0.4,0,Math.PI*2); ctx.fill();
    });
    
    // 樱花特殊：花瓣飘落
    if (item.id==='sakura' && grow>0.8) {
        for (let i=0;i<4;i++) {
            const px=x+(Math.sin(frame*0.04+i*2.1+cell.col)*sz);
            const py=y-trunkH-sz+(frame*0.6+i*12)%(sz*2);
            ctx.fillStyle='rgba(255,182,193,0.7)';
            ctx.beginPath(); ctx.arc(px,py,2*sc,0,Math.PI*2); ctx.fill();
        }
    }
    
    // 成熟时闪烁
    if (grow>=1) {
        const sparkle=Math.sin(frame*0.1)*0.5+0.5;
        ctx.fillStyle='rgba(255,215,0,'+(sparkle*0.6)+')';
        ctx.beginPath(); ctx.arc(x-sz*0.3,canopyBaseY-sz*0.3,3*sc,0,Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(x+sz*0.2,canopyBaseY,2*sc,0,Math.PI*2); ctx.fill();
    }
}

function renderFlower(x, y, s, item, grow, night) {
    const sc=UI.s;
    const sz=(0.35+grow*0.65)*sc*18;
    const stemH=sz*2.2;
    const c=item.c;
    
    // 阴影
    ctx.fillStyle='rgba(0,0,0,0.18)';
    ctx.beginPath(); ctx.ellipse(x+3*sc,y+3*sc,sz*0.7,sz*0.3,0,0,Math.PI*2); ctx.fill();
    
    // 茎
    ctx.strokeStyle=night?shade(c.stem,-30):c.stem;
    ctx.lineWidth=2.5;
    ctx.beginPath();
    ctx.moveTo(x,y);
    ctx.bezierCurveTo(x+sz*0.2,y-stemH*0.5, x-sz*0.1,y-stemH*0.6, x,y-stemH);
    ctx.stroke();
    
    // 叶子
    const lfg=night?shade(c.stem,-20):shade(c.stem,10);
    ctx.fillStyle=lfg;
    ctx.save(); ctx.translate(x+sz*0.15,y-stemH*0.5); ctx.rotate(-0.6);
    ctx.beginPath(); ctx.ellipse(0,0,sz*0.5,sz*0.15,0,0,Math.PI*2); ctx.fill(); ctx.restore();
    ctx.save(); ctx.translate(x-sz*0.1,y-stemH*0.65); ctx.rotate(0.5);
    ctx.beginPath(); ctx.ellipse(0,0,sz*0.4,sz*0.12,0,0,Math.PI*2); ctx.fill(); ctx.restore();
    
    // 花瓣（3D效果：多层）
    const petalY=y-stemH;
    const petalR=sz*0.42;
    for (let layer=2;layer>=0;layer--) {
        const lr=petalR*(1-layer*0.15);
        const numPetals=6-layer;
        for (let i=0;i<numPetals;i++) {
            const angle=(i/numPetals)*Math.PI*2+layer*0.3;
            const px=petalY?x+Math.cos(angle)*lr*0.75:petalY+Math.cos(angle)*lr*0.75;
            const py2=petalY+Math.sin(angle)*lr*0.55;
            const pg=rgrad(ctx, px-lr*0.3,py2-lr*0.3, 0, px,py2, lr);
            pg.addColorStop(0, shade(layer===0?c.p1:c.p2,night?0:15));
            pg.addColorStop(1, shade(layer<=1?c.p2:c.p3,night?-20:-10));
            ctx.fillStyle=pg;
            ctx.beginPath(); ctx.ellipse(px,py2,lr,lr*0.7,angle,0,Math.PI*2); ctx.fill();
        }
    }
    
    // 花心
    const fc=rgrad(ctx, x,petalY, 0, x,petalY, petalR*0.4);
    fc.addColorStop(0, c.center); fc.addColorStop(1, shade(c.center,night?-20:-15));
    ctx.fillStyle=fc;
    ctx.beginPath(); ctx.arc(x,petalY,petalR*0.38,0,Math.PI*2); ctx.fill();
    // 花心高光
    ctx.fillStyle=alpha('#fff',night?0.1:0.4);
    ctx.beginPath(); ctx.arc(x-petalR*0.12,petalY-petalR*0.12,petalR*0.15,0,Math.PI*2); ctx.fill();
    
    if (grow>=1) {
        const sp=Math.sin(frame*0.1)*0.5+0.5;
        ctx.fillStyle='rgba(255,215,0,'+sp*0.7+')';
        ctx.beginPath(); ctx.arc(x+sz*0.2,petalY-sz*0.1,2*sc,0,Math.PI*2); ctx.fill();
    }
}

function renderWaterObj(x, y, s, item, night) {
    const sc=UI.s;
    if (item.id==='fount') {
        const sz=sc*22;
        // 基座
        ctx.fillStyle=night?shade(item.c.stone,-30):item.c.stone;
        ctx.beginPath();
        ctx.ellipse(x,y,sz*1.2,sz*0.6,0,0,Math.PI*2); ctx.fill();
        // 水面
        const wg=rgrad(ctx,x,y,0,x,y,sz);
        wg.addColorStop(0,night?'#0288d1':item.c.foam);
        wg.addColorStop(1,night?'#01579b':item.c.water);
        ctx.fillStyle=wg;
        ctx.beginPath(); ctx.ellipse(x,y,sz*1,sz*0.5,0,0,Math.PI*2); ctx.fill();
        // 水柱
        for (let i=0;i<5;i++) {
            const t=((frame*0.05+i*0.3)%1);
            const jx=x+Math.sin(i*1.4+frame*0.03)*sz*0.4*(1-t);
            const jy=y-sz*2.5*t;
            const ja=(1-t)*0.8;
            ctx.fillStyle='rgba(173,216,230,'+ja+')';
            ctx.beginPath(); ctx.arc(jx,jy,3*sc*(1-t*0.5),0,Math.PI*2); ctx.fill();
        }
    }
}

function renderDeco(x, y, s, item, night) {
    const sc=UI.s;
    const sz=sc*14;
    const c=item.c;
    
    // 阴影
    ctx.fillStyle='rgba(0,0,0,0.2)';
    ctx.beginPath(); ctx.ellipse(x+3*sc,y+3*sc,sz*0.9,sz*0.4,0,0,Math.PI*2); ctx.fill();
    
    switch(item.id) {
        case 'rock': {
            const rg=rgrad(ctx, x-sz*0.3,y-sz*0.4, 0, x,y, sz);
            rg.addColorStop(0,c.highlight); rg.addColorStop(0.4,c.light); rg.addColorStop(1,c.dark);
            ctx.fillStyle=rg;
            ctx.beginPath(); ctx.ellipse(x,y-sz*0.3,sz,sz*0.7,0,0,Math.PI*2); ctx.fill();
            ctx.fillStyle=alpha('#fff',night?0.05:0.25);
            ctx.beginPath(); ctx.ellipse(x-sz*0.3,y-sz*0.5,sz*0.35,sz*0.2,-0.3,0,Math.PI*2); ctx.fill();
            break;
        }
        case 'lamp': {
            ctx.fillStyle=night?shade(c.pole,-20):c.pole;
            ctx.fillRect(x-sz*0.08,y-sz*3.5,sz*0.16,sz*3.5);
            // 灯罩
            ctx.fillStyle=night?c.glow:'#f5f5f5';
            ctx.beginPath(); ctx.arc(x,y-sz*3.7,sz*0.35,0,Math.PI*2); ctx.fill();
            // 发光
            if (night) {
                const lg=rgrad(ctx,x,y-sz*3.7,0,x,y-sz*3.7,sz*4);
                lg.addColorStop(0,'rgba(255,245,157,0.7)');
                lg.addColorStop(0.3,'rgba(255,235,59,0.2)');
                lg.addColorStop(1,'rgba(255,200,0,0)');
                ctx.fillStyle=lg;
                ctx.beginPath(); ctx.arc(x,y-sz*3.7,sz*4,0,Math.PI*2); ctx.fill();
            }
            break;
        }
        case 'bench': {
            // 座面
            ctx.fillStyle=night?shade(c.wood,-15):c.wood;
            ctx.fillRect(x-sz*1.2,y-sz*0.5,sz*2.4,sz*0.2);
            // 腿
            ctx.fillStyle=night?shade(c.metal,-20):c.metal;
            ctx.fillRect(x-sz*1.0,y-sz*0.3,sz*0.12,sz*0.3);
            ctx.fillRect(x+sz*0.9,y-sz*0.3,sz*0.12,sz*0.3);
            // 靠背
            ctx.fillStyle=night?shade(c.wood,-20):shade(c.wood,5);
            ctx.fillRect(x-sz*1.2,y-sz*1.0,sz*2.4,sz*0.12);
            ctx.fillRect(x-sz*1.2,y-sz*0.7,sz*2.4,sz*0.1);
            // 垫子
            ctx.fillStyle=night?shade(c.cushion,-15):c.cushion;
            ctx.fillRect(x-sz*0.9,y-sz*0.65,sz*1.8,sz*0.15);
            break;
        }
        case 'hedge': {
            const hg=rgrad(ctx, x-sz*0.5,y-sz*0.5, 0, x,y, sz*1.5);
            hg.addColorStop(0,c.light); hg.addColorStop(0.5,c.c1); hg.addColorStop(1,c.c3);
            ctx.fillStyle=hg;
            ctx.beginPath(); ctx.ellipse(x,y-sz*0.4,sz*1.3,sz*0.7,0,0,Math.PI*2); ctx.fill();
            ctx.fillStyle=alpha('#fff',night?0.03:0.15);
            ctx.beginPath(); ctx.ellipse(x-sz*0.4,y-sz*0.6,sz*0.5,sz*0.25,-0.3,0,Math.PI*2); ctx.fill();
            break;
        }
        case 'cat': {
            // 身体
            const bg=rgrad(ctx, x-sz*0.3,y-sz*0.3, 0, x,y-sz*0.5, sz);
            bg.addColorStop(0,c.body); bg.addColorStop(1,shade(c.body,-30));
            ctx.fillStyle=bg;
            ctx.beginPath(); ctx.ellipse(x,y-sz*0.4,sz,sz*0.6,0,0,Math.PI*2); ctx.fill();
            // 头
            ctx.beginPath(); ctx.arc(x+sz*0.7,y-sz*0.8,sz*0.45,0,Math.PI*2); ctx.fill();
            // 耳朵
            ctx.beginPath();
            ctx.moveTo(x+sz*0.5,y-sz*1.1); ctx.lineTo(x+sz*0.4,y-sz*0.9); ctx.lineTo(x+sz*0.6,y-sz*0.9); ctx.closePath(); ctx.fill();
            ctx.beginPath();
            ctx.moveTo(x+sz*0.85,y-sz*1.1); ctx.lineTo(x+sz*0.75,y-sz*0.9); ctx.lineTo(x+sz*0.95,y-sz*0.9); ctx.closePath(); ctx.fill();
            // 尾巴
            ctx.strokeStyle=c.body; ctx.lineWidth=sz*0.15;
            ctx.beginPath();
            ctx.moveTo(x-sz*0.9,y-sz*0.5);
            ctx.bezierCurveTo(x-sz*1.5,y-sz*0.8, x-sz*1.3,y-sz*1.2, x-sz*1.1,y-sz*1.4);
            ctx.stroke();
            // 眼睛
            ctx.fillStyle=c.eye;
            ctx.beginPath(); ctx.arc(x+sz*0.6,y-sz*0.85,sz*0.08,0,Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(x+sz*0.82,y-sz*0.85,sz*0.08,0,Math.PI*2); ctx.fill();
            break;
        }
        case 'bunny': {
            const bg=rgrad(ctx,x,y-sz*0.4,0,x,y-sz*0.5,sz);
            bg.addColorStop(0,c.body); bg.addColorStop(1,shade(c.dark,-20));
            ctx.fillStyle=bg;
            ctx.beginPath(); ctx.ellipse(x,y-sz*0.4,sz*0.8,sz*0.55,0,0,Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(x+sz*0.5,y-sz*0.8,sz*0.4,0,Math.PI*2); ctx.fill();
            // 耳朵
            ctx.fillStyle=c.body;
            ctx.beginPath(); ctx.ellipse(x+sz*0.35,y-sz*1.5,sz*0.12,sz*0.4,0.2,0,Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.ellipse(x+sz*0.6,y-sz*1.5,sz*0.12,sz*0.4,-0.2,0,Math.PI*2); ctx.fill();
            ctx.fillStyle=c.pink;
            ctx.beginPath(); ctx.ellipse(x+sz*0.35,y-sz*1.5,sz*0.07,sz*0.25,0.2,0,Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.ellipse(x+sz*0.6,y-sz*1.5,sz*0.07,sz*0.25,-0.2,0,Math.PI*2); ctx.fill();
            ctx.fillStyle=c.eye;
            ctx.beginPath(); ctx.arc(x+sz*0.4,y-sz*0.85,sz*0.07,0,Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(x+sz*0.62,y-sz*0.85,sz*0.07,0,Math.PI*2); ctx.fill();
            break;
        }
        case 'frog': {
            const fg=rgrad(ctx,x-sz*0.2,y-sz*0.3,0,x,y-sz*0.4,sz);
            fg.addColorStop(0,c.body); fg.addColorStop(1,shade(c.dark,-30));
            ctx.fillStyle=fg;
            ctx.beginPath(); ctx.ellipse(x,y-sz*0.35,sz,sz*0.5,0,0,Math.PI*2); ctx.fill();
            ctx.fillStyle=c.belly;
            ctx.beginPath(); ctx.ellipse(x,y-sz*0.25,sz*0.6,sz*0.25,0,0,Math.PI*2); ctx.fill();
            // 眼睛
            ctx.fillStyle=c.body;
            ctx.beginPath(); ctx.arc(x-sz*0.35,y-sz*0.6,sz*0.28,0,Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(x+sz*0.35,y-sz*0.6,sz*0.28,0,Math.PI*2); ctx.fill();
            ctx.fillStyle=c.eye;
            ctx.beginPath(); ctx.arc(x-sz*0.35,y-sz*0.62,sz*0.15,0,Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(x+sz*0.35,y-sz*0.62,sz*0.15,0,Math.PI*2); ctx.fill();
            break;
        }
        case 'angelf': {
            // 身体
            ctx.fillStyle=night?shade(c.stone,-15):c.stone;
            ctx.beginPath(); ctx.ellipse(x,y-sz*1.0,sz*0.45,sz*0.8,0,0,Math.PI*2); ctx.fill();
            // 翅膀
            ctx.fillStyle=c.wing;
            ctx.beginPath(); ctx.ellipse(x-sz*0.7,y-sz*1.0,sz*0.6,sz*0.3,-0.4,0,Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.ellipse(x+sz*0.7,y-sz*1.0,sz*0.6,sz*0.3,0.4,0,Math.PI*2); ctx.fill();
            // 头
            ctx.fillStyle=c.stone;
            ctx.beginPath(); ctx.arc(x,y-sz*1.85,sz*0.35,0,Math.PI*2); ctx.fill();
            // 光环
            ctx.strokeStyle=night?c.gold:shade(c.gold,10);
            ctx.lineWidth=2.5;
            ctx.beginPath(); ctx.arc(x,y-sz*2.1,sz*0.45,0,Math.PI*2); ctx.stroke();
            if (night) {
                const ag=rgrad(ctx,x,y-sz*1.5,0,x,y-sz*1.5,sz*2);
                ag.addColorStop(0,'rgba(255,215,0,0.3)'); ag.addColorStop(1,'rgba(255,215,0,0)');
                ctx.fillStyle=ag;
                ctx.beginPath(); ctx.arc(x,y-sz*1.5,sz*2,0,Math.PI*2); ctx.fill();
            }
            break;
        }
        case 'windmill': {
            // 支柱
            ctx.fillStyle=night?shade(c.wood,-20):c.wood;
            ctx.fillRect(x-sz*0.12,y-sz*3.5,sz*0.24,sz*3.5);
            // 屋顶
            ctx.fillStyle=night?shade(c.roof,-15):c.roof;
            ctx.beginPath();
            ctx.moveTo(x,y-sz*3.8); ctx.lineTo(x+sz*0.5,y-sz*3.4); ctx.lineTo(x-sz*0.5,y-sz*3.4); ctx.closePath(); ctx.fill();
            // 叶片
            const angle=frame*0.025;
            ctx.save(); ctx.translate(x,y-sz*3.5);
            for (let i=0;i<4;i++) {
                ctx.save(); ctx.rotate(angle+i*Math.PI/2);
                ctx.fillStyle=c.blade;
                ctx.beginPath(); ctx.ellipse(0,-sz*0.7,sz*0.15,sz*0.7,0,0,Math.PI*2); ctx.fill();
                ctx.restore();
            }
            ctx.restore();
            // 中心轴
            ctx.fillStyle=c.dark;
            ctx.beginPath(); ctx.arc(x,y-sz*3.5,sz*0.12,0,Math.PI*2); ctx.fill();
            break;
        }
        case 'fence': {
            // 栅栏板
            const fh=sz*1.4;
            ctx.fillStyle=night?shade(c.wood,-20):c.wood;
            for (let i=-1;i<=1;i++) {
                ctx.fillRect(x+i*sz*0.6-sz*0.1,y-fh,sz*0.2,fh);
                // 尖端
                ctx.beginPath();
                ctx.moveTo(x+i*sz*0.6-sz*0.1,y-fh); ctx.lineTo(x+i*sz*0.6,y-fh-sz*0.2); ctx.lineTo(x+i*sz*0.6+sz*0.1,y-fh); ctx.closePath(); ctx.fill();
            }
            // 横杆
            ctx.fillStyle=night?shade(c.dark,-15):c.dark;
            ctx.fillRect(x-sz*0.8,y-fh*0.7,sz*1.6,sz*0.12);
            ctx.fillRect(x-sz*0.8,y-fh*0.35,sz*1.6,sz*0.12);
            break;
        }
        default: {
            // 默认3D球形
            const dg=rgrad(ctx, x-sz*0.3,y-sz*0.4, 0, x,y, sz);
            dg.addColorStop(0,c.main||'#888'); dg.addColorStop(1,shade(c.main||'#888',-40));
            ctx.fillStyle=dg;
            ctx.beginPath(); ctx.arc(x,y-sz*0.5,sz*0.6,0,Math.PI*2); ctx.fill();
        }
    }
}

function renderRipples(s, w, h) {
    gameState.rippleList.forEach((r, i) => {
        r.life -= 0.02;
        if (r.life <= 0) { gameState.rippleList.splice(i,1); return; }
        const {x,y}=toScreen(r.col,r.row);
        ctx.strokeStyle='rgba(255,255,255,'+r.life*0.5+')';
        ctx.lineWidth=2;
        ctx.beginPath(); ctx.arc(x,y, (1-r.life)*15*s, 0, Math.PI*2); ctx.stroke();
    });
}

function renderLocked(s, w, h, zone, night) {
    const {x,y}=toScreen(1,1);
    ctx.fillStyle='rgba(0,0,0,0.55)';
    ctx.beginPath(); ctx.ellipse(x,y,88*s,48*s,0,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#ffd700'; ctx.font='bold '+(34*s)+'px sans-serif'; ctx.textAlign='center';
    ctx.fillText('🔒',x,y-15*s);
    ctx.font='bold '+(14*s)+'px sans-serif'; ctx.fillText(zone.name,x,y-50*s);
    const can=gameState.money>=zone.cost;
    ctx.fillStyle=can?'#4ade80':'#f87171'; ctx.font=(12*s)+'px sans-serif';
    ctx.fillText('解锁: '+zone.cost+' 💰',x,y+12*s);
    if (can) {
        ctx.fillStyle='#4caf50';
        ctx.beginPath(); ctx.roundRect(x-42*s,y+28*s,84*s,28*s,10*s); ctx.fill();
        ctx.fillStyle='#fff'; ctx.font='bold '+(10*s)+'px sans-serif';
        ctx.fillText('点此解锁',x,y+48*s);
    }
}

// ============================================================
// UI渲染
// ============================================================
function renderTopBar(s, w, h, sky) {
    const bg=ctx.createLinearGradient(0,0,0,48*s);
    bg.addColorStop(0,'rgba(15,25,15,0.92)'); bg.addColorStop(1,'rgba(8,15,8,0.88)');
    ctx.fillStyle=bg;
    ctx.beginPath(); ctx.roundRect(8*s,7*s,w-16*s,40*s,11*s); ctx.fill();
    ctx.strokeStyle='rgba(255,215,0,0.25)'; ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.roundRect(8*s,7*s,w-16*s,40*s,11*s); ctx.stroke();
    ctx.fillStyle='#ffd700'; ctx.font='bold '+(12*s)+'px sans-serif'; ctx.textAlign='left';
    ctx.fillText(sky.name,18*s,30*s);
    ctx.textAlign='center'; ctx.font='bold '+(17*s)+'px sans-serif';
    ctx.fillText('💰 '+gameState.money,w/2,32*s);
    ctx.textAlign='right'; ctx.font=(9.5*s)+'px sans-serif';
    ctx.fillStyle='rgba(255,255,255,0.65)';
    ctx.fillText('总:'+gameState.totalEarned,w-18*s,24*s);
    ctx.fillText('区域:'+gameState.zones.filter(z=>z.unlocked).length+'/'+ZONES.length,w-18*s,40*s);
    // 时间切换按钮
    ctx.fillStyle='rgba(255,215,0,0.15)';
    ctx.beginPath(); ctx.roundRect(w-75*s,10*s,65*s,32*s,8*s); ctx.fill();
    ctx.fillStyle='#ffd700'; ctx.font=(9*s)+'px sans-serif'; ctx.textAlign='center';
    ctx.fillText('⏰ 切换',w-42*s,29*s);
}

function renderZoneTabs(s, w, h, sky) {
    const barY=56*s, bw=38*s, bh=32*s, gap=5*s;
    const totalW=ZONES.length*(bw+gap)-gap;
    const sx=(w-totalW)/2;
    ZONES.forEach((z,idx)=>{
        const bx=sx+idx*(bw+gap);
        const sel=idx===gameState.selectedZone;
        const unl=z.unlocked;
        if (sel) {
            ctx.fillStyle='rgba(255,215,0,0.18)';
            ctx.beginPath(); ctx.roundRect(bx-3*s,barY-bh/2-3*s,bw+6*s,bh+6*s,9*s); ctx.fill();
        }
        const bg=ctx.createLinearGradient(bx,barY-bh/2,bx,barY+bh/2);
        bg.addColorStop(0, unl?(sky.n?'rgba(50,80,50,0.92)':'rgba(76,175,80,0.92)'):'rgba(55,55,55,0.85)');
        bg.addColorStop(1, unl?(sky.n?'rgba(30,50,30,0.95)':'rgba(56,142,60,0.95)'):'rgba(35,35,35,0.9)');
        ctx.fillStyle=bg;
        ctx.beginPath(); ctx.roundRect(bx,barY-bh/2,bw,bh,7*s); ctx.fill();
        if (sel) {
            ctx.strokeStyle='#ffd700'; ctx.lineWidth=2;
            ctx.beginPath(); ctx.roundRect(bx,barY-bh/2,bw,bh,7*s); ctx.stroke();
        }
        ctx.fillStyle=unl?'#fff':'rgba(130,130,130,0.5)';
        ctx.font='bold '+(8.5*s)+'px sans-serif'; ctx.textAlign='center';
        ctx.fillText(z.name.slice(0,3),bx+bw/2,barY+3*s);
        if (!unl) {
            ctx.fillStyle='#f87171'; ctx.font=(7.5*s)+'px sans-serif';
            ctx.fillText('🔒'+z.cost,bx+bw/2,barY+bh/2+9*s);
        }
    });
}

function renderShop(s, w, h, sky) {
    const sy=h-112*s, sh=105*s;
    const sg=ctx.createLinearGradient(0,sy,0,sy+sh);
    sg.addColorStop(0, sky.n?'rgba(18,32,18,0.93)':'rgba(28,58,28,0.93)');
    sg.addColorStop(1, sky.n?'rgba(8,15,8,0.96)':'rgba(15,35,15,0.96)');
    ctx.fillStyle=sg;
    ctx.beginPath(); ctx.roundRect(7*s,sy,w-14*s,sh,13*s); ctx.fill();
    ctx.strokeStyle='rgba(255,215,0,0.22)'; ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.roundRect(7*s,sy,w-14*s,sh,13*s); ctx.stroke();
    ctx.fillStyle='#fff'; ctx.font='bold '+(10.5*s)+'px sans-serif'; ctx.textAlign='left';
    ctx.fillText('🛒 商店',14*s,sy+15*s);
    ctx.textAlign='right'; ctx.fillStyle='#ffd700';
    ctx.fillText('💰'+gameState.money,w-14*s,sy+15*s);
    const cols=8, iw=(w-22*s)/cols-2*s, ih=(sh-32*s)/2;
    SHOP_ITEMS.forEach((item,idx)=>{
        const col=idx%cols, row=Math.floor(idx/cols);
        if (row>1) return;
        const ix=11*s+col*(iw+2*s), iy=sy+20*s+row*(ih+2*s);
        const sel=gameState.selectedItem?.id===item.id;
        const can=gameState.money>=item.price;
        ctx.fillStyle=sel?'rgba(76,175,80,0.38)':'rgba(255,255,255,0.07)';
        ctx.beginPath(); ctx.roundRect(ix,iy,iw,ih,5*s); ctx.fill();
        if (sel) {
            ctx.strokeStyle='#4caf50'; ctx.lineWidth=2;
            ctx.beginPath(); ctx.roundRect(ix,iy,iw,ih,5*s); ctx.stroke();
        }
        // 物品颜色预览球
        const pc=item.c?(item.c.c1||item.c.petal||item.c.main||'#888'):'#888';
        const pg=rgrad(ctx,ix+iw/2-iw*0.15,iy+ih*0.3-ih*0.15,0,ix+iw/2,iy+ih*0.3,iw*0.28);
        pg.addColorStop(0,shade(pc,20)); pg.addColorStop(1,shade(pc,-30));
        ctx.fillStyle=pg;
        ctx.beginPath(); ctx.arc(ix+iw/2,iy+ih*0.3,iw*0.28,0,Math.PI*2); ctx.fill();
        ctx.fillStyle=alpha('#fff',sky.n?0.08:0.25);
        ctx.beginPath(); ctx.arc(ix+iw/2-iw*0.1,iy+ih*0.22,iw*0.1,0,Math.PI*2); ctx.fill();
        ctx.fillStyle=can?'#ffd700':'#555'; ctx.font=(7*s)+'px sans-serif'; ctx.textAlign='center';
        ctx.fillText(item.price+'',ix+iw/2,iy+ih-4*s);
    });
}

function renderToast(s, w, h) {
    if (toastTimer<=0) return;
    const a=Math.min(0.88,toastTimer/25);
    ctx.fillStyle='rgba(0,0,0,'+a+')';
    ctx.beginPath(); ctx.roundRect(w/2-105*s,h/2-20*s,210*s,36*s,18*s); ctx.fill();
    ctx.fillStyle='#fff'; ctx.font=(12*s)+'px sans-serif'; ctx.textAlign='center';
    ctx.fillText(gameState.toastMsg,w/2,h/2+4*s);
}

// ============================================================
// 游戏逻辑
// ============================================================
function updatePlants() {
    const now=Date.now();
    gameState.zones.forEach(zone=>{
        zone.garden.forEach(cell=>{
            if (!cell.item.growth) { cell.stage=2; return; }
            const age=(now-cell.plantedAt)/1000;
            cell.stage=age<cell.item.growth*0.5?0:age<cell.item.growth?1:2;
        });
    });
}

function showToast(msg) { gameState.toastMsg=msg; toastTimer=110; }

function cycleTime() {
    [0.1,0.35,0.55,0.75,0.92].forEach((t,i,arr)=>{
        if (Math.abs(t-gameState.timeOfDay)<0.15) {
            gameState.timeOfDay=arr[(i+1)%arr.length];
        }
    });
}

function onTouchStart(e) {
    const x=e.touches[0].clientX, y=e.touches[0].clientY;
    const s=UI.s, w=UI.w, h=UI.h;
    const zone=gameState.zones[gameState.selectedZone];
    
    // 时间切换
    if (y<50*s&&x>w-80*s) { cycleTime(); return; }
    
    // 区域选择
    const barY=56*s, bw=38*s, gap=5*s;
    const totalW=ZONES.length*(bw+gap)-gap;
    const sx=(w-totalW)/2;
    if (y>=barY-22*s&&y<=barY+40*s) {
        ZONES.forEach((z,idx)=>{
            const bx=sx+idx*(bw+gap);
            if (x>=bx&&x<=bx+bw) {
                if (z.unlocked) gameState.selectedZone=idx;
                else if (gameState.money>=z.cost) {
                    gameState.money-=z.cost; z.unlocked=true;
                    gameState.selectedZone=idx;
                    showToast('🎉 解锁 '+z.name+'！');
                } else showToast('🔒 需要 '+z.cost+' 💰');
            }
        });
        return;
    }
    
    // 商店
    const sy=h-112*s;
    if (y>sy) {
        const cols=8, iw=(w-22*s)/cols-2*s, ih=(105*s-32*s)/2;
        SHOP_ITEMS.forEach((item,idx)=>{
            const col=idx%cols, row=Math.floor(idx/cols);
            if (row>1) return;
            const ix=11*s+col*(iw+2*s), iy=sy+20*s+row*(ih+2*s);
            if (x>=ix&&x<=ix+iw&&y>=iy&&y<=iy+ih) {
                if (gameState.money>=item.price) {
                    gameState.selectedItem=item;
                    showToast('✓ 已选: '+item.name);
                } else showToast('💰 金币不足');
            }
        });
        return;
    }
    
    // 格子放置
    if (zone.unlocked&&y>90*s&&y<h-120*s) {
        const iso=fromScreen(x,y);
        if (iso.col>=0&&iso.col<3&&iso.row>=0&&iso.row<3) {
            const wc=zone.col0+iso.col, wr=zone.row0+iso.row;
            const ex=zone.garden.find(g=>g.col===wc&&g.row===wr);
            if (ex) {
                showToast(ex.item.name+(ex.stage===2?' ⭐':''));
            } else if (gameState.selectedItem) {
                zone.garden.push({col:wc,row:wr,item:gameState.selectedItem,stage:0,plantedAt:Date.now()});
                gameState.money-=gameState.selectedItem.price;
                gameState.rippleList.push({col:iso.col,row:iso.row,life:1});
                showToast('🌱 放置成功！');
                gameState.selectedItem=null;
            }
        }
    }
}

function gameLoop() {
    updatePlants();
    render();
    if (toastTimer>0) { toastTimer--; gameState.toastTimer=toastTimer; }
    gameState.timeOfDay=(gameState.timeOfDay+0.00006)%1;
    requestAnimationFrame(gameLoop);
}

init();
