#!/usr/bin/env python3
"""
快速演示：AI 分析单张图片并生成视频
"""

import sys
import os

# 确保在正确目录
os.chdir(os.path.dirname(os.path.abspath(__file__)))

# 添加本地路径
sys.path.insert(0, '.')

# 手动设置 FFmpeg
import subprocess
result = subprocess.run(
    ['C:\\Users\\zxr\\.workbuddy\\binaries\\python\\versions\\3.13.12\\python.exe', '-c',
     'import imageio_ffmpeg; print(imageio_ffmpeg.get_ffmpeg_exe())'],
    capture_output=True, text=True
)
ffmpeg_path = result.stdout.strip()
print(f"FFmpeg: {ffmpeg_path}")

if not ffmpeg_path or 'ffmpeg' not in ffmpeg_path.lower():
    print("❌ FFmpeg 不可用")
    sys.exit(1)

# 现在导入主模块
from ai_video_agent import run_ai_video_agent, FFmpeg_exe
from pathlib import Path

# 使用测试图片
image = Path('input_images/frame_01.jpg')

if not image.exists():
    print("❌ 找不到测试图片")
    sys.exit(1)

print(f"\n🖼️ 测试图片: {image}")
print(f"💬 用户指令: 分析这张图片，优化色彩，生成5秒复古风格短视频\n")

result = run_ai_video_agent(str(image), "分析这张图片，优化色彩，生成5秒复古风格短视频")

if result:
    print(f"\n✅ 视频已生成: {result}")
