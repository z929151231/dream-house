#!/usr/bin/env python3
"""
启动游戏 - v3 版本
策略：先关闭应用商店，回到主页，再重新进入游戏
"""

import subprocess
import cv2
import numpy as np
import time
from pathlib import Path

DEVICE = "R5CW91XQEGF"
SCREEN_W, SCREEN_H = 2340, 1080
WORK_DIR = Path("D:/workbuddy/Claw")

def adb_shell(cmd: str) -> str:
    full = f"adb -s {DEVICE} shell {cmd}"
    result = subprocess.run(full, shell=True, capture_output=True, timeout=30)
    return result.stdout.strip().decode() if result.returncode == 0 else ""

def adb_exec_out(cmd: str) -> bytes:
    full = f"adb -s {DEVICE} exec-out {cmd}"
    result = subprocess.run(full, shell=True, capture_output=True, timeout=30)
    return result.stdout if result.returncode == 0 else b""

def screenshot() -> np.ndarray:
    raw = adb_exec_out("screencap -p")
    if not raw:
        raise RuntimeError("screencap 失败")
    img = cv2.imdecode(np.frombuffer(raw, np.uint8), cv2.IMREAD_COLOR)
    if img is None:
        raise RuntimeError("screencap 输出无法解析")
    return img

def tap(x: int, y: int, count: int = 1, delay: float = 0.5):
    for i in range(count):
        adb_shell(f"input tap {x} {y}")
        if i < count - 1:
            time.sleep(delay)
    print(f"✓ 已点击 ({x}, {y}) x{count}")

def back(times: int = 1):
    for _ in range(times):
        adb_shell("input keyevent 4")
        time.sleep(0.3)
    print(f"✓ 已执行返回 x{times}")

def save_img(img: np.ndarray, name: str):
    cv2.imwrite(str(WORK_DIR / name), img)
    print(f"  📸 {name}")

def main():
    print("=" * 60)
    print("  启动游戏 v3 - 关闭应用商店后重新进入")
    print("=" * 60)
    
    # 步骤1: 返回键关闭应用商店
    print("\n[步骤1] 关闭应用商店...")
    back(times=3)
    time.sleep(1)
    
    img = screenshot()
    save_img(img, "screen_after_back.png")
    
    # 步骤2: 进入应用商店
    print("\n[步骤2] 重新进入应用商店...")
    # 应用商店图标位置估算（通常在桌面第二行中间）
    # 或者直接启动应用商店 APK
    adb_shell("monkey -p com.android.vending -c android.intent.category.LAUNCHER 1")
    time.sleep(3)
    
    img = screenshot()
    save_img(img, "screen_store_launched.png")
    
    # 步骤3: 搜索游戏
    print("\n[步骤3] 搜索游戏...")
    # 点击搜索框（通常在顶部）
    search_x = int(SCREEN_W * 0.5)
    search_y = int(SCREEN_H * 0.12)
    tap(search_x, search_y)
    time.sleep(1)
    
    # 输入搜索词
    adb_shell("input text \"我无限升级\"")
    time.sleep(1)
    
    # 点击搜索
    adb_shell("input keyevent 66")  # Enter
    time.sleep(2)
    
    img = screenshot()
    save_img(img, "screen_search_result.png")
    
    # 步骤4: 点击游戏卡片
    print("\n[步骤4] 点击游戏卡片...")
    # 搜索结果第一张卡片
    card_x = int(SCREEN_W * 0.5)
    card_y = int(SCREEN_H * 0.45)
    tap(card_x, card_y)
    time.sleep(2)
    
    img = screenshot()
    save_img(img, "screen_detail.png")
    
    # 步骤5: 点击启动游戏
    print("\n[步骤5] 启动游戏...")
    # 启动按钮在右下角
    start_x = int(SCREEN_W * 0.75)
    start_y = int(SCREEN_H * 0.82)
    tap(start_x, start_y, count=2)
    time.sleep(5)
    
    img = screenshot()
    save_img(img, "screen_after_start.png")
    
    print("\n✅ 流程完成，请检查截图确认游戏是否启动")

if __name__ == "__main__":
    main()
