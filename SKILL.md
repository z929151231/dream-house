# SKILL.md - 星火对战平台 ADB 自动化

## 设备信息

| 项目 | 值 |
|------|-----|
| 设备 | 三星 SM-A5460 |
| 序列号 | `R5CW91XQEGF` |
| Android SDK | 36 |
| 分辨率 | 2340 × 1080 (竖屏) |

## 命令速查

```bash
# 设备连接
adb -s R5CW91XQEGF get-state
adb -s R5CW91XQEGF devices

# 截图 (直接获取 PNG 二进制)
adb -s R5CW91XQEGF exec-out screencap -p

# 点击
adb -s R5CW91XQEGF shell input tap <x> <y>

# 返回键
adb -s R5CW91XQEGF shell input keyevent 4

# 长按
adb -s R5CW91XQEGF shell input swipe <x1> <y1> <x2> <y2> 500

# 滑动
adb -s R5CW91XQEGF shell input swipe <x1> <y1> <x2> <y2>
```

## 坐标估算规则

### 居中弹窗
```
弹窗宽度 ≈ 屏幕宽度 × 0.47
弹窗高度 ≈ 屏幕高度 × 0.20~0.22
弹窗 X = (屏幕宽 - 弹窗宽) / 2
弹窗 Y = (屏幕高 - 弹窗高) / 2
```

### 对话框按钮
```
按钮位于弹窗中下部
按钮 Y = 弹窗 Y + 弹窗高 × 0.55~0.63  ← 根据实际调整!

两个按钮左右并排，各占约一半宽度
"取消"在左，"退出/确定"在右
```

### 游戏卡片 (应用商店)
```
卡片横向排列，约 5 张
每张宽度 ≈ 屏幕宽 / 5
标题区域: y = 屏幕高 × 0.45~0.65
点击位置: 卡片中心偏下，y ≈ 屏幕高 × 0.55
```

### 抽卡入口 (需实际确认)
```
通常位于:
- 左侧边栏: x ≈ 屏幕宽 × 0.10~0.20
- 右侧功能入口: x ≈ 屏幕宽 × 0.75~0.90
- 中部: y ≈ 屏幕高 × 0.45~0.65
```

## 文件说明

| 文件 | 用途 |
|------|------|
| `main_auto.py` | 主流程脚本，集成弹窗处理 + 启动 + 抽卡 |
| `gacha_auto.py` | 抽卡专用脚本 (single/ten/daily) |
| `click_game.py` | 简化版：仅点击游戏卡片 |
| `handle_exit_dialog_v8.py` | 弹窗处理独立脚本 (最新) |
| `operations.py` | ADB 基础操作封装 |
| `find_game.py` | 游戏卡片定位分析 |

## 使用方式

```bash
# 检查弹窗
python main_auto.py --action dialog

# 启动游戏 (点击卡片)
python main_auto.py --action launch

# 完整抽卡流程
python main_auto.py --action gacha --draws 1

# 仅抽卡 (假设已在游戏中)
python gacha_auto.py --mode single --count 1

# 十连抽
python gacha_auto.py --mode ten

# 每日自动抽卡 (含启动流程)
python gacha_auto.py --mode daily --count 1
```

## 关键经验

### 截图方案
```python
# ✅ 正确: adb exec-out screencap -p (直接输出 PNG)
# ❌ 错误: adb shell screencap -p /sdcard/x.png (路径/权限问题)
```

### 中文输入
```python
# ❌ adb shell input text "中文" 不支持
# ❌ 三星剪贴板获取也失败
# ✅ 需要用户手动输入或改用 Intent 方案
```

### 点击重试
```python
# 弹窗按钮建议二次点击确保生效
tap(x, y, count=2, delay=0.3)
```

### 返回键 vs 点击
```python
# 返回键 (keyevent 4) 比点击返回箭头更可靠
back()  # 推荐
```

## 调试技巧

1. **截图验证**: 每次操作后保存截图 (`cv2.imwrite`)
2. **坐标标注**: 用 `debug_overlay_*.png` 查看估算位置
3. **置信度阈值**: 模板匹配置信度 < 0.5 时降级为估算坐标
4. **日志文件**: 所有截图保存在 `D:/workbuddy/Claw/` 目录

## 下一步

- [ ] 录制实际抽卡按钮位置的模板图
- [ ] 开发游戏内其他功能自动化 (战斗/升级等)
- [ ] 增加全局弹窗监听守护进程
