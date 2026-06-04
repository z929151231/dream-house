#!/usr/bin/env python3
"""
星火对战平台 - 启动"我无限升级"游戏
"""
import subprocess
import cv2
import numpy as np
import time

DEVICE = "R5CW91XQEGF"
PLATFORM_HALL = "D:/workbuddy/Claw/platform_hall.png"
SCREEN_WIDTH = 1080
SCREEN_HEIGHT = 2340

def adb_shell(cmd):
    """执行ADB shell命令"""
    result = subprocess.run(
        ["adb", "-s", DEVICE, "shell"] + cmd,
        capture_output=True, text=True
    )
    return result.stdout.strip()

def adb_input_tap(x, y):
    """模拟点击"""
    subprocess.run(
        ["adb", "-s", DEVICE, "shell", "input", "tap", str(x), str(y)],
        check=True
    )
    print(f"[点击] ({x}, {y})")

def find_game_card(hall_img_path, template_img_path, threshold=0.8):
    """在平台大厅中定位游戏卡片"""
    hall_img = cv2.imread(hall_img_path)
    template_img = cv2.imread(template_img_path)
    
    if template_img is None:
        print(f"[错误] 模板图片不存在: {template_img_path}")
        return None
    
    h, w = template_img.shape[:2]
    
    # 在平台大厅上搜索
    result = cv2.matchTemplate(hall_img, template_img, cv2.TM_CCOEFF_NORMED)
    min_val, max_val, min_loc, max_loc = cv2.minMaxLoc(result)
    
    if max_val >= threshold:
        # 计算中心点
        cx = max_loc[0] + w // 2
        cy = max_loc[1] + h // 2
        return (cx, cy, max_val)
    
    return None

def main():
    print("=" * 50)
    print("星火对战平台 - 启动游戏")
    print("=" * 50)
    
    # 方案1: 使用已保存的模板
    template_path = "D:/workbuddy/Claw/target_game.png"
    
    result = find_game_card(PLATFORM_HALL, template_path)
    
    if result:
        cx, cy, confidence = result
        print(f"[成功] 找到游戏卡片，置信度: {confidence:.2f}")
        
        # 转换到设备坐标 (屏幕宽度1080)
        scale_x = SCREEN_WIDTH / SCREEN_WIDTH  # 截图就是1080宽度
        scale_y = SCREEN_HEIGHT / SCREEN_HEIGHT
        
        device_x = int(cx * scale_x)
        device_y = int(cy * scale_y)
        
        print(f"[坐标转换] 截图坐标({cx}, {cy}) -> 设备坐标({device_x}, {device_y})")
        
        # 点击游戏卡片
        adb_input_tap(device_x, device_y)
        print("[等待] 3秒后截图确认...")
        time.sleep(3)
        
        # 截图游戏详情页
        subprocess.run(
            ["adb", "-s", DEVICE, "shell", "screencap", "-p", "/sdcard/game_detail.png"],
            check=True
        )
        subprocess.run(
            ["adb", "-s", DEVICE, "pull", "/sdcard/game_detail.png", "D:/workbuddy/Claw/game_detail_page.png"],
            check=True
        )
        print("[完成] 游戏详情页已保存")
        return True
    
    print("[方案1失败] 模板匹配未找到")
    
    # 方案2: 手动估算坐标
    # "我无限升级"是第三张卡片，在平台大厅截图中
    # 卡片从左到右排列，每张卡片约占屏幕宽度的1/5
    
    card_index = 2  # 第三张 (0-indexed)
    card_width = SCREEN_WIDTH // 5
    card_x = card_index * card_width + card_width // 2  # 卡片中心
    
    # Y坐标估算: 卡片区域在屏幕中部偏上
    card_y = int(SCREEN_HEIGHT * 0.45)  # 约45%高度
    
    print(f"[方案2] 估算坐标: ({card_x}, {card_y})")
    adb_input_tap(card_x, card_y)
    print("[等待] 3秒后截图确认...")
    time.sleep(3)
    
    # 截图
    subprocess.run(
        ["adb", "-s", DEVICE, "shell", "screencap", "-p", "/sdcard/game_detail.png"],
        check=True
    )
    subprocess.run(
        ["adb", "-s", DEVICE, "pull", "/sdcard/game_detail.png", "D:/workbuddy/Claw/game_detail_page.png"],
        check=True
    )
    print("[完成] 游戏详情页已保存")
    return True

if __name__ == "__main__":
    main()
