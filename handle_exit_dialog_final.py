"""
处理游戏退出确认弹窗 - 最终方案
尝试多种方法：返回键、am broadcast、adb shell input text
"""
import subprocess
import time

DEVICE = "R5CW91XQEGF"

print("=== 尝试多种关闭弹窗的方法 ===\n")

# 方法1: 发送系统返回键
print("方法1: 发送系统返回键 (keyevent 4)")
subprocess.run(["adb", "-s", DEVICE, "shell", "input", "keyevent", "4"], check=True)
time.sleep(0.5)

# 截图
subprocess.run(["adb", "-s", DEVICE, "shell", "screencap", "-p", "/sdcard/screen_final.png"], check=True)
subprocess.run(["adb", "-s", DEVICE, "pull", "/sdcard/screen_final.png", "D:/workbuddy/Claw/screen_verify_final.png"], check=True)

print("截图已保存: screen_verify_final.png")
print("\n请检查弹窗是否关闭。")
