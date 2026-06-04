#!/usr/bin/env python3
"""
抽卡自动化专用脚本
支持: 单次抽卡 / 连续抽卡 / 十连抽卡
"""

import subprocess
import cv2
import numpy as np
import os
import time
from pathlib import Path

# ========== 配置 ==========
DEVICE = "R5CW91XQEGF"
WORK_DIR = Path("D:/workbuddy/Claw")
SCREEN_W, SCREEN_H = 2340, 1080

# 抽卡相关坐标 (基于 in_game_04_main_interface.png 分析)
# 左侧导航栏: 第3个图标(从上往下)为抽卡/召唤入口
# 估算: x≈120, y≈400 (左侧边栏中部)
GACHA_ENTRY = (120, 400)  # 左侧导航栏抽卡按钮
GACHA_CONFIRM = (int(SCREEN_W * 0.60), int(SCREEN_H * 0.70))  # 抽卡确认按钮 (居中弹窗右下)
GACHA_RESULT_CLOSE = (int(SCREEN_W * 0.85), int(SCREEN_H * 0.85))  # 关闭结果窗口 (右上角)

# ========== ADB 工具 ==========
def adb(cmd: str, capture=False):
    full = f"adb -s {DEVICE} {cmd}"
    result = subprocess.run(full, shell=True, capture_output=True, timeout=30)
    return result.stdout, result.stderr, result.returncode

def adb_shell(cmd: str) -> str:
    out, _, rc = adb(f"shell {cmd}")
    return out.strip() if rc == 0 else ""

def tap(x, y, count=1, delay=0.3):
    for i in range(count):
        adb_shell(f"input tap {x} {y}")
        if i < count - 1:
            time.sleep(delay)
    print(f"  点击 ({x}, {y}) x{count}")

def back():
    adb_shell("input keyevent 4")

def screenshot():
    raw = adb(f"exec-out screencap -p")[0]
    img = cv2.imdecode(np.frombuffer(raw, np.uint8), cv2.IMREAD_COLOR)
    return img

def save_screenshot(name: str):
    img = screenshot()
    path = WORK_DIR / f"gacha_{name}.png"
    cv2.imwrite(str(path), img)
    return path

# ========== 抽卡流程 ==========
def draw_single(draw_count: int = 1):
    """执行单次抽卡"""
    print("\n" + "=" * 60)
    print(f"  抽卡系统 - {draw_count} 次抽卡")
    print("=" * 60)
    
    for i in range(draw_count):
        print(f"\n[第 {i+1}/{draw_count} 次] 抽卡中...")
        
        # Step 1: 进入抽卡界面
        save_screenshot("step1_before_draw")
        print("  → 点击抽卡入口...")
        tap(*GACHA_ENTRY)
        time.sleep(1.5)
        
        # Step 2: 处理确认弹窗
        print("  → 等待弹窗...")
        save_screenshot("step2_confirm_dialog")
        time.sleep(0.5)
        
        # Step 3: 点击确认
        print("  → 点击确认按钮...")
        tap(*GACHA_CONFIRM, count=2)
        time.sleep(2)
        
        # Step 4: 查看抽卡结果
        save_screenshot("step3_result")
        print("  → 保存结果截图...")
        
        # Step 5: 关闭结果窗口
        print("  → 关闭结果窗口...")
        tap(*GACHA_RESULT_CLOSE)
        time.sleep(0.5)
        
        # Step 6: 返回抽卡界面
        print("  → 返回抽卡界面...")
        back()
        time.sleep(0.5)
    
    print(f"\n✅ 抽卡完成! 共 {draw_count} 次")
    print("\n生成的调试文件:")
    for i in range(draw_count):
        print(f"  - gacha_step1_before_draw_{i}.png (可选)")
        print(f"  - gacha_step2_confirm_dialog_{i}.png")
        print(f"  - gacha_step3_result_{i}.png")
    
    return True

def draw_ten():
    """执行十连抽卡"""
    print("\n" + "=" * 60)
    print("  十连抽卡模式")
    print("=" * 60)
    
    # 十连通常有单独的按钮
    TEN_PULL_BTN = (int(SCREEN_W * 0.75), int(SCREEN_H * 0.75))
    
    save_screenshot("ten_before")
    print("  → 点击十连抽卡...")
    tap(*TEN_PULL_BTN, count=2)
    time.sleep(3)
    
    # 处理结果
    save_screenshot("ten_result")
    print("  → 保存十连结果...")
    
    # 关闭
    back()
    time.sleep(0.5)
    
    print("\n✅ 十连抽卡完成")
    return True

def auto_daily(draw_count: int = 1):
    """
    自动每日抽卡
    1. 启动应用商店
    2. 进入游戏
    3. 执行抽卡
    4. 返回
    """
    print("\n" + "=" * 60)
    print("  自动每日抽卡")
    print("=" * 60)
    
    # 检查设备
    result = subprocess.run(f"adb -s {DEVICE} get-state", shell=True, capture_output=True)
    if result.returncode != 0:
        print("✗ 设备未连接")
        return False
    
    print("✓ 设备连接正常")
    
    # 进入游戏
    print("\n[启动] 启动游戏...")
    save_screenshot("launch")
    
    # 点击应用商店中的游戏卡片 (第二张)
    GAME_CARD = (int(SCREEN_W * 0.35), int(SCREEN_H * 0.55))
    tap(*GAME_CARD)
    time.sleep(2)
    
    # 启动游戏按钮 (右下角)
    LAUNCH_BTN = (int(SCREEN_W * 0.75), int(SCREEN_H * 0.80))
    save_screenshot("before_launch")
    tap(*LAUNCH_BTN, count=2)
    time.sleep(4)
    
    # 处理可能的登录/协议弹窗
    print("  → 处理登录/协议弹窗...")
    save_screenshot("dialog_check")
    
    # 点击"同意"/"确定"按钮 (估算位置)
    AGREE_BTN = (int(SCREEN_W * 0.65), int(SCREEN_H * 0.70))
    tap(*AGREE_BTN, count=2)
    time.sleep(2)
    
    # 进入抽卡
    print("\n[抽卡] 执行抽卡...")
    draw_single(draw_count)
    
    # 返回应用商店
    print("\n[返回] 返回应用商店...")
    for _ in range(3):
        back()
        time.sleep(0.3)
    
    save_screenshot("final")
    
    print("\n" + "=" * 60)
    print("  ✅ 每日抽卡流程完成")
    print("=" * 60)
    return True

# ========== 主入口 ==========
if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="抽卡自动化")
    parser.add_argument("--mode", choices=["single", "ten", "daily"], default="single",
                        help="抽卡模式")
    parser.add_argument("--count", type=int, default=1, help="单次抽卡次数")
    args = parser.parse_args()
    
    if args.mode == "single":
        draw_single(args.count)
    elif args.mode == "ten":
        draw_ten()
    elif args.mode == "daily":
        auto_daily(args.count)
