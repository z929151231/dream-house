#!/usr/bin/env python3
"""
详细分析当前屏幕内容，确定页面类型并扫描游戏卡片
"""
import cv2
import numpy as np
from PIL import Image
import subprocess
import os

DEVICE = "R5CW91XQEGF"

def adb_screencap(output_path):
    subprocess.run(["adb", "-s", DEVICE, "shell", "screencap", "-p", "/sdcard/screen.png"], check=True)
    subprocess.run(["adb", "-s", DEVICE, "pull", "/sdcard/screen.png", output_path], check=True)

def analyze_screen(screen_path):
    """分析屏幕内容，判断页面类型"""
    img = cv2.imread(screen_path)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    height, width = img.shape[:2]
    
    print(f"📷 屏幕尺寸: {width} × {height}")
    
    # 分析左上角区域 - 检测返回按钮
    # 返回按钮通常在左上角，呈箭头形状
    top_left = gray[0:100, 0:150]
    
    # 检测左上角的深色区域（返回按钮通常是深色圆形或箭头）
    dark_threshold = 50
    dark_pixels = cv2.countNonZero(cv2.inRange(top_left, 0, dark_threshold))
    dark_ratio = dark_pixels / top_left.size
    
    print(f"\n🔍 左上角区域分析 (0-100, 0-150):")
    print(f"   深色像素比例: {dark_ratio:.2f}")
    
    # 记录是否有返回按钮
    has_back_button = dark_ratio > 0.3
    if has_back_button:
        print("   → 可能是详情页（有返回按钮）")
    
    # 分析顶部区域 - 检测搜索框
    # 搜索框通常在顶部中间，呈圆角矩形
    top_center = gray[80:150, width//3:2*width//3]
    
    # 检测搜索框特征（浅色背景，深色边框）
    bright_pixels = cv2.countNonZero(cv2.inRange(top_center, 200, 255))
    bright_ratio = bright_pixels / top_center.size
    
    print(f"\n🔍 顶部区域分析 (80-150, center):")
    print(f"   亮色像素比例: {bright_ratio:.2f}")
    
    # 扫描整个屏幕的卡片分布
    # 从Y=200开始扫描（跳过顶部导航）
    search_start = 200
    search_end = height - 100
    
    # 检测水平分割线
    y_profile = []
    for y in range(search_start, search_end):
        row_mean = np.mean(gray[y:y+1, :])
        y_profile.append((y, row_mean))
    
    # 寻找Y轴跳变点（卡片边界）
    transitions = []
    for i in range(1, len(y_profile)):
        diff = abs(y_profile[i][1] - y_profile[i-1][1])
        if diff > 20:  # 高阈值检测明显边界
            transitions.append((y_profile[i][0], diff))
    
    print(f"\n📊 检测到 {len(transitions)} 个明显边界:")
    for y, diff in transitions:
        print(f"   Y={y}, 变化量={diff:.1f}")
    
    # 分析卡片区域
    card_regions = []
    if len(transitions) > 2:
        # 取前几个作为卡片区域
        for i in range(min(len(transitions) - 1, 10)):
            y1 = transitions[i][0]
            y2 = transitions[i+1][0]
            card_height = y2 - y1
            if card_height > 50:  # 有效卡片高度
                card_regions.append({
                    "y_start": y1,
                    "y_end": y2,
                    "y_center": (y1 + y2) // 2,
                    "height": card_height
                })
    
    print(f"\n📍 检测到 {len(card_regions)} 个可能的卡片区域:")
    for i, region in enumerate(card_regions):
        print(f"   卡片{i}: Y={region['y_start']}-{region['y_end']}, 中心={region['y_center']}")
    
    # 判断页面类型
    # 如果卡片数量较多（>5），可能是首页游戏列表
    # 如果卡片数量少且顶部有搜索框，可能是首页
    # 如果只有1-2个卡片，可能是详情页
    
    if len(card_regions) > 5:
        page_type = "home_game_list"
        print("\n✅ 判断为: 平台首页游戏列表")
    elif len(card_regions) >= 2:
        page_type = "home_page"
        print("\n✅ 判断为: 平台首页（非列表区）")
    else:
        page_type = "detail_page"
        print("\n⚠️ 判断为: 游戏详情页")
    
    result = {
        "page_type": page_type,
        "card_regions": card_regions,
        "has_back_button": has_back_button,
        "transitions": transitions
    }
    
    print("\n" + "="*50)
    print("📋 屏幕分析结果")
    print("="*50)
    print(f"页面类型: {page_type}")
    print(f"返回按钮: {'有' if has_back_button else '无'}")
    print(f"卡片数量: {len(card_regions)}")
    
    return result

if __name__ == "__main__":
    screen_path = "D:/workbuddy/Claw/screen_current.png"
    
    if not os.path.exists(screen_path):
        print("📸 重新截图...")
        adb_screencap(screen_path)
    
    result = analyze_screen(screen_path)
    
    print("\n" + "="*50)
    print("📋 屏幕分析结果")
    print("="*50)
    print(f"页面类型: {result['page_type']}")
    print(f"返回按钮: {'有' if result['has_back_button'] else '无'}")
    print(f"卡片数量: {len(result['card_regions'])}")
