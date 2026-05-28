#!/usr/bin/env python3
"""
一键图片转视频工具
功能：批量图片 → 视频（支持滤镜、文字、转场）
依赖：FFmpeg（需预先安装）
"""

import os
import subprocess
import sys
import json
import shutil
from datetime import datetime
from pathlib import Path
from PIL import Image

# ============== 配置区 ==============
CONFIG = {
    # 输入输出路径
    'input_dir': Path(__file__).parent / 'input_images',
    'output_dir': Path(__file__).parent / 'output_videos',
    
    # FFmpeg 设置
    'fps': 30,                    # 帧率
    'video_codec': 'libx264',     # 编码格式
    'video_quality': 23,          # CRF质量 (0-51, 越小越好)
    'output_format': 'mp4',       # 输出格式
    
    # 视频参数
    'width': 1920,
    'height': 1080,
    
    # 默认滤镜（可覆盖）
    'default_filter': '',
    
    # 文字设置
    'font_path': None,  # Windows 自动查找字体，或指定路径
}

# ============== 工具函数 ==============

def check_ffmpeg():
    """检查FFmpeg是否可用"""
    try:
        result = subprocess.run(
            ['ffmpeg', '-version'],
            capture_output=True,
            timeout=5
        )
        return result.returncode == 0
    except FileNotFoundError:
        return False


def find_font():
    """自动查找可用字体"""
    font_paths = [
        # Windows
        r'C:\Windows\Fonts\simhei.ttf',        # 黑体
        r'C:\Windows\Fonts\simsun.ttc',        # 宋体
        r'C:\Windows\Fonts\msyh.ttc',          # 微软雅黑
        r'C:\Windows\Fonts\STHeiti.ttf',       # 华文黑体
        r'C:\Windows\Fonts\msyhbd.ttf',        # 微软雅黑粗体
        # macOS/Linux
        '/usr/share/fonts/truetype/droid/DroidSansFallbackFull.ttf',
        '/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc',
    ]
    
    for path in font_paths:
        if os.path.exists(path):
            return path
    
    return None


def get_image_files(input_dir):
    """获取所有图片文件（按文件名排序）"""
    supported = {'.png', '.jpg', '.jpeg', '.bmp', '.webp', '.gif'}
    files = []
    
    for ext in supported:
        files.extend(input_dir.glob(f'*{ext}'))
        files.extend(input_dir.glob(f'*{ext.upper()}'))
    
    return sorted(files)


def image_to_resized(image_path, width, height):
    """调整图片尺寸（保持比例，居中填充）"""
    img = Image.open(image_path)
    
    # 转换模式
    if img.mode == 'RGBA':
        # 带透明通道的PNG
        background = Image.new('RGB', img.size, (255, 255, 255))
        background.paste(img, mask=img.split()[3])
        img = background
    elif img.mode != 'RGB':
        img = img.convert('RGB')
    
    # 计算缩放比例
    img_width, img_height = img.size
    target_ratio = width / height
    img_ratio = img_width / img_height
    
    if img_ratio > target_ratio:
        # 图片更宽，按宽度缩放
        new_width = width
        new_height = int(height * img_ratio / target_ratio)
    else:
        # 图片更高，按高度缩放
        new_height = height
        new_width = int(width * target_ratio / img_ratio)
    
    img = img.resize((new_width, new_height), Image.LANCZOS)
    
    # 创建画布，居中粘贴
    canvas = Image.new('RGB', (width, height), (0, 0, 0))
    x = (width - new_width) // 2
    y = (height - new_height) // 2
    canvas.paste(img, (x, y))
    
    return canvas


def generate_transition_frame(width, height, transition_type='fade'):
    """生成转场帧（黑场/白场/渐变）"""
    img = Image.new('RGB', (width, height), (0, 0, 0))
    return img


def create_video_ffmpeg(input_images, output_path, config):
    """使用FFmpeg创建视频"""
    if not input_images:
        return False, "没有找到输入图片"
    
    fps = config['fps']
    width = config['width']
    height = config['height']
    quality = config['video_quality']
    
    # 临时目录，存放处理后的图片
    temp_dir = Path(__file__).parent / '.temp_processed'
    temp_dir.mkdir(exist_ok=True)
    
    processed_images = []
    
    print(f"  正在处理 {len(input_images)} 张图片...")
    
    for i, img_path in enumerate(input_images):
        print(f"    [{i+1}/{len(input_images)}] {img_path.name}")
        
        # 调整尺寸
        resized = image_to_resized(str(img_path), width, height)
        temp_path = temp_dir / f'{i:04d}.jpg'
        resized.save(temp_path, 'JPEG', quality=95)
        processed_images.append(temp_path)
    
    # 计算每张图的显示帧数（默认每张2秒）
    default_duration_per_image = 2.0  # 每张图默认2秒
    frames_per_image = int(default_duration_per_image * fps)
    if frames_per_image < 1:
        frames_per_image = 1
    
    print(f"  每张图显示 {frames_per_image} 帧 (约 {default_duration_per_image:.1f}秒)")
    
    # 创建 concat 列表 - 每张图重复多帧来实现时长控制
    concat_list = temp_dir / 'concat_list.txt'
    with open(concat_list, 'w') as f:
        for img in processed_images:
            img_path = str(img.absolute()).replace('\\', '/')
            # 每张图重复 frames_per_image 次
            for _ in range(frames_per_image):
                f.write(f"file '{img_path}'\n")
    
    output_dir = config['output_dir']
    output_dir.mkdir(exist_ok=True)
    
    # 自动生成文件名
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    output_file = output_dir / f'video_{timestamp}.{config["output_format"]}'
    
    # 获取FFmpeg路径
    import imageio_ffmpeg
    ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
    
    # FFmpeg concat 命令 - 提高质量
    cmd = [
        ffmpeg_exe, '-y',  # 覆盖输出
        '-f', 'concat',
        '-safe', '0',
        '-i', str(concat_list),
        '-vf', f'fps={fps},scale={width}:{height}',
        '-c:v', config['video_codec'],
        '-crf', str(config['video_quality']),
        '-preset', 'medium',
        '-pix_fmt', 'yuv420p',  # 兼容性问题
        str(output_file)
    ]
    
    print(f"\n  正在编码视频... (约 {len(input_images) * 2:.1f} 秒)")
    
    result = subprocess.run(cmd, capture_output=True, text=True)
    
    if result.returncode != 0:
        return False, f"FFmpeg 错误:\n{result.stderr}"
    
    # 清理临时文件
    import shutil
    shutil.rmtree(temp_dir, ignore_errors=True)
    
    return True, str(output_file)


def create_video_with_slide(config, title_text=None, subtitle_text=None):
    """
    创建带文字和转场的视频
    """
    output_dir = config['output_dir']
    output_dir.mkdir(exist_ok=True)
    temp_dir = Path(__file__).parent / '.temp_processed'
    temp_dir.mkdir(exist_ok=True)
    
    width = config['width']
    height = config['height']
    
    # 如果没有输入图片，创建标题幻灯片
    if not config.get('input_images') or len(config.get('input_images', [])) == 0:
        print("  创建议题幻灯片...")
        
        # 创建背景图
        img = Image.new('RGB', (width, height), (30, 30, 46))  # 深色背景
        
        # 添加渐变效果
        from PIL import ImageDraw
        draw = ImageDraw.Draw(img)
        
        for y in range(height):
            alpha = int(255 * (y / height) * 0.3)
            draw.line([(0, y), (width, y)], fill=(alpha + 30, alpha + 30, alpha + 46))
        
        # 添加文字
        font_path = find_font()
        font_size = min(width, height) // 12
        
        if font_path:
            from PIL import ImageFont
            font = ImageFont.truetype(font_path, font_size)
            subtitle_font = ImageFont.truetype(font_path, font_size // 2)
        else:
            font = ImageFont.load_default()
            subtitle_font = font
        
        # 绘制文字
        if title_text:
            # 标题居中
            bbox = draw.textbbox((0, 0), title_text, font=font)
            text_width = bbox[2] - bbox[0]
            text_x = (width - text_width) // 2
            text_y = height // 2 - font_size // 2
            draw.text((text_x, text_y), title_text, fill=(255, 255, 255), font=font)
        
        if subtitle_text:
            bbox = draw.textbbox((0, 0), subtitle_text, font=subtitle_font)
            text_width = bbox[2] - bbox[0]
            text_x = (width - text_width) // 2
            text_y = height // 2 + font_size // 2
            draw.text((text_x, text_y), subtitle_text, fill=(180, 180, 200), font=subtitle_font)
        
        # 保存
        slide_path = temp_dir / 'slide_0000.jpg'
        img.save(slide_path, 'JPEG', quality=95)
        config['input_images'] = [slide_path]
    
    # 使用主创建函数
    return create_video_ffmpeg(config['input_images'], None, config)


def apply_filter_to_video(input_video, output_video, filter_type='vintage'):
    """
    对已有视频应用滤镜
    
    支持滤镜：
    - vintage: 复古色调
    - cinematic: 电影感
    - vibrant: 鲜艳
    - noir: 黑白电影
    - warm: 暖色调
    """
    filters = {
        'vintage': 'colorchannelmixer=.3:.4:.3:0:.3:.4:.3:0:.3:.4:.3,scale=1.1',
        'cinematic': 'lutrgb=r=max(val*0.8,0):g=max(val*0.85,0):b=min(val*0.7,255),curves=preset=backup',
        'vibrant': 'eq=saturation=1.3:contrast=1.1:brightness=0.05',
        'noir': 'color=black:enable="between(t,0,10)",blackandwhite',
        'warm': 'colorchannelmixer=rr=1.1:rg=0:rb=-0.1:gr=0.05:gg=1:gb=0:br=-0.1:bg=0:bb=1.1',
        'fade': 'fade=t=in:st=0:d=1,fade=t=out:st=10:d=1',
    }
    
    if filter_type not in filters:
        return False, f"不支持的滤镜: {filter_type}"
    
    cmd = [
        'ffmpeg', '-y',
        '-i', str(input_video),
        '-vf', filters[filter_type],
        '-c:v', 'libx264',
        '-crf', '23',
        '-pix_fmt', 'yuv420p',
        str(output_video)
    ]
    
    result = subprocess.run(cmd, capture_output=True, text=True)
    
    if result.returncode != 0:
        return False, f"FFmpeg 错误:\n{result.stderr}"
    
    return True, str(output_video)


def add_watermark_to_video(input_video, output_video, text='© MyVideo', position='se'):
    """给视频添加水印文字"""
    cmd = [
        'ffmpeg', '-y',
        '-i', str(input_video),
        '-vf', f"drawtext=text='{text}':fontsize=24:fontcolor=white:x='w-text_w-10':y='h-text_h-10'",
        '-c:v', 'libx264',
        '-crf', '23',
        '-pix_fmt', 'yuv420p',
        str(output_video)
    ]
    
    result = subprocess.run(cmd, capture_output=True, text=True)
    
    if result.returncode != 0:
        return False, f"FFmpeg 错误:\n{result.stderr}"
    
    return True, str(output_video)


# ============== CLI 界面 ==============

def print_banner():
    print("=" * 60)
    print("  🎬 一键图片转视频工具")
    print("  图片序列 → 视频（支持滤镜、文字、转场）")
    print("=" * 60)


def main_interactive():
    """交互式运行"""
    print_banner()
    
    if not check_ffmpeg():
        print("\n❌ FFmpeg 未安装！")
        print("\n  安装方法：")
        print("  Windows: 下载安装 https://ffmpeg.org/download.html")
        print("  或使用 Chocolatey: choco install ffmpeg")
        print("  macOS: brew install ffmpeg")
        print("  Linux: sudo apt install ffmpeg")
        sys.exit(1)
    
    # 检查输入目录
    if not CONFIG['input_dir'].exists():
        CONFIG['input_dir'].mkdir(parents=True, exist_ok=True)
        print(f"\n📁 创建了输入目录: {CONFIG['input_dir']}")
        print("   请放入图片后重新运行！")
        return
    
    images = get_image_files(CONFIG['input_dir'])
    if not images:
        print(f"\n⚠️ 输入目录为空: {CONFIG['input_dir']}")
        print("   请放入图片文件（支持 .jpg, .png, .webp）")
        return
    
    print(f"\n📸 找到 {len(images)} 张图片:")
    for img in images:
        size_kb = img.stat().st_size / 1024
        print(f"   • {img.name} ({size_kb:.1f} KB)")
    
    # 询问设置
    print("\n" + "-" * 40)
    print("  配置选项（直接回车使用默认）")
    print("-" * 40)
    
    fps_input = input(f"  帧率 [默认 {CONFIG['fps']}]: ").strip()
    fps = int(fps_input) if fps_input else CONFIG['fps']
    
    duration_input = input("  每张显示秒数 [默认 2.0]: ").strip()
    duration = float(duration_input) if duration_input else 2.0
    
    quality_input = input("  视频质量 0-51 (越小越好) [默认 23]: ").strip()
    quality = int(quality_input) if quality_input else CONFIG['video_quality']
    
    filter_input = input("  应用滤镜 [vintage/cinematic/vibrant/noir/warm/无]: ").strip().lower()
    apply_filter = filter_input if filter_input and filter_input != '无' and filter_input != 'none' else None
    
    watermark_input = input("  添加水印文字（留空跳过）: ").strip()
    
    # 修改配置
    CONFIG['fps'] = fps
    CONFIG['video_quality'] = quality
    if apply_filter:
        CONFIG['default_filter'] = apply_filter
    
    # 创建视频
    print("\n" + "=" * 60)
    print("  开始处理...")
    print("=" * 60)
    
    success, result = create_video_ffmpeg(images, None, CONFIG)
    
    if not success:
        print(f"\n❌ 失败: {result}")
        return
    
    print(f"\n✅ 视频已生成: {result}")
    
    video_size = os.path.getsize(result) / (1024 * 1024)
    print(f"   文件大小: {video_size:.2f} MB")
    
    # 应用滤镜
    if apply_filter:
        print(f"\n  正在应用滤镜: {apply_filter}...")
        filter_output = CONFIG['output_dir'] / f'filtered_{Path(result).name}'
        success, result = apply_filter_to_video(result, str(filter_output), apply_filter)
        if success:
            print(f"   ✅ 滤镜视频: {result}")
    
    # 添加水印
    if watermark_input:
        print(f"\n  正在添加水印...")
        wm_output = CONFIG['output_dir'] / f'watermarked_{Path(result).name}'
        success, result = add_watermark_to_video(result, str(wm_output), watermark_input)
        if success:
            print(f"   ✅ 水印视频: {result}")
    
    print("\n" + "=" * 60)
    print("  🎉 完成！")
    print("=" * 60)
    print(f"\n  输出目录: {CONFIG['output_dir']}")
    print("  再次运行可重新生成新视频")


if __name__ == '__main__':
    main_interactive()
