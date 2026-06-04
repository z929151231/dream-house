#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
网格点击测试 - 在左侧区域多点测试找到正确位置
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

def tap(x, y):
    adb_shell(f"input tap {x} {y}")

def main():
    print("网格点击测试 - 左侧区域")
    
    # 左侧卡片大概在 X=100~500, Y=400~800
    # 逐点测试
    for x in range(200, 601, 100):
        for y in range(400, 801, 100):
            screenshot(f"grid_test_{x}_{y}")
            print(f"  点击 ({x}, {y})")
            tap(x, y)
            time.sleep(2)
    
    print("完成，查看所有 grid_test_*.png 找到触发变化的那个")

if __name__ == "__main__":
    main()
