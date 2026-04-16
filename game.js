// 梦想小屋 - 微信小游戏（含俯视角花园）
const gameState = {
  money: 1000,
  level: 1,
  // 室内家具
  furniture: [],
  wallColor: '#fef3c7',
  selectedFurniture: null,
  // 花园
  currentTab: 'room', // 'room' | 'garden'
  garden: [],         // {x, y, item}
  selectedGardenItem: null,
};

const shopItems = [
  { id: 1, emoji: '🛋️', name: '沙发', price: 100 },
  { id: 2, emoji: '🛏️', name: '床', price: 150 },
  { id: 3, emoji: '🪑', name: '椅子', price: 50 },
  { id: 4, emoji: '📺', name: '电视', price: 200 },
  { id: 5, emoji: '🌿', name: '盆栽', price: 30 },
  { id: 6, emoji: '💡', name: '台灯', price: 40 },
  { id: 7, emoji: '🖼️', name: '挂画', price: 80 },
  { id: 8, emoji: '🧸', name: '玩偶', price: 60 },
  { id: 9, emoji: '🎵', name: '音响', price: 180 },
  { id: 10, emoji: '🎮', name: '游戏机', price: 300, level: 2 }
];

const gardenItems = [
  { id: 'rose',   emoji: '🌹', name: '玫瑰',       price: 20 },
  { id: 'sunf',  emoji: '🌻', name: '向日葵',     price: 15 },
  { id: 'tulip', emoji: '🌷', name: '郁金香',     price: 15 },
  { id: 'sakura',emoji: '🌸', name: '樱花',       price: 30 },
  { id: 'tree',  emoji: '🌲', name: '松树',       price: 80 },
  { id: 'palm',  emoji: '🌴', name: '棕榈',       price: 90 },
  { id: 'grass', emoji: '🌿', name: '草坪',       price: 10 },
  { id: 'bush',  emoji: '🌳', name: '灌木丛',     price: 25 },
  { id: 'path',  emoji: '🟫', name: '小路',       price: 5 },
  { id: 'bench', emoji: '🪑', name: '长椅',       price: 50 },
  { id: 'pond',  emoji: '💧', name: '池塘',       price: 150 },
  { id: 'fount', emoji: '⛲', name: '喷泉',       price: 200 },
  { id: 'lamp',  emoji: '🏮', name: '灯笼',       price: 60 },
  { id: 'rock',  emoji: '🪨', name: '石头',       price: 10 },
  { id: 'fence', emoji: '🪵', name: '栅栏',       price: 15 },
  { id: 'butrf', emoji: '🦋', name: '蝴蝶',       price: 30 },
  { id: 'bird',  emoji: '🐦', name: '小鸟',       price: 25 },
  { id: 'fwid',  emoji: '🌺', name: '扶桑花',     price: 20 },
  { id: 'lavnd', emoji: '💜', name: '薰衣草',     price: 25 },
  { id: 'shrl',  emoji: '🌾', name: '干草堆',     price: 10 },
];

const wallColors = ['#fef3c7', '#dbeafe', '#fce7f3', '#d1fae5', '#e5e7eb', '#fde68a'];

let canvas, ctx;
let UI = {};
let draggedFurniture = null;
let dragOffsetX = 0, dragOffsetY = 0;
let toastMsg = '';
let toastTimer = 0;
// 俯视角花园
const GRID_COLS = 8;
const GRID_ROWS = 8;
let gardenCellSize = 0;
let gardenOriginX = 0;
let gardenOriginY = 0;

function init() {
  canvas = wx.createCanvas();
  ctx = canvas.getContext('2d');
  
  const info = wx.getSystemInfoSync();
  UI.w = info.windowWidth;
  UI.h = info.windowHeight;
  UI.s = UI.w / 375;
  canvas.width = UI.w;
  canvas.height = UI.h;
  
  wx.onTouchStart(onTouchStart);
  wx.onTouchMove(onTouchMove);
  wx.onTouchEnd(onTouchEnd);
  
  gameLoop();
}

function onTouchStart(e) {
  const x = e.touches[0].clientX;
  const y = e.touches[0].clientY;
  
  // === Tab 切换 ===
  const tabRoomX = UI.w / 2 - 75 * UI.s;
  const tabGardenX = UI.w / 2 + 5 * UI.s;
  const tabY = 55 * UI.s;
  if (y >= tabY - 5 * UI.s && y <= tabY + 28 * UI.s) {
    if (x >= tabRoomX && x <= tabRoomX + 70 * UI.s) {
      gameState.currentTab = 'room';
      gameState.selectedFurniture = null;
      gameState.selectedGardenItem = null;
      return;
    }
    if (x >= tabGardenX && x <= tabGardenX + 70 * UI.s) {
      gameState.currentTab = 'garden';
      gameState.selectedFurniture = null;
      gameState.selectedGardenItem = null;
      return;
    }
  }
  
  if (gameState.currentTab === 'room') {
    handleRoomTouch(x, y);
  } else {
    handleGardenTouch(x, y);
  }
}

function handleRoomTouch(x, y) {
  // 拖拽家具
  for (let i = gameState.furniture.length - 1; i >= 0; i--) {
    const f = gameState.furniture[i];
    if (x >= f.x && x <= f.x + 50 * UI.s && y >= f.y && y <= f.y + 50 * UI.s) {
      draggedFurniture = f;
      dragOffsetX = x - f.x;
      dragOffsetY = y - f.y;
      return;
    }
  }
  
  // 商店
  const shopY = UI.h - 125 * UI.s;
  if (y > shopY) {
    for (let i = 0; i < shopItems.length; i++) {
      const ix = 15 * UI.s + i * 65 * UI.s;
      if (x >= ix && x <= ix + 50 * UI.s) {
        const item = shopItems[i];
        if (item.level && item.level > gameState.level) {
          showToast(`需要 ${item.level} 级解锁`);
        } else if (gameState.money >= item.price) {
          gameState.selectedFurniture = item;
          showToast(`点击房间放置 ${item.emoji}`);
        } else {
          showToast('金币不足！');
        }
        return;
      }
    }
  }
  
  // 放置家具
  const roomTop = 110 * UI.s;
  const roomBot = UI.h - 130 * UI.s;
  if (gameState.selectedFurniture && y > roomTop && y < roomBot) {
    gameState.furniture.push({
      emoji: gameState.selectedFurniture.emoji,
      price: gameState.selectedFurniture.price,
      x: x - 25 * UI.s,
      y: y - 25 * UI.s
    });
    gameState.money -= gameState.selectedFurniture.price;
    gameState.selectedFurniture = null;
    showToast('放置成功！');
    checkLevelUp();
    return;
  }
  
  // 颜色选择
  const colorY = UI.h - 165 * UI.s;
  if (y > colorY && y < colorY + 35 * UI.s) {
    for (let i = 0; i < wallColors.length; i++) {
      const cx = 100 * UI.s + i * 38 * UI.s;
      if (x >= cx && x <= cx + 30 * UI.s) {
        gameState.wallColor = wallColors[i];
        showToast('换色成功！');
        return;
      }
    }
  }
  
  // 出售按钮
  const bx = UI.w / 2 - 80 * UI.s;
  const by = UI.h - 55 * UI.s;
  if (x >= bx && x <= bx + 160 * UI.s && y >= by && y <= by + 40 * UI.s) {
    sellHouse();
  }
}

function handleGardenTouch(x, y) {
  const shopY = UI.h - 125 * UI.s;
  
  // 商店区域
  if (y > shopY) {
    const scrollOffset = 0;
    for (let i = 0; i < gardenItems.length; i++) {
      const ix = 10 * UI.s + i * 58 * UI.s;
      if (x >= ix && x <= ix + 50 * UI.s) {
        if (gameState.money >= gardenItems[i].price) {
          gameState.selectedGardenItem = gardenItems[i];
          showToast(`点击格子放置 ${gardenItems[i].emoji}`);
        } else {
          showToast('金币不足！');
        }
        return;
      }
    }
  }
  
  // 花园格子区域
  if (x >= gardenOriginX && x <= gardenOriginX + GRID_COLS * gardenCellSize &&
      y >= gardenOriginY && y <= gardenOriginY + GRID_ROWS * gardenCellSize) {
    const col = Math.floor((x - gardenOriginX) / gardenCellSize);
    const row = Math.floor((y - gardenOriginY) / gardenCellSize);
    
    if (gameState.selectedGardenItem) {
      // 已有物品的格子可以替换
      gameState.garden = gameState.garden.filter(g => !(g.col === col && g.row === row));
      gameState.garden.push({
        col, row,
        item: gameState.selectedGardenItem
      });
      gameState.money -= gameState.selectedGardenItem.price;
      gameState.selectedGardenItem = null;
      showToast('种植成功！');
      checkLevelUp();
      return;
    } else {
      // 点击已有物品可删除（可选功能）
      const existing = gameState.garden.find(g => g.col === col && g.row === row);
      if (existing) {
        // 点击物品时弹出提示（或可再次点击删除）
        showToast(`已有 ${existing.item.emoji}，选物品覆盖`);
      }
    }
    return;
  }
}

function onTouchMove(e) {
  if (gameState.currentTab === 'room' && draggedFurniture) {
    draggedFurniture.x = e.touches[0].clientX - dragOffsetX;
    draggedFurniture.y = e.touches[0].clientY - dragOffsetY;
  }
}

function onTouchEnd() {
  draggedFurniture = null;
}

function sellHouse() {
  const val = gameState.furniture.reduce((s, f) => s + f.price * 0.8, 0);
  const bonus = Math.floor(val + 500);
  gameState.money += bonus;
  gameState.furniture = [];
  showToast(`出售成功 +${bonus}`);
  checkLevelUp();
}

function checkLevelUp() {
  const next = gameState.level + 1;
  if (gameState.money >= next * 1000) {
    gameState.level = next;
    showToast(`升级！现在是 ${next} 级`);
  }
}

function showToast(msg) {
  toastMsg = msg;
  toastTimer = 120;
}

function gameLoop() {
  render();
  if (toastTimer > 0) toastTimer--;
  requestAnimationFrame(gameLoop);
}

function render() {
  const s = UI.s, w = UI.w, h = UI.h;
  ctx.clearRect(0, 0, w, h);
  
  if (gameState.currentTab === 'room') {
    renderRoom(s, w, h);
  } else {
    renderGarden(s, w, h);
  }
}

function renderRoom(s, w, h) {
  // 背景
  const grd = ctx.createLinearGradient(0, 0, w, h);
  grd.addColorStop(0, '#667eea');
  grd.addColorStop(1, '#764ba2');
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, w, h);
  
  // Tab 栏
  renderTabs(s, w);
  
  // 标题
  ctx.fillStyle = '#fff';
  ctx.font = `bold ${20 * s}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('🏠 室内装修', w / 2, 88 * s);
  
  // 状态栏
  ctx.fillStyle = 'rgba(255,255,255,0.95)';
  roundRect(ctx, 10 * s, 92 * s, w - 20 * s, 30 * s, 12 * s);
  ctx.fill();
  ctx.fillStyle = '#f59e0b';
  ctx.font = `bold ${15 * s}px sans-serif`;
  ctx.textAlign = 'left';
  ctx.fillText(`💰 ${gameState.money}`, 22 * s, 112 * s);
  ctx.fillStyle = '#10b981';
  ctx.font = `bold ${13 * s}px sans-serif`;
  ctx.textAlign = 'right';
  ctx.fillText(`⭐ Lv.${gameState.level}`, w - 22 * s, 112 * s);
  
  // 房间
  ctx.fillStyle = 'rgba(255,255,255,0.95)';
  roundRect(ctx, 10 * s, 128 * s, w - 20 * s, h - 250 * s, 15 * s);
  ctx.fill();
  ctx.fillStyle = gameState.wallColor;
  roundRect(ctx, 20 * s, 138 * s, w - 40 * s, h - 285 * s, 10 * s);
  ctx.fill();
  
  // 家具
  ctx.font = `${38 * s}px sans-serif`;
  ctx.textAlign = 'center';
  gameState.furniture.forEach(f => {
    ctx.fillText(f.emoji, f.x + 25 * s, f.y + 33 * s);
  });
  
  // 选中提示
  if (gameState.selectedFurniture) {
    ctx.fillStyle = '#10b981';
    ctx.font = `${12 * s}px sans-serif`;
    ctx.fillText(`已选 ${gameState.selectedFurniture.emoji}，点击房间放置`, w / 2, 126 * s);
  }
  
  // 颜色选择
  ctx.fillStyle = '#374151';
  ctx.font = `${11 * s}px sans-serif`;
  ctx.textAlign = 'left';
  ctx.fillText('墙壁:', 15 * s, h - 148 * s);
  wallColors.forEach((color, i) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(100 * s + i * 38 * s + 15 * s, h - 155 * s, 14 * s, 0, Math.PI * 2);
    ctx.fill();
    if (color === gameState.wallColor) {
      ctx.strokeStyle = '#374151';
      ctx.lineWidth = 2 * s;
      ctx.stroke();
    }
  });
  
  // 商店
  ctx.fillStyle = 'rgba(255,255,255,0.95)';
  roundRect(ctx, 10 * s, h - 125 * s, w - 20 * s, 60 * s, 15 * s);
  ctx.fill();
  ctx.fillStyle = '#374151';
  ctx.font = `bold ${13 * s}px sans-serif`;
  ctx.textAlign = 'left';
  ctx.fillText('🛒 商店', 20 * s, h - 108 * s);
  
  // 商店物品
  shopItems.forEach((item, i) => {
    const ix = 15 * s + i * 65 * s;
    const iy = h - 92 * s;
    const locked = item.level && item.level > gameState.level;
    ctx.fillStyle = locked ? '#e5e7eb' :
      (gameState.selectedFurniture?.id === item.id ? '#d1fae5' : '#f3f4f6');
    roundRect(ctx, ix, iy, 55 * s, 38 * s, 8 * s);
    ctx.fill();
    if (gameState.selectedFurniture?.id === item.id) {
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2 * s;
      ctx.stroke();
    }
    ctx.font = `${20 * s}px sans-serif`;
    ctx.fillText(locked ? '🔒' : item.emoji, ix + 27 * s, iy + 24 * s);
    if (!locked) {
      ctx.fillStyle = '#f59e0b';
      ctx.font = `${9 * s}px sans-serif`;
      ctx.fillText(`${item.price}`, ix + 27 * s, iy + 36 * s);
    }
  });
  
  // 出售按钮
  ctx.fillStyle = '#10b981';
  roundRect(ctx, w / 2 - 80 * s, h - 55 * s, 160 * s, 38 * s, 19 * s);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = `bold ${15 * s}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('💰 出售房屋 +500', w / 2, h - 32 * s);
  
  renderToast(s, w, h);
}

function renderGarden(s, w, h) {
  // 俯视角草地背景
  const grd = ctx.createLinearGradient(0, 0, w, h);
  grd.addColorStop(0, '#86efac');
  grd.addColorStop(1, '#4ade80');
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, w, h);
  
  // Tab 栏
  renderTabs(s, w);
  
  // 标题
  ctx.fillStyle = '#fff';
  ctx.font = `bold ${20 * s}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.shadowColor = 'rgba(0,0,0,0.3)';
  ctx.shadowBlur = 4;
  ctx.fillText('🌿 俯视角花园', w / 2, 88 * s);
  ctx.shadowBlur = 0;
  
  // 状态栏
  ctx.fillStyle = 'rgba(255,255,255,0.95)';
  roundRect(ctx, 10 * s, 92 * s, w - 20 * s, 30 * s, 12 * s);
  ctx.fill();
  ctx.fillStyle = '#f59e0b';
  ctx.font = `bold ${15 * s}px sans-serif`;
  ctx.textAlign = 'left';
  ctx.fillText(`💰 ${gameState.money}`, 22 * s, 112 * s);
  ctx.fillStyle = '#10b981';
  ctx.font = `bold ${13 * s}px sans-serif`;
  ctx.textAlign = 'right';
  ctx.fillText(`⭐ Lv.${gameState.level}`, w - 22 * s, 112 * s);
  
  // === 俯视角格子花园 ===
  const gardenW = w - 20 * s;
  const gardenH = h - 255 * s;
  gardenCellSize = Math.min(gardenW / GRID_COLS, gardenH / GRID_ROWS);
  const gridW = GRID_COLS * gardenCellSize;
  const gridH = GRID_ROWS * gardenCellSize;
  gardenOriginX = (w - gridW) / 2;
  gardenOriginY = 128 * s;
  
  // 花园地块（深绿色底）
  ctx.fillStyle = '#166534';
  ctx.fillRect(gardenOriginX - 4 * s, gardenOriginY - 4 * s, gridW + 8 * s, gridH + 8 * s);
  
  // 绘制格子
  for (let row = 0; row < GRID_ROWS; row++) {
    for (let col = 0; col < GRID_COLS; col++) {
      const cx = gardenOriginX + col * gardenCellSize;
      const cy = gardenOriginY + row * gardenCellSize;
      // 格子交替颜色（棋盘格）
      ctx.fillStyle = (row + col) % 2 === 0 ? '#22c55e' : '#16a34a';
      ctx.fillRect(cx, cy, gardenCellSize, gardenCellSize);
      // 格子边框
      ctx.strokeStyle = '#15803d';
      ctx.lineWidth = 1;
      ctx.strokeRect(cx, cy, gardenCellSize, gardenCellSize);
    }
  }
  
  // 绘制花园物品（按行列排序绘制，小号在下层）
  // 先画地面物品（小），再画高物品（大）
  const sorted = [...gameState.garden].sort((a, b) => a.row - b.row);
  sorted.forEach(g => {
    const cx = gardenOriginX + g.col * gardenCellSize + gardenCellSize / 2;
    const cy = gardenOriginY + g.row * gardenCellSize + gardenCellSize / 2;
    const size = gardenCellSize * 0.7;
    ctx.font = `${size}px sans-serif`;
    ctx.textAlign = 'center';
    // 物品阴影
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fillText(g.item.emoji, cx + 2 * s, cy + size * 0.35 + 2 * s);
    // 物品本体
    ctx.fillStyle = '#fff';
    ctx.fillText(g.item.emoji, cx, cy + size * 0.35);
  });
  
  // 选中提示
  if (gameState.selectedGardenItem) {
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    roundRect(ctx, w / 2 - 90 * s, 122 * s, 180 * s, 30 * s, 12 * s);
    ctx.fill();
    ctx.fillStyle = '#86efac';
    ctx.font = `${12 * s}px sans-serif`;
    ctx.fillText(`已选 ${gameState.selectedGardenItem.emoji}，点击格子放置`, w / 2, 142 * s);
  }
  
  // 花园统计
  const flowerCount = gameState.garden.filter(g => ['rose','sunf','tulip','sakura','fwid','lavnd'].includes(g.item.id)).length;
  const treeCount = gameState.garden.filter(g => ['tree','palm','bush'].includes(g.item.id)).length;
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  roundRect(ctx, 10 * s, gardenOriginY + gridH + 8 * s, 120 * s, 22 * s, 10 * s);
  ctx.fill();
  ctx.fillStyle = '#374151';
  ctx.font = `${10 * s}px sans-serif`;
  ctx.textAlign = 'left';
  ctx.fillText(`🌸 ${flowerCount} | 🌲 ${treeCount} | 共 ${gameState.garden.length}`, 18 * s, gardenOriginY + gridH + 22 * s);
  
  // 花园商店
  ctx.fillStyle = 'rgba(255,255,255,0.95)';
  roundRect(ctx, 10 * s, h - 125 * s, w - 20 * s, 60 * s, 15 * s);
  ctx.fill();
  ctx.fillStyle = '#374151';
  ctx.font = `bold ${13 * s}px sans-serif`;
  ctx.textAlign = 'left';
  ctx.fillText('🌱 花园商店', 20 * s, h - 108 * s);
  
  // 花园商店物品（水平滚动，横向排列）
  gardenItems.forEach((item, i) => {
    const ix = 10 * s + i * 58 * s;
    const iy = h - 92 * s;
    const canAfford = gameState.money >= item.price;
    ctx.fillStyle = !canAfford ? '#e5e7eb' :
      (gameState.selectedGardenItem?.id === item.id ? '#bbf7d0' : '#f3f4f6');
    roundRect(ctx, ix, iy, 50 * s, 38 * s, 8 * s);
    ctx.fill();
    if (gameState.selectedGardenItem?.id === item.id) {
      ctx.strokeStyle = '#16a34a';
      ctx.lineWidth = 2 * s;
      ctx.stroke();
    }
    ctx.font = `${18 * s}px sans-serif`;
    ctx.fillText(item.emoji, ix + 25 * s, iy + 23 * s);
    ctx.fillStyle = canAfford ? '#f59e0b' : '#9ca3af';
    ctx.font = `${9 * s}px sans-serif`;
    ctx.fillText(`${item.price}`, ix + 25 * s, iy + 35 * s);
  });
  
  renderToast(s, w, h);
}

function renderTabs(s, w) {
  const tabY = 55 * UI.s;
  const tabH = 30 * UI.s;
  
  // 室内 Tab
  const roomActive = gameState.currentTab === 'room';
  ctx.fillStyle = roomActive ? '#fff' : 'rgba(255,255,255,0.5)';
  roundRect(ctx, w / 2 - 78 * s, tabY - 4 * s, 72 * s, tabH, 15 * s);
  ctx.fill();
  ctx.fillStyle = roomActive ? '#667eea' : '#fff';
  ctx.font = `bold ${13 * s}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('🏠 室内', w / 2 - 42 * s, tabY + 17 * s);
  
  // 花园 Tab
  const gardenActive = gameState.currentTab === 'garden';
  ctx.fillStyle = gardenActive ? '#fff' : 'rgba(255,255,255,0.5)';
  roundRect(ctx, w / 2 + 6 * s, tabY - 4 * s, 72 * s, tabH, 15 * s);
  ctx.fill();
  ctx.fillStyle = gardenActive ? '#16a34a' : '#fff';
  ctx.font = `bold ${13 * s}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('🌿 花园', w / 2 + 42 * s, tabY + 17 * s);
}

function renderToast(s, w, h) {
  if (toastTimer > 0) {
    ctx.fillStyle = `rgba(0,0,0,${Math.min(0.8, toastTimer / 40)})`;
    roundRect(ctx, w / 2 - 90 * s, h - 200 * s, 180 * s, 35 * s, 17 * s);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = `${14 * s}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(toastMsg, w / 2, h - 178 * s);
  }
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
