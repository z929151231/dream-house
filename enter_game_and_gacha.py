#!/usr/bin/env python3
"""
进入游戏并执行抽卡 - 完整流程
1. 处理退出确认弹窗
2. 进入游戏主界面
3. 定位并执行抽卡
"""

import subprocess
import cv2
import numpy as np
import os
import time
from pathlib import Path

# ========== 设备配置 ==========
DEVICE = "R5CW91XQEGF"
SCREEN_W, SCREEN_H = 2340, 1080
WORK_DIR = Path("D:/workbuddy/Claw")

# ========== ADB 操作 ==========
def adb(cmd: str):
    """执行 ADB 命令"""
    full = f"adb -s {DEVICE} {cmd}"
    return subprocess.run(full, shell=True, capture_output=True, timeout=30)

def adb_shell(cmd: str) -> str:
    out = adb(f"shell {cmd}")
    return out.stdout.strip().decode() if out.returncode == 0 else ""

def adb_exec_out(cmd: str) -> bytes:
    out = adb(f"exec-out {cmd}")
    return out.stdout if out.returncode == 0 else b""

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
    """点击位置"""
    for i in range(count):
        adb_shell(f"input tap {x} {y}")
        if i < count - 1:
            time.sleep(delay)
    print(f"✓ 已点击 ({x}, {y}) x{count}")

def back():
    """执行返回键"""
    adb_shell("input keyevent 4")
    print("✓ 已执行返回")

def save_img(img: np.ndarray, name: str):
    """保存截图"""
    cv2.imwrite(str(WORK_DIR / name), img)
    print(f"  📸 已保存: {name}")

# ========== 弹窗处理 ==========
def handle_exit_dialog_v8() -> bool:
    """
    v8 版本弹窗处理 - 基于之前的验证
    使用估算坐标点击"取消"按钮
    """
    print("\n[弹窗处理] 关闭退出确认弹窗...")
    
    img = screenshot()
    save_img(img, "before_dialog_close.png")
    
    # 弹窗估算坐标（基于之前分析）
    # 弹窗居中，"取消"按钮在左侧
    # 弹窗宽度约 47% 屏幕，按钮在弹窗下半部分
    dialog_x = int(SCREEN_W * 0.26)   # 约 608px
    dialog_y = int(SCREEN_H * 0.40)   # 约 432px
    dialog_w = int(SCREEN_W * 0.47)   # 约 1100px
    dialog_h = int(SCREEN_H * 0.25)   # 约 270px
    
    # "取消"按钮估算位置
    btn_x = dialog_x + int(dialog_w * 0.25)   # 左侧按钮中心
    btn_y = dialog_y + int(dialog_h * 0.60)   # 按钮Y坐标
    
    print(f"  弹窗区域: ({dialog_x}, {dialog_y}) {dialog_w}x{dialog_h}")
    print(f"  估算点击位置: ({btn_x}, {btn_y})")
    
    # 点击"取消"按钮
    tap(btn_x, btn_y, count=2, delay=0.3)
    time.sleep(1.5)
    
    # 验证弹窗是否关闭
    img_after = screenshot()
    save_img(img_after, "after_dialog_close.png")
    
    # 简单检查：弹窗区域是否还有高亮
    check_region = img_after[dialog_y:dialog_y+dialog_h, dialog_x:dialog_x+dialog_w]
    bright_mask = (check_region[:,:,0] > 180) & (check_region[:,:,1] > 180) & (check_region[:,:,2] > 180)
    bright_ratio = np.sum(bright_mask) / (dialog_w * dialog_h)
    
    if bright_ratio < 0.3:
        print("  ✅ 弹窗已关闭")
        return True
    else:
        print(f"  ⚠️ 弹窗可能仍在 (亮度比例: {bright_ratio:.2f})")
        # 尝试返回键备选
        back()
        time.sleep(0.5)
        return True

# ========== 游戏定位 ==========
def find_and_launch_game():
    """
    点击游戏卡片，启动游戏
    """
    print("\n[游戏启动] 进入游戏应用...")
    
    # 估算游戏卡片位置（第二张卡片）
    game_x = 702
    game_y = 540
    print(f"  点击游戏卡片: ({game_x}, {game_y})")
    tap(game_x, game_y)
    time.sleep(1.5)
    
    img = screenshot()
    save_img(img, "detail_page.png")
    
    # 点击"启动游戏"按钮（右下角）
    start_x = int(SCREEN_W * 0.75)  # 约 1755
    start_y = int(SCREEN_H * 0.80)  # 约 864
    print(f"  点击启动按钮: ({start_x}, {start_y})")
    tap(start_x, start_y, count=2)
    time.sleep(1)
    
    # 处理协议弹窗（如果需要）
    handle_exit_dialog_v8()
    time.sleep(3)  # 等待游戏加载
    
    img = screenshot()
    save_img(img, "game_loading.png")
    print("  ⏳ 游戏加载中...")

# ========== 抽卡入口定位 ==========
def locate_gacha_button(img: np.ndarray) -> tuple:
    """
    在游戏主界面中定位抽卡按钮
    返回: (x, y) 坐标
    """
    h, w = img.shape[:2]
    
    # 方案1: 使用模板匹配（如果有模板）
    template_files = ["gacha_btn.png", "draw_btn.png", "gacha_icon.png"]
    for temp_name in template_files:
        temp_path = WORK_DIR / temp_name
        if temp_path.exists():
            template = cv2.imread(str(temp_path))
            if template is not None:
                res = cv2.matchTemplate(img, template, cv2.TM_CCOEFF_NORMED)
                _, max_val, _, max_loc = cv2.minMaxLoc(res)
                if max_val > 0.7:
                    tw, th = template.shape[1], template.shape[0]
                    center = (max_loc[0] + tw // 2, max_loc[1] + th // 2)
                    print(f"  ✅ 模板匹配找到抽卡按钮: {center} (置信度: {max_val:.4f})")
                    return center
    
    # 方案2: 估算位置（基于常见游戏UI布局）
    # 抽卡通常在左侧或右侧固定位置
    # 根据 in_game_04_main_interface.png 的分析
    # 抽卡入口可能在左侧菜单区域
    
    # 假设抽卡入口在左侧中上部
    gacha_x = int(w * 0.12)  # 约 120-150
    gacha_y = int(h * 0.35)  # 约 380-420
    
    print(f"  ⚠️ 使用估算位置: ({gacha_x}, {gacha_y})")
    print("  请确认后通过 gacha_auto.py 修正")
    
    return gacha_x, gacha_y

# ========== 抽卡执行 ==========
def execute_gacha(gacha_x: int, gacha_y: int, num_draws: int = 1):
    """
    执行抽卡操作
    """
    print(f"\n{'='*60}")
    print(f"  执行 {num_draws} 次抽卡")
    print(f"{'='*60}")
    
    for i in range(num_draws):
        print(f"\n  -- 第 {i+1}/{num_draws} 次抽卡 --")
        
        # 点击抽卡入口
        tap(gacha_x, gacha_y, count=1)
        time.sleep(1)
        
        # 截图确认抽卡界面
        img = screenshot()
        save_img(img, f"gacha_step_{i+1}.png")
        
        # 处理可能出现的抽卡确认弹窗
        # 如果有消耗资源的确认弹窗，需要点击"确定"
        time.sleep(0.5)
        
        # 等待抽卡动画
        time.sleep(2)
        
        # 截图记录结果
        img = screenshot()
        save_img(img, f"gacha_result_{i+1}.png")
        
        # 关闭结果界面
        back()
        time.sleep(0.5)
    
    print(f"\n✅ 抽卡完成!")

# ========== 主流程 ==========
def main():
    import argparse
    
    parser = argparse.ArgumentParser(description="进入游戏并抽卡")
    parser.add_argument("--draws", type=int, default=1, help="抽卡次数")
    parser.add_argument("--skip-launch", action="store_true", help="跳过启动流程，假设已在游戏")
    args = parser.parse_args()
    
    print("=" * 60)
    print("  星火对战平台 - 进入游戏并抽卡")
    print("=" * 60)
    
    # 验证设备
    result = subprocess.run(f"adb -s {DEVICE} get-state", shell=True, capture_output=True)
    if result.returncode != 0:
        print("✗ 设备未连接")
        return
    
    print(f"✓ 设备已连接: {DEVICE}")
    
    # 步骤1: 处理退出弹窗
    handle_exit_dialog_v8()
    time.sleep(0.5)
    
    if not args.skip_launch:
        # 步骤2: 启动游戏
        find_and_launch_game()
        time.sleep(2)
    
    # 步骤3: 截图分析游戏界面
    img = screenshot()
    save_img(img, "current_game_screen.png")
    print("\n📋 游戏界面截图已保存，请确认:")
    print("   - 是否成功进入游戏主界面？")
    print("   - 抽卡入口在什么位置？")
    
    # 步骤4: 定位抽卡按钮
    gacha_x, gacha_y = locate_gacha_button(img)
    
    # 步骤5: 执行抽卡（需要用户确认后取消这行）
    # execute_gacha(args.draws, gacha_x, gacha_y)
    
    print("\n" + "=" * 60)
    print("  流程暂停，等待用户确认抽卡按钮位置")
    print("  确认后可在 gacha_auto.py 中修正坐标")
    print("=" * 60)

if __name__ == "__main__":
    main()
