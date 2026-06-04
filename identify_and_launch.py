#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
识别游戏图片并启动"我无限升级"
使用 OpenCV 模板匹配和颜色分析
"""

import cv2
import numpy as np
import subprocess
import time

DEVICE = "R5CW91XQEGF"

def adb(cmd):
    """执行adb命令"""
    result = subprocess.run(
        f"adb -s {DEVICE} {cmd}",
        shell=True, capture_output=True, text=True
    )
    return result.stdout.strip()

def screenshot():
    """截图并返回numpy数组"""
    # 使用 shell screencap + pull 方式（Android 16兼容）
    adb("shell screencap /sdcard/current.png")
    subprocess.run(f"adb -s {DEVICE} pull /sdcard/current.png D:/workbuddy/Claw/current_debug.png", shell=True)
    img = cv2.imread("D:/workbuddy/Claw/current_debug.png")
    return img

def find_game_by_text(img, target_text="我无限升级"):
    """
    通过OCR或颜色/形状特征识别游戏卡片
    由于adb shell input text不支持中文，这里用图像特征匹配
    """
    # 分析游戏卡片区域 - 在列表中寻找"我无限升级"的特征
    # "我无限升级"游戏卡片应该有特定颜色或形状特征
    
    # 先检测所有卡片中的文字区域
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    # 使用阈值分割找文字区域
    _, thresh = cv2.threshold(gray, 150, 255, cv2.THRESH_BINARY)
    
    # 找连通的白色文字区域
    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    print(f"检测到 {len(contours)} 个文字区域")
    
    # 返回检测到的卡片位置
    card_positions = []
    for cnt in contours:
        x, y, w, h = cv2.boundingRect(cnt)
        if w > 50 and h > 20:  # 过滤小区域
            card_positions.append((x, y, w, h))
    
    return card_positions

def analyze_current_page(img):
    """分析当前页面是什么"""
    height, width = img.shape[:2]
    print(f"截图尺寸: {width}x{height}")
    
    # 检查左上角是否有返回箭头
    top_left = img[0:100, 0:100]
    # 检查右下角是否有"启动游戏"按钮
    bottom_right = img[height-150:height, width-300:width]
    
    # 检测蓝色/紫色按钮（启动游戏通常是紫色）
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    
    # 紫色范围
    lower_purple = np.array([120, 50, 50])
    upper_purple = np.array([160, 255, 255])
    mask_purple = cv2.inRange(hsv, lower_purple, upper_purple)
    
    # 检测是否有启动游戏按钮
    purple_regions = cv2.findNonZero(mask_purple)
    if purple_regions is not None:
        x, y, w, h = cv2.boundingRect(purple_regions)
        print(f"检测到紫色区域（可能是启动按钮）: ({x}, {y}), 尺寸 {w}x{h}")
    
    # 分析标题区域（顶部）
    title_area = img[0:80, 50:width//2]
    # 简化：检查标题颜色分布
    title_mean = cv2.mean(title_area)[:3]
    print(f"标题区域平均颜色: {title_mean}")
    
    return {
        "has_launch_button": purple_regions is not None,
        "title_color": title_mean
    }

def main():
    print("="*50)
    print("开始识别游戏并启动")
    print("="*50)
    
    # 1. 截图分析当前状态
    img = screenshot()
    if img is None:
        print("❌ 截图失败")
        return
    
    info = analyze_current_page(img)
    
    # 2. 如果当前是详情页，需要返回
    if info["has_launch_button"]:
        print("当前是游戏详情页，需要关闭返回平台首页")
        
        # 方案1：尝试点击左上角返回箭头
        # 由于返回会触发弹窗，我们尝试关闭按钮
        # 先找当前页面的关闭/X按钮
        
        # 右上角可能有X或关闭按钮
        # 估算位置：右上角约 (width-50, 20)
        
        # 先截图保存用于分析
        cv2.imwrite("D:/workbuddy/Claw/page_analysis.png", img)
        print("已保存分析图片: page_analysis.png")
        
        # 计算点击坐标关闭当前页
        # 根据之前的经验，返回箭头的估算位置
        # 但由于会触发弹窗，我们需要关闭弹窗
        
        # 尝试点击左上角返回（约50, 50）
        click_x, click_y = 50, 50
        print(f"尝试点击返回: ({click_x}, {click_y})")
        
        adb(f"shell input tap {click_x} {click_y}")
        time.sleep(1)
        
        # 等待弹窗出现
        time.sleep(1)
        
        # 截图检查是否有弹窗
        img2 = screenshot()
        
        # 检查"确认退出游戏"弹窗（白色背景，两个按钮）
        if img2 is not None:
            # 检测弹窗区域 - 通常是居中白色矩形
            gray = cv2.cvtColor(img2, cv2.COLOR_BGR2GRAY)
            
            # 找白色大区域（弹窗背景）
            _, thresh = cv2.threshold(gray, 220, 255, cv2.THRESH_BINARY)
            contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            
            for cnt in contours:
                x, y, w, h = cv2.boundingRect(cnt)
                # 弹窗特征：中等大小、居中位置
                if 300 < w < 800 and 200 < h < 500 and w > h:
                    print(f"检测到弹窗: ({x}, {y}), 尺寸 {w}x{h}")
                    
                    # 找到"取消"按钮 - 通常在左侧
                    # 估算：弹窗左半部分
                    cancel_x = x + w // 4
                    cancel_y = y + h * 3 // 4
                    print(f"估算取消按钮位置: ({cancel_x}, {cancel_y})")
                    
                    # 点击取消
                    adb(f"shell input tap {cancel_x} {cancel_y}")
                    print(f"点击取消: ({cancel_x}, {cancel_y})")
                    break
    
    print("\n现在需要重新截图确认状态")
    img_final = screenshot()
    cv2.imwrite("D:/workbuddy/Claw/current_state_final.png", img_final)
    print("状态已保存到: current_state_final.png")

if __name__ == "__main__":
    main()
