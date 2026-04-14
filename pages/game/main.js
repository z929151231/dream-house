// pages/game/main.js
const state = {
  money: 1000,
  level: 1,
  furniture: [],
  wallColor: '#fef3c7',
  selectedFurniture: null
};

const shopItems = [
  { id: 1, emoji: '🛋️', price: 100 },
  { id: 2, emoji: '🛏️', price: 150 },
  { id: 3, emoji: '🪑', price: 50 },
  { id: 4, emoji: '📺', price: 200 },
  { id: 5, emoji: '🌿', price: 30 },
  { id: 6, emoji: '💡', price: 40 },
  { id: 7, emoji: '🖼️', price: 80 },
  { id: 8, emoji: '🧸', price: 60 },
  { id: 9, emoji: '🎵', price: 180 },
  { id: 10, emoji: '🎮', price: 300, level: 2 }
];

const wallColors = ['#fef3c7', '#dbeafe', '#fce7f3', '#d1fae5', '#e5e7eb', '#fde68a'];

let canvas, ctx, UI = {};
let draggedFurniture = null;
let dragOffsetX = 0, dragOffsetY = 0;
let toastMsg = '', toastTimer = 0;

Page({
  data: { canvasReady: false },

  onLoad() {
    // 开启分享（右上角菜单 → 发送给朋友）
    wx.showShareMenu({ withShareTicket: true });
  },

  // 自定义分享内容
  onShareAppMessage() {
    return {
      title: '🏠 梦想小屋 - 我的温馨小窝',
      imageUrl: '/pages/game/main.png',
      path: 'pages/game/main'
    };
  },

  onReady() {
    // 先尝试从 wxml canvas 获取
    const query = wx.createSelectorQuery();
    query.select('#gameCanvas').node(res => {
      if (res && res.node) {
        canvas = res.node;
        ctx = canvas.getContext('2d');
        const info = wx.getSystemInfoSync();
        UI.w = info.windowWidth;
        UI.h = info.windowHeight;
        UI.s = UI.w / 375;
        canvas.width = UI.w;
        canvas.height = UI.h;
        this.setData({ canvasReady: true });
        this.scheduleLoop();
      }
    }).exec();

    // 超时保护：3秒后还没拿到 canvas，用备用方案
    setTimeout(() => {
      if (!ctx) {
        canvas = wx.createCanvas();
        ctx = canvas.getContext('2d');
        const info = wx.getSystemInfoSync();
        UI.w = info.windowWidth;
        UI.h = info.windowHeight;
        UI.s = UI.w / 375;
        canvas.width = UI.w;
        canvas.height = UI.h;
        this.setData({ canvasReady: true });
        this.scheduleLoop();
      }
    }, 3000);
  },

  scheduleLoop() {
    if (this.data.canvasReady) {
      this.render();
      if (toastTimer > 0) toastTimer--;
    }
    setTimeout(() => this.scheduleLoop(), 16);
  },

  onTouchStart(e) {
    const { x, y } = e.touches[0];
    // 拖家具
    for (let i = state.furniture.length - 1; i >= 0; i--) {
      const f = state.furniture[i];
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
          if (item.level && item.level > state.level) return this.showToast(`需要 ${item.level} 级解锁`);
          if (state.money >= item.price) { state.selectedFurniture = item; return this.showToast(`点击房间放置 ${item.emoji}`); }
          return this.showToast('金币不足！');
        }
      }
    }
    // 房间放置
    if (state.selectedFurniture && y > 95 * UI.s && y < UI.h - 130 * UI.s) {
      state.furniture.push({ emoji: state.selectedFurniture.emoji, price: state.selectedFurniture.price, x: x - 25 * UI.s, y: y - 25 * UI.s });
      state.money -= state.selectedFurniture.price;
      state.selectedFurniture = null;
      this.showToast('放置成功！');
      this.checkLevelUp();
      return;
    }
    // 换色
    if (y > UI.h - 165 * UI.s && y < UI.h - 130 * UI.s) {
      for (let i = 0; i < wallColors.length; i++) {
        const cx = 100 * UI.s + i * 38 * UI.s;
        if (x >= cx && x <= cx + 30 * UI.s) { state.wallColor = wallColors[i]; return this.showToast('换色成功！'); }
      }
    }
    // 出售
    const bx = UI.w / 2 - 80 * UI.s, by = UI.h - 55 * UI.s;
    if (x >= bx && x <= bx + 160 * UI.s && y >= by && y <= by + 40 * UI.s) this.sellHouse();
  },

  onTouchMove(e) {
    if (draggedFurniture) {
      draggedFurniture.x = e.touches[0].clientX - dragOffsetX;
      draggedFurniture.y = e.touches[0].clientY - dragOffsetY;
    }
  },

  onTouchEnd() { draggedFurniture = null; },

  sellHouse() {
    const val = state.furniture.reduce((s, f) => s + f.price * 0.8, 0);
    const bonus = Math.floor(val + 500);
    state.money += bonus;
    state.furniture = [];
    this.showToast(`出售成功 +${bonus}`);
    this.checkLevelUp();
  },

  checkLevelUp() {
    const next = state.level + 1;
    if (state.money >= next * 1000) {
      state.level = next;
      this.showToast(`升级！现在是 ${next} 级`);
    }
  },

  showToast(msg) { toastMsg = msg; toastTimer = 120; },

  render() {
    const s = UI.s, w = UI.w, h = UI.h;
    ctx.clearRect(0, 0, w, h);
    const grd = ctx.createLinearGradient(0, 0, w, h);
    grd.addColorStop(0, '#667eea'); grd.addColorStop(1, '#764ba2');
    ctx.fillStyle = grd; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#fff'; ctx.font = `bold ${22*s}px sans-serif`; ctx.textAlign = 'center';
    ctx.fillText('🏠 梦想小屋', w/2, 35*s);
    ctx.fillStyle = 'rgba(255,255,255,0.95)'; this.rr(10*s,50*s,w-20*s,35*s,15*s); ctx.fill();
    ctx.fillStyle = '#f59e0b'; ctx.font = `bold ${16*s}px sans-serif`; ctx.textAlign = 'left';
    ctx.fillText(`💰 ${state.money}`, 25*s, 73*s);
    ctx.fillStyle = '#10b981'; ctx.font = `bold ${14*s}px sans-serif`; ctx.textAlign = 'right';
    ctx.fillText(`⭐ Lv.${state.level}`, w-25*s, 73*s);
    ctx.fillStyle = 'rgba(255,255,255,0.95)'; this.rr(10*s,95*s,w-20*s,h-230*s,15*s); ctx.fill();
    ctx.fillStyle = state.wallColor; this.rr(20*s,105*s,w-40*s,h-270*s,10*s); ctx.fill();
    ctx.font = `${40*s}px sans-serif`; ctx.textAlign = 'center';
    state.furniture.forEach(f => ctx.fillText(f.emoji, f.x+25*s, f.y+35*s));
    if (state.selectedFurniture) {
      ctx.fillStyle = '#10b981'; ctx.font = `${12*s}px sans-serif`;
      ctx.fillText(`已选 ${state.selectedFurniture.emoji}，点击房间放置`, w/2, 93*s);
    }
    ctx.fillStyle = '#374151'; ctx.font = `${12*s}px sans-serif`; ctx.textAlign = 'left';
    ctx.fillText('墙壁:', 15*s, h-148*s);
    wallColors.forEach((c, i) => {
      ctx.fillStyle = c; ctx.beginPath(); ctx.arc(100*s+i*38*s+15*s, h-155*s, 15*s, 0, Math.PI*2); ctx.fill();
      if (c === state.wallColor) { ctx.strokeStyle='#374151'; ctx.lineWidth=3*s; ctx.stroke(); }
    });
    ctx.fillStyle = 'rgba(255,255,255,0.95)'; this.rr(10*s,h-125*s,w-20*s,60*s,15*s); ctx.fill();
    ctx.fillStyle = '#374151'; ctx.font = `bold ${14*s}px sans-serif`; ctx.textAlign = 'left';
    ctx.fillText('🛒 商店', 20*s, h-105*s);
    shopItems.forEach((item, i) => {
      const ix = 15*s + i*65*s, iy = h-90*s;
      const locked = item.level && item.level > state.level;
      ctx.fillStyle = locked ? '#e5e7eb' : (state.selectedFurniture?.id ===item.id ? '#d1fae5' : '#f3f4f6');
      this.rr(ix, iy, 55*s, 40*s, 8*s); ctx.fill();
      if (state.selectedFurniture?.id === item.id) { ctx.strokeStyle='#10b981'; ctx.lineWidth=2*s; ctx.stroke(); }
      ctx.font = `${22*s}px sans-serif`; ctx.fillText(locked ? '🔒' : item.emoji, ix+27*s, iy+26*s);
      if (!locked) { ctx.fillStyle='#f59e0b'; ctx.font=`${10*s}px sans-serif`; ctx.fillText(`${item.price}`, ix+27*s, iy+38*s); }
    });
    ctx.fillStyle = '#10b981'; this.rr(w/2-80*s,h-55*s,160*s,40*s,20*s); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = `bold ${16*s}px sans-serif`; ctx.textAlign = 'center';
    ctx.fillText('💰 出售房屋 +500', w/2, h-30*s);
    if (toastTimer > 0) {
      ctx.fillStyle = `rgba(0,0,0,${Math.min(0.8, toastTimer/40)})`;
      this.rr(w/2-90*s,h-200*s,180*s,35*s,17*s); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.font = `${14*s}px sans-serif`; ctx.fillText(toastMsg, w/2, h-178*s);
    }
  },

  rr(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y);
    ctx.quadraticCurveTo(x+w,y,x+w,y+r); ctx.lineTo(x+w,y+h-r);
    ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h); ctx.lineTo(x+r,y+h);
    ctx.quadraticCurveTo(x,y+h,x,y+h-r); ctx.lineTo(x,y+r);
    ctx.quadraticCurveTo(x,y,x+r,y); ctx.closePath();
  }
});
