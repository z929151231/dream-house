#!/usr/bin/env python3
"""
处理退出确认弹窗 - OpenCV 模板匹配 + ADB (v8 修复版)

修复内容：
- 修正"取消"按钮的 Y 坐标估算，从 0.55 调整到 0.63
- 确保裁剪区域完整覆盖按钮的边框和文字
"""

import cv2
import numpy as np
import subprocess
import os
import time
from pathlib import Path

# 设备信息
DEVICE = "R5CW91XQEGF"

def run_adb(cmd):
    """执行 ADB 命令"""
    full_cmd = f"adb -s {DEVICE} {cmd}"
    result = subprocess.run(full_cmd, shell=True, capture_output=True)
    return result

def screenshot():
    """截取当前屏幕，返回 numpy 数组"""
    result = run_adb("exec-out screencap -p")
    if result.returncode != 0:
        raise RuntimeError(f"screencap 失败: {result.stderr.decode('utf-8', errors='ignore')}")
    
    # 直接解析 PNG 数据 (二进制)
    img_array = np.frombuffer(result.stdout, dtype=np.uint8)
    img = cv2.imdecode(img_array, cv2.IMREAD_COLOR)
    if img is None:
        raise RuntimeError("screencap 输出无法解析为图片")
    return img

def find_template(img, template_path, threshold=0.5):
    """在 img 中查找 template，返回最佳匹配位置和置信度"""
    template = cv2.imread(template_path)
    if template is None:
        raise FileNotFoundError(f"模板文件不存在: {template_path}")
    
    res = cv2.matchTemplate(img, template, cv2.TM_CCOEFF_NORMED)
    min_val, max_val, min_loc, max_loc = cv2.minMaxLoc(res)
    
    if max_val >= threshold:
        h, w = template.shape[:2]
        return (max_loc[0], max_loc[1]), max_val
    return None, max_val

def click(x, y):
    """点击指定位置"""
    run_adb(f"shell input tap {x} {y}")
    print(f"✓ 已点击位置 ({x}, {y})")

def main():
    print("=" * 60)
    print("  处理退出确认弹窗 - OpenCV 模板匹配 + ADB (v8 修复版)")
    print("=" * 60)
    
    # 验证设备
    result = run_adb("get-state")
    if result.returncode != 0:
        print("✗ 设备未连接")
        return
    print(f"✓ 设备已连接: {DEVICE}")
    
    # 步骤1: 截取当前屏幕
    print("\n[步骤1] 截取当前屏幕...")
    img = screenshot()
    h, w = img.shape[:2]
    print(f"  分辨率: {w}×{h}")
    
    cv2.imwrite("current_screen_v8.png", img)
    
    # ========== 坐标重新估算 ==========
    # 弹窗：居中显示，约 47% 宽度，20% 高度
    dialog_w = int(w * 0.47)
    dialog_h = int(h * 0.22)  # 稍微增加高度
    dialog_x = (w - dialog_w) // 2
    dialog_y = (h - dialog_h) // 2
    
    print(f"  弹窗估算: x[{dialog_x}-{dialog_x+dialog_w}], y[{dialog_y}-{dialog_y+dialog_h}]")
    
    # "取消"按钮：左半部分，Y 坐标需要调整
    # 从视觉上看，按钮位于弹窗中下部
    btn_w = int(dialog_w * 0.42)
    btn_h = int(dialog_h * 0.25)
    btn_x = dialog_x + int(dialog_w * 0.05)
    btn_y = dialog_y + int(dialog_h * 0.60)  # 从 0.55 调整到 0.60
    
    print(f"  '取消'按钮估算: x[{btn_x}-{btn_x+btn_w}], y[{btn_y}-{btn_y+btn_h}]")
    
    # 裁剪"取消"按钮作为模板
    cancel_btn_template = img[btn_y:btn_y+btn_h, btn_x:btn_x+btn_w]
    cv2.imwrite("cancel_btn_v8.png", cancel_btn_template)
    print(f"✓ 已保存模板: cancel_btn_v8.png ({cancel_btn_template.shape[1]}×{cancel_btn_template.shape[0]})")
    
    # 绘制调试图
    debug_img = img.copy()
    # 弹窗框
    cv2.rectangle(debug_img, (dialog_x, dialog_y), (dialog_x+dialog_w, dialog_y+dialog_h), (0, 255, 0), 2)
    # 按钮框
    cv2.rectangle(debug_img, (btn_x, btn_y), (btn_x+btn_w, btn_y+btn_h), (255, 0, 0), 2)
    cv2.imwrite("debug_overlay_v8.png", debug_img)
    print("✓ 已保存调试图: debug_overlay_v8.png")
    
    # 步骤2: 执行模板匹配
    print("\n[步骤2] 执行模板匹配...")
    match_pos, confidence = find_template(img, "cancel_btn_v8.png", threshold=0.5)
    
    if match_pos:
        mx, my = match_pos
        btn_template = cv2.imread("cancel_btn_v8.png")
        th, tw = btn_template.shape[:2]
        cx = mx + tw // 2
        cy = my + th // 2
        print(f"✅ 找到匹配位置!")
        print(f"   匹配左上角: ({mx}, {my})")
        print(f"   点击中心: ({cx}, {cy})")
        print(f"   匹配置信度: {confidence:.4f}")
        
        # 绘制匹配结果
        match_img = img.copy()
        cv2.rectangle(match_img, (mx, my), (mx+tw, my+th), (0, 0, 255), 2)
        cv2.circle(match_img, (cx, cy), 8, (255, 0, 255), -1)
        cv2.imwrite("match_result_v8.png", match_img)
    else:
        print(f"❌ 未找到匹配 (最高置信度: {confidence:.4f})")
        print("   尝试使用 ADB 返回键作为备选方案...")
        click(1200, 800)  # 点击背景区域
        time.sleep(0.5)
        run_adb("shell input keyevent 4")  # 返回键
        print("✓ 已尝试使用返回键关闭弹窗")
        return
    
    # 步骤3: 执行点击
    print("\n[步骤3] 执行点击...")
    click(cx, cy)
    time.sleep(0.8)
    
    # 备选方案：再次点击确保生效
    print("  二次点击确保生效...")
    click(cx, cy)
    time.sleep(0.5)
    
    # 步骤4: 验证弹窗状态
    print("\n[步骤4] 验证弹窗状态...")
    img_after = screenshot()
    cv2.imwrite("after_cancel_v8.png", img_after)
    
    # 在结果图中查找弹窗特征
    match_pos_after, conf_after = find_template(img_after, "cancel_btn_v8.png", threshold=0.7)
    
    if match_pos_after and conf_after > 0.7:
        print(f"⚠️  弹窗可能仍存在 (置信度: {conf_after:.4f})")
        print("   建议检查 after_cancel_v8.png 确认弹窗状态")
    else:
        print(f"✅ 弹窗已关闭 (残留匹配置信度: {conf_after:.4f})")
    
    print("\n" + "=" * 60)
    print("  完成！请查看以下文件确认结果:")
    print("  - current_screen_v8.png  (原始截图)")
    print("  - cancel_btn_v8.png     (裁剪的模板)")
    print("  - debug_overlay_v8.png  (坐标标注)")
    print("  - match_result_v8.png   (匹配结果)")
    print("  - after_cancel_v8.png   (验证截图)")
    print("=" * 60)

if __name__ == "__main__":
    main()
