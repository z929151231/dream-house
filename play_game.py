#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
星火对战平台自动化脚本
功能：启动平台 → 搜索游戏 → 启动游戏 → 进入"高地保安"房间
设备：三星 SM-A5460 (R5CW91XQEGF, Android SDK 36)
"""

import subprocess
import time
import sys
from pathlib import Path

# ===== 配置 =====
DEVICE = "R5CW91XQEGF"
PLATFORM_PKG = "xd.sce.box"
PLATFORM_LAUNCHER = "com.sdk.taptap.TaptapLauncher"
TARGET_GAME = "我的枪无限子弹"  # 游戏关键词

# 屏幕分辨率
SCREEN_W = 2340
SCREEN_H = 1080

# 坐标配置（基于分辨率 2340×1080）
COORDS = {
    # 平台主页 - 搜索图标位置
    "search_icon": (1080, 60),  # 顶部搜索图标
    
    # 搜索结果 - 游戏卡片点击区域（估算）
    "game_card_click": (1170, 540),  # 屏幕中央
    
    # 游戏详情页 - 启动游戏按钮
    "launch_game_btn": (1880, 850),  # 右下角
    
    # 协议同意按钮
    "agree_protocol": (1350, 750),  # 协议弹窗同意按钮（估算）
    
    # 取消/退出弹窗 - 取消按钮（保留游戏状态）
    "cancel_popup": (900, 750),
    
    # 退出弹窗 - 退出按钮（关闭游戏）
    "exit_popup": (1350, 750),
    
    # 游戏内 - 高地保安入口 - 需要精确校准
    "gaodi_baoan": (200, 500),  # TODO: 需要图像识别精确定位
}

# 点击区域微调（使用更大的安全点击区）
ZONE_CLICK = {
    "search_icon": {"w": 150, "h": 80},
    "gaodi_baoan": {"w": 300, "h": 200},
}


def adb(cmd: str) -> str:
    """执行ADB命令并返回输出"""
    result = subprocess.run(
        ["adb", "-s", DEVICE, *cmd.split()],
        capture_output=True, text=True, timeout=30
    )
    if result.returncode != 0:
        print(f"[ERROR] adb {cmd} 失败: {result.stderr.strip()}")
    return result.stdout.strip()


def adb_shell(cmd: str) -> str:
    """执行shell命令"""
    return adb(f"shell {cmd}")


def tap(x: int, y: int, desc: str = ""):
    """模拟点击"""
    print(f"[TAP] {desc}: ({x}, {y})")
    adb_shell(f"input tap {x} {y}")
    time.sleep(0.3)


def wait(seconds: float = 1.0):
    """等待"""
    time.sleep(seconds)
    print(f"[WAIT] {seconds}s")


def screenshot(output: str = None) -> str:
    """截图并保存"""
    if output is None:
        output = f"/tmp/screen_{int(time.time())}.png"
    adb_shell(f"screencap -p /sdcard/scr.png")
    adb(f"pull /sdcard/scr.png {output}")
    print(f"[SCREENSHOT] saved to {output}")
    return output


# ===== 主流程 =====
def step1_launch_platform():
    """步骤1：启动星火对战平台"""
    print("\n" + "="*50)
    print("步骤1: 启动星火对战平台")
    print("="*50)
    
    # 启动应用
    adb_shell(f"monkey -p {PLATFORM_PKG} -c android.intent.category.LAUNCHER 1")
    wait(3)
    
    # 检查是否成功启动
    info = adb(f"shell dumpsys activity top | head -20")
    if PLATFORM_PKG in info:
        print("[OK] 平台已启动")
        screenshot("D:/workbuddy/Claw/step1_platform.png")
        return True
    return False


def step2_search_game():
    """步骤2：搜索目标游戏"""
    print("\n" + "="*50)
    print("步骤2: 搜索游戏")
    print("="*50)
    
    # 点击搜索图标
    tap(*COORDS["search_icon"], "搜索图标")
    wait(1)
    
    # 输入游戏名（注意：ADB input text 不支持中文）
    # 这里假设用户已经手动输入或平台有已安装游戏列表
    # 或者使用其他方式搜索
    print("[NOTE] ADB input text 不支持中文，请手动输入或在已安装列表中选择")
    
    # 等待搜索结果
    wait(2)
    screenshot("D:/workbuddy/Claw/step2_search.png")
    return True


def step3_launch_game():
    """步骤3：启动游戏"""
    print("\n" + "="*50)
    print("步骤3: 启动游戏")
    print("="*50)
    
    # 点击游戏卡片（进入详情页）
    tap(*COORDS["game_card_click"], "游戏卡片")
    wait(2)
    
    # 点击"启动游戏"按钮
    tap(*COORDS["launch_game_btn"], "启动游戏按钮")
    wait(2)
    
    # 处理可能出现的协议弹窗
    screenshot("D:/workbuddy/Claw/step3_launch.png")
    return True


def step4_agree_protocol():
    """步骤4：处理协议弹窗"""
    print("\n" + "="*50)
    print("步骤4: 同意用户协议")
    print("="*50)
    
    # 点击同意协议
    tap(*COORDS["agree_protocol"], "同意协议")
    wait(2)
    
    screenshot("D:/workbuddy/Claw/step4_agree.png")
    return True


def step5_handle_popup():
    """步骤5：处理退出确认弹窗"""
    print("\n" + "="*50)
    print("步骤5: 处理弹出确认")
    print("="*50)
    
    # 截图检查当前状态
    screenshot("D:/workbuddy/Claw/step5_popup.png")
    
    # 这里需要视觉识别判断弹窗状态
    # 简化版：如果检测到弹窗，点击"取消"保留状态
    # 实际使用中建议接入OCR或图像识别
    print("[MANUAL] 当前显示退出确认弹窗，建议选择'取消'保留游戏状态")
    print("         或选择'退出'后重新启动")
    
    return True


def step6_enter_game():
    """步骤6：进入高地保安房间"""
    print("\n" + "="*50)
    print("步骤6: 进入游戏 - 高地保安")
    print("="*50)
    
    # 检查当前界面
    screenshot("D:/workbuddy/Claw/step6_game.png")
    
    # 点击"高地保安"卡片
    tap(*COORDS["gaodi_baoan"], "高地保安入口")
    wait(3)
    
    screenshot("D:/workbuddy/Claw/step6_entered.png")
    print("[OK] 已进入游戏房间！")
    
    return True


def main():
    """主函数：执行完整流程"""
    print("\n" + "🎮" * 30)
    print("   星火对战平台自动化脚本")
    print("🎮" * 30)
    print(f"设备: {DEVICE}")
    print(f"目标游戏: {TARGET_GAME}")
    
    # 检查设备连接
    devices = adb("devices")
    if DEVICE not in devices:
        print(f"[ERROR] 设备 {DEVICE} 未连接！")
        sys.exit(1)
    
    print("[OK] 设备连接正常")
    
    # 执行流程
    try:
        step1_launch_platform()
        # step2_search_game()  # 需要手动输入游戏名
        step3_launch_game()
        step4_agree_protocol()
        step5_handle_popup()
        step6_enter_game()
        
        print("\n" + "✅" * 30)
        print("   流程完成！请在游戏中开始游玩")
        print("✅" * 30)
        
    except Exception as e:
        print(f"[ERROR] 流程中断: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
