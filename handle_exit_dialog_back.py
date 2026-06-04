"""
处理游戏退出确认弹窗 - 使用系统返回键
"""
import subprocess
import time

DEVICE = "R5CW91XQEGF"

# 屏幕分辨率: 1080x2340 (竖屏)
SCREEN_W = 1080
SCREEN_H = 2340

# 弹窗在竖屏中居中显示
# 弹窗高度约占屏幕 25%，宽度约占 80%
# 按钮 Y 在弹窗底部

popup_top = int(SCREEN_H * 0.37)   # ~866
popup_bottom = int(SCREEN_H * 0.62) # ~1451
popup_left = int(SCREEN_W * 0.10)   # ~108
popup_right = int(SCREEN_W * 0.90)  # ~972

button_y = int(SCREEN_H * 0.56)  # ~1310 (按钮位置)

# 取消按钮在左，确认在右
btn_half = (popup_right - popup_left) // 2
cancel_x = popup_left + btn_half // 2  # ~324
confirm_x = popup_right - btn_half // 2  # ~756

print(f"竖屏参数 (1080x2340):")
print(f"  弹窗范围: X[{popup_left}-{popup_right}], Y[{popup_top}-{popup_bottom}]")
print(f"  取消按钮: ({cancel_x}, {button_y})")
print(f"  确认按钮: ({confirm_x}, {button_y})")

# 尝试1: 直接点击估算的取消按钮位置
print("\n=== 尝试1: 点击取消按钮 ===")
subprocess.run(["adb", "-s", DEVICE, "shell", "input", "tap", str(cancel_x), str(button_y)], check=True)
time.sleep(0.5)

# 截图验证
subprocess.run(["adb", "-s", DEVICE, "shell", "screencap", "-p", "/sdcard/screen_back.png"], check=True)
subprocess.run(["adb", "-s", DEVICE, "pull", "/sdcard/screen_back.png", "D:/workbuddy/Claw/screen_verify_back.png"], check=True)
print("验证截图: screen_verify_back.png")

# 检查弹窗是否关闭
print("\n如果弹窗仍在，请查看截图后告诉我下一步操作。")
print("或者我可以尝试发送系统返回键 (keyevent 4) 来关闭弹窗。")
