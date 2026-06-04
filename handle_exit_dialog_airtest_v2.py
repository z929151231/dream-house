"""
使用 Airtest 图像识别精确点击"取消"按钮
v2: 更精确裁剪模板区域
"""
from airtest.core.api import G, snapshot, exists, touch, Template, connect_device
from airtest.core.android.android import Android
import cv2
import os

# 设备连接
dev = Android("R5CW91XQEGF")
G.DEVICE = dev

# 截图并裁剪"取消"按钮精确区域
img = G.DEVICE.shell("screencap -p /data/local/tmp/screen.png")
G.DEVICE.shell("pull /data/local/tmp/screen.png ./current_screen.png")
img = cv2.imread("current_screen.png")

print(f"截图尺寸: {img.shape[1]} x {img.shape[0]}")

# 精确裁剪"取消"按钮区域 (基于 v4 截图的精确坐标)
# "取消"按钮位置: x[275-389], y[1322-1370]
btn_region = img[1322:1370, 275:389]
cv2.imwrite("cancel_btn_exact.png", btn_region)
print("已裁剪精确的取消按钮模板")

# 显示模板供参考
# cv2.imshow("cancel_btn_exact", btn_region)
# cv2.waitKey(0)
# cv2.destroyAllWindows()

# 使用更低的阈值进行搜索
tpl = Template("cancel_btn_exact.png", threshold=0.5)
print("开始图像匹配...")
result = exists(tpl)

if result:
    click_x, click_y = result
    print(f"✅ 找到'取消'按钮: ({click_x}, {click_y})")
    
    # 点击按钮中心
    touch(result)
    print("✅ 已点击")
    
    # 等待关闭动画
    import time
    time.sleep(1.5)
    
    # 验证截图
    G.DEVICE.shell("screencap -p /data/local/tmp/verify.png")
    G.DEVICE.shell("pull /data/local/tmp/verify.png ./screen_verify_v2.png")
    print("已保存验证截图 screen_verify_v2.png")
else:
    print("❌ 未找到'取消'按钮，可能需要手动输入")
