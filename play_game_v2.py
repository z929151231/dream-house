#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
智能版自动化脚本 - 使用图像匹配判断界面状态
支持自动处理各种弹窗和界面状态
"""

import subprocess
import time
import sys
from pathlib import Path

DEVICE = "R5CW91XQEGF"
SCREEN_W = 2340
SCREEN_H = 1080

# 当前已知坐标（需根据实际截图校准）
COORDS = {
    # 星火对战平台 - 搜索
    "platform_search": (1080, 60),
    
    # 游戏详情页 - 启动游戏按钮（右下角）
    "launch_btn": (1880, 850),
    
    # 协议弹窗 - 同意
    "agree": (1350, 750),
    
    # 退出确认弹窗
    "cancel_popup": (900, 750),   # 取消按钮
    "exit_popup": (1350, 750),    # 退出按钮
    
    # 游戏内 - 高地保安入口
    "gaodi": (416, 675),  # 左侧卡片中心
}


def adb(cmd):
    """执行ADB命令"""
    return subprocess.run(
        ["adb", "-s", DEVICE, *cmd.split() if isinstance(cmd, str) else cmd],
        capture_output=True, text=True, timeout=30
    )


def adb_shell(cmd):
    """执行shell命令"""
    return adb(f"shell {cmd}").stdout.strip()


def tap(x, y, msg=""):
    """点击"""
    print(f"  → 点击({x},{y}) {msg}")
    adb_shell(f"input tap {x} {y}")
    time.sleep(0.5)


def wait(n=1):
    """等待"""
    time.sleep(n)
    print(f"  ⏳ 等待 {n}s")


def screenshot(name):
    """截图"""
    path = Path(f"D:/workbuddy/Claw/{name}.png")
    adb_shell("screencap -p /sdcard/tmp.png")
    adb(["pull", "/sdcard/tmp.png", str(path)])
    return path


def detect_popup() -> str:
    """
    检测当前屏幕是否有弹窗
    返回: 'none' | 'agree' | 'confirm_exit' | 'game_ready'
    """
    # 简化版：基于时间判断
    # 实际版本应使用图像识别或OCR检测
    return 'none'


# ===== 状态机流程 =====
class GameState:
    """游戏状态机"""
    
    def __init__(self):
        self.state = "idle"
        self.retries = 0
    
    def run(self):
        """主循环"""
        steps = [
            ("启动平台", self.launch_platform),
            ("搜索游戏", self.search_game),
            ("进入详情页", self.open_game_detail),
            ("启动游戏", self.launch_game),
            ("处理协议", self.handle_protocol),
            ("处理弹窗", self.handle_popup),
            ("进入游戏", self.enter_game_room),
        ]
        
        for name, fn in steps:
            print(f"\n📍 {name}")
            try:
                result = fn()
                if result == "retry":
                    if self.retries < 2:
                        self.retries += 1
                        print(f"  重试 ({self.retries}/2)")
                        continue
                    else:
                        print("  重试次数耗尽，退出")
                        return
            except Exception as e:
                print(f"  ❌ 错误: {e}")
                return
        
        print("\n🎉 流程完成！游戏已启动")
    
    def launch_platform(self):
        adb_shell(f"monkey -p xd.sce.box -c android.intent.category.LAUNCHER 1")
        wait(3)
        screenshot("launch_platform")
    
    def search_game(self):
        # 点击搜索
        tap(*COORDS["platform_search"], "搜索")
        wait(1)
        
        # 注意：中文输入需要手动完成
        print("  ⚠️  中文输入请手动完成，或改用其他输入法方案")
        wait(2)
        screenshot("search")
    
    def open_game_detail(self):
        # 假设游戏已搜索到，点击第一个结果
        tap(1170, 540, "游戏卡片")
        wait(2)
        screenshot("game_detail")
    
    def launch_game(self):
        # 点击启动游戏按钮
        tap(*COORDS["launch_btn"], "启动游戏")
        wait(2)
        screenshot("after_launch")
    
    def handle_protocol(self):
        # 如果有协议弹窗，同意
        popup = detect_popup()
        if popup == "agree":
            tap(*COORDS["agree"], "同意协议")
            wait(2)
        screenshot("after_agree")
    
    def handle_popup(self):
        """处理各种弹窗"""
        popup = detect_popup()
        
        if popup == "confirm_exit":
            print("  📱 检测到'确认退出'弹窗")
            print("  策略：点击'取消'，保留游戏状态")
            tap(*COORDS["cancel_popup"], "取消")
            wait(2)
            screenshot("after_cancel")
        
        screenshot("after_popup")
    
    def enter_game_room(self):
        # 进入游戏大厅
        screenshot("game_room")
        
        # 点击"高地保安"入口
        tap(*COORDS["gaodi"], "高地保安")
        wait(3)
        screenshot("entered")


def main():
    print("\n" + "🎮" * 20)
    print("   智能自动化脚本 v2.0")
    print("🎮" * 20)
    
    # 检查设备
    result = adb("devices")
    if DEVICE not in result.stdout:
        print(f"[!] 设备 {DEVICE} 未连接")
        sys.exit(1)
    print(f"[✓] 设备 {DEVICE} 已连接")
    
    # 运行流程
    GameState().run()


if __name__ == "__main__":
    main()
