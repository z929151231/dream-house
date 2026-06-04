"""
处理游戏退出确认弹窗 - Airtest 图像识别 v3
使用更精确的模板裁剪和多重验证
"""
from airtest.core.api import G, snapshot, exists, touch, keyevent, sleep, Template, connect_device
from airtest.core.android.android import Android
import cv2
import time

print("=" * 50)
print("  Airtest 图像识别 - 点击'取消'按钮")
print("=" * 50)

# 1. 连接设备
try:
    connect_device("Android://R5CW91XQEGF")
    print("✓ 设备已连接")
except Exception as e:
    print(f"连接失败: {e}")
    # 尝试直接创建 Android 对象
    G.DEVICE = Android("R5CW91XQEGF")
    print("✓ 直接使用 Android 对象")

dev = G.DEVICE
print(f"设备序列号: {dev.serialno}")

# 2. 截取当前屏幕
print("\n[步骤1] 截取当前屏幕...")
snapshot("current_verify.png")
print("✓ 已截图: current_verify.png")

# 3. 加载截图分析
img = cv2.imread("current_verify.png")
if img is None:
    print("✗ 无法读取截图文件")
    exit(1)

h, w = img.shape[:2]
print(f"截图尺寸: {w} x {h}")

# 4. 基于视觉分析精确裁剪"取消"按钮
# 从 screen_after.png 分析得出（已验证弹窗存在）
# 设备竖屏 1080x2340，截图已自动旋转
# "取消"按钮位置估算：
# - 弹窗居中的深色对话框
# - "取消"按钮在左侧，白色边框
# 坐标基于 1080x2340 竖屏

# 弹窗大致位置（占屏幕约 47% 宽度，约 18% 高度）
dialog_w = int(w * 0.47)
dialog_h = int(h * 0.18)
dialog_cx = w // 2
dialog_cy = h // 2 + int(h * 0.02)

# 弹窗边界
dialog_left = dialog_cx - dialog_w // 2
dialog_right = dialog_cx + dialog_w // 2
dialog_top = dialog_cy - dialog_h // 2
dialog_bottom = dialog_cy + dialog_h // 2

print(f"\n弹窗区域: x[{dialog_left}-{dialog_right}], y[{dialog_top}-{dialog_bottom}]")

# "取消"按钮（弹窗内左侧，约占弹窗宽度 45%，高度 20%）
# 按钮有白色边框，内部是蓝色背景，文字"取消"
btn_w = int(dialog_w * 0.42)
btn_h = int(dialog_h * 0.22)
btn_left = dialog_left + int(dialog_w * 0.04)
btn_right = btn_left + btn_w
btn_top = dialog_top + int(dialog_h * 0.42)
btn_bottom = btn_top + btn_h

print(f"'取消'按钮区域: x[{btn_left}-{btn_right}], y[{btn_top}-{btn_bottom}]")
print(f"按钮尺寸: {btn_right - btn_left} x {btn_bottom - btn_top}")

# 裁剪按钮模板
btn_template = img[btn_top:btn_bottom, btn_left:btn_right]
cv2.imwrite("cancel_btn_v3.png", btn_template)
print(f"✓ 已保存模板: cancel_btn_v3.png")

# 5. 显示模板边界框（用于调试）
debug_img = img.copy()
cv2.rectangle(debug_img, (btn_left, btn_top), (btn_right, btn_bottom), (0, 255, 0), 3)
cv2.rectangle(debug_img, (dialog_left, dialog_top), (dialog_right, dialog_bottom), (255, 0, 0), 2)
cv2.imwrite("debug_overlay.png", debug_img)
print("✓ 已保存调试图: debug_overlay.png")

# 6. 使用 Airtest 在实时屏幕上匹配模板
print("\n[步骤2] 开始在屏幕上搜索'取消'按钮...")
tpl = Template("cancel_btn_v3.png", threshold=0.55)
result = G.DEVICE.find(tpl, timeout=5)

if result:
    click_x, click_y = result
    confidence = result.confidence if hasattr(result, 'confidence') else "N/A"
    print(f"\n✅ 找到'取消'按钮!")
    print(f"   位置: ({click_x}, {click_y})")
    print(f"   置信度: {confidence}")
    
    # 点击按钮
    print("\n[步骤3] 执行点击...")
    touch(result)
    print("✓ 已点击取消按钮")
    
    # 等待弹窗关闭动画
    time.sleep(1.5)
    
    # 7. 验证截图
    print("\n[步骤4] 验证弹窗状态...")
    snapshot("after_cancel_click.png")
    print("✓ 已保存验证截图: after_cancel_click.png")
    
    # 检查弹窗是否还存在（再次搜索模板）
    result2 = G.DEVICE.find(tpl, timeout=2)
    if result2:
        print("⚠️  警告: 弹窗可能仍然存在，位置:", result2)
        print("   建议: 检查截图确认状态")
    else:
        print("✓ 弹窗已关闭（未检测到匹配图像）")
    
else:
    print("\n❌ 未找到'取消'按钮")
    print("可能的原因:")
    print("  1. 弹窗已被关闭")
    print("  2. 模板裁剪区域不精确")
    print("  3. 屏幕显示内容变化")
    
    # 备选方案：尝试系统返回键
    print("\n尝试使用系统返回键...")
    keyevent(4)
    time.sleep(1)
    snapshot("after_backkey.png")
    print("✓ 已保存截图: after_backkey.png")

print("\n" + "=" * 50)
print("  执行完毕")
print("=" * 50)
