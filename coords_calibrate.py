#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
坐标校准工具
用法: 运行后在屏幕上显示点击位置，输出精确坐标
"""

import subprocess
import sys

DEVICE = "R5CW91XQEGF"

def adb_shell(cmd):
    result = subprocess.run(
        ["adb", "-s", DEVICE, "shell", cmd],
        capture_output=True, text=True
    )
    return result.stdout.strip()

def calibrate():
    """交互式坐标校准"""
    print("\n坐标校准模式")
    print("="*50)
    print("1. 运行脚本后，手机会出现标记")
    print("2. 手动在需要的位置点击")
    print("3. 脚本会输出该位置的精确坐标")
    print("="*50)
    
    print("\n使用方法:")
    print("  手机屏幕上会出现十字标记")
    print("  手动点击需要校准的位置")
    print("  然后按 Enter 获取坐标")
    print("\n直接按 Enter 开始...")
    input()
    
    while True:
        # 显示临时标记
        x, y = 100, 100  # 默认位置
        adb_shell(f"am broadcast -a com.android.server.teleport -e x {x} -e y {y}")
        
        print("在目标位置点击后，按 Enter 获取坐标 (Ctrl+C 退出)")
        input()
        
        # 获取最后一次触摸事件
        output = adb_shell("dumpsys input | grep 'Last Touch' | tail -1")
        print(f"\n读取到的触摸信息: {output}")
        
        # 或者用 getevent 更精确
        print("\n按 Enter 记录当前屏幕截图...")
        input()
        subprocess.run(["adb", "-s", DEVICE, "shell", "screencap", "-p", "/sdcard/curr.png"])
        subprocess.run(["adb", "-s", DEVICE, "pull", "/sdcard/curr.png", "calibration.png"])
        print("已保存: calibration.png")


if __name__ == "__main__":
    calibrate()
