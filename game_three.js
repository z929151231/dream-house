// ============================================================
// 梦想小屋 v3 - 完整3D世界
// 透视相机 · 真实房屋 · 环绕院子 · 自由旋转
// ============================================================

// ===== 商店物品 =====
var DECO_ITEMS = [
  { id:'sakura',  name:'樱花树',  kind:'tree',   growth:12, c:{trunk:'#6d4c41',c1:'#f48fb1',c2:'#f06292',c3:'#ec407a'} },
  { id:'pine',    name:'松树',    kind:'tree',   growth:20, c:{trunk:'#5d4037',c1:'#1b5e20',c2:'#2e7d32',c3:'#388e3c'} },
  { id:'maple',   name:'枫树',    kind:'tree',   growth:12, c:{trunk:'#5d4037',c1:'#ff7043',c2:'#ff5722',c3:'#f4511e'} },
  { id:'willow',  name:'垂柳',    kind:'tree',   growth:15, c:{trunk:'#5d4037',c1:'#a5d6a7',c2:'#81c784',c3:'#66bb6a'} },
  { id:'bush',    name:'灌木',    kind:'tree',   growth:8,  c:{trunk:'#4e342e',c1:'#388e3c',c2:'#43a047',c3:'#4caf50'} },
  { id:'rose',    name:'玫瑰',    kind:'flower', growth:8,  c:{stem:'#2e7d32',p1:'#e91e63',center:'#ffd54f'} },
  { id:'sunf',    name:'向日葵',  kind:'flower', growth:6,  c:{stem:'#388e3c',p1:'#ffc107',center:'#5d4037'} },
  { id:'tulip',   name:'郁金香',  kind:'flower', growth:6,  c:{stem:'#43a047',p1:'#e91e63',center:'#fff176'} },
  { id:'lavnd',   name:'薰衣草',  kind:'flower', growth:8,  c:{stem:'#388e3c',p1:'#9c27b0',center:'#ce93d8'} },
  { id:'hydra',   name:'绣球',    kind:'flower', growth:10, c:{stem:'#2e7d32',p1:'#2196f3',center:'#fff9c4'} },
  { id:'pond',    name:'池塘',    kind:'water',  growth:0,  c:{water:'#4fc3f7',edge:'#78909c'} },
  { id:'fount',   name:'喷泉',    kind:'water',  growth:0,  c:{water:'#4fc3f7',stone:'#90a4ae'} },
  { id:'rock',    name:'石头',    kind:'deco',   growth:0,  c:{light:'#bdbdbd',dark:'#757575'} },
  { id:'lamp',    name:'路灯',    kind:'deco',   growth:0,  c:{pole:'#546e7a',glow:'#fff176'} },
  { id:'bench',    name:'长椅',   kind:'deco',   growth:0,  c:{wood:'#8d6e63',metal:'#455a64'} },
  { id:'fence',    name:'栅栏',   kind:'deco',   growth:0,  c:{wood:'#a1887f',dark:'#8d6e63'} },
  { id:'cat',     name:'猫咪',    kind:'deco',   growth:0,  c:{body:'#ff9800',eye:'#1a1a1a'} },
  { id:'bunny',   name:'兔子',    kind:'deco',   growth:0,  c:{body:'#fafafa',pink:'#f8bbd9',eye:'#1a1a1a'} },
  { id:'windmill',name:'风车',    kind:'deco',   growth:0,  c:{wood:'#8d6e63',blade:'#fafafa',roof:'#bcaaa4'} },
  { id:'angelf',  name:'天使像',  kind:'deco',   growth:0,  c:{stone:'#eceff1',gold:'#ffd700'} },
  { id:'hedge',   name:'树篱',    kind:'deco',   growth:0,  c:{c1:'#388e3c',light:'#4caf50'} },
  { id:'step',    name:'石板路',  kind:'ground', growth:0,  c:{top:'#bdbdbd',side:'#9e9e9e'} },
  { id:'grass',   name:'草坪',    kind:'ground', growth:0,  c:{top:'#4caf50',side:'#388e3c'} },
];

var HOUSE_LEVELS = [
  { name:'小木屋',  scale:1.0, c:{wall:'#d7ccc8',wallS:'#bcaaa4',roof:'#795548',roofS:'#5d4037',win:'#4fc3f7',door:'#6d4c41',base:'#90a4ae'} },
  { name:'砖瓦房',  scale:1.15, c:{wall:'#a1887f',wallS:'#8d6e63',roof:'#6d4c41',roofS:'#5d4037',win:'#fff59d',door:'#5d4037',base:'#8d6e63'} },
  { name:'欧式别墅',scale:1.3, c:{wall:'#ef9a9a',wallS:'#e57373',roof:'#c62828',roofS:'#b71c1c',win:'#fff176',door:'#4e342e',base:'#ef9a9a'} },
  { name:'现代豪宅',scale:1.5, c:{wall:'#f5f5f5',wallS:'#e0e0e0',roof:'#37474f',roofS:'#263238',win:'#4dd0e1',door:'#37474f',base:'#cfd8dc'} },
  { name:'梦幻城堡',scale:1.7, c:{wall:'#e1bee7',wallS:'#ce93d8',roof:'#6a1b9a',roofS:'#4a148c',win:'#fff9c4',door:'#4a148c',base:'#ce93d8'} },
];

// 程序贴图（运行时生成）
var brickTex, woodTex, roofTex, grassTex, stoneTex;

// ===== 院子格子布局 =====
// 院子是以房子为中心的环形区域，分成若干可放置格子
// 格子坐标系：以房子中心为原点，格子大小2x2
var YARD_SLOTS = (function() {
  var slots = [];
  var id = 0;
  // 外圈：-4到4，排除中心3x3（房子占地）
  for (var row = -4; row <= 4; row++) {
    for (var col = -4; col <= 4; col++) {
      // 跳过中心3x3（房子区域）
      if (row >= -1 && row <= 1 && col >= -1 && col <= 1) continue;
      slots.push({ id: id++, row: row, col: col, item: null, plantedAt: 0 });
    }
  }
  return slots;
})();

// ===== 游戏状态 =====
var gameState = {
  houseLevel: 1,
  timeOfDay: 0.42,
  _fireflyActive: false,
};

// ===== Three.js 全局 =====
var scene, camera, renderer, clock;
var ambientLight, sunLight, hemiLight;
var raycaster, mouse;
var yardGroup, houseGroup, groundMesh;
var highlightMesh;
var sakuParticles = [], fireflies = [];

// 相机轨道控制
var camTheta = 0.6;   // 水平角
var camPhi   = 0.9;   // 垂直角（0=顶视，PI/2=侧视）
var camDist  = 28;    // 距离
var camTarget = new THREE.Vector3(0, 0, 0);
var isDragging = false, lastPointer = null;
var pinchDist0 = 0;

// 升级动画状态
var upgradeAnim = {
  active: false,
  phase: 'none',
  timer: 0,
  particles: [],
  ring: null,
};

// ===== 程序贴图 =====
function makeCanvas(w, h, drawFn) {
  var cv = document.createElement('canvas');
  cv.width = w; cv.height = h;
  var ctx = cv.getContext('2d');
  drawFn(ctx, w, h);
  var tex = new THREE.CanvasTexture(cv);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

function createTextures() {
  // 砖墙
  brickTex = makeCanvas(256, 256, function(ctx, w, h) {
    ctx.fillStyle = '#c8a882'; ctx.fillRect(0, 0, w, h);
    var bh = 18, bw = 45;
    for (var y = 0; y < h; y += bh) {
      var off = (Math.floor(y / bh) % 2 === 0) ? 0 : bw / 2;
      for (var x = -bw; x < w + bw; x += bw) {
        var bx = x + off;
        var gap = 2;
        // 砖块底色+明暗
        var bright = 0.85 + Math.random() * 0.3;
        ctx.fillStyle = 'rgba(' + Math.floor(180*bright) + ',' + Math.floor(140*bright) + ',' + Math.floor(100*bright) + ',1)';
        ctx.fillRect(bx + gap, y + gap, bw - gap*2, bh - gap*2);
        // 灰浆缝
        ctx.fillStyle = '#8a7a6a';
        ctx.fillRect(bx, y, bw, 2);
        ctx.fillRect(bx, y, 2, bh);
      }
    }
    // 表面纹理噪声
    var id = ctx.getImageData(0, 0, w, h);
    for (var i = 0; i < id.data.length; i += 4) {
      var n = (Math.random() - 0.5) * 18;
      id.data[i]   = Math.max(0, Math.min(255, id.data[i]   + n));
      id.data[i+1] = Math.max(0, Math.min(255, id.data[i+1] + n));
      id.data[i+2] = Math.max(0, Math.min(255, id.data[i+2] + n));
    }
    ctx.putImageData(id, 0, 0);
  });
  brickTex.repeat.set(2, 1.5);

  // 木纹
  woodTex = makeCanvas(256, 256, function(ctx, w, h) {
    ctx.fillStyle = '#8b5e3c'; ctx.fillRect(0, 0, w, h);
    // 竖向木纹
    for (var x = 0; x < w; x += 8 + Math.random() * 6) {
      var v = Math.floor(120 + Math.random() * 60);
      ctx.fillStyle = 'rgba(' + v + ',' + Math.floor(v*0.7) + ',' + Math.floor(v*0.4) + ',0.5)';
      ctx.fillRect(x, 0, 2 + Math.random() * 4, h);
    }
    // 年轮/节眼
    for (var i = 0; i < 5; i++) {
      var cx = Math.random() * w, cy = Math.random() * h;
      var r = 4 + Math.random() * 8;
      var g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      g.addColorStop(0, 'rgba(100,60,30,0.6)');
      g.addColorStop(0.7, 'rgba(130,80,40,0.3)');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI*2); ctx.fill();
    }
    // 噪声
    var id = ctx.getImageData(0, 0, w, h);
    for (var i2 = 0; i2 < id.data.length; i2 += 4) {
      var n2 = (Math.random() - 0.5) * 12;
      id.data[i2]   = Math.max(0, Math.min(255, id.data[i2]   + n2));
      id.data[i2+1] = Math.max(0, Math.min(255, id.data[i2+1] + n2));
      id.data[i2+2] = Math.max(0, Math.min(255, id.data[i2+2] + n2));
    }
    ctx.putImageData(id, 0, 0);
  });
  woodTex.repeat.set(1, 2);

  // 瓦片屋顶
  roofTex = makeCanvas(256, 256, function(ctx, w, h) {
    ctx.fillStyle = '#4a4a5a'; ctx.fillRect(0, 0, w, h);
    var tw = 22, th = 12;
    for (var ty = 0; ty < h + th; ty += th) {
      var off = (Math.floor(ty / th) % 2 === 0) ? 0 : tw / 2;
      for (var tx = -tw; tx < w + tw; tx += tw) {
        var bright = 0.7 + Math.random() * 0.3;
        var r = Math.floor(80*bright), g = Math.floor(80*bright), b = Math.floor(100*bright);
        ctx.fillStyle = 'rgb(' + r + ',' + g + ',' + b + ')';
        ctx.beginPath();
        ctx.moveTo(tx + off, ty);
        ctx.lineTo(tx + off + tw/2, ty + th * 0.3);
        ctx.lineTo(tx + off + tw, ty);
        ctx.lineTo(tx + off + tw, ty + th * 0.7);
        ctx.lineTo(tx + off + tw/2, ty + th);
        ctx.lineTo(tx + off, ty + th * 0.7);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#2a2a3a'; ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
  });
  roofTex.repeat.set(2, 2);

  // 草地
  grassTex = makeCanvas(256, 256, function(ctx, w, h) {
    ctx.fillStyle = '#3d8b3d'; ctx.fillRect(0, 0, w, h);
    for (var i = 0; i < 3000; i++) {
      var x = Math.random() * w, y = Math.random() * h;
      var g = Math.floor(50 + Math.random() * 50);
      ctx.fillStyle = 'rgba(' + g + ',' + (g + 20) + ',0,0.4)';
      ctx.fillRect(x, y, 1 + Math.random() * 2, 2 + Math.random() * 4);
    }
    // 深浅斑块
    for (var i2 = 0; i2 < 15; i2++) {
      ctx.fillStyle = 'rgba(30,80,20,' + (0.1 + Math.random() * 0.15) + ')';
      ctx.beginPath();
      ctx.arc(Math.random()*w, Math.random()*h, 10 + Math.random()*20, 0, Math.PI*2);
      ctx.fill();
    }
  });

  // 石板
  stoneTex = makeCanvas(256, 256, function(ctx, w, h) {
    ctx.fillStyle = '#9e9e9e'; ctx.fillRect(0, 0, w, h);
    var sw = 50, sh = 50;
    for (var sy = 0; sy < h; sy += sh) {
      var off2 = (Math.floor(sy / sh) % 2 === 0) ? 0 : sw/2;
      for (var sx = -sw; sx < w + sw; sx += sw) {
        var bx2 = sx + off2;
        var bright2 = 0.85 + Math.random() * 0.3;
        ctx.fillStyle = 'rgb(' + Math.floor(150*bright2) + ',' + Math.floor(148*bright2) + ',' + Math.floor(145*bright2) + ')';
        ctx.fillRect(bx2 + 2, sy + 2, sw - 4, sh - 4);
        ctx.strokeStyle = '#757575'; ctx.lineWidth = 2;
        ctx.strokeRect(bx2 + 2, sy + 2, sw - 4, sh - 4);
      }
    }
  });
  stoneTex.repeat.set(3, 3);
}

// ===== 初始化 =====
function init() {
  createTextures();

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87CEEB);
  scene.fog = new THREE.FogExp2(0x87CEEB, 0.012);
  clock = new THREE.Clock();

  // 透视相机
  camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 500);
  updateCamera();

  // 渲染器
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  document.getElementById('gameCanvas').appendChild(renderer.domElement);

  mouse = new THREE.Vector2();
  raycaster = new THREE.Raycaster();

  // 组
  yardGroup  = new THREE.Group();
  houseGroup = new THREE.Group();
  scene.add(yardGroup);
  scene.add(houseGroup);

  // 光照
  setupLighting();

  // 地面
  buildGround();

  // 院子格子
  buildYardSlots();

  // 房屋
  buildHouse();

  // 高亮
  createHighlight();

  // 事件
  renderer.domElement.addEventListener('pointerdown', onPointerDown, {passive:false});
  renderer.domElement.addEventListener('pointermove', onPointerMove, {passive:false});
  renderer.domElement.addEventListener('pointerup',   onPointerUp);
  renderer.domElement.addEventListener('wheel',      onWheel, {passive:false});
  renderer.domElement.addEventListener('touchstart',  onTouchStart, {passive:false});
  renderer.domElement.addEventListener('touchmove',   onTouchMove, {passive:false});
  renderer.domElement.addEventListener('touchend',   onPointerUp);
  renderer.domElement.addEventListener('touchcancel', onPointerUp);
  renderer.domElement.addEventListener('contextmenu', function(e){ e.preventDefault(); });
  window.addEventListener('resize', onResize);
  document.body.style.overflow = 'hidden';
  document.body.style.overscrollBehavior = 'none';

  setupUI();
  animate();
}

// ===== 相机 =====
function updateCamera() {
  var x = camDist * Math.sin(camPhi) * Math.sin(camTheta);
  var y = camDist * Math.cos(camPhi);
  var z = camDist * Math.sin(camPhi) * Math.cos(camTheta);
  camera.position.set(
    camTarget.x + x,
    camTarget.y + y,
    camTarget.z + z
  );
  camera.lookAt(camTarget);
}

// ===== 光照 =====
function setupLighting() {
  ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  hemiLight = new THREE.HemisphereLight(0x87CEEB, 0x4a7c4a, 0.6);
  scene.add(hemiLight);

  sunLight = new THREE.DirectionalLight(0xfffaf0, 1.2);
  sunLight.position.set(15, 25, 10);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.width  = 2048;
  sunLight.shadow.mapSize.height = 2048;
  sunLight.shadow.camera.near   = 1;
  sunLight.shadow.camera.far    = 100;
  sunLight.shadow.camera.left   = -30;
  sunLight.shadow.camera.right  = 30;
  sunLight.shadow.camera.top    = 30;
  sunLight.shadow.camera.bottom = -30;
  sunLight.shadow.bias = -0.001;
  scene.add(sunLight);
}

function updateDayNight() {
  var t = gameState.timeOfDay;
  var skyHex, sunHex, sunInt, ambInt, isNight = false;

  if (t < 0.15) {
    skyHex=0x0d1b4b; sunHex=0x334466; sunInt=0.1; ambInt=0.15; isNight=true;
  } else if (t < 0.25) {
    skyHex=0xff7043; sunHex=0xff8a65; sunInt=0.7; ambInt=0.4;
  } else if (t < 0.5) {
    skyHex=0x87CEEB; sunHex=0xfffaf0; sunInt=1.2; ambInt=0.55;
  } else if (t < 0.75) {
    skyHex=0xff8a65; sunHex=0xffab91; sunInt=0.8; ambInt=0.4;
  } else {
    skyHex=0x1a237e; sunHex=0x334466; sunInt=0.1; ambInt=0.15; isNight=true;
  }

  scene.background.setHex(skyHex);
  scene.fog.color.setHex(skyHex);
  sunLight.color.setHex(sunHex);
  sunLight.intensity = sunInt;
  ambientLight.intensity = ambInt;
  hemiLight.intensity = ambInt * 0.8;
  hemiLight.groundColor.setHex(isNight ? 0x1a2f1a : 0x4a7c4a);

  var angle = t * Math.PI * 2 - Math.PI / 2;
  sunLight.position.set(Math.cos(angle)*25, Math.sin(angle)*20+5, 8);

  // 萤火虫
  if (isNight !== gameState._fireflyActive) {
    gameState._fireflyActive = isNight;
    if (isNight) {
      for (var i = 0; i < 18; i++) {
        var fm = new THREE.Mesh(
          new THREE.SphereGeometry(0.07, 4, 4),
          new THREE.MeshBasicMaterial({ color:0xffff88, transparent:true, opacity:0.8 })
        );
        fm.position.set((Math.random()-0.5)*24, 0.5+Math.random()*3, (Math.random()-0.5)*24);
        fm.userData.phase = Math.random()*Math.PI*2;
        fm.userData.speed = 0.4+Math.random()*0.6;
        fm.userData.baseY = fm.position.y;
        scene.add(fm);
        fireflies.push(fm);
      }
    } else {
      for (var j=0;j<fireflies.length;j++) scene.remove(fireflies[j]);
      fireflies = [];
    }
  }
}

// ===== 大地面 =====
function buildGround() {
  // 主草地
  var geo = new THREE.PlaneGeometry(60, 60, 1, 1);
  var mat = new THREE.MeshPhongMaterial({ map: grassTex });
  groundMesh = new THREE.Mesh(geo, mat);
  groundMesh.rotation.x = -Math.PI / 2;
  groundMesh.position.y = -0.01;
  groundMesh.receiveShadow = true;
  scene.add(groundMesh);

  // 小路（从房子门口延伸出去）
  var pathGeo = new THREE.BoxGeometry(2.0, 0.05, 12);
  var pathMat = new THREE.MeshPhongMaterial({ map: stoneTex });
  var path = new THREE.Mesh(pathGeo, pathMat);
  path.position.set(0, 0.02, 8);
  path.receiveShadow = true;
  scene.add(path);

  // 围墙/篱笆
  buildFenceRing(18);
}

function buildFenceRing(r) {
  var postMat = new THREE.MeshPhongMaterial({ map: woodTex, color: 0xffffff });
  var railMat = new THREE.MeshPhongMaterial({ map: woodTex, color: 0xffffff });
  var sides = 24;
  for (var i = 0; i < sides; i++) {
    var a = (i / sides) * Math.PI * 2;
    var x = Math.cos(a) * r, z = Math.sin(a) * r;
    var post = new THREE.Mesh(new THREE.BoxGeometry(0.15, 1.2, 0.15), postMat);
    post.position.set(x, 0.6, z);
    post.castShadow = true;
    scene.add(post);
    // 横杆
    var a2 = ((i+1)/sides)*Math.PI*2;
    var x2 = Math.cos(a2)*r, z2 = Math.sin(a2)*r;
    var mx=(x+x2)/2, mz=(z+z2)/2;
    var len = Math.sqrt((x2-x)*(x2-x)+(z2-z)*(z2-z));
    var ang = Math.atan2(x2-x, z2-z);
    [0.35, 0.75].forEach(function(ry) {
      var rail = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, len), railMat);
      rail.position.set(mx, ry, mz);
      rail.rotation.y = ang;
      scene.add(rail);
    });
  }
}

// ===== 院子格子 =====
function buildYardSlots() {
  yardGroup.clear();
  for (var i = 0; i < YARD_SLOTS.length; i++) {
    var slot = YARD_SLOTS[i];
    var x = slot.col * 2;
    var z = slot.row * 2;

    // 地面格子（可点击）
    var tileGeo = new THREE.BoxGeometry(1.85, 0.12, 1.85);
    var tileColor = (slot.col + slot.row) % 2 === 0 ? 0x66bb6a : 0x5abf5a;
    if (slot.item && slot.item.kind === 'ground') {
      tileColor = slot.item.id === 'step' ? 0xbdbdbd : 0x4caf50;
    }
    var tileMat = new THREE.MeshPhongMaterial({ color: tileColor });
    var tile = new THREE.Mesh(tileGeo, tileMat);
    tile.position.set(x, 0.06, z);
    tile.receiveShadow = true;
    tile.userData = { type:'slot', slotId: slot.id };
    yardGroup.add(tile);

    // 放置的物体
    if (slot.item) {
      var now = Date.now();
      var grow = slot.item.growth > 0
        ? Math.min(1, (now - slot.plantedAt) / 1000 / slot.item.growth)
        : 1;
      var obj = createItemMesh(slot.item, grow);
      obj.position.set(x, 0.12, z);
      obj.userData = { type:'object', slotId: slot.id };
      yardGroup.add(obj);
    }
  }
}

// ===== 房屋 =====
function buildHouse() {
  houseGroup.clear();
  var lvl = gameState.houseLevel;
  if (lvl === 1) buildWoodenHut();
  else if (lvl === 2) buildBrickHouse();
  else if (lvl === 3) buildEuropeanVilla();
  else if (lvl === 4) buildModernMansion();
  else buildCastle();
  updateWindowGlow();
}

// ===== 1. 小木屋：A字顶童话风 =====
function buildWoodenHut() {
  var c = HOUSE_LEVELS[0].c;
  var s = HOUSE_LEVELS[0].scale;
  
  // 地基
  var base = new THREE.Mesh(new THREE.BoxGeometry(5*s, 0.3, 5*s), new THREE.MeshPhongMaterial({color: c.base}));
  base.position.y = 0.15;
  base.receiveShadow = true;
  houseGroup.add(base);
  
  // 主体（原木色墙壁）
  var wallMat = new THREE.MeshPhongMaterial({color: c.wall});
  wallMat.map = woodTex;
  // 前墙
  var front = new THREE.Mesh(new THREE.BoxGeometry(4*s, 3*s, 0.25), wallMat);
  front.position.set(0, 1.65*s, -2*s);
  front.castShadow = true;
  front.receiveShadow = true;
  houseGroup.add(front);
  // 后墙
  var back = front.clone();
  back.position.z = 2*s;
  houseGroup.add(back);
  // 左墙
  var left = new THREE.Mesh(new THREE.BoxGeometry(0.25, 3*s, 4*s), wallMat);
  left.position.set(-2*s, 1.65*s, 0);
  left.castShadow = true;
  houseGroup.add(left);
  // 右墙
  var right = left.clone();
  right.position.x = 2*s;
  houseGroup.add(right);
  
  // A字三角顶
  var roofShape = new THREE.Shape();
  roofShape.moveTo(-2.5*s, 0);
  roofShape.lineTo(0, 2.5*s);
  roofShape.lineTo(2.5*s, 0);
  roofShape.lineTo(-2.5*s, 0);
  var roofGeo = new THREE.ExtrudeGeometry(roofShape, {depth: 5*s, bevelEnabled: false});
  var roofMat = new THREE.MeshPhongMaterial({color: c.roof});
  var roof = new THREE.Mesh(roofGeo, roofMat);
  roof.rotation.x = Math.PI/2;
  roof.position.set(0, 3*s, 2.5*s);
  roof.castShadow = true;
  houseGroup.add(roof);
  
  // 门
  var door = new THREE.Mesh(new THREE.BoxGeometry(0.9*s, 1.8*s, 0.15), new THREE.MeshPhongMaterial({color: c.door}));
  door.position.set(0, 1.0*s, -2.1*s);
  houseGroup.add(door);
  
  // 小圆窗
  var win = new THREE.Mesh(new THREE.CircleGeometry(0.4*s, 16), new THREE.MeshPhongMaterial({color: c.win, transparent: true, opacity: 0.85}));
  win.position.set(0, 2.2*s, -2.1*s);
  houseGroup.add(win);
  
  // 窗框
  var frame = new THREE.Mesh(new THREE.RingGeometry(0.35*s, 0.45*s, 16), new THREE.MeshPhongMaterial({color: c.wallS}));
  frame.position.set(0, 2.2*s, -2.08*s);
  houseGroup.add(frame);
}

// ===== 2. 砖瓦房：传统四坡顶 =====
function buildBrickHouse() {
  var c = HOUSE_LEVELS[1].c;
  var s = HOUSE_LEVELS[1].scale;
  
  // 地基
  var base = new THREE.Mesh(new THREE.BoxGeometry(7*s, 0.4, 7*s), new THREE.MeshPhongMaterial({color: c.base}));
  base.position.y = 0.2;
  base.receiveShadow = true;
  houseGroup.add(base);
  
  // 墙壁
  var wallMat = new THREE.MeshPhongMaterial({color: 0xffffff});
  wallMat.map = brickTex;
  
  addWall(houseGroup, 6*s, 4*s, 0.3, 0, 2*s, -3*s, 0, 0xffffff, true, brickTex);
  addWall(houseGroup, 6*s, 4*s, 0.3, 0, 2*s, 3*s, 0, 0xffffff, true, brickTex);
  addWall(houseGroup, 0.3, 4*s, 6*s, -3*s, 2*s, 0, 0, 0xffffff, true, brickTex);
  addWall(houseGroup, 0.3, 4*s, 6*s, 3*s, 2*s, 0, 0, 0xffffff, true, brickTex);
  
  // 四坡顶
  buildPyramidRoof(s, 7*s, 3*s, c.roof);
  
  // 烟囱
  var chim = new THREE.Mesh(new THREE.BoxGeometry(0.5*s, 1.8*s, 0.5*s), new THREE.MeshPhongMaterial({color: shadeColor(c.roof, -20)}));
  chim.position.set(1.5*s, 5.5*s, 1*s);
  chim.castShadow = true;
  houseGroup.add(chim);
  
  // 门廊
  [-0.9*s, 0.9*s].forEach(function(px) {
    var pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.15*s, 0.18*s, 1.3*s, 8), new THREE.MeshPhongMaterial({color: c.wall}));
    pillar.position.set(px, 1.0*s, -3.6*s);
    pillar.castShadow = true;
    houseGroup.add(pillar);
  });
  
  // 门廊顶
  var porchRoof = new THREE.Mesh(new THREE.BoxGeometry(2.2*s, 0.15, 0.8), new THREE.MeshPhongMaterial({color: c.roofS}));
  porchRoof.position.set(0, 1.7*s, -3.5*s);
  houseGroup.add(porchRoof);
  
  // 门
  var door = new THREE.Mesh(new THREE.BoxGeometry(1.1*s, 2.2*s, 0.2), new THREE.MeshPhongMaterial({color: c.door}));
  door.position.set(0, 1.2*s, -3.1*s);
  houseGroup.add(door);
  
  // 窗户
  var winPos = [[-1.5*s, 2.3*s, -3.05*s, 0], [1.5*s, 2.3*s, -3.05*s, 0], [-3.05*s, 2.3*s, -1.5*s, Math.PI/2], [3.05*s, 2.3*s, -1.5*s, Math.PI/2]];
  winPos.forEach(function(wp) {
    var win = new THREE.Mesh(new THREE.BoxGeometry(0.9*s, 0.9*s, 0.08), new THREE.MeshPhongMaterial({color: c.win, transparent: true, opacity: 0.85}));
    win.position.set(wp[0], wp[1], wp[2]);
    win.rotation.y = wp[3];
    houseGroup.add(win);
    var frame = new THREE.Mesh(new THREE.BoxGeometry(1.0*s, 1.0*s, 0.06), new THREE.MeshPhongMaterial({color: c.wallS}));
    frame.position.set(wp[0], wp[1], wp[2]);
    frame.rotation.y = wp[3];
    houseGroup.add(frame);
  });
}

// ===== 3. 欧式别墅：带塔楼 =====
function buildEuropeanVilla() {
  var c = HOUSE_LEVELS[2].c;
  var s = HOUSE_LEVELS[2].scale;
  
  // 地基
  var base = new THREE.Mesh(new THREE.BoxGeometry(8*s, 0.5, 8*s), new THREE.MeshPhongMaterial({color: c.base}));
  base.position.y = 0.25;
  base.receiveShadow = true;
  houseGroup.add(base);
  
  // 主楼
  addWall(houseGroup, 5*s, 4.5*s, 0.3, 0, 2.5*s, -2*s, 0, c.wall, true, null);
  addWall(houseGroup, 5*s, 4.5*s, 0.3, 0, 2.5*s, 2*s, 0, c.wallS, true, null);
  addWall(houseGroup, 0.3, 4.5*s, 4*s, -2.5*s, 2.5*s, 0, 0, c.wallS, true, null);
  addWall(houseGroup, 0.3, 4.5*s, 4*s, 2.5*s, 2.5*s, 0, 0, c.wall, true, null);
  
  // 尖塔楼（左前角）
  var tower = new THREE.Group();
  // 塔身
  var towerBody = new THREE.Mesh(new THREE.CylinderGeometry(0.8*s, 1.0*s, 5*s, 12), new THREE.MeshPhongMaterial({color: c.wall}));
  towerBody.position.y = 2.5*s;
  towerBody.castShadow = true;
  tower.add(towerBody);
  // 塔顶（圆锥）
  var towerRoof = new THREE.Mesh(new THREE.ConeGeometry(1.2*s, 2.5*s, 12), new THREE.MeshPhongMaterial({color: c.roof}));
  towerRoof.position.y = 6.25*s;
  towerRoof.castShadow = true;
  tower.add(towerRoof);
  // 塔顶球
  var ball = new THREE.Mesh(new THREE.SphereGeometry(0.15*s, 8, 6), new THREE.MeshPhongMaterial({color: c.gold || '#ffd700'}));
  ball.position.y = 7.6*s;
  tower.add(ball);
  tower.position.set(-3*s, 0, -3*s);
  houseGroup.add(tower);
  
  // 主楼四坡顶
  buildPyramidRoof(s, 6*s, 2.5*s, c.roof);
  
  // 阳台（右侧）
  var balcony = new THREE.Group();
  var balconyFloor = new THREE.Mesh(new THREE.BoxGeometry(2*s, 0.15, 1.2*s), new THREE.MeshPhongMaterial({color: c.base}));
  balconyFloor.position.set(2.8*s, 2.8*s, 0);
  balcony.add(balconyFloor);
  // 栏杆
  [-0.8*s, 0.8*s].forEach(function(rz) {
    var rail = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.6*s, 1.2*s), new THREE.MeshPhongMaterial({color: c.wall}));
    rail.position.set(2.8*s, 3.2*s, rz);
    balcony.add(rail);
  });
  houseGroup.add(balcony);
  
  // 拱形门
  var doorFrame = new THREE.Mesh(new THREE.BoxGeometry(1.4*s, 2.6*s, 0.2), new THREE.MeshPhongMaterial({color: c.door}));
  doorFrame.position.set(0, 1.4*s, -2.1*s);
  houseGroup.add(doorFrame);
  // 门拱
  var arch = new THREE.Mesh(new THREE.TorusGeometry(0.6*s, 0.12, 8, 12, Math.PI), new THREE.MeshPhongMaterial({color: c.door}));
  arch.rotation.z = Math.PI;
  arch.position.set(0, 2.65*s, -2.05*s);
  houseGroup.add(arch);
  
  // 窗户（拱形）
  var winPos2 = [[-1.5*s, 2.8*s, -2.05*s], [1.5*s, 2.8*s, -2.05*s]];
  winPos2.forEach(function(wp) {
    var win = new THREE.Mesh(new THREE.BoxGeometry(0.7*s, 1.2*s, 0.08), new THREE.MeshPhongMaterial({color: c.win, transparent: true, opacity: 0.85}));
    win.position.set(wp[0], wp[1], wp[2]);
    houseGroup.add(win);
    // 拱形窗顶
    var winArch = new THREE.Mesh(new THREE.TorusGeometry(0.35*s, 0.06, 8, 12, Math.PI), new THREE.MeshPhongMaterial({color: c.wallS}));
    winArch.rotation.z = Math.PI;
    winArch.position.set(wp[0], wp[1] + 0.6*s, wp[2]);
    houseGroup.add(winArch);
  });
}

// ===== 4. 现代豪宅：平顶+大玻璃 =====
function buildModernMansion() {
  var c = HOUSE_LEVELS[3].c;
  var s = HOUSE_LEVELS[3].scale;
  
  // 地基
  var base = new THREE.Mesh(new THREE.BoxGeometry(10*s, 0.5, 10*s), new THREE.MeshPhongMaterial({color: c.base}));
  base.position.y = 0.25;
  base.receiveShadow = true;
  houseGroup.add(base);
  
  // 主体 - 层叠几何
  // 下层
  var lower = new THREE.Mesh(new THREE.BoxGeometry(8*s, 3*s, 7*s), new THREE.MeshPhongMaterial({color: c.wall}));
  lower.position.set(0, 1.8*s, 0);
  lower.castShadow = true;
  houseGroup.add(lower);
  
  // 上层（偏移）
  var upper = new THREE.Mesh(new THREE.BoxGeometry(6*s, 2.5*s, 5*s), new THREE.MeshPhongMaterial({color: c.wallS}));
  upper.position.set(-1*s, 4.55*s, 0.5*s);
  upper.castShadow = true;
  houseGroup.add(upper);
  
  // 平顶
  var flatRoof = new THREE.Mesh(new THREE.BoxGeometry(8.5*s, 0.2, 7.5*s), new THREE.MeshPhongMaterial({color: c.roof}));
  flatRoof.position.set(0, 3.4*s, 0);
  houseGroup.add(flatRoof);
  
  // 大落地窗（前墙）
  var glassMat = new THREE.MeshPhongMaterial({color: c.win, transparent: true, opacity: 0.75});
  var bigWin = new THREE.Mesh(new THREE.BoxGeometry(3*s, 2.2*s, 0.1), glassMat);
  bigWin.position.set(0, 1.6*s, -3.55*s);
  houseGroup.add(bigWin);
  
  // 窗框分割
  var hLine = new THREE.Mesh(new THREE.BoxGeometry(3*s, 0.08, 0.15), new THREE.MeshPhongMaterial({color: c.wallS}));
  hLine.position.set(0, 1.6*s, -3.5*s);
  houseGroup.add(hLine);
  var vLine = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.2*s, 0.15), new THREE.MeshPhongMaterial({color: c.wallS}));
  vLine.position.set(0, 1.6*s, -3.5*s);
  houseGroup.add(vLine);
  
  // 现代门
  var door = new THREE.Mesh(new THREE.BoxGeometry(1.5*s, 2.4*s, 0.15), new THREE.MeshPhongMaterial({color: c.door}));
  door.position.set(2*s, 1.3*s, -3.55*s);
  houseGroup.add(door);
  
  // 露台（上层顶部）
  var terrace = new THREE.Mesh(new THREE.BoxGeometry(6.5*s, 0.15, 5.5*s), new THREE.MeshPhongMaterial({color: c.base}));
  terrace.position.set(-1*s, 5.9*s, 0.5*s);
  houseGroup.add(terrace);
  
  // 露台栏杆（玻璃）
  var railGlass = new THREE.Mesh(new THREE.BoxGeometry(6.5*s, 0.8*s, 0.05), glassMat);
  railGlass.position.set(-1*s, 6.35*s, -2.2*s);
  houseGroup.add(railGlass);
}

// ===== 5. 梦幻城堡：双塔+城墙 =====
function buildCastle() {
  var c = HOUSE_LEVELS[4].c;
  var s = HOUSE_LEVELS[4].scale;
  
  // 地基
  var base = new THREE.Mesh(new THREE.BoxGeometry(12*s, 0.6, 12*s), new THREE.MeshPhongMaterial({color: c.base}));
  base.position.y = 0.3;
  base.receiveShadow = true;
  houseGroup.add(base);
  
  // 主楼
  var main = new THREE.Mesh(new THREE.BoxGeometry(6*s, 5*s, 6*s), new THREE.MeshPhongMaterial({color: c.wall}));
  main.position.set(0, 2.8*s, 0);
  main.castShadow = true;
  houseGroup.add(main);
  
  // 双塔（左右）
  [-4*s, 4*s].forEach(function(tx) {
    var tower = new THREE.Group();
    // 塔身
    var body = new THREE.Mesh(new THREE.CylinderGeometry(1.2*s, 1.4*s, 7*s, 16), new THREE.MeshPhongMaterial({color: c.wallS}));
    body.position.y = 3.5*s;
    body.castShadow = true;
    tower.add(body);
    // 塔顶（圆锥）
    var roof = new THREE.Mesh(new THREE.ConeGeometry(1.8*s, 3*s, 16), new THREE.MeshPhongMaterial({color: c.roof}));
    roof.position.y = 8*s;
    roof.castShadow = true;
    tower.add(roof);
    // 城垛
    for (var i = 0; i < 8; i++) {
      var battlement = new THREE.Mesh(new THREE.BoxGeometry(0.5*s, 0.6*s, 0.3*s), new THREE.MeshPhongMaterial({color: c.wallS}));
      var angle = (i / 8) * Math.PI * 2;
      battlement.position.set(Math.cos(angle) * 1.1*s, 7.2*s, Math.sin(angle) * 1.1*s);
      battlement.rotation.y = -angle;
      tower.add(battlement);
    }
    tower.position.set(tx, 0, 0);
    houseGroup.add(tower);
  });
  
  // 城墙（连接塔与主楼）
  [-3*s, 3*s].forEach(function(wz) {
    var wall = new THREE.Mesh(new THREE.BoxGeometry(8*s, 3.5*s, 0.5*s), new THREE.MeshPhongMaterial({color: c.wall}));
    wall.position.set(0, 2.0*s, wz);
    wall.castShadow = true;
    houseGroup.add(wall);
    // 城垛
    for (var j = -3; j <= 3; j++) {
      if (j === 0) continue;
      var batt = new THREE.Mesh(new THREE.BoxGeometry(0.6*s, 0.8*s, 0.3*s), new THREE.MeshPhongMaterial({color: c.wallS}));
      batt.position.set(j*1.1*s, 3.7*s, wz);
      houseGroup.add(batt);
    }
  });
  
  // 主楼塔顶
  var mainRoof = new THREE.Mesh(new THREE.ConeGeometry(3*s, 3.5*s, 8), new THREE.MeshPhongMaterial({color: c.roofS}));
  mainRoof.position.set(0, 7.3*s, 0);
  mainRoof.castShadow = true;
  houseGroup.add(mainRoof);
  
  // 旗帜
  var flagPole = new THREE.Mesh(new THREE.CylinderGeometry(0.05*s, 0.05*s, 2*s, 8), new THREE.MeshPhongMaterial({color: '#8b4513'}));
  flagPole.position.set(0, 9.3*s, 0);
  houseGroup.add(flagPole);
  var flag = new THREE.Mesh(new THREE.BoxGeometry(0.8*s, 0.5*s, 0.02), new THREE.MeshPhongMaterial({color: '#ff0000'}));
  flag.position.set(0.4*s, 10*s, 0);
  houseGroup.add(flag);
  
  // 拱形大门
  var gateFrame = new THREE.Mesh(new THREE.BoxGeometry(2.2*s, 3.5*s, 0.3*s), new THREE.MeshPhongMaterial({color: c.door}));
  gateFrame.position.set(0, 2.0*s, -3.2*s);
  houseGroup.add(gateFrame);
  var gateArch = new THREE.Mesh(new THREE.TorusGeometry(1.0*s, 0.2, 8, 16, Math.PI), new THREE.MeshPhongMaterial({color: c.door}));
  gateArch.rotation.z = Math.PI;
  gateArch.position.set(0, 3.8*s, -3.1*s);
  houseGroup.add(gateArch);
  
  // 窗户
  [[-1.5*s, 3.5*s, -3.1*s], [1.5*s, 3.5*s, -3.1*s]].forEach(function(wp) {
    var win = new THREE.Mesh(new THREE.BoxGeometry(0.8*s, 1.2*s, 0.1), new THREE.MeshPhongMaterial({color: c.win, transparent: true, opacity: 0.85}));
    win.position.set(wp[0], wp[1], wp[2]);
    houseGroup.add(win);
    // 尖拱
    var pt = new THREE.Mesh(new THREE.ConeGeometry(0.4*s, 0.6*s, 4), new THREE.MeshPhongMaterial({color: c.wallS}));
    pt.position.set(wp[0], wp[1] + 0.9*s, wp[2]);
    houseGroup.add(pt);
  });
}

// ===== 辅助：四坡顶 =====
function buildPyramidRoof(s, w, h, color) {
  var roofGeo = new THREE.ConeGeometry(w/2 * s, h * s, 4);
  var roof = new THREE.Mesh(roofGeo, new THREE.MeshPhongMaterial({color: color}));
  roof.position.set(0, (4 + h/2) * s, 0);
  roof.rotation.y = Math.PI/4;
  roof.castShadow = true;
  houseGroup.add(roof);
}

function addWall(group, w, h, d, x, y, z, ry, color, shadow, tex) {
  var geo = new THREE.BoxGeometry(w, h, d);
  var mat = new THREE.MeshPhongMaterial({ color: color });
  if (tex) {
    mat.map = tex;
    mat.color.set(0xffffff);
  }
  var mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(x, y, z);
  if (ry) mesh.rotation.y = ry;
  if (shadow) { mesh.castShadow = true; mesh.receiveShadow = true; }
  group.add(mesh);
  return mesh;
}

function buildRoof(group, s, c) {
  // 四坡屋顶：用4个梯形面 + 顶脊
  var roofH = 3.0 * s;
  var roofW = 7.0 * s;
  var roofD = 7.0 * s;
  var wallTop = 4.0 * s;
  var peak = wallTop + roofH;

  // 前坡
  group.add(makeRoofPanel(
    new THREE.Vector3(-roofW/2, wallTop, -roofD/2),
    new THREE.Vector3( roofW/2, wallTop, -roofD/2),
    new THREE.Vector3( roofW/2*0.3, peak, 0),
    new THREE.Vector3(-roofW/2*0.3, peak, 0),
    c.roofS
  ));
  // 后坡
  group.add(makeRoofPanel(
    new THREE.Vector3( roofW/2, wallTop,  roofD/2),
    new THREE.Vector3(-roofW/2, wallTop,  roofD/2),
    new THREE.Vector3(-roofW/2*0.3, peak, 0),
    new THREE.Vector3( roofW/2*0.3, peak, 0),
    c.roofS
  ));
  // 左坡
  group.add(makeRoofPanel(
    new THREE.Vector3(-roofW/2, wallTop, -roofD/2),
    new THREE.Vector3(-roofW/2*0.3, peak, 0),
    new THREE.Vector3(-roofW/2*0.3, peak, 0),
    new THREE.Vector3(-roofW/2, wallTop,  roofD/2),
    c.roof
  ));
  // 右坡
  group.add(makeRoofPanel(
    new THREE.Vector3( roofW/2*0.3, peak, 0),
    new THREE.Vector3( roofW/2, wallTop, -roofD/2),
    new THREE.Vector3( roofW/2, wallTop,  roofD/2),
    new THREE.Vector3( roofW/2*0.3, peak, 0),
    c.roof
  ));

  // 屋脊
  var ridgeGeo = new THREE.BoxGeometry(roofW*0.6+0.3, 0.25*s, 0.25*s);
  var ridge = new THREE.Mesh(ridgeGeo, new THREE.MeshPhongMaterial({ color: shadeColor(c.roofS, -20) }));
  ridge.position.set(0, peak+0.1, 0);
  ridge.castShadow = true;
  group.add(ridge);

  // 屋檐
  var eaveGeo = new THREE.BoxGeometry(roofW+0.8, 0.15*s, roofD+0.8);
  var eave = new THREE.Mesh(eaveGeo, new THREE.MeshPhongMaterial({ color: shadeColor(c.roof, -10) }));
  eave.position.set(0, wallTop+0.05, 0);
  eave.castShadow = true;
  group.add(eave);
}

function makeRoofPanel(v0, v1, v2, v3, color) {
  var geo = new THREE.BufferGeometry();
  var verts = new Float32Array([
    v0.x,v0.y,v0.z, v1.x,v1.y,v1.z, v2.x,v2.y,v2.z,
    v0.x,v0.y,v0.z, v2.x,v2.y,v2.z, v3.x,v3.y,v3.z,
  ]);
  geo.setAttribute('position', new THREE.BufferAttribute(verts, 3));
  geo.computeVertexNormals();
  var mat = new THREE.MeshPhongMaterial({ color: color, side: THREE.DoubleSide });
  mat.map = roofTex;
  mat.color.set(0xffffff);
  var mesh = new THREE.Mesh(geo, mat);
  mesh.castShadow = true;
  return mesh;
}

function updateWindowGlow() {
  var isNight = gameState.timeOfDay < 0.2 || gameState.timeOfDay > 0.8;
  houseGroup.children.forEach(function(child) {
    if (child.material && child.material.transparent && child.material.opacity < 1) {
      child.material.emissive = isNight
        ? new THREE.Color(0xffee88).multiplyScalar(0.4)
        : new THREE.Color(0x000000);
    }
  });
}

// ===== 高亮框 =====
function createHighlight() {
  var geo = new THREE.BoxGeometry(1.85, 0.2, 1.85);
  var mat = new THREE.MeshBasicMaterial({ color: 0xFFD700, transparent: true, opacity: 0.4, depthWrite: false });
  highlightMesh = new THREE.Mesh(geo, mat);
  highlightMesh.visible = false;
  highlightMesh.position.y = 0.15;
  scene.add(highlightMesh);
}

// ===== 物体工厂 =====
function createItemMesh(item, grow) {
  if (item.kind === 'tree')   return createTree(item, grow);
  if (item.kind === 'flower') return createFlower(item, grow);
  if (item.kind === 'water')  return createWater(item);
  return createDeco(item);
}

function createTree(item, grow) {
  var g = new THREE.Group();
  var s = (0.4 + grow * 0.6) * 0.7;
  var c = item.c;

  var trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.1*s, 0.16*s, 1.8*s, 7),
    new THREE.MeshPhongMaterial({ color: c.trunk })
  );
  trunk.position.y = 0.9*s;
  trunk.castShadow = true;
  g.add(trunk);

  var crowns = [
    {ox:0,    oy:2.0*s, r:0.9*s, col:c.c1},
    {ox:-0.3*s, oy:1.8*s, r:0.7*s, col:c.c2},
    {ox: 0.3*s, oy:1.9*s, r:0.65*s, col:c.c1},
    {ox:0,    oy:2.6*s, r:0.55*s, col:c.c3},
  ];
  crowns.forEach(function(cr) {
    var m = new THREE.Mesh(
      new THREE.SphereGeometry(cr.r, 9, 7),
      new THREE.MeshPhongMaterial({ color: cr.col })
    );
    m.position.set(cr.ox, cr.oy, 0);
    m.castShadow = true;
    g.add(m);
  });

  if (grow >= 1) {
    var glow = new THREE.Mesh(
      new THREE.SphereGeometry(0.14, 6, 6),
      new THREE.MeshBasicMaterial({ color:0xffd700, transparent:true, opacity:0.7 })
    );
    glow.position.y = 2.5*s;
    glow.userData.isGlow = true;
    g.add(glow);
  }
  g.userData.isTree = true;
  g.userData.windPhase = Math.random() * Math.PI * 2;
  return g;
}

function createFlower(item, grow) {
  var g = new THREE.Group();
  var s = (0.3 + grow * 0.7) * 0.5;
  var c = item.c;

  var stem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.03, 0.04, 1.4*s, 5),
    new THREE.MeshPhongMaterial({ color: c.stem })
  );
  stem.position.y = 0.7*s;
  g.add(stem);

  var py = 1.4*s, pr = 0.25*s;
  for (var i = 0; i < 6; i++) {
    var a = (i/6)*Math.PI*2;
    var petal = new THREE.Mesh(
      new THREE.SphereGeometry(pr, 6, 4),
      new THREE.MeshPhongMaterial({ color: c.p1 })
    );
    petal.scale.y = 0.5;
    petal.position.set(Math.cos(a)*pr*1.3, py, Math.sin(a)*pr*1.3);
    g.add(petal);
  }
  var center = new THREE.Mesh(
    new THREE.SphereGeometry(pr*0.65, 6, 4),
    new THREE.MeshPhongMaterial({ color: c.center })
  );
  center.position.y = py;
  g.add(center);

  if (grow >= 1) {
    var glow = new THREE.Mesh(
      new THREE.SphereGeometry(0.1, 5, 4),
      new THREE.MeshBasicMaterial({ color:0xffd700, transparent:true, opacity:0.7 })
    );
    glow.position.y = py;
    glow.userData.isGlow = true;
    g.add(glow);
  }
  g.userData.isFlower = true;
  return g;
}

function createWater(item) {
  var g = new THREE.Group();
  var c = item.c;
  if (item.id === 'fount') {
    var base = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 1.0, 0.4, 10), new THREE.MeshPhongMaterial({ color: c.stone }));
    base.position.y = 0.2;
    base.castShadow = true;
    g.add(base);
    var water = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.75, 0.12, 16), new THREE.MeshPhongMaterial({ color: c.water, transparent:true, opacity:0.85, shininess:100 }));
    water.position.y = 0.46;
    g.add(water);
    var col = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 1.4, 7), new THREE.MeshPhongMaterial({ color: c.stone }));
    col.position.y = 1.1;
    col.castShadow = true;
    g.add(col);
    g.userData.isFountain = true;
  } else {
    var pond = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 0.95, 0.22, 14), new THREE.MeshPhongMaterial({ color: c.water, transparent:true, opacity:0.88, shininess:80 }));
    pond.position.y = 0.11;
    pond.receiveShadow = true;
    g.add(pond);
    var edge = new THREE.Mesh(new THREE.TorusGeometry(1.0, 0.1, 4, 18), new THREE.MeshPhongMaterial({ color: c.edge }));
    edge.rotation.x = Math.PI/2;
    edge.position.y = 0.22;
    g.add(edge);
  }
  return g;
}

function createDeco(item) {
  var g = new THREE.Group();
  var s = 0.55;
  var c = item.c;
  var id = item.id;

  if (id === 'rock') {
    var m = new THREE.Mesh(new THREE.DodecahedronGeometry(0.45*s, 0), new THREE.MeshPhongMaterial({ color: c.light, flatShading:true }));
    m.position.y = 0.28*s;
    m.castShadow = true;
    g.add(m);

  } else if (id === 'lamp') {
    var pole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 2.0*s, 7), new THREE.MeshPhongMaterial({ color: c.pole }));
    pole.position.y = 1.0*s;
    pole.castShadow = true;
    g.add(pole);
    var globe = new THREE.Mesh(new THREE.SphereGeometry(0.22*s, 8, 6), new THREE.MeshBasicMaterial({ color: c.glow }));
    globe.position.y = 2.1*s;
    g.add(globe);
    var pl = new THREE.PointLight(0xfff9c4, 0.9, 5);
    pl.position.y = 2.1*s;
    g.add(pl);

  } else if (id === 'bench') {
    var seat = new THREE.Mesh(new THREE.BoxGeometry(1.3*s, 0.12*s, 0.45*s), new THREE.MeshPhongMaterial({ color: c.wood }));
    seat.position.y = 0.5*s;
    seat.castShadow = true;
    g.add(seat);
    var back = new THREE.Mesh(new THREE.BoxGeometry(1.3*s, 0.45*s, 0.1*s), new THREE.MeshPhongMaterial({ color: c.wood }));
    back.position.set(0, 0.75*s, -0.17*s);
    back.castShadow = true;
    g.add(back);
    [-0.5*s, 0.5*s].forEach(function(lx) {
      var leg = new THREE.Mesh(new THREE.BoxGeometry(0.09*s, 0.5*s, 0.09*s), new THREE.MeshPhongMaterial({ color: c.metal }));
      leg.position.set(lx, 0.25*s, 0.12*s);
      g.add(leg);
    });

  } else if (id === 'fence') {
    for (var fi=-1; fi<=1; fi++) {
      var post = new THREE.Mesh(new THREE.BoxGeometry(0.12*s, 0.8*s, 0.12*s), new THREE.MeshPhongMaterial({ color: c.wood }));
      post.position.set(fi*0.55*s, 0.4*s, 0);
      post.castShadow = true;
      g.add(post);
      var tip = new THREE.Mesh(new THREE.ConeGeometry(0.07*s, 0.18*s, 4), new THREE.MeshPhongMaterial({ color: c.wood }));
      tip.position.set(fi*0.55*s, 0.8*s, 0);
      g.add(tip);
    }
    [0.28*s, 0.58*s].forEach(function(ry) {
      var rail = new THREE.Mesh(new THREE.BoxGeometry(1.2*s, 0.07*s, 0.07*s), new THREE.MeshPhongMaterial({ color: c.dark }));
      rail.position.y = ry;
      g.add(rail);
    });

  } else if (id === 'cat') {
    var body = new THREE.Mesh(new THREE.SphereGeometry(0.38*s, 8, 6), new THREE.MeshPhongMaterial({ color: c.body }));
    body.scale.set(1, 0.7, 1.3);
    body.position.y = 0.38*s;
    body.castShadow = true;
    g.add(body);
    var head = new THREE.Mesh(new THREE.SphereGeometry(0.24*s, 8, 6), new THREE.MeshPhongMaterial({ color: c.body }));
    head.position.set(0.38*s, 0.6*s, 0);
    g.add(head);
    [0.15, -0.15].forEach(function(ez) {
      var ear = new THREE.Mesh(new THREE.ConeGeometry(0.09*s, 0.17*s, 3), new THREE.MeshPhongMaterial({ color: c.body }));
      ear.position.set(0.42*s, 0.78*s, ez*s);
      g.add(ear);
    });
    var tail = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.025, 0.55*s, 5), new THREE.MeshPhongMaterial({ color: c.body }));
    tail.position.set(-0.42*s, 0.52*s, 0);
    tail.rotation.z = -0.8;
    tail.userData.isTail = true;
    g.add(tail);
    g.userData.isCat = true;

  } else if (id === 'bunny') {
    var bb = new THREE.Mesh(new THREE.SphereGeometry(0.32*s, 8, 6), new THREE.MeshPhongMaterial({ color: c.body }));
    bb.scale.set(1, 0.9, 1.2);
    bb.position.y = 0.32*s;
    bb.castShadow = true;
    g.add(bb);
    var bh = new THREE.Mesh(new THREE.SphereGeometry(0.22*s, 8, 6), new THREE.MeshPhongMaterial({ color: c.body }));
    bh.position.set(0.28*s, 0.55*s, 0);
    g.add(bh);
    [0.1, -0.1].forEach(function(ez) {
      var ear = new THREE.Mesh(new THREE.CylinderGeometry(0.045*s, 0.055*s, 0.45*s, 5), new THREE.MeshPhongMaterial({ color: c.body }));
      ear.position.set(0.22*s, 0.82*s, ez*s);
      ear.rotation.z = ez > 0 ? 0.2 : -0.2;
      g.add(ear);
    });
    g.userData.isBunny = true;

  } else if (id === 'windmill') {
    var wbase = new THREE.Mesh(new THREE.CylinderGeometry(0.14*s, 0.2*s, 2.2*s, 7), new THREE.MeshPhongMaterial({ color: c.wood }));
    wbase.position.y = 1.1*s;
    wbase.castShadow = true;
    g.add(wbase);
    var wroof = new THREE.Mesh(new THREE.ConeGeometry(0.28*s, 0.55*s, 6), new THREE.MeshPhongMaterial({ color: c.roof }));
    wroof.position.y = 2.5*s;
    g.add(wroof);
    var blades = new THREE.Group();
    blades.position.y = 1.9*s;
    for (var bi=0; bi<4; bi++) {
      var blade = new THREE.Mesh(new THREE.PlaneGeometry(0.1*s, 0.8*s), new THREE.MeshPhongMaterial({ color: c.blade, side:THREE.DoubleSide }));
      blade.position.y = 0.4*s;
      blade.rotation.z = (bi/4)*Math.PI*2;
      blades.add(blade);
    }
    blades.add(new THREE.Mesh(new THREE.SphereGeometry(0.09*s, 6, 4), new THREE.MeshPhongMaterial({ color: shadeColor(c.wood, -30) })));
    g.add(blades);
    g.userData.blades = blades;
    g.userData.isWindmill = true;

  } else if (id === 'angelf') {
    var ab = new THREE.Mesh(new THREE.CylinderGeometry(0.17*s, 0.22*s, 0.9*s, 8), new THREE.MeshPhongMaterial({ color: c.stone }));
    ab.position.y = 0.75*s;
    ab.castShadow = true;
    g.add(ab);
    var ah = new THREE.Mesh(new THREE.SphereGeometry(0.2*s, 8, 6), new THREE.MeshPhongMaterial({ color: c.stone }));
    ah.position.y = 1.35*s;
    g.add(ah);
    var halo = new THREE.Mesh(new THREE.TorusGeometry(0.24*s, 0.035*s, 6, 16), new THREE.MeshBasicMaterial({ color: c.gold }));
    halo.position.y = 1.62*s;
    halo.rotation.x = 0.2;
    halo.userData.isHalo = true;
    g.add(halo);
    g.userData.isAngel = true;

  } else if (id === 'hedge') {
    var hm = new THREE.Mesh(new THREE.BoxGeometry(1.3*s, 0.9*s, 0.9*s), new THREE.MeshPhongMaterial({ color: c.c1 }));
    hm.position.y = 0.45*s;
    hm.castShadow = true;
    g.add(hm);
    var ht = new THREE.Mesh(new THREE.BoxGeometry(1.1*s, 0.32*s, 0.7*s), new THREE.MeshPhongMaterial({ color: c.light }));
    ht.position.y = 1.0*s;
    g.add(ht);

  } else {
    var def = new THREE.Mesh(new THREE.SphereGeometry(0.32*s, 6, 4), new THREE.MeshPhongMaterial({ color: 0x888888 }));
    def.position.y = 0.32*s;
    def.castShadow = true;
    g.add(def);
  }
  return g;
}

// ===== 工具 =====
function shadeColor(hex, amt) {
  if (!hex || hex[0] !== '#' || hex.length < 7) return '#888888';
  var r = Math.max(0, Math.min(255, parseInt(hex.substring(1,3),16)+amt));
  var g = Math.max(0, Math.min(255, parseInt(hex.substring(3,5),16)+amt));
  var b = Math.max(0, Math.min(255, parseInt(hex.substring(5,7),16)+amt));
  var pad = function(n){ return ('0'+Math.round(n).toString(16)).slice(-2); };
  return '#'+pad(r)+pad(g)+pad(b);
}

// ===== 输入 =====
var touchMode = 0; // 0=无, 1=单指旋转, 2=双指缩放
var touchStartCenter = null;
var touchStartTheta = 0;
var touchStartPhi = 0;
var touchMoved = false;

function onPointerDown(e) {
  e.preventDefault();
  isDragging = false;
  touchMoved = false;
  if (e.touches) {
    if (e.touches.length === 1) {
      touchMode = 1;
      touchStartCenter = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      touchStartTheta = camTheta;
      touchStartPhi = camPhi;
    } else if (e.touches.length === 2) {
      touchMode = 2;
      pinchDist0 = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
    }
  } else {
    lastPointer = { x: e.clientX, y: e.clientY, button: e.button };
  }
}

function onPointerMove(e) {
  var rect = renderer.domElement.getBoundingClientRect();
  var cx, cy;
  if (e.touches) {
    if (e.touches.length === 1 && touchMode === 1) {
      cx = e.touches[0].clientX;
      cy = e.touches[0].clientY;
      var dx = cx - touchStartCenter.x;
      var dy = cy - touchStartCenter.y;
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
        touchMoved = true;
        camTheta = touchStartTheta - dx * 0.006;
        camPhi = Math.max(0.15, Math.min(1.45, touchStartPhi + dy * 0.006));
        updateCamera();
      }
      mouse.x = ((cx - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((cy - rect.top) / rect.height) * 2 + 1;
    } else if (e.touches.length === 2 && touchMode === 2) {
      var d = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      camDist = Math.max(8, Math.min(50, camDist - (d - pinchDist0) * 0.06));
      pinchDist0 = d;
      updateCamera();
      // 计算双指中心用于高亮
      cx = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      cy = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      mouse.x = ((cx - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((cy - rect.top) / rect.height) * 2 + 1;
    }
  } else {
    cx = e.clientX;
    cy = e.clientY;
    mouse.x = ((cx - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((cy - rect.top) / rect.height) * 2 + 1;
    if (lastPointer) {
      var dx = cx - lastPointer.x;
      var dy = cy - lastPointer.y;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        isDragging = true;
        if (lastPointer.button === 2) {
          var panSpeed = 0.03;
          var right = new THREE.Vector3();
          var fwd = new THREE.Vector3();
          camera.getWorldDirection(fwd);
          right.crossVectors(fwd, camera.up).normalize();
          camTarget.addScaledVector(right, -dx * panSpeed);
          camTarget.y += dy * panSpeed;
        } else {
          camTheta -= dx * 0.008;
          camPhi = Math.max(0.15, Math.min(1.45, camPhi + dy * 0.008));
        }
        updateCamera();
        lastPointer = { x: cx, y: cy, button: lastPointer.button };
      }
    }
  }

  // 高亮
  raycaster.setFromCamera(mouse, camera);
  var hits = raycaster.intersectObjects(yardGroup.children, false);
  var found = false;
  for (var i = 0; i < hits.length; i++) {
    var obj = hits[i].object;
    if (obj.userData.type === 'slot') {
      highlightMesh.position.set(obj.position.x, 0.15, obj.position.z);
      highlightMesh.visible = true;
      found = true;
      break;
    }
  }
  if (!found) highlightMesh.visible = false;
}

function onPointerUp(e) {
  var wasDrag = isDragging || touchMoved;
  if (e.touches) {
    if (e.touches.length === 0) {
      if (!wasDrag && touchMode === 1) {
        handlePointerTap();
      }
      touchMode = 0;
      touchStartCenter = null;
    }
  } else {
    lastPointer = null;
    if (!wasDrag) {
      handlePointerTap();
    }
  }
  isDragging = false;
  touchMoved = false;
}

function handlePointerTap() {
  raycaster.setFromCamera(mouse, camera);
  var hits = raycaster.intersectObjects(yardGroup.children, false);
  for (var i = 0; i < hits.length; i++) {
    var obj = hits[i].object;
    if (obj.userData.type === 'slot') {
      handleSlotClick(obj.userData.slotId);
      return;
    }
  }
}

function onWheel(e) {
  e.preventDefault();
  camDist = Math.max(8, Math.min(50, camDist + e.deltaY * 0.04));
  updateCamera();
}

function onTouchStart(e) {
  e.preventDefault();
  onPointerDown(e);
}

function onTouchMove(e) {
  e.preventDefault();
  onPointerMove(e);
}

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// ===== 格子点击 =====
function handleSlotClick(slotId) {
  var slot = null;
  for (var i = 0; i < YARD_SLOTS.length; i++) {
    if (YARD_SLOTS[i].id === slotId) { slot = YARD_SLOTS[i]; break; }
  }
  if (!slot) return;

  if (slot.item) {
    var name = slot.item.name;
    slot.item = null;
    slot.plantedAt = 0;
    buildYardSlots();
    showToast('🗑️ 已移除 ' + name);
  } else {
    var item = DECO_ITEMS[Math.floor(Math.random() * DECO_ITEMS.length)];
    slot.item = item;
    slot.plantedAt = Date.now();
    buildYardSlots();
    showToast('🌱 放置了 ' + item.name);
  }
}

// ===== 昼夜切换 =====
function cycleTime() {
  var times = [0.1, 0.35, 0.55, 0.75, 0.92];
  var closest = times[0], minDist = Infinity;
  for (var i = 0; i < times.length; i++) {
    var d = Math.abs(times[i] - gameState.timeOfDay);
    if (d < minDist) { minDist = d; closest = times[i]; }
  }
  var idx = times.indexOf(closest);
  gameState.timeOfDay = times[(idx+1) % times.length];
  updateDayNight();
  updateWindowGlow();
}

// ===== 房屋升级 =====
function upgradeHouse() {
  if (upgradeAnim.active) return;
  if (gameState.houseLevel >= HOUSE_LEVELS.length) { showToast('🏠 已是最高等级！'); return; }
  startUpgradeAnimation();
}

// ===== 升级动画 =====
function startUpgradeAnimation() {
  upgradeAnim.active = true;
  upgradeAnim.phase = 'shrink';
  upgradeAnim.timer = 0;
  var btn = document.querySelector('.btn-house');
  if (btn) btn.disabled = true;
}

function updateUpgradeAnim(dt) {
  if (!upgradeAnim.active) return;
  upgradeAnim.timer += dt;

  if (upgradeAnim.phase === 'shrink') {
    var p = Math.min(1, upgradeAnim.timer / 1.0);
    var s = Math.max(0.01, 1 - p);
    houseGroup.scale.set(s, s, s);
    houseGroup.rotation.y = p * Math.PI * 2;
    if (p >= 1) {
      upgradeAnim.phase = 'particles';
      upgradeAnim.timer = 0;
      houseGroup.visible = false;
      houseGroup.rotation.y = 0;
      spawnUpgradeParticles();
    }
  } else if (upgradeAnim.phase === 'particles') {
    updateParticles(dt);
    if (upgradeAnim.timer > 0.8) {
      upgradeAnim.phase = 'ring';
      upgradeAnim.timer = 0;
      cleanParticles();
      spawnFlashRing();
    }
  } else if (upgradeAnim.phase === 'ring') {
    if (upgradeAnim.ring) {
      var rp = upgradeAnim.timer / 0.5;
      var rs = 1 + rp * 8;
      upgradeAnim.ring.scale.set(rs, rs, rs);
      upgradeAnim.ring.material.opacity = Math.max(0, 1 - rp);
    }
    if (upgradeAnim.timer > 0.5) {
      upgradeAnim.phase = 'grow';
      upgradeAnim.timer = 0;
      cleanRing();
      gameState.houseLevel++;
      buildHouse();
      houseGroup.scale.set(0.01, 0.01, 0.01);
      houseGroup.visible = true;
    }
  } else if (upgradeAnim.phase === 'grow') {
    var p2 = Math.min(1, upgradeAnim.timer / 0.8);
    var s2;
    if (p2 < 0.6) {
      s2 = (p2 / 0.6) * 1.15;
    } else {
      s2 = 1.15 - ((p2 - 0.6) / 0.4) * 0.15;
    }
    houseGroup.scale.set(s2, s2, s2);
    if (p2 >= 1) {
      houseGroup.scale.set(1, 1, 1);
      upgradeAnim.active = false;
      upgradeAnim.phase = 'none';
      var btn = document.querySelector('.btn-house');
      if (btn) btn.disabled = false;
      showToast('🏠 ' + HOUSE_LEVELS[gameState.houseLevel-1].name + ' 解锁！');
      var hi = document.getElementById('houseInfo');
      if (hi) hi.textContent = HOUSE_LEVELS[gameState.houseLevel-1].name;
    }
  }
}

function spawnUpgradeParticles() {
  for (var i = 0; i < 40; i++) {
    var hue = Math.random() * 0.15 + 0.08;
    var color = new THREE.Color().setHSL(hue, 1, 0.6);
    var p = new THREE.Mesh(
      new THREE.SphereGeometry(0.1 + Math.random() * 0.1, 6, 4),
      new THREE.MeshBasicMaterial({ color: color, transparent: true })
    );
    var angle = Math.random() * Math.PI * 2;
    var speed = 3 + Math.random() * 5;
    p.position.set(0, 3, 0);
    p.userData.vel = { x: Math.cos(angle) * speed, y: 4 + Math.random() * 6, z: Math.sin(angle) * speed };
    p.userData.life = 0;
    scene.add(p);
    upgradeAnim.particles.push(p);
  }
}

function updateParticles(dt) {
  for (var i = upgradeAnim.particles.length - 1; i >= 0; i--) {
    var p = upgradeAnim.particles[i];
    p.userData.life += dt;
    p.userData.vel.y -= 12 * dt;
    p.position.x += p.userData.vel.x * dt;
    p.position.y += p.userData.vel.y * dt;
    p.position.z += p.userData.vel.z * dt;
    p.material.opacity = Math.max(0, 1 - p.userData.life / 1.2);
    if (p.userData.life > 1.2 || p.position.y < -1) {
      scene.remove(p);
      upgradeAnim.particles.splice(i, 1);
    }
  }
}

function cleanParticles() {
  for (var i = 0; i < upgradeAnim.particles.length; i++) scene.remove(upgradeAnim.particles[i]);
  upgradeAnim.particles = [];
}

function spawnFlashRing() {
  var geo = new THREE.RingGeometry(0.5, 1.0, 32);
  var mat = new THREE.MeshBasicMaterial({ color: 0xFFD700, transparent: true, opacity: 1, side: THREE.DoubleSide });
  upgradeAnim.ring = new THREE.Mesh(geo, mat);
  upgradeAnim.ring.rotation.x = -Math.PI / 2;
  upgradeAnim.ring.position.y = 0.5;
  scene.add(upgradeAnim.ring);
}

function cleanRing() {
  if (upgradeAnim.ring) { scene.remove(upgradeAnim.ring); upgradeAnim.ring = null; }
}

var _toastTimer = 0;
function showToast(msg) {
  _toastTimer = 120;
  var el = document.getElementById('toast');
  if (el) { el.textContent = msg; el.style.display = 'block'; el.style.opacity = '1'; }
}
function updateToast() {
  if (_toastTimer <= 0) {
    var el = document.getElementById('toast');
    if (el) el.style.display = 'none';
    return;
  }
  _toastTimer--;
  var el = document.getElementById('toast');
  if (el) el.style.opacity = String(Math.min(1, _toastTimer / 40));
}

function setupUI() {
  var houseInfo = document.getElementById('houseInfo');
  if (houseInfo) houseInfo.textContent = HOUSE_LEVELS[gameState.houseLevel-1].name;
}

// ===== 樱花粒子 =====
function updateSakura() {
  var hasSakura = false;
  for (var i = 0; i < YARD_SLOTS.length; i++) {
    if (YARD_SLOTS[i].item && YARD_SLOTS[i].item.id === 'sakura') { hasSakura = true; break; }
  }
  if (hasSakura && sakuParticles.length < 40 && Math.random() < 0.04) {
    var p = new THREE.Mesh(
      new THREE.SphereGeometry(0.07, 4, 3),
      new THREE.MeshBasicMaterial({ color:0xffb6c1, transparent:true, opacity:0.85 })
    );
    p.position.set((Math.random()-0.5)*20, 4+Math.random()*3, (Math.random()-0.5)*20);
    p.userData.vel = { x:(Math.random()-0.5)*0.025, y:-0.018-Math.random()*0.012, z:(Math.random()-0.5)*0.025 };
    p.userData.phase = Math.random()*Math.PI*2;
    scene.add(p);
    sakuParticles.push(p);
  }
  for (var pi = sakuParticles.length-1; pi >= 0; pi--) {
    var sp = sakuParticles[pi];
    sp.userData.phase += 0.05;
    sp.position.x += sp.userData.vel.x + Math.sin(sp.userData.phase)*0.012;
    sp.position.y += sp.userData.vel.y;
    sp.position.z += sp.userData.vel.z;
    sp.rotation.x += 0.05;
    sp.rotation.z += 0.03;
    if (sp.position.y < 0) { scene.remove(sp); sakuParticles.splice(pi, 1); }
  }
}

// ===== 主循环 =====
var _lastAnimTime = 0;
function animate() {
  requestAnimationFrame(animate);
  var t = clock.getElapsedTime();
  var dt = _lastAnimTime > 0 ? (t - _lastAnimTime) : 0.016;
  if (dt > 0.1) dt = 0.016;
  _lastAnimTime = t;

  // 时间流逝
  gameState.timeOfDay = (gameState.timeOfDay + 0.00004) % 1;
  updateDayNight();

  // 升级动画
  updateUpgradeAnim(dt);

  // 物体动画
  for (var i = 0; i < yardGroup.children.length; i++) {
    var obj = yardGroup.children[i];
    if (obj.userData.isTree) {
      obj.rotation.z = Math.sin(t * 0.7 + obj.userData.windPhase) * 0.025;
    }
    if (obj.userData.isWindmill && obj.userData.blades) {
      obj.userData.blades.rotation.z = t * 1.8;
    }
    if (obj.userData.isCat) {
      for (var ci = 0; ci < obj.children.length; ci++) {
        if (obj.children[ci].userData.isTail) {
          obj.children[ci].rotation.x = Math.sin(t * 2.2) * 0.35;
        }
      }
    }
    if (obj.userData.isAngel) {
      for (var ai = 0; ai < obj.children.length; ai++) {
        if (obj.children[ai].userData.isHalo) {
          obj.children[ai].rotation.z = t * 0.6;
        }
      }
    }
    // 成熟闪烁
    for (var gi = 0; gi < obj.children.length; gi++) {
      var gc = obj.children[gi];
      if (gc.userData.isGlow && gc.material) {
        gc.material.opacity = 0.4 + Math.sin(t * 4) * 0.3;
      }
    }
  }

  // 萤火虫
  for (var fi = 0; fi < fireflies.length; fi++) {
    var ff = fireflies[fi];
    ff.position.y = ff.userData.baseY + Math.sin(t * ff.userData.speed + ff.userData.phase) * 0.35;
    ff.material.opacity = 0.35 + Math.sin(t * 3 + ff.userData.phase) * 0.45;
  }

  // 喷泉水波
  for (var wi = 0; wi < yardGroup.children.length; wi++) {
    var wo = yardGroup.children[wi];
    if (wo.userData.isFountain) {
      for (var wci = 0; wci < wo.children.length; wci++) {
        var wc = wo.children[wci];
        if (wc.material && wc.material.transparent) {
          wc.material.opacity = 0.7 + Math.sin(t * 2) * 0.15;
        }
      }
    }
  }

  updateSakura();
  updateToast();
  renderer.render(scene, camera);
}

// ===== 启动 =====
init();
