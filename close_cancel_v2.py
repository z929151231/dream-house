#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
关闭退出确认弹窗 - 改进版：先定位红色"退出"按钮推算位置
"""
import subprocess
import cv2
import numpy as np
import os
import time

def adb_shell(cmd):
    result = subprocess.run(['adb', 'shell'] + cmd.split(), capture_output=True, text=True)
    return result.stdout.strip()

def adb_exec_out(cmd):
    result = subprocess.run(['adb', 'exec-out', cmd], capture_output=True)
    return result.stdout if result.returncode == 0 else None

def screenshot():
    """使用 shell screencap + pull 方式获取截图（更稳定）"""
    tmp_file = '/sdcard/_screen_tmp.png'
    local_file = '/tmp/_adb_screen.png'
    
    # 截图到设备
    result = subprocess.run(['adb', '-s', 'R5CW91XQEGF', 'shell', 'screencap', tmp_file], 
                          capture_output=True, timeout=15)
    if result.returncode != 0:
        print(f"shell screencap 失败: {result.stderr}")
        return None
    
    # 拉取到本地
    result = subprocess.run(['adb', '-s', 'R5CW91XQEGF', 'pull', tmp_file, local_file], 
                          capture_output=True, timeout=15)
    if result.returncode != 0:
        print(f"pull 失败: {result.stderr}")
        return None
    
    # 读取图像
    img = cv2.imread(local_file)
    if img is None:
        print("cv2.imread 失败")
        return None
    
    # 清理临时文件
    subprocess.run(['adb', '-s', 'R5CW91XQEGF', 'shell', 'rm', tmp_file], timeout=5)
    
    return img

def click_at(x, y):
    subprocess.run(['adb', 'shell', 'input', 'tap', str(x), str(y)], timeout=5)

def main():
    print("=" * 50)
    print("关闭退出确认弹窗")
    print("=" * 50)
    
    # 检查设备 - 直接指定序列号验证
    result = subprocess.run(['adb', '-s', 'R5CW91XQEGF', 'shell', 'getprop', 'ro.product.model'], 
                          capture_output=True, text=True)
    if result.returncode != 0 or not result.stdout.strip():
        print("ERROR: 设备 R5CW91XQEGF 未连接")
        return
    print(f"✓ 设备已确认: {result.stdout.strip()}")
    print("✓ 设备 R5CW91XQEGF 已连接")
    
    # 获取截图
    img = screenshot()
    if img is None:
        print("ERROR: 截图失败")
        return
    print(f"截图尺寸: {img.shape[1]} x {img.shape[0]}")
    
    # 保存当前截图用于调试
    cv2.imwrite('D:/workbuddy/Claw/debug_capture.png', img)
    print("✓ 调试截图已保存")
    
    # === 方案1: 颜色扫描定位红色"退出"按钮 ===
    print("\n--- 方案1: 颜色扫描定位红色按钮 ---")
    
    # 红色范围 (BGR格式)
    # 红色在BGR中大致是 (0, 50, 200) 到 (0, 100, 255)
    lower_red = np.array([0, 40, 180])
    upper_red = np.array([10, 100, 255])
    
    mask1 = cv2.inRange(img, lower_red, upper_red)
    # 红色还有另一段 (160-180)
    lower_red2 = np.array([160, 40, 180])
    upper_red2 = np.array([180, 100, 255])
    mask2 = cv2.inRange(img, lower_red2, upper_red2)
    
    mask = cv2.bitwise_or(mask1, mask2)
    
    # 形态学操作连接区域
    kernel = np.ones((5,5), np.uint8)
    mask = cv2.dilate(mask, kernel, iterations=2)
    mask = cv2.erode(mask, kernel, iterations=1)
    
    # 找最大连通区域
    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    exit_btn_center = None
    for cnt in contours:
        area = cv2.contourArea(cnt)
        if area > 1000:  # 过滤小区域
            x, y, w, h = cv2.boundingRect(cnt)
            center_x = x + w // 2
            center_y = y + h // 2
            # 红色按钮通常在右侧，排除太小的区域
            if w > 50 and h > 30:
                print(f"找到红色区域: 位置({x},{y}) 尺寸{w}x{h} 面积{area}")
                if exit_btn_center is None or area > cv2.contourArea(contours[0]):
                    exit_btn_center = (center_x, center_y, x, y, w, h)
    
    if exit_btn_center:
        ex_x, ex_y, ex_bbox_x, ex_bbox_y, ex_w, ex_h = exit_btn_center
        print(f"✓ 退出按钮位置: ({ex_x}, {ex_y})")
        
        # "取消"按钮在"退出"按钮左侧，估算位置
        # 两个按钮通常对称排列
        cancel_x = ex_x - ex_w - (ex_w // 2)  # 左侧间隔半个按钮宽度
        cancel_y = ex_y  # Y坐标相近
        
        print(f"估算取消按钮位置: ({cancel_x}, {cancel_y})")
        
        # 点击"取消"按钮（偏左一点确保点到）
        click_x = cancel_x - 20
        click_y = cancel_y
        
        print(f"\n--- 点击'取消'按钮 ({click_x}, {click_y}) ---")
        click_at(click_x, click_y)
        
        # 等待响应
        time.sleep(1.5)
        
        # 再次点击确认（确保点击生效）
        click_at(click_x, click_y + 5)
        time.sleep(1)
        
        # 验证
        print("\n--- 验证结果 ---")
        verify_img = screenshot()
        cv2.imwrite('D:/workbuddy/Claw/verify_after_cancel.png', verify_img)
        
        # 检查红色按钮是否还在
        mask_verify = cv2.inRange(verify_img, lower_red, upper_red)
        mask_verify2 = cv2.inRange(verify_img, lower_red2, upper_red2)
        mask_verify = cv2.bitwise_or(mask_verify, mask_verify2)
        
        red_pixels = cv2.countNonZero(mask_verify)
        print(f"红色像素数: {red_pixels}")
        
        if red_pixels < 500:
            print("✓✓✓ 弹窗已关闭！")
        else:
            print(f"⚠ 红色区域仍有 {red_pixels} 像素，弹窗可能还在")
    else:
        print("⚠ 未找到红色按钮，尝试方案2...")
        
        # === 方案2: 基于弹窗整体位置估算 ===
        print("\n--- 方案2: 基于截图尺寸估算 ---")
        
        # 屏幕尺寸
        screen_w, screen_h = img.shape[1], img.shape[0]
        
        # 弹窗通常在屏幕中央
        # "取消"按钮估算位置（基于经验）
        # 假设弹窗居中，按钮在下方
        cancel_x = screen_w // 2 - 100
        cancel_y = screen_h // 2 + 50
        
        print(f"估算取消按钮位置: ({cancel_x}, {cancel_y})")
        print(f"点击 ({cancel_x}, {cancel_y})")
        
        click_at(cancel_x, cancel_y)
        time.sleep(1.5)
        
        click_at(cancel_x - 20, cancel_y + 5)  # 二次点击
        time.sleep(1)
        
        # 验证
        verify_img = screenshot()
        cv2.imwrite('D:/workbuddy/Claw/verify_after_cancel_v2.png', verify_img)
        
        mask_verify = cv2.inRange(verify_img, lower_red, upper_red)
        mask_verify2 = cv2.inRange(verify_img, lower_red2, upper_red2)
        mask_verify = cv2.bitwise_or(mask_verify, mask_verify2)
        red_pixels = cv2.countNonZero(mask_verify)
        
        if red_pixels < 500:
            print("✓✓✓ 弹窗已关闭！")
        else:
            print(f"⚠ 红色区域仍有 {red_pixels} 像素")
    
    print("\n" + "=" * 50)
    print("完成")

if __name__ == "__main__":
    main()
