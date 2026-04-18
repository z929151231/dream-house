# 手机端触摸操作优化

## 时间
2026-04-18 13:53

## 改动内容

### 触摸事件处理
- **单指拖拽**：旋转视角（替代桌面端左键拖拽）
- **双指捏合**：缩放视角（替代滚轮）
- **点击放置**：单指轻触格子放置物品
- **防止误触**：拖动超过5px才认为是旋转，避免误触发点击

### 事件监听
- `touchstart` → `onTouchStart` (阻止默认，初始化触摸状态)
- `touchmove` → `onTouchMove` (阻止默认，处理旋转/缩放)
- `touchend` → `onPointerUp` (触发点击检测)
- `touchcancel` → 清理状态

### 防止页面滚动
- `passive:false` 阻止默认行为
- `document.body.style.overflow = 'hidden'`
- `document.body.style.overscrollBehavior = 'none'`
- meta viewport 禁用缩放

### UI优化
- 商店网格放大：66px → 72px
- 按钮放大：padding 增大
- 触摸反馈：`:active` 状态缩放
- 提示文字：🖱️ → 👆

## 测试方法
手机浏览器打开：
- 本地：直接打开 index.html
- 线上：https://z929151231.github.io/dream-house/

## 提交
```
2bdc338 feat: 手机端触摸操作优化
```
