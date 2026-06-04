#!/usr/bin/env python3
"""
图像识别定位"我无限升级"游戏
通过模板匹配和颜色分析来精确定位目标游戏卡片
"""

import subprocess
import cv2
import numpy as np
import os

DEVICE = "R5CW91XQEGF"
WORK_DIR = "D:/workbuddy/Claw"

def adb(cmd):
    """执行ADB命令"""
    result = subprocess.run(
        f"adb -s {DEVICE} {cmd}",
        shell=True,
        capture_output=True,
        text=True
    )
    return result.stdout.strip(), result.stderr.strip()

def screenshot():
    """截图并保存到本地"""
    # 清除可能的旧文件
    local_path = os.path.join(WORK_DIR, "current_screen.png")
    
    # 截图到设备
    adb("shell screencap /sdcard/current.png")
    
    # 拉取到本地
    pull_cmd = f"adb -s {DEVICE} pull /sdcard/current.png \"{local_path}\""
    subprocess.run(pull_cmd, shell=True, capture_output=True)
    
    return local_path

def detect_cancel_button(img):
    """检测"取消"按钮"""
    # 尝试模板匹配
    template_dir = os.path.join(WORK_DIR, "cancel_btn_template.png")
    if os.path.exists(template_dir):
        template = cv2.imread(template_dir, cv2.IMREAD_COLOR)
        if template is not None:
            result = cv2.matchTemplate(img, template, cv2.TM_CCOEFF_NORMED)
            min_val, max_val, min_loc, max_loc = cv2.minMaxLoc(result)
            
            if max_val > 0.7:
                print(f"找到取消按钮！置信度: {max_val:.4f}, 位置: {max_loc}")
                return max_loc, max_val
    
    return None, 0

def detect_confirm_button(img):
    """检测"退出"按钮（红色）"""
    # 红色按钮检测 - 在HSV空间
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    
    # 红色范围
    lower_red1 = np.array([0, 100, 100])
    upper_red1 = np.array([15, 255, 255])
    lower_red2 = np.array([160, 100, 100])
    upper_red2 = np.array([180, 255, 255])
    
    mask1 = cv2.inRange(hsv, lower_red1, upper_red1)
    mask2 = cv2.inRange(hsv, lower_red2, upper_red2)
    mask = cv2.bitwise_or(mask1, mask2)
    
    # 查找红色区域
    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    if contours:
        # 找最大的红色区域
        largest = max(contours, key=cv2.contourArea)
        x, y, w, h = cv2.boundingRect(largest)
        area = cv2.contourArea(largest)
        
        if area > 1000:  # 过滤小区域
            print(f"找到红色退出按钮，位置: ({x}, {y}), 大小: {w}x{h}")
            return (x, y, w, h), area
    
    return None, 0

def detect_game_card_by_color(img, target_name="我无限升级"):
    """通过颜色特征检测游戏卡片"""
    # 游戏卡片通常有亮色的标题栏
    # 扫描屏幕上半部分寻找可能的卡片区域
    
    height, width = img.shape[:2]
    
    # 假设卡片在屏幕中上部区域
    card_region = img[50:500, :]  # Y:50-500
    
    # 检测可能的文本区域（白色/亮色）
    hsv = cv2.cvtColor(card_region, cv2.COLOR_BGR2HSV)
    
    # 高饱和度区域可能是游戏标题
    lower_saturate = np.array([0, 50, 200])
    upper_saturate = np.array([180, 255, 255])
    mask = cv2.inRange(hsv, lower_saturate, upper_saturate)
    
    # 查找连通区域
    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    # 按面积排序，找最大的几个区域
    areas = [(cv2.contourArea(c), cv2.boundingRect(c)) for c in contours]
    areas.sort(reverse=True, key=lambda x: x[0])
    
    print(f"发现 {len(areas)} 个高亮区域")
    
    # 显示检测结果
    debug_img = card_region.copy()
    for i, (area, (x, y, w, h)) in enumerate(areas[:5]):
        if area > 500:
            cv2.rectangle(debug_img, (x, y), (x + w, y + h), (0, 255, 0), 2)
            cv2.putText(debug_img, f"#{i}", (x, y - 5), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
    
    return debug_img, areas

def click_location(x, y):
    """点击指定位置"""
    adb(f"shell input tap {x} {y}")
    print(f"点击 ({x}, {y})")

def analyze_screen():
    """完整屏幕分析流程"""
    print("=" * 60)
    print("开始图像识别分析")
    print("=" * 60)
    
    # 截图
    img_path = screenshot()
    img = cv2.imread(img_path)
    
    if img is None:
        print("❌ 截图失败")
        return False
    
    height, width = img.shape[:2]
    print(f"截图尺寸: {width}x{height}")
    
    # 步骤1: 检查是否有退出确认弹窗
    print("\n📍 步骤1: 检测弹窗状态")
    
    cancel_loc, cancel_conf = detect_cancel_button(img)
    confirm_box, confirm_area = detect_confirm_button(img)
    
    if cancel_loc:
        print(f"发现退出确认弹窗！")
        print(f"  - 取消按钮位置: {cancel_loc} (置信度: {cancel_conf:.4f})")
        
        # 计算取消按钮中心
        template = cv2.imread(os.path.join(WORK_DIR, "cancel_btn_template.png"))
        if template is not None:
            tw, th = template.shape[1], template.shape[0]
            cancel_x = cancel_loc[0] + tw // 2
            cancel_y = cancel_loc[1] + th // 2
            
            print(f"  - 点击取消按钮中心: ({cancel_x}, {cancel_y})")
            click_location(cancel_x, cancel_y)
            
            print("  - 等待3秒...")
            import time
            time.sleep(3)
            
            # 重新截图确认
            img_path = screenshot()
            img = cv2.imread(img_path)
            print("  - 弹窗已关闭，继续检测游戏列表")
    
    # 步骤2: 扫描游戏列表
    print("\n📍 步骤2: 扫描游戏列表寻找'我无限升级'")
    
    # 检测游戏卡片区域
    debug_img, game_regions = detect_game_card_by_color(img)
    
    # 保存调试图
    debug_path = os.path.join(WORK_DIR, "game_detection.png")
    cv2.imwrite(debug_path, debug_img)
    print(f"调试图已保存: {debug_path}")
    
    # 分析最可能的游戏卡片
    print("\n📊 游戏卡片区域分析:")
    
    # 过滤掉太小的区域
    valid_regions = [(area, box) for area, box in game_regions if area > 1000]
    
    if valid_regions:
        for i, (area, (x, y, w, h)) in enumerate(valid_regions[:3]):
            print(f"  区域{i}: 位置({x}, {y}), 大小{w}x{h}, 面积{area:.0f}")
            
            # 计算卡片中心（全局坐标）
            center_x = x + w // 2
            center_y = y + 50 + h // 2  # +50 因为card_region从Y=50开始
            
            print(f"    → 卡片中心: ({center_x}, {center_y})")
    
    # 步骤3: 尝试点击最可能的游戏
    print("\n🎯 步骤3: 点击目标游戏")
    
    # 根据之前的经验，"我无限升级"应该是第二张卡片
    # 假设卡片1是"我的枪无限子弹"，卡片2是"我无限升级"
    
    if len(valid_regions) >= 2:
        # 选择第二大的区域（通常是第二张卡片）
        second_region = valid_regions[1]
        area, (x, y, w, h) = second_region
        
        center_x = x + w // 2
        center_y = y + 50 + h // 2
        
        print(f"选择第二张卡片作为目标:")
        print(f"  - 位置: ({x}, {y}), 大小: {w}x{h}")
        print(f"  - 中心: ({center_x}, {center_y})")
        
        # 截图该区域用于确认
        card_roi = img[y+50:y+50+h, x:x+w]
        card_path = os.path.join(WORK_DIR, "target_card.png")
        cv2.imwrite(card_path, card_roi)
        print(f"  - 卡片截图已保存: {card_path}")
        
        # 点击
        click_location(center_x, center_y)
        
        return True
    else:
        print("❌ 未检测到足够的游戏卡片区域")
        return False

if __name__ == "__main__":
    success = analyze_screen()
    
    if success:
        print("\n✅ 分析完成，等待游戏响应...")
        import time
        time.sleep(5)
        
        # 最终截图确认
        final_path = screenshot()
        print(f"最终截图: {final_path}")
    else:
        print("\n❌ 分析失败，请检查设备状态")
