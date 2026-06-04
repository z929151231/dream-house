#!/usr/bin/env python3
"""处理游戏退出确认弹窗"""
import subprocess

DEVICE = "R5CW91XQEGF"

def click_at(x, y):
    """点击指定位置"""
    subprocess.run(["adb", "-s", DEVICE, "shell", "input", "tap", str(x), str(y)], check=True)
    print(f"已点击: ({x}, {y})")

def back():
    """返回键"""
    subprocess.run(["adb", "-s", DEVICE, "shell", "input", "keyevent", "4"], check=True)
    print("已执行返回")

if __name__ == "__main__":
    # 从截图 screen_after.png 分析：
    # 游戏正在运行，但有退出确认弹窗
    # 弹窗居中，两个按钮在底部
    # 估算弹窗位置（基于 2340x1080 屏幕）
    
    SCREEN_W = 2340
    SCREEN_H = 1080
    
    # 弹窗大致位置：
    # - 左按钮"取消"/"否": 点击左侧按钮
    # - 右按钮"确定"/"是": 点击右侧按钮
    
    # 根据截图估算按钮位置
    # 弹窗宽度约 47% 屏幕，居中显示
    popup_left = int(SCREEN_W * 0.265)  # ~620
    popup_right = int(SCREEN_W * 0.735)  # ~1720
    button_y = int(SCREEN_H * 0.79)       # ~850
    btn_half = int(SCREEN_W * 0.235)      # ~550
    
    cancel_x = popup_left + btn_half // 2  # 取消按钮中心
    confirm_x = popup_right - btn_half // 2  # 确认按钮中心
    
    print(f"弹窗区域: X[{popup_left}-{popup_right}], Y按钮={button_y}")
    print(f"取消按钮位置: ({cancel_x}, {button_y})")
    print(f"确认按钮位置: ({confirm_x}, {button_y})")
    
    # 点击"取消"按钮 (左侧按钮) 来关闭弹窗，继续游戏
    print("\n点击'取消'按钮关闭退出确认...")
    click_at(cancel_x, button_y)
    
    # 等待一下让弹窗关闭
    import time
    time.sleep(1)
    
    # 验证游戏是否继续运行
    print("\n请观察游戏是否继续运行，如仍有问题可再次运行此脚本")
