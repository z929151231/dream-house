#!/usr/bin/env python3
"""
通过图像识别在星火对战平台首页找到"我无限升级"游戏
"""
import cv2
import numpy as np
from PIL import Image, ImageEnhance
import subprocess
import os

# 设备序列号
DEVICE = "R5CW91XQEGF"

def adb_screencap(output_path):
    """截图到指定路径"""
    subprocess.run([
        "adb", "-s", DEVICE, 
        "shell", "screencap", "-p", "/sdcard/screen.png"
    ], check=True)
    subprocess.run([
        "adb", "-s", DEVICE, "pull", "/sdcard/screen.png", output_path
    ], check=True)

def enhance_brightness(img_path, factor=2.0):
    """增强图片亮度"""
    img = Image.open(img_path)
    enhancer = ImageEnhance.Brightness(img)
    enhanced = enhancer.enhance(factor)
    enhanced.save(img_path)
    return img_path

def scan_game_cards(screen_path):
    """扫描游戏卡片，寻找'我无限升级'"""
    img = cv2.imread(screen_path)
    if img is None:
        print(f"❌ 无法读取图片: {screen_path}")
        return None
    
    print(f"📷 屏幕尺寸: {img.shape[1]} × {img.shape[0]}")
    
    # 先增强亮度
    enhanced_path = screen_path.replace(".png", "_bright.png")
    enhance_brightness(screen_path, 2.0)
    img_bright = cv2.imread(enhanced_path)
    
    # 扫描整个屏幕，寻找游戏卡片区域
    # 游戏卡片通常是矩形，包含游戏封面图和标题文字
    # 从Y坐标分析：截图是竖屏1080×2340，卡片从上到下排列
    
    height, width = img.shape[:2]
    
    print(f"\n🔍 分析游戏卡片分布...")
    
    # 检测卡片区域：通过边缘检测和颜色分析
    # 游戏卡片通常有边框或背景色
    
    # 将图片转为灰度
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    # 简单扫描：寻找可能的卡片区域（从上到下扫描Y轴）
    # 假设卡片高度约60-100像素，间距10-20像素
    
    card_height_est = 80
    card_gap_est = 15
    
    # 扫描区域：排除顶部导航栏（约200像素）
    search_start = 200
    search_end = height - 200
    
    # 在搜索范围内检测水平分割线（卡片分隔）
    # 通过Y轴像素值变化检测
    y_profiles = []
    for y in range(search_start, search_end, 2):
        row_mean = np.mean(gray[y:y+2, :])
        y_profiles.append((y, row_mean))
    
    # 寻找Y轴亮度跳变点（可能是卡片边界）
    transitions = []
    for i in range(1, len(y_profiles)):
        diff = abs(y_profiles[i][1] - y_profiles[i-1][1])
        if diff > 15:  # 亮度变化阈值
            transitions.append((y_profiles[i][0], diff))
    
    print(f"\n📍 检测到 {len(transitions)} 个亮度变化点（可能的卡片边界）:")
    for y, diff in transitions[:20]:
        print(f"   Y={y}, 变化量={diff:.1f}")
    
    # 估算卡片位置
    card_positions = []
    if len(transitions) >= 2:
        # 取第一个和最后一个变化点作为卡片区域范围
        first_y = transitions[0][0]
        last_y = transitions[-1][0]
        
        # 估算卡片数量
        total_height = last_y - first_y
        est_card_count = int(total_height / (card_height_est + card_gap_est))
        print(f"\n📊 估算卡片数量: {est_card_count}")
        
        # 扫描每张卡片区域
        for i in range(min(est_card_count, 10)):
            card_y = first_y + i * (card_height_est + card_gap_est)
            card_x_start = 50
            card_x_end = width - 50
            
            # 裁剪卡片区域
            card_region = img[card_y:card_y+card_height_est, card_x_start:card_x_end]
            
            # 保存卡片区域用于后续分析
            card_path = f"/tmp/card_{i}.png"
            cv2.imwrite(card_path, card_region)
            card_positions.append({
                "index": i,
                "y_center": card_y + card_height_est // 2,
                "x_center": (card_x_start + card_x_end) // 2,
                "path": card_path
            })
    
    # 通过OCR或模板匹配识别"我无限升级"
    # 由于adb shell input text不支持中文，使用图像匹配
    
    # 方法：寻找包含"无限升级"字样的文字区域
    # 扫描卡片标题区域（通常在卡片下方）
    
    print(f"\n🔍 扫描卡片标题区域...")
    
    # 简单策略：扫描所有卡片区域的标题文字
    # 由于没有中文OCR，使用以下启发式方法：
    # 1. 寻找长文字区域（游戏标题通常较长）
    # 2. 寻找包含特定颜色特征的区域
    
    for pos in card_positions:
        card_y = pos["y_center"] - 30
        card_height = 60
        
        # 检查标题区域
        if card_y > 0 and card_y + card_height < height:
            title_region = gray[card_y:card_y+card_height, 50:width-50]
            
            # 检测文字密度（白色/亮色像素比例）
            bright_pixels = cv2.countNonZero(cv2.inRange(title_region, 200, 255))
            total_pixels = title_region.size
            bright_ratio = bright_pixels / total_pixels
            
            print(f"   卡片{i}: 标题区域亮度比例={bright_ratio:.2f}")
    
    return card_positions

def find_text_regions(img):
    """寻找可能的文字区域"""
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    # 使用阈值检测文字（游戏标题通常是亮色文字）
    _, thresh = cv2.threshold(gray, 200, 255, cv2.THRESH_BINARY)
    
    # 查找轮廓
    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    text_regions = []
    for cnt in contours:
        x, y, w, h = cv2.boundingRect(cnt)
        # 过滤：文字区域通常宽度>30，高度在15-40之间
        if w > 50 and 10 < h < 50:
            text_regions.append((x, y, w, h))
    
    return text_regions

if __name__ == "__main__":
    screen_path = "D:/workbuddy/Claw/screen_current.png"
    
    if not os.path.exists(screen_path):
        print("📸 重新截图...")
        adb_screencap(screen_path)
    
    print("\n" + "="*50)
    print("🎯 扫描游戏卡片，寻找'我无限升级'")
    print("="*50 + "\n")
    
    cards = scan_game_cards(screen_path)
    
    if cards:
        print(f"\n✅ 检测到 {len(cards)} 个游戏卡片")
        print("\n📍 卡片位置（中心坐标）:")
        for pos in cards:
            print(f"   卡片{pos['index']}: ({pos['x_center']}, {pos['y_center']})")
    else:
        print("\n❌ 未检测到游戏卡片")
