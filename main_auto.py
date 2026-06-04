#!/usr/bin/env python3
"""
星火对战平台游戏自动化 - 主流程 (集成版)
整合: 弹窗处理 + 游戏点击 + 抽卡系统
"""

import subprocess
import cv2
import numpy as np
import os
import time
from pathlib import Path

# ========== 设备配置 ==========
DEVICE = "R5CW91XQEGF"
SCREEN_W, SCREEN_H = 2340, 1080  # 竖屏方向的实际像素
WORK_DIR = Path("D:/workbuddy/Claw")

# ========== ADB 基础操作 ==========
def adb(cmd: str, capture=False) -> tuple:
    """执行 ADB 命令"""
    full = f"adb -s {DEVICE} {cmd}"
    result = subprocess.run(full, shell=True, capture_output=True, timeout=30)
    return result.stdout, result.stderr, result.returncode

def adb_shell(cmd: str) -> str:
    """执行 ADB shell 命令，返回 stdout"""
    out, _, rc = adb(f"shell {cmd}")
    return out.strip() if rc == 0 else ""

def adb_exec_out(cmd: str) -> bytes:
    """执行 ADB exec-out 命令，返回二进制输出"""
    out, _, rc = adb(f"exec-out {cmd}")
    return out if rc == 0 else b""

def screenshot() -> np.ndarray:
    """截取屏幕，返回 numpy 数组"""
    raw = adb_exec_out("screencap -p")
    if not raw:
        raise RuntimeError("screencap 失败")
    img = cv2.imdecode(np.frombuffer(raw, np.uint8), cv2.IMREAD_COLOR)
    if img is None:
        raise RuntimeError("screencap 输出无法解析")
    return img

def tap(x: int, y: int, count: int = 1, delay: float = 0.5):
    """点击位置，支持多次点击"""
    for i in range(count):
        adb_shell(f"input tap {x} {y}")
        if i < count - 1:
            time.sleep(delay)
    print(f"✓ 已点击 ({x}, {y}) x{count}")

def back():
    """执行返回键"""
    adb_shell("input keyevent 4")
    print("✓ 已执行返回")

# ========== 通用弹窗检测 ==========
def detect_dialog(img: np.ndarray, threshold: float = 0.6) -> tuple:
    """
    检测屏幕中是否有居中弹窗
    返回: (有弹窗, 弹窗中心坐标, 置信度)
    """
    h, w = img.shape[:2]
    
    # 居中区域特征：颜色较浅/高亮
    r, g, b = img[:,:,0], img[:,:,1], img[:,:,2]
    bright_mask = (r > 180) & (g > 180) & (b > 180)
    
    # 寻找居中连续区域
    coords = np.column_stack(np.where(bright_mask))
    if len(coords) < 100:
        return False, None, 0.0
    
    # 按 X 坐标分桶，找最密集的中心区域
    x_coords = coords[:, 1]
    center_x = w // 2
    tol = w // 6  # 容忍范围
    
    center_mask = (x_coords > center_x - tol) & (x_coords < center_x + tol)
    center_coords = coords[center_mask]
    
    if len(center_coords) < 50:
        return False, None, 0.0
    
    # 估算弹窗边界
    x_min, x_max = center_coords[:, 1].min(), center_coords[:, 1].max()
    y_min, y_max = center_coords[:, 0].min(), center_coords[:, 0].max()
    
    # 验证：弹窗应该有合理的宽高比
    dlg_w = x_max - x_min
    dlg_h = y_max - y_min
    
    if dlg_w < w * 0.2 or dlg_h < h * 0.05:
        return False, None, 0.0
    
    # 计算置信度（基于面积比和亮度）
    area_ratio = (dlg_w * dlg_h) / (w * h)
    avg_brightness = np.mean(img[y_min:y_max, x_min:x_max]) / 255.0
    
    confidence = min(area_ratio * 3, 1.0) * 0.5 + avg_brightness * 0.5
    
    center = (int(center_x), int((y_min + y_max) // 2))
    
    return confidence > threshold, center, confidence

def find_button(img: np.ndarray, template_path: str, threshold: float = 0.6) -> tuple:
    """
    使用模板匹配找按钮
    返回: (有匹配, 中心坐标, 置信度)
    """
    if not os.path.exists(template_path):
        return False, None, 0.0
    
    template = cv2.imread(template_path)
    if template is None:
        return False, None, 0.0
    
    res = cv2.matchTemplate(img, template, cv2.TM_CCOEFF_NORMED)
    _, max_val, _, max_loc = cv2.minMaxLoc(res)
    
    if max_val >= threshold:
        th, tw = template.shape[:2]
        center = (max_loc[0] + tw // 2, max_loc[1] + th // 2)
        return True, center, max_val
    
    return False, None, max_val

# ========== 弹窗处理模块 ==========
def handle_exit_dialog() -> bool:
    """
    检测并关闭退出确认弹窗
    返回: True=已处理(弹窗关闭), False=无弹窗/处理失败
    """
    print("\n[弹窗检测] 检查是否有退出确认弹窗...")
    
    img = screenshot()
    has_dialog, dialog_center, conf = detect_dialog(img)
    
    if not has_dialog:
        print("  ✅ 无弹窗")
        return True  # 无弹窗即成功
    
    print(f"  ⚠️ 检测到弹窗 (置信度: {conf:.4f})")
    print(f"  中心位置: {dialog_center}")
    
    # 尝试用通用 "取消/确定" 模板
    cancel_temps = [
        "cancel_btn_v8.png",
        "cancel_btn_v4.png",
        "cancel_btn_template.png",
    ]
    
    found_btn = False
    btn_pos = None
    
    for temp_name in cancel_temps:
        temp_path = WORK_DIR / temp_name
        if temp_path.exists():
            has_match, center, match_conf = find_button(img, str(temp_path))
            if has_match:
                print(f"  ✅ 找到按钮模板: {temp_name} (置信度: {match_conf:.4f})")
                btn_pos = center
                found_btn = True
                break
    
    if found_btn and btn_pos:
        # 点击 "取消" 按钮
        print(f"  点击取消按钮: {btn_pos}")
        tap(btn_pos[0], btn_pos[1], count=2, delay=0.3)
        time.sleep(1.5)
        
        # 验证
        img_after = screenshot()
        has_still, _, conf_after = detect_dialog(img_after)
        
        if not has_still:
            print("  ✅ 弹窗已关闭")
            return True
        else:
            print(f"  ⚠️ 弹窗仍在 (残留置信度: {conf_after:.4f})")
            # 尝试备选方案
            back()
            time.sleep(0.5)
            return True  # 已尝试处理
    
    # 备选：直接返回键
    print("  备选方案: 使用返回键...")
    back()
    time.sleep(0.5)
    return True

# ========== 游戏卡片定位 ==========
def find_game_card(game_name: str = "我无限升级") -> tuple:
    """
    在应用商店主页定位游戏卡片
    返回: (x, y) 中心点击坐标
    """
    print(f"\n[游戏定位] 搜索 '{game_name}' 卡片...")
    
    img = screenshot()
    h, w = img.shape[:2]
    
    # 估算卡片区域（应用商店卡片通常在上半部分）
    # 横向排列，每张约占 1/5 宽度
    card_width = w // 5
    card_y_start = int(h * 0.35)
    card_y_end = int(h * 0.65)
    
    print(f"  卡片区域: x[0-{w}], y[{card_y_start}-{card_y_end}]")
    
    # 截取第二张卡片区域（《我无限升级》通常排在第二）
    idx = 1  # 第二张
    x1 = idx * card_width + int(card_width * 0.1)
    x2 = (idx + 1) * card_width - int(card_width * 0.1)
    
    card_region = img[card_y_start:card_y_end, x1:x2]
    card_center_x = x1 + (x2 - x1) // 2
    card_center_y = card_y_start + (card_y_end - card_y_start) // 2
    
    print(f"  估算点击坐标: ({card_center_x}, {card_center_y})")
    
    # 保存卡片区域用于验证
    cv2.imwrite(str(WORK_DIR / "found_card.png"), card_region)
    
    return card_center_x, card_center_y

# ========== 抽卡模块 ==========
def run_gacha(num_draws: int = 1):
    """
    执行抽卡操作
    流程: 
    1. 确认进入应用商店详情页
    2. 查找并点击 "启动游戏" 或类似按钮
    3. 处理可能出现的登录/协议弹窗
    4. 进入游戏后查找 "每日抽卡" 或类似功能入口
    5. 执行抽卡
    """
    print(f"\n{'='*60}")
    print(f"  抽卡系统 - {num_draws} 次抽卡")
    print(f"{'='*60}")
    
    # === 阶段1: 进入游戏 ===
    print("\n[阶段1] 进入游戏应用...")
    
    # 检查当前是否有退出弹窗
    handle_exit_dialog()
    time.sleep(0.5)
    
    # 点击游戏卡片进入详情页
    game_x, game_y = find_game_card()
    tap(game_x, game_y)
    time.sleep(2)
    
    # 处理可能出现的启动游戏弹窗
    img = screenshot()
    cv2.imwrite(str(WORK_DIR / "after_launch.png"), img)
    
    # === 阶段2: 进入游戏主界面 ===
    print("\n[阶段2] 进入游戏主界面...")
    
    # 查找"启动游戏"按钮并点击
    start_temps = ["start_game_btn.png", "launch_btn.png"]
    found_start = False
    
    for temp_name in start_temps:
        temp_path = WORK_DIR / temp_name
        if temp_path.exists():
            has_match, btn_pos, conf = find_button(img, str(temp_path))
            if has_match and conf > 0.5:
                print(f"  ✅ 找到启动按钮: {btn_pos}")
                tap(btn_pos[0], btn_pos[1], count=2)
                found_start = True
                break
    
    if not found_start:
        # 备选：估算启动按钮位置（通常在右下角）
        start_x = int(SCREEN_W * 0.75)
        start_y = int(SCREEN_H * 0.80)
        print(f"  估算启动按钮位置: ({start_x}, {start_y})")
        tap(start_x, start_y, count=2)
    
    time.sleep(3)  # 等待游戏加载
    
    # === 阶段3: 定位抽卡入口 ===
    print("\n[阶段3] 定位抽卡入口...")
    
    img = screenshot()
    cv2.imwrite(str(WORK_DIR / "in_game.png"), img)
    
    # 估算抽卡按钮位置（通常在游戏界面的某个固定位置）
    # 需要根据实际游戏界面调整
    # 假设抽卡入口在左侧/右侧的某个位置
    
    # 这里提供占位符，需要用户根据实际情况调整坐标
    gacha_x = int(SCREEN_W * 0.15)  # 左侧区域
    gacha_y = int(SCREEN_H * 0.50)  # 中部
    
    print(f"  抽卡入口估算位置: ({gacha_x}, {gacha_y})")
    print("  ⚠️ 需要用户确认实际抽卡按钮位置")
    print("  请查看 in_game.png 确认坐标")
    
    # === 阶段4: 执行抽卡 ===
    print("\n[阶段4] 执行抽卡...")
    
    for i in range(num_draws):
        print(f"\n  -- 第 {i+1}/{num_draws} 次抽卡 --")
        
        # 点击抽卡入口
        tap(gacha_x, gacha_y)
        time.sleep(1)
        
        # 处理抽卡确认弹窗
        handle_exit_dialog()  # 复用弹窗处理逻辑
        time.sleep(0.5)
        
        # 等待抽卡结果
        time.sleep(2)
        
        # 关闭结果弹窗
        back()
        time.sleep(0.5)
    
    print(f"\n✅ 抽卡完成! 共执行 {num_draws} 次")
    
    # === 阶段5: 返回应用商店 ===
    print("\n[阶段5] 返回应用商店...")
    for _ in range(3):
        back()
        time.sleep(0.3)
    
    # 再次检查弹窗
    handle_exit_dialog()
    
    print(f"\n{'='*60}")
    print("  ✅ 自动化流程完成")
    print(f"{'='*60}")
    print(f"\n生成的调试文件:")
    print(f"  - after_launch.png  (启动后截图)")
    print(f"  - in_game.png       (游戏界面截图)")

# ========== 主入口 ==========
def main():
    import argparse
    
    parser = argparse.ArgumentParser(description="星火平台游戏自动化")
    parser.add_argument("--action", choices=["launch", "gacha", "dialog"], default="launch",
                        help="执行的动作")
    parser.add_argument("--draws", type=int, default=1, help="抽卡次数")
    args = parser.parse_args()
    
    # 验证设备连接
    print("=" * 60)
    print("  星火对战平台游戏自动化")
    print("=" * 60)
    
    result = subprocess.run(f"adb -s {DEVICE} get-state", shell=True, capture_output=True)
    if result.returncode != 0:
        print("✗ 设备未连接")
        print("  请运行: adb -s R5CW91XQEGF connect")
        return
    
    print(f"✓ 设备已连接: {DEVICE}")
    
    if args.action == "dialog":
        handle_exit_dialog()
    elif args.action == "launch":
        game_x, game_y = find_game_card()
        tap(game_x, game_y)
        print("\n已点击游戏卡片，请手动处理后续弹窗")
    elif args.action == "gacha":
        run_gacha(args.draws)

if __name__ == "__main__":
    main()
