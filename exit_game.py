#!/usr/bin/env python3
"""
退出当前游戏，返回星火对战平台
"""
import cv2
import numpy as np
import subprocess
import os

DEVICE = "R5CW91XQEGF"

def adb_click(x, y):
    subprocess.run(["adb", "-s", DEVICE, "shell", "input", "tap", str(x), str(y)], check=True)

def adb_launch_starpaltform():
    """启动星火对战平台"""
    subprocess.run([
        "adb", "-s", DEVICE, "shell", "am", "start",
        "-n", "xd.sce.box/com.sdk.taptap.TaptapLauncher"
    ], check=True)

def find_ui_element(screen_path, description="返回按钮"):
    """在屏幕中寻找UI元素"""
    img = cv2.imread(screen_path)
    if img is None:
        return None
    
    height, width = img.shape[:2]
    print(f"📷 屏幕尺寸: {width} × {height}")
    
    # 分析屏幕特征
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    # 寻找文字区域（游戏界面通常有明确的功能按钮）
    # 方法：寻找亮色文字区域
    
    # 顶部区域分析
    top_region = gray[0:100, 0:width]
    
    # 检测顶部文字
    _, thresh = cv2.threshold(top_region, 180, 255, cv2.THRESH_BINARY)
    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    text_regions = []
    for cnt in contours:
        x, y, w, h = cv2.boundingRect(cnt)
        area = w * h
        if w > 30 and 15 < h < 60:  # 文字区域特征
            text_regions.append((x, y, w, h))
    
    print(f"\n🔍 顶部检测到 {len(text_regions)} 个文字区域:")
    for i, (x, y, w, h) in enumerate(text_regions[:10]):
        print(f"   区域{i}: ({x}, {y}) 尺寸 {w}×{h}")
    
    # 寻找"返回"文字（通常在左上角）
    back_button = None
    for x, y, w, h in text_regions:
        # 检查是否在左侧区域
        if x < 200:
            center_x = x + w // 2
            center_y = y + h // 2
            back_button = (center_x, center_y)
            print(f"\n🎯 找到返回按钮位置: ({center_x}, {center_y})")
            break
    
    if back_button is None:
        # 寻找其他可能的退出按钮
        # 分析右侧功能区域
        right_region = gray[100:height-200, width-200:width]
        
        # 寻找功能按钮区域
        _, thresh = cv2.threshold(right_region, 150, 255, cv2.THRESH_BINARY)
        contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        button_candidates = []
        for cnt in contours:
            x, y, w, h = cv2.boundingRect(cnt)
            area = w * h
            if area > 500 and area < 5000:
                button_candidates.append((x + width - 200, y + 100, w, h))
        
        print(f"\n🔍 右侧功能区域检测到 {len(button_candidates)} 个按钮候选")
        if button_candidates:
            # 取第一个作为点击目标
            x, y, w, h = button_candidates[0]
            back_button = (x + w // 2, y + h // 2)
            print(f"🎯 选择右侧按钮: ({back_button[0]}, {back_button[1]})")
    
    return back_button

def main():
    screen_path = "D:/workbuddy/Claw/screen_after_click.png"
    
    print("="*50)
    print("🚪 尝试退出当前游戏")
    print("="*50)
    
    # 寻找返回按钮
    back_pos = find_ui_element(screen_path)
    
    if back_pos:
        x, y = back_pos
        print(f"\n🖱️ 点击返回按钮: ({x}, {y})")
        adb_click(x, y)
        print("✅ 点击完成")
    
    # 等待响应
    print("\n⏳ 等待2秒...")
    import time
    time.sleep(2)
    
    # 再次截图验证
    subprocess.run([
        "adb", "-s", DEVICE, "shell", "screencap", "-p", "/sdcard/screen_verify2.png"
    ], check=True)
    subprocess.run([
        "adb", "-s", DEVICE, "pull", "/sdcard/screen_verify2.png",
        "D:/workbuddy/Claw/screen_verify2.png"
    ], check=True)
    print("📸 验证截图已保存")
    
    # 分析新截图
    img = cv2.imread("D:/workbuddy/Claw/screen_verify2.png")
    if img is not None:
        height, width = img.shape[:2]
        print(f"\n📷 新截图尺寸: {width} × {height}")
        
        # 检查是否是平台首页
        # 平台首页通常有搜索框和较多游戏卡片
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # 检测搜索框（通常在顶部中间）
        search_area = gray[80:150, width//3:2*width//3]
        bright_pixels = cv2.countNonZero(cv2.inRange(search_area, 200, 255))
        bright_ratio = bright_pixels / search_area.size
        print(f"   顶部搜索区域亮色比例: {bright_ratio:.2f}")
        
        if bright_ratio > 0.3:
            print("   ✅ 可能是平台首页（有搜索框）")
        else:
            print("   ⚠️ 可能仍在游戏内")

if __name__ == "__main__":
    main()
