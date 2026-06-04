#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
高精度点击测试 - 在指定坐标画标记并点击
"""

import subprocess
import time

DEVICE = "R5CW91XQEGF"

def adb_shell(cmd):
    return subprocess.run(["adb", "-s", DEVICE, "shell", cmd],
                         capture_output=True, text=True).stdout.strip()

def screenshot(name):
    adb_shell("screencap -p /sdcard/tmp.png")
    subprocess.run(["adb", "-s", DEVICE, "pull", "/sdcard/tmp.png", f"D:/workbuddy/Claw/{name}.png"])

def main():
    # 先截张图看看
    screenshot("before_mark")
    
    # 在左侧区域画个十字标记
    x, y = 500, 650  # 测试位置
    
    print(f"在 ({x}, {y}) 画标记并点击...")
    
    # 画标记（如果支持的话）
    adb_shell(f"am broadcast -a android.intent.action.USER_PRESENT 2>/dev/null")
    
    # 点击
    adb_shell(f"input tap {x} {y}")
    
    time.sleep(3)
    screenshot("after_click_test")
    
    print(f"完成，查看 before_mark.png 和 after_click_test.png 对比")

if __name__ == "__main__":
    main()
