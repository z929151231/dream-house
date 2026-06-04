"""
使用 OpenCV 模板匹配 + ADB 点击"取消"按钮
使用系统 Python 3.14 运行（避免 numpy MINGW-W64 崩溃）
"""
import cv2
import subprocess
import numpy as np
import os
import sys

DEVICE = "R5CW91XQEGF"

def adb_shell(cmd):
    """执行 ADB shell 命令"""
    result = subprocess.run(
        ["adb", "-s", DEVICE, "shell", cmd],
        capture_output=True, text=True
    )
    return result.stdout.strip()

def adb_input_keyevent(keycode):
    """发送输入事件"""
    subprocess.run(["adb", "-s", DEVICE, "shell", "input", "keyevent", str(keycode)])

def adb_tap(x, y):
    """点击屏幕坐标"""
    subprocess.run(["adb", "-s", DEVICE, "shell", "input", "tap", str(x), str(y)])

def get_screenshot():
    """获取屏幕截图"""
    # 推送到本地
    subprocess.run(
        ["adb", "-s", DEVICE, "exec-out", "screencap", "-p"],
        stdout=open("current_screen.png", "wb")
    )
    return cv2.imread("current_screen.png")

def template_match(img, template, threshold=0.8):
    """模板匹配，返回最佳匹配位置"""
    h, w = template.shape[:2]
    result = cv2.matchTemplate(img, template, cv2.TM_CCOEFF_NORMED)
    min_val, max_val, min_loc, max_loc = cv2.minMaxLoc(result)
    
    if max_val >= threshold:
        # 返回中心点坐标
        cx = max_loc[0] + w // 2
        cy = max_loc[1] + h // 2
        return (cx, cy), max_val
    return None, max_val

def main():
    print("=" * 50)
    print("使用 OpenCV 模板匹配点击'取消'按钮")
    print("=" * 50)
    
    # 1. 获取当前截图
    print("\n[1] 获取屏幕截图...")
    img = get_screenshot()
    if img is None:
        print("❌ 截图失败")
        return
    print(f"✅ 截图尺寸: {img.shape[1]} x {img.shape[0]}")
    
    # 2. 从 v4 截图裁剪"取消"按钮精确模板
    # 基于之前分析，"取消"按钮区域
    v4_img = cv2.imread("v4.png")
    if v4_img is not None:
        # 裁剪取消按钮 (竖屏 1080x2340，取消按钮在弹窗左下)
        # 坐标: x[275-389], y[1322-1370]
        cancel_btn = v4_img[1322:1370, 275:389]
        cv2.imwrite("cancel_btn_template.png", cancel_btn)
        print("✅ 已裁剪取消按钮模板")
    else:
        print("❌ 无法加载 v4.png，请检查文件")
        return
    
    # 3. 加载模板
    template = cv2.imread("cancel_btn_template.png")
    if template is None:
        print("❌ 模板加载失败")
        return
    
    # 4. 模板匹配
    print("\n[2] 执行模板匹配...")
    result_pos, confidence = template_match(img, template, threshold=0.7)
    
    if result_pos:
        cx, cy = result_pos
        print(f"✅ 找到'取消'按钮: ({cx}, {cy}) 置信度: {confidence:.4f}")
        
        # 5. 点击按钮中心
        print("\n[3] 点击'取消'按钮...")
        adb_tap(cx, cy)
        print("✅ 点击完成")
        
        # 等待弹窗关闭动画
        import time
        time.sleep(2)
        
        # 6. 验证结果
        print("\n[4] 验证截图...")
        verify_img = get_screenshot()
        cv2.imwrite("screen_after_cancel_cv2.png", verify_img)
        print("✅ 已保存验证截图: screen_after_cancel_cv2.png")
        
        # 检查弹窗是否还存在（简单检查：看是否有红色按钮区域）
        # 弹窗通常有红色"退出"按钮，通过检测红色来判断
        hsv = cv2.cvtColor(verify_img, cv2.COLOR_BGR2HSV)
        lower_red = np.array([0, 100, 100])
        upper_red = np.array([10, 255, 255])
        mask1 = cv2.inRange(hsv, lower_red, upper_red)
        lower_red2 = np.array([160, 100, 100])
        upper_red2 = np.array([180, 255, 255])
        mask2 = cv2.inRange(hsv, lower_red2, upper_red2)
        red_mask = cv2.bitwise_or(mask1, mask2)
        
        red_count = cv2.countNonZero(red_mask)
        total_pixels = verify_img.shape[0] * verify_img.shape[1]
        red_ratio = red_count / total_pixels
        
        print(f"\n📊 红色像素分析: {red_count} / {total_pixels} ({red_ratio:.2%})")
        
        if red_ratio > 0.005:
            print("⚠️  可能仍有弹窗存在（检测到较多红色区域）")
        else:
            print("✅ 弹窗可能已关闭")
    else:
        print(f"❌ 未找到'取消'按钮，最高置信度: {confidence:.4f} (阈值: 0.7)")
        print("💡 建议: 手动点击或调整模板/阈值")

if __name__ == "__main__":
    main()
