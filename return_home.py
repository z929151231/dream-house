#!/usr/bin/env python3
"""
点击返回按钮回到星火对战平台首页
"""
import cv2
import numpy as np
import subprocess

DEVICE = "R5CW91XQEGF"

def adb_click(x, y):
    """执行点击操作"""
    subprocess.run(["adb", "-s", DEVICE, "shell", "input", "tap", str(x), str(y)], check=True)

def find_back_button(screen_path):
    """在左上角区域寻找返回按钮"""
    img = cv2.imread(screen_path)
    if img is None:
        print(f"❌ 无法读取图片: {screen_path}")
        return None
    
    height, width = img.shape[:2]
    print(f"📷 屏幕尺寸: {width} × {height}")
    
    # 返回按钮通常在左上角
    # 可能是箭头形状或X按钮
    # 搜索区域：0-150, 0-150
    
    search_area = img[0:150, 0:150]
    
    # 检测返回按钮的特征：
    # 1. 白色箭头（在深色背景上）
    # 2. 或者深色圆形背景
    
    # 方法1：寻找白色像素（箭头）
    white_pixels = cv2.countNonZero(cv2.inRange(search_area, 240, 255))
    white_ratio = white_pixels / (150 * 150)
    print(f"   左上角白色像素比例: {white_ratio:.2f}")
    
    # 方法2：检测左上角区域的边缘
    gray = cv2.cvtColor(search_area, cv2.COLOR_BGR2GRAY)
    
    # 寻找最亮的区域（可能是箭头）
    _, thresh = cv2.threshold(gray, 200, 255, cv2.THRESH_BINARY)
    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    # 寻找左上角的亮色区域
    arrow_candidates = []
    for cnt in contours:
        x, y, w, h = cv2.boundingRect(cnt)
        area = w * h
        if 50 < area < 2000:  # 合理的箭头大小
            arrow_candidates.append((x, y, w, h, area))
    
    print(f"\n🔍 检测到 {len(arrow_candidates)} 个可能的返回按钮候选:")
    for i, (x, y, w, h, area) in enumerate(arrow_candidates):
        print(f"   候选{i}: ({x}, {y}) 尺寸 {w}×{h}, 面积={area}")
    
    # 选择最靠左上的候选（通常是返回按钮）
    if arrow_candidates:
        # 按Y坐标排序，取最上面的
        arrow_candidates.sort(key=lambda c: c[1])
        best = arrow_candidates[0]
        click_x = best[0] + best[2] // 2
        click_y = best[1] + best[3] // 2
        print(f"\n🎯 选择返回按钮点击位置: ({click_x}, {click_y})")
        return (click_x, click_y)
    
    # 如果没找到，使用默认位置
    # 返回按钮通常在 (60, 70) 附近
    default_x, default_y = 70, 70
    print(f"\n⚠️ 未检测到返回按钮，使用默认位置: ({default_x}, {default_y})")
    return (default_x, default_y)

def main():
    screen_path = "D:/workbuddy/Claw/screen_verify.png"
    
    print("="*50)
    print("🔙 准备点击返回按钮")
    print("="*50)
    
    back_pos = find_back_button(screen_path)
    
    if back_pos:
        x, y = back_pos
        print(f"\n🖱️ 执行点击: ({x}, {y})")
        adb_click(x, y)
        print("✅ 点击完成")

if __name__ == "__main__":
    main()
