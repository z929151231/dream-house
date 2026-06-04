"""
处理游戏退出确认弹窗 - 使用Airtest
"""
from airtest.core.api import G, snapshot, exists, touch, keyevent, sleep, Template
from airtest.core.android.android import Android
import cv2
import time

print("=== Airtest 图像识别点击弹窗取消按钮 ===\n")

# 直接用Android类连接设备
dev = Android("R5CW91XQEGF")
G.DEVICE = dev
print(f"设备连接成功: {dev.serialno}")

# 截取当前屏幕
snapshot("screen_verify.png")
print("已截图: screen_verify.png")

# 读取截图
img = cv2.imread("screen_verify.png")
h, w = img.shape[:2]
print(f"截图尺寸: {w}x{h}")

# 裁剪"取消"按钮区域作为模板
# 从之前的截图分析，弹窗位于屏幕中间区域
# 取消按钮在弹窗左侧
btn_x1 = int(w * 0.15)
btn_x2 = int(w * 0.42)
btn_y1 = int(h * 0.55)
btn_y2 = int(h * 0.59)

btn_region = img[btn_y1:btn_y2, btn_x1:btn_x2]
cv2.imwrite("cancel_btn_template.png", btn_region)
print(f"裁剪取消按钮模板: x[{btn_x1}-{btn_x2}], y[{btn_y1}-{btn_y2}]")
print(f"模板尺寸: {btn_region.shape[1]}x{btn_region.shape[0]}")

# 用Airtest在屏幕上找这个模板
# 使用Template对象来设置阈值
print("\n正在搜索匹配图像...")
tpl = Template("cancel_btn_template.png", threshold=0.6)
template_result = exists(tpl)

if template_result:
    print(f"✓ 找到取消按钮! 位置: {template_result}")
    touch(template_result)
    print("✓ 已点击取消按钮")
    sleep(1)
    
    # 验证
    snapshot("screen_after_cancel.png")
    print("\n验证截图: screen_after_cancel.png")
else:
    print("✗ 未找到匹配的取消按钮图像")
    print("尝试直接用系统返回键...")
    
    keyevent(4)
    sleep(1)
    
    snapshot("screen_after_backkey.png")
    print("验证截图: screen_after_backkey.png")

print("\n=== 执行完毕 ===")
