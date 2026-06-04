#!/usr/bin/env python3
"""
启动游戏 - v2 版本
精确定位"启动游戏"按钮并点击
"""

import subprocess
import cv2
import numpy as np
import time
from pathlib import Path

DEVICE = "R5CW91XQEGF"
SCREEN_W, SCREEN_H = 2340, 1080
WORK_DIR = Path("D:/workbuddy/Claw")

def adb(cmd: str):
    full = f"adb -s {DEVICE} {cmd}"
    return subprocess.run(full, shell=True, capture_output=True, timeout=30)

def adb_shell(cmd: str) -> str:
    out = adb(f"shell {cmd}")
    return out.stdout.strip().decode() if out.returncode == 0 else ""

def adb_exec_out(cmd: str) -> bytes:
    out = adb(f"exec-out {cmd}")
    return out.stdout if out.returncode == 0 else b""

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

def save_img(img: np.ndarray, name: str):
    cv2.imwrite(str(WORK_DIR / name), img)
    print(f"  📸 {name}")

# 从 current_game_screen.png 分析"启动游戏"按钮的位置
# 按钮在右下角，紫色背景，白色文字

def find_launch_button(img: np.ndarray) -> tuple:
    """
    精确定位"启动游戏"按钮
    特征：右下角，紫色背景(#8B5CF6 附近)，圆角矩形
    """
    h, w = img.shape[:2]
    
    # 搜索区域：右下角
    # 从截图看，按钮大约在 x=1700-2000, y=850-950 范围
    x1, y1 = int(w * 0.70), int(h * 0.75)
    x2, y2 = int(w * 0.95), int(h * 0.92)
    
    region = img[y1:y2, x1:x2]
    
    # 寻找紫色区域（启动按钮的特征色）
    # 紫色：R < G, B > R, B 较高
    r, g, b = region[:,:,0], region[:,:,1], region[:,:,2]
    purple_mask = (b > 150) & (b > r + 30) & (g > r)
    
    # 寻找连续区域
    coords = np.column_stack(np.where(purple_mask))
    if len(coords) < 100:
        return None
    
    # 计算中心
    y_coords, x_coords = coords[:, 0], coords[:, 1]
    btn_x = x1 + int(x_coords.mean())
    btn_y = y1 + int(y_coords.mean())
    
    return btn_x, btn_y

def main():
    print("=" * 60)
    print("  启动游戏 v2")
    print("=" * 60)
    
    # 获取当前屏幕
    img = screenshot()
    save_img(img, "screen_before_launch.png")
    
    # 定位"启动游戏"按钮
    btn_pos = find_launch_button(img)
    
    if btn_pos:
        bx, by = btn_pos
        print(f"\n  ✅ 找到启动按钮: ({bx}, {by})")
        print(f"  点击启动按钮...")
        tap(bx, by, count=3, delay=0.5)  # 多次点击确保触发
        
        # 等待游戏启动
        print("\n  ⏳ 等待游戏启动 (10秒)...")
        time.sleep(10)
        
        # 截图确认
        img_after = screenshot()
        save_img(img_after, "screen_after_launch.png")
        print("\n  📋 游戏启动后截图已保存")
        print("  请检查是否成功进入游戏主界面")
    else:
        print("\n  ⚠️ 未找到启动按钮，使用估算位置")
        # 备选：直接点击右下角区域
        tap(int(SCREEN_W * 0.80), int(SCREEN_H * 0.85), count=3)
        time.sleep(5)
        img = screenshot()
        save_img(img, "screen_fallback.png")

if __name__ == "__main__":
    main()
