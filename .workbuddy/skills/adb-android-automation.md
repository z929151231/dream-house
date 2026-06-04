# adb-android-automation

> 使用 ADB 命令自动化操作三星安卓设备的工作流

## 核心设备信息

- **设备序列号**: `R5CW91XQEGF` (三星 SM-A5460)
- **Android SDK 版本**: 36 (高版本)
- **屏幕分辨率**: 2340 × 1080

## 关键命令速查

### 截图
```bash
# ✅ 推荐: 输出 PNG 格式
adb -s R5CW91XQEGF exec-out screencap -p > screenshot.png

# ❌ 错误: shell screencap 输出 raw 格式 (PIL 无法直接读取)
adb -s R5CW91XQEGF shell screencap -p /sdcard/pic.png
```

### 点击操作
```bash
# 精确坐标点击
adb -s R5CW91XQEGF shell input tap 1300 850

# 系统返回键 (比点击返回箭头更可靠)
adb -s R5CW91XQEGF shell input keyevent 4

# 滑动操作
adb -s R5CW91XQEGF shell input swipe x1 y1 x2 y2 duration
```

### 搜索与应用启动
```bash
# 启动应用商店
adb -s R5CW91XQEGF shell am start -n com.sec.android.app.samsungapps/.MainForChina

# 直接启动已安装应用
adb -s R5CW91XQEGF shell am start -n 包名/活动名

# 获取设备信息
adb -s R5CW91XQEGF shell getprop ro.serialno
adb -s R5CW91XQEGF shell getprop ro.build.version.sdk
```

## 中文输入问题

### 已知限制
- `adb shell input text` 只支持 ASCII 字符，无法输入中文
- 三星设备 `cmd clipboard get_clipboard` 无法获取剪贴板内容

### 解决方案
1. **手动输入**: 用户手动输入中文，脚本只负责点击
2. **Intent 方案**: `adb shell am start -a android.intent.action.MAIN -n 包名/活动名`
3. **Airtest 备用**: 当 ADB shell 失败时，切换到 Airtest `device().keyevent()`

## 高版本 Android 注意事项

### minicap/javacap 兼容性
- Android SDK 36 上 Airtest 的 minicap 不兼容
- Airtest 会自动回退到 `javacap` 截图方案
- 确保 Airtest 使用正确的 Python 环境: `/c/Python314/python`

### 连接问题
```bash
# 连接重置时的恢复
adb -s R5CW91XQEGF reconnect
sleep 3
adb -s R5CW91XQEGF shell getprop ro.serialno  # 验证连接
```

## 坐标估算方法

### 屏幕参数
- 分辨率: 2340 × 1080
- 常用 UI 区域比例:
  - 顶部导航栏: y ≈ 100-150
  - 内容区域: y ≈ 350-650 (占屏幕 35%-65%)
  - 底部操作栏: y ≈ 850-950
  - 搜索框: x ≈ 540, y ≈ 160

### 弹窗按钮定位
```python
# 居中弹窗估算
screen_width = 2340
dialog_width = 1100  # 约 47% 屏幕宽度

center_x = screen_width // 2  # 1170
dialog_right = center_x + dialog_width // 2  # 1720

# 两个按钮各占一半，同意在右侧
button_half_width = 420
agree_x = dialog_right - button_half_width  # 1300
agree_y = 850
```

## 完整工作流

### 1. 设备连接验证
```python
adb -s R5CW91XQEGF shell getprop ro.serialno
# 输出: R5CW91XQEGF ✅
```

### 2. 启动目标应用
```python
# 方式1: 通过应用商店搜索
adb -s R5CW91XQEGF shell am start -n com.sec.android.app.samsungapps/.MainForChina
# 手动输入搜索关键词 "星火对战平台"

# 方式2: 直接启动 (如果已安装)
adb -s R5CW91XQEGF shell am start -n com.xinghuo.main/.MainActivity
```

### 3. 定位目标元素
```python
# 截图分析
adb -s R5CW91XQEGF exec-out screencap -p > current.png

# Python 分析卡片/按钮位置
# 分割屏幕区域，精确定位坐标
```

### 4. 执行点击操作
```python
# 使用估算的坐标
adb -s R5CW91XQEGF shell input tap x y

# 验证结果 (再次截图)
adb -s R5CW91XQEGF exec-out screencap -p > after_click.png
```

### 5. 处理弹窗/协议
```python
# 常见弹窗类型:
# - 服务协议: 需要点击"同意"按钮
# - 自动断开: 需要点击"确定"关闭
# - 权限请求: 需要点击"允许"

# 对话框按钮坐标估算 (居中弹窗):
# 拒绝按钮: (dialog_left + half_width, button_y)
# 同意按钮: (dialog_right - half_width, button_y)
```

### 6. 返回/退出操作
```python
# 优先使用系统返回键
adb -s R5CW91XQEGF shell input keyevent 4

# 点击返回箭头 (备选)
adb -s R5CW91XQEGF shell input tap 80 120  # 左上角估算
```

## 调试技巧

### 截图验证每个步骤
```python
# 每个操作后截图
step = 1
adb -s R5CW91XQEGF exec-out screencap -p > step{step}_result.png
```

### 分割分析复杂界面
```python
# 将大厅分割为5个卡片区域
card_width = width // 5
for i in range(5):
    card = img.crop((i*card_width, y1, (i+1)*card_width, y2))
    card.save(f"card_{i}.png")
```

### 坐标微调
```python
# 如果点击不生效，尝试在估算坐标周围微调
for x in [1280, 1300, 1320]:
    for y in [830, 850, 870]:
        adb -s R5CW91XQEGF shell input tap x y
        # 截图验证
```

## 常见问题

| 问题 | 原因 | 解决方案 |
|------|------|----------|
| `adb exec-out screencap` 输出乱码 | 未加 `-p` 参数 | 使用 `adb exec-out screencap -p` |
| 点击返回箭头无效 | UI 响应慢/位置不准 | 改用 `input keyevent 4` |
| 中文搜索失败 | `input text` 不支持中文 | 用户手动输入，或剪贴板方案 |
| ADB 连接重置 | 长时间操作/USB 不稳定 | `adb reconnect` 后重新验证 |
| Airtest 连接失败 | SDK 36 minicap 不兼容 | 改用纯 ADB 命令 |
| 点击协议弹窗无效 | 坐标估算偏差 | 缩小对话框估算范围，重新截图分析 |

## 依赖

- **Python**: 3.14.4 (系统) 或 3.13.12 (managed)
- **PIL/Pillow**: `pip install pillow`
- **adb**: Windows 平台需安装 [Android SDK Platform Tools](https://developer.android.com/tools/releases/platform-tools)
- **Airtest** (可选): `pip install airtest`

## 设备标识

```bash
# 列出所有连接的设备
adb devices

# 输出示例:
# List of devices attached
# R5CW91XQEGF device
```