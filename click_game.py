#!/usr/bin/env python3
"""点击特定游戏进入"""
import subprocess

DEVICE = "R5CW91XQEGF"

def click_at(x, y):
    """点击指定位置"""
    subprocess.run(["adb", "-s", DEVICE, "shell", "input", "tap", str(x), str(y)], check=True)
    print(f"已点击位置: ({x}, {y})")

if __name__ == "__main__":
    # 《我无限升级》是第二张游戏卡片
    # 根据布局估算位置：第二张卡片中部偏下
    # 竖屏 1080x2340，卡片横向排列
    # 第二张卡片 x 约 350~680，y 约 600~1200
    x, y = 600, 700
    click_at(x, y)