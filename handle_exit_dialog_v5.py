"""
处理游戏退出确认弹窗 - Airtest 图像识别 v5
修正模板裁剪：精确选择"取消"按钮（白色边框）
"""
from airtest.core.api import G, snapshot, exists, touch, keyevent, sleep, Template
from airtest.core.android.android import Android
import cv2
import time

print("=" * 50)
print("  Airtest 图像识别 - 点击'取消'按钮 (v5)")
print("=" * 50)

# 1. 连接设备
G.DEVICE = Android("R5CW91XQEGF")
print(f"✓ 设备已连接: {G.DEVICE.serialno}")

# 2. 截取当前屏幕
print("\n[步骤1] 截取当前屏幕...")
snapshot("current_screen_v5.png")
print("✓ 已截图: current_screen_v5.png")

# 3. 加载截图分析
img = cv2.imread("current_screen_v5.png")
if img is None:
    print("✗ 无法读取截图文件")
    exit(1)

h, w = img.shape[:2]
print(f"截图尺寸: {w} x {h}")

# 4. 从之前的调试图 debug_overlay_v4.png 分析
# "取消"按钮是白色边框的矩形，位于弹窗左侧
# 根据 debug_overlay_v4.png 的绿框错误位置，需要向下移动裁剪区域

# 弹窗区域（从之前的分析）
dialog_w = int(w * 0.47)
dialog_h = int(h * 0.18)
dialog_cx = w // 2
dialog_cy = h // 2

# "取消"按钮 - 白色边框的矩形
# 位置：弹窗内左侧，比之前裁剪的更靠下
# 根据截图视觉分析：
btn_w = int(dialog_w * 0.45)  # 按钮宽度约为弹窗的45%
btn_h = int(dialog_h * 0.35)  # 按钮高度约为弹窗的35%
btn_left = dialog_cx - dialog_w // 2 + int(dialog_w * 0.03)  # 左侧留边
btn_right = btn_left + btn_w
btn_top = dialog_cy + int(dialog_h * 0.05)  # 比之前更靠下
btn_bottom = btn_top + btn_h

print(f"\n弹窗区域: x[{dialog_cx - dialog_w // 2}-{dialog_cx + dialog_w // 2}], y[{dialog_cy - dialog_h // 2}-{dialog_cy + dialog_h // 2}]")
print(f"'取消'按钮区域: x[{btn_left}-{btn_right}], y[{btn_top}-{btn_bottom}]")

# 裁剪按钮模板
btn_template = img[btn_top:btn_bottom, btn_left:btn_right]
cv2.imwrite("cancel_btn_v5.png", btn_template)
print(f"✓ 已保存模板: cancel_btn_v5.png (尺寸: {btn_template.shape[1]}x{btn_template.shape[0]})")

# 5. 显示模板边界框（用于调试）
debug_img = img.copy()
cv2.rectangle(debug_img, (btn_left, btn_top), (btn_right, btn_bottom), (0, 255, 0), 3)  # 绿色：取消按钮
cv2.rectangle(debug_img, 
              (dialog_cx - dialog_w // 2, dialog_cy - dialog_h // 2),
              (dialog_cx + dialog_w // 2, dialog_cy + dialog_h // 2), 
              (255, 0, 0), 2)  # 红色：弹窗
# 标记"退出"按钮位置（红色填充）
exit_btn_left = btn_left + btn_w + 10
exit_btn_right = exit_btn_left + btn_w
exit_btn_top = btn_top
exit_btn_bottom = btn_bottom
cv2.rectangle(debug_img, (exit_btn_left, exit_btn_top), (exit_btn_right, exit_btn_bottom), (255, 255, 0), 2)  # 黄色：退出按钮
cv2.imwrite("debug_overlay_v5.png", debug_img)
print("✓ 已保存调试图: debug_overlay_v5.png")

# 6. 使用 Airtest 在实时屏幕上匹配模板
print("\n[步骤2] 开始在屏幕上搜索'取消'按钮...")
tpl = Template("cancel_btn_v5.png", threshold=0.60)
result = exists(tpl, timeout=10)

if result:
    click_x, click_y = result
    print(f"\n✅ 找到'取消'按钮!")
    print(f"   位置: ({click_x}, {click_y})")
    
    # 点击按钮中心
    print("\n[步骤3] 执行点击...")
    touch(result)
    print("✓ 已点击取消按钮")
    
    # 等待弹窗关闭动画
    sleep(2)
    
    # 7. 验证截图
    print("\n[步骤4] 验证弹窗状态...")
    snapshot("after_cancel_click_v5.png")
    print("✓ 已保存验证截图: after_cancel_click_v5.png")
    
    # 检查弹窗是否还存在
    result2 = exists(tpl, timeout=2)
    if result2:
        print("⚠️  警告: 弹窗可能仍然存在，位置:", result2)
        print("   可能是匹配到了'退出'按钮或其他元素")
    else:
        print("✓ 弹窗已关闭（未检测到匹配图像）")
    
else:
    print("\n❌ 未找到'取消'按钮")
    print("可能的原因:")
    print("  1. 弹窗已被关闭")
    print("  2. 模板裁剪区域仍不精确")
    print("  3. 屏幕显示内容变化")
    
    # 备选方案：尝试系统返回键
    print("\n[备选] 尝试使用系统返回键...")
    keyevent(4)
    sleep(1.5)
    snapshot("after_backkey_v5.png")
    print("✓ 已保存截图: after_backkey_v5.png")

print("\n" + "=" * 50)
print("  执行完毕")
print("=" * 50)
