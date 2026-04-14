// 梦想小屋 - 微信小游戏
const gameState = {
  money: 1000,
  level: 1,
  furniture: [],
  wallColor: '#fef3c7',
  selectedFurniture: null
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

const wallColors = ['#fef3c7', '#dbeafe', '#fce7f3', '#d1fae5', '#e5e7eb', '#fde68a'];

let canvas, ctx;
let UI = {};
let draggedFurniture = null;
let dragOffsetX = 0, dragOffsetY = 0;
let toastMsg = '';
let toastTimer = 0;

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
  
  for (let i = gameState.furniture.length - 1; i >= 0; i--) {
    const f = gameState.furniture[i];
    if (x >= f.x && x <= f.x + 50 * UI.s && y >= f.y && y <= f.y + 50 * UI.s) {
      draggedFurniture = f;
      dragOffsetX = x - f.x;
      dragOffsetY = y - f.y;
      return;
    }
  }
  
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
  
  const roomTop = 95 * UI.s;
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
  
  const bx = UI.w / 2 - 80 * UI.s;
  const by = UI.h - 55 * UI.s;
  if (x >= bx && x <= bx + 160 * UI.s && y >= by && y <= by + 40 * UI.s) {
    sellHouse();
  }
}

function onTouchMove(e) {
  if (draggedFurniture) {
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
  
  // 背景
  const grd = ctx.createLinearGradient(0, 0, w, h);
  grd.addColorStop(0, '#667eea');
  grd.addColorStop(1, '#764ba2');
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, w, h);
  
  // 标题
  ctx.fillStyle = '#fff';
  ctx.font = `bold ${22 * s}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('🏠 梦想小屋', w / 2, 35 * s);
  
  // 状态栏
  ctx.fillStyle = 'rgba(255,255,255,0.95)';
  roundRect(ctx, 10 * s, 50 * s, w - 20 * s, 35 * s, 15 * s);
  ctx.fill();
  ctx.fillStyle = '#f59e0b';
  ctx.font = `bold ${16 * s}px sans-serif`;
  ctx.textAlign = 'left';
  ctx.fillText(`💰 ${gameState.money}`, 25 * s, 73 * s);
  ctx.fillStyle = '#10b981';
  ctx.font = `bold ${14 * s}px sans-serif`;
  ctx.textAlign = 'right';
  ctx.fillText(`⭐ Lv.${gameState.level}`, w - 25 * s, 73 * s);
  
  // 房间
  ctx.fillStyle = 'rgba(255,255,255,0.95)';
  roundRect(ctx, 10 * s, 95 * s, w - 20 * s, h - 230 * s, 15 * s);
  ctx.fill();
  ctx.fillStyle = gameState.wallColor;
  roundRect(ctx, 20 * s, 105 * s, w - 40 * s, h - 270 * s, 10 * s);
  ctx.fill();
  
  // 家具
  ctx.font = `${40 * s}px sans-serif`;
  ctx.textAlign = 'center';
  gameState.furniture.forEach(f => {
    ctx.fillText(f.emoji, f.x + 25 * s, f.y + 35 * s);
  });
  
  // 选中提示
  if (gameState.selectedFurniture) {
    ctx.fillStyle = '#10b981';
    ctx.font = `${12 * s}px sans-serif`;
    ctx.fillText(`已选 ${gameState.selectedFurniture.emoji}，点击房间放置`, w / 2, 93 * s);
  }
  
  // 颜色选择
  ctx.fillStyle = '#374151';
  ctx.font = `${12 * s}px sans-serif`;
  ctx.textAlign = 'left';
  ctx.fillText('墙壁:', 15 * s, h - 148 * s);
  wallColors.forEach((color, i) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(100 * s + i * 38 * s + 15 * s, h - 155 * s, 15 * s, 0, Math.PI * 2);
    ctx.fill();
    if (color === gameState.wallColor) {
      ctx.strokeStyle = '#374151';
      ctx.lineWidth = 3 * s;
      ctx.stroke();
    }
  });
  
  // 商店
  ctx.fillStyle = 'rgba(255,255,255,0.95)';
  roundRect(ctx, 10 * s, h - 125 * s, w - 20 * s, 60 * s, 15 * s);
  ctx.fill();
  ctx.fillStyle = '#374151';
  ctx.font = `bold ${14 * s}px sans-serif`;
  ctx.textAlign = 'left';
  ctx.fillText('🛒 商店', 20 * s, h - 105 * s);
  
  // 商店物品
  shopItems.forEach((item, i) => {
    const ix = 15 * s + i * 65 * s;
    const iy = h - 90 * s;
    const locked = item.level && item.level > gameState.level;
    ctx.fillStyle = locked ? '#e5e7eb' :
      (gameState.selectedFurniture?.id === item.id ? '#d1fae5' : '#f3f4f6');
    roundRect(ctx, ix, iy, 55 * s, 40 * s, 8 * s);
    ctx.fill();
    if (gameState.selectedFurniture?.id === item.id) {
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2 * s;
      ctx.stroke();
    }
    ctx.font = `${22 * s}px sans-serif`;
    ctx.fillText(locked ? '🔒' : item.emoji, ix + 27 * s, iy + 26 * s);
    if (!locked) {
      ctx.fillStyle = '#f59e0b';
      ctx.font = `${10 * s}px sans-serif`;
      ctx.fillText(`${item.price}`, ix + 27 * s, iy + 38 * s);
    }
  });
  
  // 出售按钮
  ctx.fillStyle = '#10b981';
  roundRect(ctx, w / 2 - 80 * s, h - 55 * s, 160 * s, 40 * s, 20 * s);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = `bold ${16 * s}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('💰 出售房屋 +500', w / 2, h - 30 * s);
  
  // Toast
  if (toastTimer > 0) {
    ctx.fillStyle = `rgba(0,0,0,${Math.min(0.8, toastTimer / 40)})`;
    roundRect(ctx, w / 2 - 90 * s, h - 200 * s, 180 * s, 35 * s, 17 * s);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = `${14 * s}px sans-serif`;
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
