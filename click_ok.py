#!/usr/bin/env python3
"""通过图像识别精确点击确定按钮"""
import subprocess
import re

DEVICE = "R5CW91XQEGF"

def get_screenshot():
    """获取截图"""
    subprocess.run(["adb", "-s", DEVICE, "shell", "screencap", "-p", "/sdcard/screen2.png"], check=True)
    subprocess.run(["adb", "-s", DEVICE, "pull", "/sdcard/screen2.png", "D:/workbuddy/Claw/screen2.png"], check=True)
    subprocess.run(["adb", "-s", DEVICE, "shell", "rm", "/sdcard/screen2.png"], check=True)

def find_dialog_center():
    """查找弹窗中心位置"""
    try:
        from PIL import Image
        import numpy as np
        
        img = Image.open("D:/workbuddy/Claw/screen2.png")
        img_array = np.array(img)
        
        # 截图是横屏，需要旋转90度还原
        img = img.rotate(-90, expand=False)
        img_array = np.array(img)
        
        h, w = img_array.shape[:2]
        
        # 查找中间偏下的蓝色区域（确定按钮）
        # 弹窗按钮通常是亮色/蓝色
        r, g, b = img_array[:,:,0], img_array[:,:,1], img_array[:,:,2]
        
        # 找到亮色区域（可能是弹窗）
        # 弹窗背景通常是较亮的颜色
        bright_mask = (r > 100) & (g > 100) & (b > 120)
        
        if not bright_mask.any():
            print("未检测到亮色区域")
            return w//2, h//2 + 200
        
        # 找到弹窗中心区域
        coords = np.column_stack(np.where(bright_mask))
        y_min, x_min = coords.min(axis=0)
        y_max, x_max = coords.max(axis=0)
        
        dialog_center_x = (x_min + x_max) // 2
        dialog_center_y = (y_max + y_min) // 2 + (y_max - y_min) // 4  # 按钮在弹窗下半部分
        
        print(f"弹窗区域: x[{x_min}:{x_max}], y[{y_min}:{y_max}]")
        print(f"按钮估算位置: ({dialog_center_x}, {dialog_center_y})")
        
        return dialog_center_x, dialog_center_y
        
    except ImportError:
        print("未安装 PIL，使用估算坐标")
        return 540, 1500  # 1080x2340屏幕的估算坐标

def click_at(x, y):
    """点击指定位置"""
    subprocess.run(["adb", "-s", DEVICE, "shell", "input", "tap", str(x), str(y)], check=True)
    print(f"已点击位置: ({x}, {y})")

if __name__ == "__main__":
    get_screenshot()
    x, y = find_dialog_center()
    click_at(x, y)