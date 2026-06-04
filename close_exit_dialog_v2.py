#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
处理游戏退出确认弹窗 - v2 改进版
- 使用ADB指定设备序列号
- 纯Python + OpenCV模板匹配
"""
import subprocess
import cv2
import numpy as np
import os
import time

DEVICE_ID = "R5CW91XQEGF"

def adb(cmd):
    """执行ADB命令"""
    return subprocess.run(
        ['adb', '-s', DEVICE_ID, 'shell', cmd],
        capture_output=True,
        text=True,
        timeout=30
    )

def adb_pull(remote, local):
    """ADB拉取文件"""
    return subprocess.run(
        ['adb', '-s', DEVICE_ID, 'pull', remote, local],
        capture_output=True,
        text=True,
        timeout=30
    )

def screenshot():
    """获取屏幕截图"""
    # 设备端截图
    res = adb('screencap -p /sdcard/screen.png')
    if res.returncode != 0:
        print(f"screencap error: {res.stderr}")
        return None
    
    # 拉取到本地
    local_path = r"D:/workbuddy/Claw/screen_current.png"
    res = adb_pull('/sdcard/screen.png', local_path)
    if res.returncode != 0:
        print(f"pull error: {res.stderr}")
        return None
    
    # 读取图像
    img = cv2.imread(local_path)
    if img is None:
        print("cv2.imread failed")
        return None
    
    return img

def click_at(x, y):
    """模拟点击"""
    subprocess.run(
        ['adb', '-s', DEVICE_ID, 'shell', 'input', 'tap', str(x), str(y)],
        timeout=10
    )

def main():
    print("=" * 50)
    print(f"关闭游戏退出弹窗 v2 (设备: {DEVICE_ID})")
    print("=" * 50)
    
    # 获取当前截图
    print("\n--- 获取屏幕截图 ---")
    img = screenshot()
    if img is None:
        print("ERROR: 截图失败")
        return
    print(f"✓ 截图尺寸: {img.shape[1]} x {img.shape[0]}")
    
    # 保存截图用于调试
    cv2.imwrite(r"D:/workbuddy/Claw/screen_for_match.png", img)
    print("✓ 截图已保存: screen_for_match.png")
    
    # === 模板匹配 ===
    print("\n--- OpenCV模板匹配 ---")
    
    # 读取"取消"按钮模板
    template_file = r"D:\workbuddy\Claw\cancel_btn_v4.png"
    if not os.path.exists(template_file):
        print(f"ERROR: 模板文件不存在: {template_file}")
        return
    
    template = cv2.imread(template_file)
    if template is None:
        print(f"ERROR: 无法读取模板: {template_file}")
        return
    
    print(f"模板尺寸: {template.shape[1]} x {template.shape[0]}")
    
    # 执行模板匹配
    result = cv2.matchTemplate(img, template, cv2.TM_CCOEFF_NORMED)
    min_val, max_val, min_loc, max_loc = cv2.minMaxLoc(result)
    
    print(f"匹配结果: 最大置信度 = {max_val:.6f}")
    
    threshold = 0.6
    if max_val < threshold:
        print(f"⚠ 置信度低于阈值，尝试降低阈值...")
        threshold = 0.45
    
    if max_val < threshold:
        print(f"ERROR: 无法匹配到取消按钮 (置信度: {max_val:.4f})")
        return
    
    print(f"✓ 匹配成功! 置信度: {max_val:.6f}")
    print(f"  匹配位置: {max_loc}")
    
    # 计算点击位置（按钮中心）
    btn_w, btn_h = template.shape[1], template.shape[0]
    click_x = max_loc[0] + btn_w // 2
    click_y = max_loc[1] + btn_h // 2
    print(f"  按钮尺寸: {btn_w}x{btn_h}")
    print(f"  计划点击: ({click_x}, {click_y})")
    
    # === 执行点击 ===
    print("\n--- 执行点击操作 ---")
    print(f"第一次点击: ({click_x}, {click_y})")
    click_at(click_x, click_y)
    time.sleep(2)
    
    print(f"第二次点击: ({click_x}, {click_y + btn_h//3})")
    click_at(click_x, click_y + btn_h // 3)
    time.sleep(2)
    
    # === 验证 ===
    print("\n--- 验证弹窗状态 ---")
    verify_img = screenshot()
    if verify_img is None:
        print("ERROR: 验证截图失败")
        return
    
    cv2.imwrite(r"D:/workbuddy/Claw/after_click_verify.png", verify_img)
    print("✓ 验证截图已保存: after_click_verify.png")
    
    # 检查弹窗是否还在
    result2 = cv2.matchTemplate(verify_img, template, cv2.TM_CCOEFF_NORMED)
    _, max_val2, _, _ = cv2.minMaxLoc(result2)
    
    if max_val2 < threshold:
        print(f"\n{'='*50}")
        print(f"✓✓✓ 成功！弹窗已关闭！")
        print(f"验证置信度: {max_val2:.4f} < {threshold}")
        print(f"{'='*50}")
    else:
        print(f"\n⚠ 弹窗可能仍在")
        print(f"验证置信度: {max_val2:.4f} (阈值: {threshold})")
        print("请查看验证截图确认状态")
    
    # 保存调试信息
    debug_img = img.copy()
    cv2.rectangle(debug_img, max_loc, (max_loc[0]+btn_w, max_loc[1]+btn_h), (0, 255, 0), 2)
    cv2.circle(debug_img, (click_x, click_y), 10, (255, 0, 0), -1)
    cv2.imwrite(r"D:/workbuddy/Claw/match_debug.png", debug_img)
    print("✓ 调试图像已保存: match_debug.png")
    
    print("\n" + "=" * 50)
    print("脚本执行完成")
    print("=" * 50)

if __name__ == "__main__":
    main()
