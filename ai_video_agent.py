#!/usr/bin/env python3
"""
AI 驱动的图片优化与视频生成 Agent
利用 GLM 图生文能力 + FFmpeg 执行

流程：图片 → GLM分析 → 生成指令 → FFmpeg执行 → 输出视频
"""

import os
import json
import urllib.request
import base64
import subprocess
import sys
import shutil
from datetime import datetime
from pathlib import Path
from PIL import Image

# FFmpeg 执行路径
FFmpeg_exe = None

# ============== 配置 ==============
CONFIG = {
    'glm_api_key': '4c5103ef14254a5da223e5de0bd27879.Pt0orCbAoQGgXwSU',
    'glm_model': 'glm-4.6v-flashx',
    'glm_timeout': 120,
    
    'input_dir': Path(__file__).parent / 'input_images',
    'output_dir': Path(__file__).parent / 'output_videos',
    'temp_dir': Path(__file__).parent / '.temp_ai_video',
    
    'fps': 30,
    'width': 1920,
    'height': 1080,
}

# ============== 智谱 API ==============

def image_to_base64(image_path):
    """图片转 base64"""
    with open(image_path, 'rb') as f:
        return base64.b64encode(f.read()).decode('utf-8')


def call_glm(image_path, prompt, model=None):
    """调用 GLM 分析图片"""
    model = model or CONFIG['glm_model']
    image_b64 = image_to_base64(image_path)
    
    payload = json.dumps({
        'model': model,
        'messages': [{
            'role': 'user',
            'content': [
                {
                    'type': 'image_url',
                    'image_url': {
                        'url': 'data:image/png;base64,' + image_b64
                    }
                },
                {'type': 'text', 'text': prompt}
            ]
        }]
    }).encode('utf-8')
    
    url = 'https://open.bigmodel.cn/api/paas/v4/chat/completions'
    req = urllib.request.Request(
        url,
        data=payload,
        headers={
            'Authorization': f'Bearer {CONFIG["glm_api_key"]}',
            'Content-Type': 'application/json'
        }
    )
    
    try:
        resp = urllib.request.urlopen(req, timeout=CONFIG['glm_timeout'])
        result = json.loads(resp.read().decode('utf-8'))
        return result['choices'][0]['message']['content'], None
    except Exception as e:
        return None, str(e)


# ============== FFmpeg 工具 ==============

def check_ffmpeg():
    """检查 FFmpeg（优先 imageio-ffmpeg，其次系统 ffmpeg）"""
    global FFmpeg_exe
    FFmpeg_exe = None
    
    # 尝试 imageio-ffmpeg
    try:
        import imageio_ffmpeg
        FFmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
        if FFmpeg_exe and os.path.exists(FFmpeg_exe):
            return True
    except:
        pass
    
    # 尝试系统 ffmpeg
    try:
        result = subprocess.run(['ffmpeg', '-version'], capture_output=True, timeout=5)
        if result.returncode == 0:
            FFmpeg_exe = 'ffmpeg'
            return True
    except FileNotFoundError:
        pass
    
    return False


def parse_filter_command(response_text):
    """
    从 GLM 响应中提取 FFmpeg 命令
    
    GLM 返回示例：
    "推荐滤镜: eq=brightness=0.15:saturation=1.3, 视频时长: 5 秒, 标题: '高光时刻'"
    
    或者返回完整 JSON：
    {"filter": "eq=brightness=0.15:saturation=1.3", "duration": 5, "title": "高光时刻"}
    """
    # 尝试解析 JSON
    try:
        # 查找 JSON 块
        json_start = response_text.find('{')
        json_end = response_text.rfind('}') + 1
        if json_start >= 0 and json_end > json_start:
            data = json.loads(response_text[json_start:json_end])
            return data
    except:
        pass
    
    # 回退到文本解析
    data = {
        'filter': '',
        'duration': 3,
        'title': '',
        'subtitle': '',
        'style': 'normal'
    }
    
    # 提取滤镜
    if 'filter' in response_text.lower() or 'eq=' in response_text:
        import re
        match = re.search(r'eq=[^"\s}]+', response_text)
        if match:
            data['filter'] = match.group()
    
    # 提取时长
    duration_match = re.search(r'(\d+)\s*秒|(\d+)\s*second', response_text)
    if duration_match:
        data['duration'] = int(duration_match.group(1) or duration_match.group(2))
    
    # 提取标题
    title_match = re.search(r'标题[:：]?\s*["\']?([^"\']+)["\']?', response_text)
    if title_match:
        data['title'] = title_match.group(1).strip()
    
    # 检测风格关键词
    style_keywords = {
        '复古': 'vintage',
        'vintage': 'vintage',
        '电影': 'cinematic',
        'cinematic': 'cinematic',
        '鲜艳': 'vibrant',
        'vibrant': 'vibrant',
        '黑白': 'noir',
        'noir': 'noir',
        '暖色': 'warm',
        'warm': 'warm',
    }
    for cn, en in style_keywords.items():
        if cn in response_text or en in response_text.lower():
            data['style'] = en
            break
    
    return data


# ============== 视频生成 ==============

def create_video_with_instruction(images, instruction, output_path, ffmpeg_exe=None):
    """
    根据 AI 生成的指令创建视频
    
    instruction: {"filter": "...", "duration": 3, "title": "...", "style": "..."}
    """
    global FFmpeg_exe
    if ffmpeg_exe:
        FFmpeg_exe = ffmpeg_exe
    temp_dir = CONFIG['temp_dir']
    temp_dir.mkdir(exist_ok=True)
    
    fps = CONFIG['fps']
    width = CONFIG['width']
    height = CONFIG['height']
    
    # 处理图片
    processed_images = []
    for i, img_path in enumerate(images):
        img = Image.open(img_path)
        
        # 模式转换
        if img.mode == 'RGBA':
            background = Image.new('RGB', img.size, (255, 255, 255))
            background.paste(img, mask=img.split()[3])
            img = background
        elif img.mode != 'RGB':
            img = img.convert('RGB')
        
        # 缩放
        img_ratio = img.size[0] / img.size[1]
        target_ratio = width / height
        
        if img_ratio > target_ratio:
            new_w = width
            new_h = int(height * img_ratio / target_ratio)
        else:
            new_h = height
            new_w = int(width * target_ratio / img_ratio)
        
        img = img.resize((new_w, new_h), Image.LANCZOS)
        
        # 居中裁剪/填充
        canvas = Image.new('RGB', (width, height), (0, 0, 0))
        x = (width - new_w) // 2
        y = (height - new_h) // 2
        canvas.paste(img, (x, y))
        
        # 添加标题文字
        if instruction.get('title'):
            from PIL import ImageDraw, ImageFont
            draw = ImageDraw.Draw(canvas)
            
            # 找字体
            font_path = None
            for p in [
                r'C:\Windows\Fonts\simhei.ttf',
                r'C:\Windows\Fonts\msyh.ttc',
                r'C:\Windows\Fonts\STHeiti.ttf',
            ]:
                if os.path.exists(p):
                    font_path = p
                    break
            
            if font_path:
                try:
                    font = ImageFont.truetype(font_path, min(width, height) // 25)
                except:
                    font = ImageFont.load_default()
            else:
                font = ImageFont.load_default()
            
            # 文字背景条
            text = instruction['title']
            bbox = draw.textbbox((0, 0), text, font=font)
            tw = bbox[2] - bbox[0]
            th = bbox[3] - bbox[1]
            
            # 半透明背景
            overlay = Image.new('RGBA', canvas.size, (0, 0, 0, 0))
            odraw = ImageDraw.Draw(overlay)
            odraw.rectangle([20, 30, 20 + tw + 40, 30 + th + 20], fill=(0, 0, 0, 150))
            canvas = Image.alpha_composite(canvas.convert('RGBA'), overlay).convert('RGB')
            draw = ImageDraw.Draw(canvas)
            
            draw.text(((width - tw) // 2, 35), text, fill=(255, 255, 255), font=font)
        
        # 保存
        temp_path = temp_dir / f'frame_{i:04d}.jpg'
        canvas.save(temp_path, 'JPEG', quality=95)
        processed_images.append(temp_path)
    
    # 计算每张图需要显示的帧数
    total_duration = instruction.get('duration', 3)
    num_images = len(processed_images)
    # 每张图片重复的帧数 = 目标时长 / 图片数量 * fps
    frames_per_image = int((total_duration / num_images) * fps)
    if frames_per_image < 1:
        frames_per_image = 1
    print(f"   目标时长 {total_duration}s, {num_images} 张图, FPS {fps}")
    print(f"   每张图重复 {frames_per_image} 帧 = 实际时长约 {frames_per_image * num_images / fps:.2f}s")
    
    # 创建 concat 列表 - 每张图重复多帧来实现时长控制
    concat_list = temp_dir / 'concat.txt'
    with open(concat_list, 'w') as f:
        for img in processed_images:
            img_path = str(img.absolute()).replace('\\', '/')
            # 每张图重复 frames_per_image 次
            for _ in range(frames_per_image):
                f.write(f"file '{img_path}'\n")
    
    # 构建 FFmpeg 滤镜链
    filter_chain = f'fps={fps},scale={width}:{height}'
    
    # 添加 AI 推荐的滤镜
    if instruction.get('filter'):
        filter_chain += f',{instruction["filter"]}'
    elif instruction.get('style'):
        style_filters = {
            'vintage': 'colorchannelmixer=.3:.4:.3:0:.3:.4:.3:0:.3:.4:.3',
            'cinematic': 'lutrgb=r=max(val*0.8,0):g=max(val*0.85,0):b=min(val*0.7,255)',
            'vibrant': 'eq=saturation=1.3:contrast=1.1',
            'noir': 'blackandwhite',
            'warm': 'colorchannelmixer=rr=1.1:rg=0:rb=-0.1:gr=0.05:gg=1:gb=0:br=-0.1:bg=0:bb=1.1',
        }
        filter_chain += f',{style_filters.get(instruction["style"], "")}'
    
    # FFmpeg 命令 - 提高质量，CRF 18 更好
    cmd = [
        FFmpeg_exe, '-y',
        '-f', 'concat',
        '-safe', '0',
        '-i', str(concat_list),
        '-vf', filter_chain,
        '-c:v', 'libx264',
        '-crf', '18',  # 18比23质量更好
        '-preset', 'medium',
        '-pix_fmt', 'yuv420p',
        str(output_path)
    ]
    
    result = subprocess.run(cmd, capture_output=True, text=True)
    
    # 清理
    shutil.rmtree(temp_dir, ignore_errors=True)
    
    if result.returncode != 0:
        return False, f"FFmpeg 错误:\n{result.stderr}"
    
    return True, str(output_path)


# ============== 主流程 ==============

def run_ai_video_agent(image_path, user_prompt, ffmpeg_exe=None):
    """
    完整流程：AI分析 → 生成指令 → 创建视频
    
    示例：
    image_path = 'input_images/game_screenshot.png'
    user_prompt = '优化这张图片并制作成 5 秒短视频，风格要复古'
    """
    global FFmpeg_exe
    if ffmpeg_exe:
        FFmpeg_exe = ffmpeg_exe
    else:
        # 确保 FFmpeg_exe 已初始化
        if FFmpeg_exe is None:
            check_ffmpeg()
    
    if FFmpeg_exe is None:
        print("❌ FFmpeg 不可用")
        return None
    
    print("=" * 60)
    print("  🤖 AI 视频生成 Agent")
    print(f"  FFmpeg: {FFmpeg_exe}")
    print("=" * 60)
    
    # Step 1: 调用 GLM 分析
    print(f"\n[1/3] 📸 分析图片...")
    
    full_prompt = f"""
你正在分析一张图片并为其生成视频制作指令。

用户要求：{user_prompt}

请按照以下 JSON 格式返回你的分析和指令：

{{
    "filter": "FFmpeg 滤镜参数，如 eq=brightness=0.1:saturation=1.2",
    "duration": 5,
    "title": "视频标题",
    "style": "视频风格: vintage/cinematic/vibrant/noir/warm/normal",
    "description": "简短的图片内容描述"
}}

要求：
1. filter 必须是有效的 FFmpeg 滤镜表达式
2. duration 是整数秒（1-10）
3. title 不超过 20 字符
4. style 必须是指定选项之一
5. 只返回 JSON，不要其他文字
"""
    
    response, error = call_glm(image_path, full_prompt)
    
    if error:
        print(f"❌ API 调用失败: {error}")
        return None
    
    print(f"   GLM 响应:")
    print(f"   └─ {response[:200]}...")
    
    # Step 2: 解析指令
    print(f"\n[2/3] 🔧 解析指令...")
    
    instruction = parse_filter_command(response)
    print(f"   滤镜: {instruction['filter'] or instruction['style']}")
    print(f"   时长: {instruction['duration']}秒")
    print(f"   标题: {instruction['title']}")
    print(f"   风格: {instruction['style']}")
    
    # Step 3: 生成视频
    print(f"\n[3/3] 🎬 生成视频...")
    
    CONFIG['output_dir'].mkdir(parents=True, exist_ok=True)
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    output_path = CONFIG['output_dir'] / f'ai_video_{timestamp}.mp4'
    
    success, result = create_video_with_instruction(
        [Path(image_path)],
        instruction,
        output_path,
        FFmpeg_exe
    )
    
    if not success:
        print(f"❌ 视频生成失败: {result}")
        return None
    
    file_size = os.path.getsize(result) / (1024 * 1024)
    print(f"\n✅ 视频已生成: {result}")
    print(f"   文件大小: {file_size:.2f} MB")
    print(f"   时长: {instruction['duration']}秒")
    
    # 保存分析记录
    record_file = CONFIG['output_dir'] / f'analysis_{timestamp}.json'
    with open(record_file, 'w', encoding='utf-8') as f:
        json.dump({
            'image': str(image_path),
            'user_prompt': user_prompt,
            'glm_response': response,
            'instruction': instruction,
            'output': str(result),
            'timestamp': datetime.now().isoformat()
        }, f, ensure_ascii=False, indent=2)
    
    print(f"\n📝 分析记录: {record_file}")
    
    return result


# ============== 交互式主入口 ==============

def main():
    print("=" * 60)
    print("  🤖 AI 驱动的视频生成工具")
    print("  图片 → GLM分析 → FFmpeg执行 → 视频")
    print("=" * 60)
    
    if not check_ffmpeg():
        print("\n❌ FFmpeg 未安装，请安装后重试：https://ffmpeg.org/download.html")
        sys.exit(1)
    
    # 检查输入目录
    input_dir = CONFIG['input_dir']
    if not input_dir.exists():
        input_dir.mkdir(parents=True, exist_ok=True)
        print(f"\n📁 请放入图片到: {input_dir}")
        return
    
    # 获取图片
    supported = {'.png', '.jpg', '.jpeg', '.bmp', '.webp'}
    images = []
    for ext in supported:
        images.extend(input_dir.glob(f'*{ext}'))
        images.extend(input_dir.glob(f'*{ext.upper()}'))
    images = sorted(images)
    
    if not images:
        print(f"\n⚠️ 输入目录为空: {input_dir}")
        return
    
    print(f"\n📸 找到 {len(images)} 张图片:")
    for img in images:
        print(f"   • {img.name}")
    
    # 选择图片
    print("\n选择要处理的图片（输入编号或Enter全选）：")
    selection = input(f"   1-{len(images)}, 或 Enter 全选: ").strip()
    
    if selection.lower() == 'all' or selection == '':
        selected = images
    else:
        try:
            idx = int(selection) - 1
            selected = [images[idx]]
        except:
            print("❌ 无效输入，使用第一张图片")
            selected = [images[0]]
    
    # 用户描述需求
    print("\n" + "-" * 40)
    print("  描述你的需求（AI 会帮你生成优化方案）")
    print("-" * 40)
    user_prompt = input("   例如：'把图片调亮，做成复古风格的 5 秒视频'：\n   → ").strip()
    
    if not user_prompt:
        print("⚠️ 没有输入描述，使用默认方案")
        user_prompt = "优化图片色彩，生成 3 秒短视频"
    
    # 运行 Agent
    print("\n" + "=" * 60)
    print("  开始处理...")
    print("=" * 60)
    
    result = run_ai_video_agent(str(selected[0]), user_prompt)
    
    if result:
        print("\n" + "=" * 60)
        print("  🎉 完成！")
        print("=" * 60)
        print(f"\n  输出文件: {result}")
        print(f"  用播放器打开查看效果：")
        print(f"  start {result}")


if __name__ == '__main__':
    main()
