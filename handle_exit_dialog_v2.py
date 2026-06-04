"""
处理游戏退出确认弹窗 - v2
重新分析截图，调整坐标估算
"""
import subprocess

DEVICE = "R5CW91XQEGF"

def click_at(x, y):
    """点击指定位置"""
    subprocess.run(["adb", "-s", DEVICE, "shell", "input", "tap", str(x), str(y)], check=True)
    print(f"点击: ({x}, {y})")

SCREEN_W = 2340
SCREEN_H = 1080

# v2 更精确的估算:
# 弹窗底部按钮区域更靠下
# 弹窗左侧约 24% 屏幕，右侧约 76% 屏幕
# 按钮 Y 坐标在屏幕 84%-93% 之间

popup_left = int(SCREEN_W * 0.24)  # ~562
popup_right = int(SCREEN_W * 0.76)  # ~1778
button_y = int(SCREEN_H * 0.88)      # ~950

# 弹窗内两个按钮水平排列
btn_width = (popup_right - popup_left) // 2  # 每个按钮宽度 ~608

# 取消按钮: 左侧，中心
cancel_x = popup_left + btn_width // 2
# 确认/退出按钮: 右侧，中心
confirm_x = popup_right - btn_width // 2

print(f"估算参数:")
print(f"  弹窗范围: X[{popup_left}-{popup_right}], Y[{int(SCREEN_H*0.72)}-950]")
print(f"  取消按钮: ({cancel_x}, {button_y})")
print(f"  确认按钮: ({confirm_x}, {button_y})")

# 点击取消按钮
click_at(cancel_x, button_y)

# 等待一下
import time
time.sleep(1)

# 截图验证
subprocess.run(["adb", "-s", DEVICE, "shell", "screencap", "-p", "/sdcard/screen_v2.png"], check=True)
subprocess.run(["adb", "-s", DEVICE, "pull", "/sdcard/screen_v2.png", "D:/workbuddy/Claw/screen_verify_v2.png"], check=True)
print("验证截图已保存: screen_verify_v2.png")
