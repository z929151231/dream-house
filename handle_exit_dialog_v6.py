"""
处理游戏退出确认弹窗 - 纯 Python + OpenCV + ADB (v6)
不依赖 airtest，直接使用 opencv 模板匹配
"""
import cv2
import subprocess
import time

DEVICE_ID = "R5CW91XQEGF"

def adb(cmd, shell=False):
    """执行 ADB 命令"""
    full_cmd = f"adb -s {DEVICE_ID} {cmd}"
    result = subprocess.run(full_cmd, shell=True, capture_output=True, text=True, timeout=30)
    return result.stdout.strip()

def screenshot():
    """截取设备屏幕并返回 OpenCV 图像"""
    # 截图到设备
    adb("shell screencap -p /sdcard/screen.png")
    time.sleep(0.5)
    # 拉取到本地
    local_path = "temp_screen.png"
    subprocess.run(f"adb -s {DEVICE_ID} pull /sdcard/screen.png {local_path}", 
                   shell=True, capture_output=True, timeout=30)
    # 读取图像
    img = cv2.imread(local_path)
    return img

def find_template(img, template_path, threshold=0.6):
    """在图像中查找模板，返回最佳匹配位置和置信度"""
    template = cv2.imread(template_path)
    if template is None:
        print(f"✗ 无法读取模板: {template_path}")
        return None, 0
    
    h, w = template.shape[:2]
    res = cv2.matchTemplate(img, template, cv2.TM_CCOEFF_NORMED)
    min_val, max_val, min_loc, max_loc = cv2.minMaxLoc(res)
    
    if max_val >= threshold:
        return max_loc, max_val  # (x, y) 左上角
    return None, max_val

def click_at(x, y):
    """点击指定坐标"""
    subprocess.run(
        f"adb -s {DEVICE_ID} shell input tap {x} {y}",
        shell=True, capture_output=True, timeout=10
    )

def main():
    print("=" * 60)
    print("  处理退出确认弹窗 - OpenCV 模板匹配 + ADB (v6)")
    print("=" * 60)
    
    # 1. 检查设备连接
    result = subprocess.run(f"adb -s {DEVICE_ID} get-state", shell=True, 
                           capture_output=True, text=True, timeout=10)
    if "device" not in result.stdout:
        print(f"✗ 设备 {DEVICE_ID} 未连接")
        return
    
    print(f"✓ 设备已连接: {DEVICE_ID}")
    
    # 2. 截取当前屏幕
    print("\n[步骤1] 截取当前屏幕...")
    img = screenshot()
    if img is None:
        print("✗ 无法获取截图")
        return
    cv2.imwrite("current_screen_v6.png", img)
    h, w = img.shape[:2]
    print(f"✓ 已截图: current_screen_v6.png (尺寸: {w}x{h})")
    
    # 3. 加载当前屏幕分析
    # 根据之前 debug_overlay_v4.png 分析，弹窗位置已知
    # 需要精确裁剪"取消"按钮（白色边框的矩形）
    
    # 弹窗参数（从之前分析）
    dialog_w = int(w * 0.47)
    dialog_h = int(h * 0.18)
    dialog_cx = w // 2
    dialog_cy = h // 2
    
    # "取消"按钮（白色边框矩形）- v6 版本修正
    # 根据截图视觉分析：白色边框的"取消"按钮在弹窗左侧
    btn_w = int(dialog_w * 0.45)
    btn_h = int(dialog_h * 0.35)
    btn_left = dialog_cx - dialog_w // 2 + int(dialog_w * 0.03)
    btn_right = btn_left + btn_w
    btn_top = dialog_cy + int(dialog_h * 0.05)
    btn_bottom = btn_top + btn_h
    
    print(f"\n弹窗区域: x[{dialog_cx - dialog_w // 2}-{dialog_cx + dialog_w // 2}], y[{dialog_cy - dialog_h // 2}-{dialog_cy + dialog_h // 2}]")
    print(f"'取消'按钮区域: x[{btn_left}-{btn_right}], y[{btn_top}-{btn_bottom}]")
    
    # 裁剪"取消"按钮模板
    cancel_btn_template = img[btn_top:btn_bottom, btn_left:btn_right]
    cv2.imwrite("cancel_btn_v6.png", cancel_btn_template)
    print(f"✓ 已保存模板: cancel_btn_v6.png ({cancel_btn_template.shape[1]}x{cancel_btn_template.shape[0]})")
    
    # 保存调试图
    debug_img = img.copy()
    cv2.rectangle(debug_img, (btn_left, btn_top), (btn_right, btn_bottom), (0, 255, 0), 3)
    cv2.rectangle(debug_img,
                  (dialog_cx - dialog_w // 2, dialog_cy - dialog_h // 2),
                  (dialog_cx + dialog_w // 2, dialog_cy + dialog_h // 2),
                  (255, 0, 0), 2)
    cv2.imwrite("debug_overlay_v6.png", debug_img)
    print("✓ 已保存调试图: debug_overlay_v6.png")
    
    # 4. 模板匹配
    print("\n[步骤2] 执行模板匹配...")
    match_pos, confidence = find_template(img, "cancel_btn_v6.png", threshold=0.5)
    
    if match_pos:
        mx, my = match_pos
        # 计算点击中心
        cx = mx + btn_w // 2
        cy = my + btn_h // 2
        print(f"\n✅ 找到匹配位置!")
        print(f"   模板位置: ({mx}, {my})")
        print(f"   点击中心: ({cx}, {cy})")
        print(f"   匹配置信度: {confidence:.4f}")
        
        # 5. 点击
        print("\n[步骤3] 执行点击...")
        click_at(cx, cy)
        print(f"✓ 已点击位置 ({cx}, {cy})")
        
        # 等待
        time.sleep(2)
        
        # 6. 验证
        print("\n[步骤4] 验证弹窗状态...")
        verify_img = screenshot()
        cv2.imwrite("after_cancel_v6.png", verify_img)
        
        # 检查是否还在
        _, conf2 = find_template(verify_img, "cancel_btn_v6.png", threshold=0.5)
        if conf2 > 0.5:
            print(f"⚠️ 弹窗可能仍存在 (置信度: {conf2:.4f})")
        else:
            print("✓ 弹窗已关闭")
            
    else:
        print(f"\n❌ 未找到匹配 (最高置信度: {confidence:.4f})")
        print("   尝试使用系统返回键...")
        subprocess.run(f"adb -s {DEVICE_ID} shell input keyevent 4", 
                      shell=True, capture_output=True, timeout=10)
        time.sleep(1.5)
        adb_screenshot()
        print("✓ 已执行返回操作并截图")

if __name__ == "__main__":
    main()
    print("\n" + "=" * 60)
    print("  执行完毕")
    print("=" * 60)
