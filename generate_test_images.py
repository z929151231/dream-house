#!/usr/bin/env python3
"""
生成测试图片用于视频制作测试
"""

from PIL import Image, ImageDraw, ImageFont
import os
from pathlib import Path

output_dir = Path(__file__).parent / 'input_images'
output_dir.mkdir(exist_ok=True)

# 查找字体
def find_font():
    font_paths = [
        r'C:\Windows\Fonts\simhei.ttf',
        r'C:\Windows\Fonts\msyh.ttc',
        r'C:\Windows\Fonts\STHeiti.ttf',
    ]
    for p in font_paths:
        if os.path.exists(p):
            return p
    return None

font_path = find_font()

colors = [
    (45, 55, 72),    # 深灰蓝
    (66, 153, 225),  # 蓝色
    (102, 126, 234), # 靛蓝
    (128, 90, 213),  # 紫色
    (160, 92, 177),  # 紫红
]

for i in range(5):
    # 创建1920x1080图片
    img = Image.new('RGB', (1920, 1080), colors[i])
    draw = ImageDraw.Draw(img)
    
    # 添加渐变效果
    for y in range(1080):
        factor = y / 1080
        r = int(colors[i][0] * (1 - factor * 0.3))
        g = int(colors[i][1] * (1 - factor * 0.3))
        b = int(colors[i][2] * (1 - factor * 0.3))
        draw.line([(0, y), (1920, y)], fill=(r, g, b))
    
    # 添加文字
    if font_path:
        try:
            font = ImageFont.truetype(font_path, 80)
            small_font = ImageFont.truetype(font_path, 40)
        except:
            font = ImageFont.load_default()
            small_font = font
    else:
        font = ImageFont.load_default()
        small_font = font
    
    # 标题
    text = f"Slide {i+1}"
    bbox = draw.textbbox((0, 0), text, font=font)
    tw = bbox[2] - bbox[0]
    draw.text(((1920 - tw) // 2, 450), text, fill=(255, 255, 255), font=font)
    
    # 副标题
    subtitle = f"Test video frame {i+1}/5"
    bbox = draw.textbbox((0, 0), subtitle, font=small_font)
    tw = bbox[2] - bbox[0]
    draw.text(((1920 - tw) // 2, 550), subtitle, fill=(200, 200, 200), font=small_font)
    
    # 保存
    output_path = output_dir / f'frame_{i+1:02d}.jpg'
    img.save(output_path, 'JPEG', quality=95)
    print(f"✅ 生成: {output_path.name}")

print(f"\n📁 测试图片已保存到: {output_dir}")
