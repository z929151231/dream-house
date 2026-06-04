#!/usr/bin/env python3
"""ADB 自动化操作"""
import subprocess

DEVICE = "R5CW91XQEGF"

def click_at(x, y):
    """点击指定位置"""
    subprocess.run(["adb", "-s", DEVICE, "shell", "input", "tap", str(x), str(y)], check=True)
    print(f"已点击: ({x}, {y})")

def back():
    """返回"""
    subprocess.run(["adb", "-s", DEVICE, "shell", "input", "keyevent", "4"], check=True)
    print("已执行返回")

if __name__ == "__main__":
    back()