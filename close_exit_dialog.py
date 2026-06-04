#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
处理游戏退出确认弹窗 - 纯Python + ADB方案
不依赖airtest，使用标准库和opencv
"""
import subprocess
import cv2
import numpy as np
import os
import time
import re

def adb_cmd(cmd):
    """执行ADB命令"""
    result = subprocess.run(
        ['adb', 'shell', cmd],
        capture_output=True,
        text=True,
        timeout=30
    )
    return result.stdout.strip(), result.returncode

def adb_exec_out(cmd):
    """执行ADB命令并获取二进制输出"""
    result = subprocess.run(
        ['adb', 'exec-out', cmd],
        capture_output=True,
        timeout=30
    )
    return result.stdout if result.returncode == 0 else None

def screenshot():
    """获取屏幕截图"""
    img_data = adb_exec_out('screencap -p')
    if img_data is None:
        return None
    # 将二进制数据转换为numpy数组
    nparr = np.frombuffer(img_data, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    return img

def click_at(x, y):
    """模拟点击"""
    # 使用input tap命令
    subprocess.run(['adb', 'shell', 'input', 'tap', str(x), str(y)], timeout=10)

def main():
    print("=" * 50)
    print("关闭游戏退出弹窗 - 纯Python+ADB方案")
    print("=" * 50)
    
    # 检查ADB连接
    result = subprocess.run(['adb', 'devices'], capture_output=True, text=True)
    if 'R5CW91XQEGF' not in result.stdout:
        print("ERROR: 设备未连接")
        return
    print("✓ 设备连接正常")
    
    # 获取当前截图
    print("\n--- 获取屏幕截图 ---")
    img = screenshot()
    if img is None:
        print("ERROR: 截图失败")
        return
    print(f"截图尺寸: {img.shape[1]} x {img.shape[0]}")
    
    # 保存截图
    screenshot_file = r"D:\workbuddy\Claw\current_screen.png"
    cv2.imwrite(screenshot_file, img)
    print(f"✓ 截图已保存: {screenshot_file}")
    
    # === 使用OpenCV模板匹配找到"取消"按钮 ===
    print("\n--- OpenCV模板匹配 ---")
    
    # 读取之前裁剪的取消按钮模板
    template_dir = r"D:\workbuddy\Claw"
    template_file = os.path.join(template_dir, "cancel_btn_v4.png")
    
    if not os.path.exists(template_file):
        print(f"ERROR: 模板文件不存在: {template_file}")
        print("请手动裁剪'取消'按钮区域并保存为cancel_btn_template.png")
        return
    
    template = cv2.imread(template_file)
    if template is None:
        print(f"ERROR: 无法读取模板文件: {template_file}")
        return
    
    print(f"模板尺寸: {template.shape[1]} x {template.shape[0]}")
    
    # 执行模板匹配
    result = cv2.matchTemplate(img, template, cv2.TM_CCOEFF_NORMED)
    min_val, max_val, min_loc, max_loc = cv2.minMaxLoc(result)
    
    threshold = 0.6
    if max_val < threshold:
        print(f"⚠ 匹配度太低: {max_val:.4f} < {threshold}")
        print("尝试降低阈值...")
        threshold = 0.4
    
    if max_val < threshold:
        print(f"ERROR: 无法匹配到取消按钮 (置信度: {max_val:.4f})")
        return
    
    print(f"✓ 匹配成功!")
    print(f"  置信度: {max_val:.6f}")
    print(f"  位置: {max_loc}")
    
    # 计算按钮中心
    btn_w, btn_h = template.shape[1], template.shape[0]
    click_x = max_loc[0] + btn_w // 2
    click_y = max_loc[1] + btn_h // 2
    
    print(f"  点击位置: ({click_x}, {click_y})")
    
    # === 点击操作 ===
    print("\n--- 执行点击 ---")
    click_at(click_x, click_y)
    print(f"✓ 已点击 ({click_x}, {click_y})")
    
    # 等待响应
    time.sleep(2)
    
    # 再次点击（更靠下的位置，确保点击到可点击区域）
    time.sleep(1)
    click_at(click_x, click_y + btn_h // 4)
    print(f"✓ 第二次点击 ({click_x}, {click_y + btn_h // 4})")
    
    # === 验证 ===
    print("\n--- 验证结果 ---")
    time.sleep(1.5)
    
    # 获取验证截图
    verify_img = screenshot()
    if verify_img is None:
        print("ERROR: 验证截图失败")
        return
    
    verify_file = r"D:\workbuddy\Claw\after_close_click.png"
    cv2.imwrite(verify_file, verify_img)
    print(f"✓ 验证截图已保存: {verify_file}")
    
    # 检查弹窗是否还在
    result_check = cv2.matchTemplate(verify_img, template, cv2.TM_CCOEFF_NORMED)
    _, max_val_check, _, _ = cv2.minMaxLoc(result_check)
    
    if max_val_check < threshold:
        print(f"\n✓✓✓ 成功！弹窗已关闭！(置信度: {max_val_check:.4f})")
    else:
        print(f"\n⚠ 弹窗仍在 (置信度: {max_val_check:.4f})")
        print("可能需要进一步调试")
    
    print("\n" + "=" * 50)
    print("脚本执行完成")
    print("=" * 50)

if __name__ == "__main__":
    main()
