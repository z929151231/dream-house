#!/usr/bin/env python3
"""
游戏自动化主流程 - v1
星火对战平台 → "我无限升级" → 抽卡
"""
import subprocess
import cv2
import numpy as np
import os
import time

DEVICE_ID = "R5CW91XQEGF"

# 分辨率
WIDTH, HEIGHT = 1080, 2340

def adb_cmd(cmd_parts, capture=True):
    """执行ADB shell命令"""
    full_cmd = ['adb', '-s', DEVICE_ID, 'shell'] + cmd_parts
    return subprocess.run(full_cmd, capture_output=capture, text=capture, timeout=30)

def adb_shell(cmd_str):
    """执行单个ADB shell命令字符串"""
    return adb_cmd(cmd_str.split())

def adb_input(cmd_parts):
    """输入命令"""
    return adb_cmd(['input'] + cmd_parts)

def adb_screencap():
    """截取屏幕并返回numpy数组"""
    # 设备端截图
    res = adb_shell(f'screencap -p /sdcard/screen_auto.png')
    if res.returncode != 0:
        print(f"screencap error: {res.stderr}")
        return None
    
    # 拉取到本地
    local_path = r"D:/workbuddy/Claw/screen_auto.png"
    res = subprocess.run(
        ['adb', '-s', DEVICE_ID, 'pull', '/sdcard/screen_auto.png', local_path],
        capture_output=True, text=True, timeout=30
    )
    if res.returncode != 0:
        print(f"pull error: {res.stderr}")
        return None
    
    # 读取图像
    img = cv2.imread(local_path)
    if img is None:
        print("cv2.imread failed")
        return None
    
    return img

def adb_input_tap(x, y):
    """模拟点击"""
    adb_input(['tap', str(int(x)), str(int(y))])

def adb_input_keyevent(keycode):
    """模拟按键"""
    adb_input(['keyevent', str(keycode)])

def find_and_click(template_path, confidence_threshold=0.6, double_click=False, click_offset=None):
    """模板匹配并点击"""
    img = adb_screencap()
    if img is None:
        return False, "截图失败"
    
    template = cv2.imread(template_path)
    if template is None:
        return False, f"模板不存在: {template_path}"
    
    result = cv2.matchTemplate(img, template, cv2.TM_CCOEFF_NORMED)
    _, max_val, max_loc, _ = cv2.minMaxLoc(result)
    
    print(f"  匹配置信度: {max_val:.4f}")
    
    if max_val < confidence_threshold:
        return False, f"置信度不足 {max_val:.4f} < {confidence_threshold}"
    
    btn_w, btn_h = template.shape[1], template.shape[0]
    click_x = max_loc[0] + btn_w // 2
    click_y = max_loc[1] + btn_h // 2
    
    if click_offset:
        click_x += click_offset[0]
        click_y += click_offset[1]
    
    print(f"  点击位置: ({click_x}, {click_y})")
    adb_input_tap(click_x, click_y)
    
    if double_click:
        time.sleep(0.3)
        adb_input_tap(click_x, click_y)
    
    return True, (click_x, click_y)

def step_1_close_exit_dialog():
    """步骤1: 关闭退出确认弹窗"""
    print("\n" + "="*50)
    print("步骤1: 关闭退出确认弹窗")
    print("="*50)
    
    # 先尝试系统返回键（最简单有效）
    print("方法1: 发送返回键 (keyevent 4)")
    adb_input_keyevent(4)
    time.sleep(1.5)
    
    # 截图验证
    img = adb_screencap()
    if img is None:
        print("⚠ 截图失败，继续执行")
        return True
    
    # 保存截图查看状态
    cv2.imwrite(r"D:/workbuddy/Claw/screen_after_back.png", img)
    
    # 检查是否还有弹窗（匹配弹窗标题区域）
    # 如果弹窗还在，使用模板匹配点击"取消"
    cancel_template = r"D:/workbuddy/Claw/cancel_btn_v4.png"
    if os.path.exists(cancel_template):
        success, result = find_and_click(cancel_template, confidence_threshold=0.5)
        if success:
            print("✓ 点击取消按钮成功")
            time.sleep(1)
        else:
            print(f"取消按钮匹配失败: {result}")
            # 使用估算坐标（对话框按钮通常在屏幕中下部）
            # 根据 current_screen.png，按钮大约在中下部
            print("使用估算坐标点击取消按钮")
            adb_input_tap(WIDTH // 3, HEIGHT * 0.79)  # 左按钮
            time.sleep(1)
    
    return True

def step_2_return_to_hall():
    """步骤2: 返回平台大厅"""
    print("\n" + "="*50)
    print("步骤2: 返回平台大厅")
    print("="*50)
    
    # 多次按返回键直到回到大厅
    for i in range(3):
        adb_input_keyevent(4)
        time.sleep(1)
        img = adb_screencap()
        if img is None:
            continue
        
        # 保存截图检查
        cv2.imwrite(f"D:/workbuddy/Claw/screen_back_{i}.png", img)
        
        # 检查是否有游戏卡片（hall_now.png 有大厅特征）
        # 简化：假设3次返回后应该到大厅
        print(f"  返回{i+1}次后截图已保存")
    
    print("✓ 假设已返回大厅")
    return True

def step_3_launch_target_game():
    """步骤3: 启动目标游戏《我无限升级》"""
    print("\n" + "="*50)
    print("步骤3: 启动《我无限升级》")
    print("="*50)
    
    # 根据 hall_now.png，游戏卡片布局：
    # 第1张: 我的枪无限子弹
    # 第2张: 我无限升级 ← 目标
    # 第3张: 我的英雄无限融合
    # 第4张: 末日兵工厂
    # 第5张: 放置:刷宝不能停
    
    # 第二张卡片的中心位置估算
    # 竖屏卡片横向排列，每张约 35% 宽度
    # 第二张 x: 约 330-700, y: 约 500-1200
    target_x, target_y = 515, 750
    
    print(f"点击游戏卡片位置: ({target_x}, {target_y})")
    adb_input_tap(target_x, target_y)
    time.sleep(2)
    
    # 等待游戏详情页加载
    print("等待游戏详情页加载...")
    time.sleep(3)
    
    # 截图保存
    img = adb_screencap()
    if img is not None:
        cv2.imwrite(r"D:/workbuddy/Claw/screen_game_detail.png", img)
    
    # 查找并点击"启动游戏"按钮
    # 根据 hall_search.png，启动按钮在右下角
    start_btn_x, start_btn_y = 850, 1800
    
    print(f"点击启动游戏按钮: ({start_btn_x}, {start_btn_y})")
    adb_input_tap(start_btn_x, start_btn_y)
    time.sleep(2)
    
    return True

def step_4_wait_game_load():
    """步骤4: 等待游戏加载完成"""
    print("\n" + "="*50)
    print("步骤4: 等待游戏加载")
    print("="*50)
    
    print("游戏启动需要时间，等待10秒...")
    time.sleep(10)
    
    img = adb_screencap()
    if img is not None:
        cv2.imwrite(r"D:/workbuddy/Claw/screen_game_loaded.png", img)
        print("✓ 游戏截图已保存")
    
    return True

def main():
    print("\n" + "="*50)
    print("星火对战平台游戏自动化 - v1")
    print("设备:", DEVICE_ID)
    print("目标: 我无限升级 → 抽卡")
    print("="*50)
    
    # 步骤1: 关闭当前退出弹窗
    step_1_close_exit_dialog()
    time.sleep(1)
    
    # 步骤2: 返回平台大厅
    step_2_return_to_hall()
    time.sleep(1)
    
    # 步骤3: 启动目标游戏
    step_3_launch_target_game()
    time.sleep(1)
    
    # 步骤4: 等待游戏加载
    step_4_wait_game_load()
    
    print("\n" + "="*50)
    print("✓ 游戏已启动，准备抽卡")
    print("下一步: 进入游戏内，定位抽卡入口")
    print("="*50)

if __name__ == "__main__":
    main()