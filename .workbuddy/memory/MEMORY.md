# MEMORY.md - 长期记忆

## adb-android-automation (星火对战平台操作)

### 设备信息
- **设备序列号**: `R5CW91XQEGF` (三星 SM-A5460)
- **Android SDK 版本**: 36 (高版本)
- **屏幕分辨率**: 2340 × 1080
- **星火对战平台包名**: `xd.sce.box` ✅
  - Activity: `com.sdk.taptap.TaptapLauncher`

### 关键发现

1. **截图命令**: `adb exec-out screencap -p` 输出 PNG 格式 ✅
   - `adb shell screencap -p` 输出 raw 格式 (PIL 无法读取) ❌

2. **返回操作**: `adb shell input keyevent 4` (系统返回键) 比点击返回箭头更可靠

3. **中文输入**: `adb shell input text` 不支持中文 ❌
   - 三星设备剪贴板获取也失败
   - 需要用户手动输入或改用 Intent 方案

4. **Airtest 限制**: Android SDK 36 上 minicap 不兼容，Airtest 自动回退到 javacap
   - 优先使用纯 ADB 命令，Airtest 作为备选

5. **坐标估算**:
   - 居中弹窗: 宽度约 47% 屏幕
   - 对话框按钮 Y 坐标: 约屏幕 79% 高度处
   - 两个按钮左右并排，各占一半宽度

### 成功流程

```
设备连接 → 启动应用商店 → 搜索并安装 → 启动平台 → 关闭自动断开弹窗
→ 滑动浏览卡片 → 定位目标游戏 → 点击进入详情页 → 点击启动游戏
→ 协议弹窗 → 点击"同意" → 等待下载 → 游戏启动
```

### 文件位置
- 操作脚本: `D:/game_auto/`
- 技能文件: `D:/game_auto/SKILL.md`
- 核心封装: `D:/game_auto/adb_ops.py`

### 经验教训

| 问题 | 解决 |
|------|------|
| 点击协议弹窗不生效 | 重新截图分析，精确计算按钮坐标 |
| 长时间操作导致 ADB 断开 | `adb reconnect` 恢复 |
| 坐标估算偏差 | 缩小估算范围，多次验证 |