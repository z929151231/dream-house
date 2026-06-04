#!/usr/bin/env python3
"""
精确匹配并点击"我无限升级"游戏卡片
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
    result = subprocess.run(
        ["adb", "-s", DEVICE, "shell"] + cmd,
        capture_output=True, text=True
    )
    return result.stdout.strip()

def adb_input_tap(x, y):
    subprocess.run(
        ["adb", "-s", DEVICE, "shell", "input", "tap", str(x), str(y)],
        check=True
    )
    print(f"[点击] ({x}, {y})")

def find_game_card(hall_img_path, template_img_path, threshold=0.7):
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
    
    print(f"[匹配结果] 最大置信度: {max_val:.3f}")
    
    if max_val >= threshold:
        # 计算中心点
        cx = max_loc[0] + w // 2
        cy = max_loc[1] + h // 2
        print(f"[匹配位置] 截图坐标: ({cx}, {cy})")
        return (cx, cy)
    
    return None

def main():
    print("=" * 50)
    print("精确匹配并点击游戏卡片")
    print("=" * 50)
    
    # 使用已保存的模板
    template_path = "D:/workbuddy/Claw/target_game.png"
    
    result = find_game_card(PLATFORM_HALL, template_path)
    
    if result:
        cx, cy = result
        
        # 截图就是1080宽度，直接映射
        device_x = cx
        device_y = cy
        
        print(f"[点击目标] 设备坐标: ({device_x}, {device_y})")
        adb_input_tap(device_x, device_y)
        print("[等待] 游戏启动...")
        time.sleep(5)
        
        # 截图确认
        subprocess.run(
            ["adb", "-s", DEVICE, "shell", "screencap", "-p", "/sdcard/result.png"],
            check=True
        )
        subprocess.run(
            ["adb", "-s", DEVICE, "pull", "/sdcard/result.png", "D:/workbuddy/Claw/result_after_click.png"],
            check=True
        )
        print("[完成] 结果已保存")
        return True
    
    print("[失败] 未找到匹配的游戏卡片")
    return False

if __name__ == "__main__":
    main()
