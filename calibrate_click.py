#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
精确坐标校准 - 在左侧区域测试一系列坐标
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
    print("精确校准：在左侧区域测试点击")
    print("=" * 50)
    print("将依次测试以下坐标，每次测试后截图保存")
    print("请查看 after_cal_*.png 对比哪次触发了变化")
    print("=" * 50)
    
    # 基于截图，"高地保安"卡片左侧大致位置
    # 估算：X 约 100-500, Y 约 400-800 (屏幕左侧)
    test_points = [
        (200, 450), (250, 450), (300, 450),
        (200, 500), (250, 500), (300, 500),
        (200, 550), (250, 550), (300, 550),
        (200, 600), (250, 600), (300, 600),
        (200, 650), (250, 650), (300, 650),
        (350, 450), (400, 450),
        (350, 500), (400, 500),
        (350, 550), (400, 550),
        (350, 600), (400, 600),
    ]
    
    for i, (x, y) in enumerate(test_points):
        print(f"\n测试点 {i+1}/{len(test_points)}: ({x}, {y})")
        
        # 点击前截图
        screenshot(f"before_cal_{x}_{y}")
        
        # 执行点击
        tap(x, y)
        
        # 等待并截图
        time.sleep(1.5)
        screenshot(f"after_cal_{x}_{y}")
        
        print(f"  完成 -> 查看 before_cal_{x}_{y}.png 和 after_cal_{x}_{y}.png")
    
    print("\n" + "=" * 50)
    print("校准完成！请对比所有截图找到触发页面变化的坐标")

if __name__ == "__main__":
    main()
