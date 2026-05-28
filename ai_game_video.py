#!/usr/bin/env python3
"""
完整流程：ADB截图 → GLM分析 → AI优化 → 视频生成
一步到位的游戏视频制作工具
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

# ============== 配置 ==============
CONFIG = {
    # GLM API
    'glm_api_key': '4c5103ef14254a5da223e5de0bd27879.Pt0orCbAoQGgXwSU',
    'glm_model': 'glm-4.6v-flashx',
    'glm_timeout': 120,
    
    # ADB 设备
    'adb_device': None,  # None = 自动获取第一个设备
    
    # 路径
    'screenshots_dir': Path(__file__).parent / 'screenshots',
    'output_dir': Path(__file__).parent / 'output_videos',
    'temp_dir': Path(__file__).parent / '.temp_game_video',
    
    # 视频参数
    'fps': 30,
    'width': 1920,
    'height': 1080,
}

# ============== FFmpeg ==============

FFmpeg_exe = None

def init_ffmpeg():
    """初始化 FFmpeg"""
    global FFmpeg_exe
    try:
        import imageio_ffmpeg
        FFmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
        return FFmpeg_exe is not None and os.path.exists(FFmpeg_exe)
    except:
        return False


# ============== ADB ==============

def get_adb_devices():
    """获取所有连接的设备"""
    try:
        result = subprocess.run(['adb', 'devices'], capture_output=True, text=True, timeout=10)
        devices = []
        for line in result.stdout.split('\n'):
            if '\tdevice' in line:
                devices.append(line.split('\t')[0])
        return devices
    except:
        return []


def adb_screenshot(device_id=None, save_path=None):
    """ADB 截图"""
    if device_id is None:
        devices = get_adb_devices()
        if not devices:
            return None, "没有连接的设备"
        device_id = devices[0]
    
    CONFIG['screenshots_dir'].mkdir(parents=True, exist_ok=True)
    
    if save_path is None:
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        save_path = CONFIG['screenshots_dir'] / f'game_{timestamp}.png'
    
    temp_path = "/sdcard/screenshot_temp.png"
    
    # 截图
    cmd = f'adb -s {device_id} shell screencap {temp_path}'
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=30)
    if result.returncode != 0:
        return None, f"截图失败: {result.stderr}"
    
    # 拉取
    cmd = f'adb -s {device_id} pull {temp_path} "{save_path}"'
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=30)
    if result.returncode != 0:
        return None, f"拉取失败: {result.stderr}"
    
    # 清理
    subprocess.run(f'adb -s {device_id} shell rm {temp_path}', shell=True, capture_output=True)
    
    return str(save_path), None


# ============== GLM API ==============

def image_to_base64(image_path):
    """图片转 base64"""
    with open(image_path, 'rb') as f:
        return base64.b64encode(f.read()).decode('utf-8')


def call_glm(image_path, prompt):
    """调用 GLM 分析图片"""
    image_b64 = image_to_base64(image_path)
    
    payload = json.dumps({
        'model': CONFIG['glm_model'],
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


# ============== 视频生成 ==============

def generate_video_from_screenshots(screenshot_paths, instruction, output_path):
    """根据 AI 指令生成视频"""
    temp_dir = CONFIG['temp_dir']
    temp_dir.mkdir(exist_ok=True)
    
    width = CONFIG['width']
    height = CONFIG['height']
    fps = CONFIG['fps']
    
    # 处理每张截图
    processed = []
    for i, img_path in enumerate(screenshot_paths):
        img = Image.open(img_path)
        
        # 模式转换
        if img.mode == 'RGBA':
            bg = Image.new('RGB', img.size, (0, 0, 0))
            bg.paste(img, mask=img.split()[3])
            img = bg
        elif img.mode != 'RGB':
            img = img.convert('RGB')
        
        # 缩放（保持比例，居中填充）
        img_w, img_h = img.size
        target_ratio = width / height
        img_ratio = img_w / img_h
        
        if img_ratio > target_ratio:
            new_w, new_h = width, int(height * img_ratio / target_ratio)
        else:
            new_h, new_w = height, int(width * target_ratio / img_ratio)
        
        img = img.resize((new_w, new_h), Image.LANCZOS)
        
        # 居中填充
        canvas = Image.new('RGB', (width, height), (0, 0, 0))
        x = (width - new_w) // 2
        y = (height - new_h) // 2
        canvas.paste(img, (x, y))
        
        # 添加帧编号和时间戳
        from PIL import ImageDraw, ImageFont
        draw = ImageDraw.Draw(canvas)
        
        font_path = None
        for p in [
            r'C:\Windows\Fonts\simhei.ttf',
            r'C:\Windows\Fonts\msyh.ttc',
        ]:
            if os.path.exists(p):
                font_path = p
                break
        
        if font_path:
            try:
                font = ImageFont.truetype(font_path, 24)
            except:
                font = ImageFont.load_default()
        else:
            font = ImageFont.load_default()
        
        # 左下角显示帧信息
        text = f"Frame {i+1}/{len(screenshot_paths)}"
        draw.text((20, height - 50), text, fill=(255, 255, 255, 200), font=font)
        
        # 右上角显示时间戳
        ts = datetime.now().strftime('%H:%M:%S')
        draw.text((width - 150, 20), ts, fill=(255, 255, 255, 200), font=font)
        
        temp_path = temp_dir / f'frame_{i:04d}.jpg'
        canvas.save(temp_path, 'JPEG', quality=95)
        processed.append(temp_path)
    
    # 计算每张图的显示帧数
    total_duration = instruction.get('duration', 5)
    num_images = len(processed)
    frames_per_image = int((total_duration / num_images) * fps)
    if frames_per_image < 1:
        frames_per_image = 1
    print(f"   每张图显示 {frames_per_image} 帧 (约 {frames_per_image/fps:.2f}秒)")
    
    # 创建 concat 列表 - 每张图重复多帧来实现时长控制
    concat_list = temp_dir / 'concat.txt'
    with open(concat_list, 'w') as f:
        for img in processed:
            img_path = str(img.absolute()).replace('\\', '/')
            for _ in range(frames_per_image):
                f.write(f"file '{img_path}'\n")
    
    # 构建滤镜链
    filter_chain = f'fps={fps},scale={width}:{height}'
    
    # 合法的简单 FFmpeg 滤镜
    SIMPLE_FILTERS = {
        'eq': True, 'hue': True, 'colorbalance': True, 'colorchannelmixer': True,
        'curves': True, 'lutrgb': True, 'unsharp': True, 'boxblur': True,
        'gblur': True, 'vignette': True, 'fade': True, 'negate': True,
        'grayworld': True, 'blackandwhite': True, 'lumaconvert': True,
    }
    
    # 添加 AI 推荐的滤镜（仅使用简单滤镜）
    ai_filter = instruction.get('filter', '')
    if ai_filter:
        # 只保留已知的简单滤镜
        kept_filters = []
        for part in ai_filter.split(','):
            part = part.strip()
            if any(sf in part for sf in SIMPLE_FILTERS.keys()):
                kept_filters.append(part)
        if kept_filters:
            filter_chain += f',{",".join(kept_filters[:3])}'  # 最多 3 个
        elif ai_filter:
            print(f"   ⚠️ 跳过无法解析的滤镜: {ai_filter[:50]}...")
    
    # 添加风格滤镜（作为兜底）
    if instruction.get('style'):
        style_filters = {
            'vintage': 'colorchannelmixer=.3:.4:.3:0:.3:.4:.3:0:.3:.4:.3',
            'cinematic': 'lutrgb=r=max(val*0.8,0):g=max(val*0.85,0):b=min(val*0.7,255)',
            'vibrant': 'eq=saturation=1.3:contrast=1.1',
            'noir': 'blackandwhite',
            'warm': 'colorchannelmixer=rr=1.1:rg=0:rb=-0.1:gr=0.05:gg=1:gb=0:br=-0.1:bg=0:bb=1.1',
        }
        sf = style_filters.get(instruction['style'], '')
        if sf:
            filter_chain += f',{sf}'
    
    # FFmpeg 命令
    cmd = [
        FFmpeg_exe, '-y',
        '-f', 'concat',
        '-safe', '0',
        '-i', str(concat_list),
        '-vf', filter_chain,
        '-c:v', 'libx264',
        '-crf', '23',
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

def run_full_pipeline(num_frames=5, interval=1, user_prompt=None):
    """
    完整流程：ADB连续截图 → GLM分析最后一帧 → 生成优化视频
    
    参数：
    - num_frames: 连续截图数量（默认 5 张）
    - interval: 截图间隔秒数（默认 1 秒）
    - user_prompt: 用户需求描述
    """
    # 确保 FFmpeg 已初始化
    if not init_ffmpeg():
        print("❌ FFmpeg 不可用")
        return None
    
    print("=" * 60)
    print("  🎮 AI 游戏视频生成器")
    print("  ADB截图 → GLM分析 → 视频生成")
    print("=" * 60)
    
    # Step 1: 检查设备
    print("\n[1/5] 🔍 检查设备...")
    devices = get_adb_devices()
    if not devices:
        print("❌ 没有连接的设备")
        print("   请确保：USB调试开启 + 设备已连接")
        return None
    device = CONFIG['adb_device'] or devices[0]
    print(f"✅ 设备: {device}")
    
    # Step 2: 连续截图
    print(f"\n[2/5] 📸 连续截图 {num_frames} 张 (间隔 {interval}s)...")
    screenshot_paths = []
    
    for i in range(num_frames):
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        save_path = CONFIG['screenshots_dir'] / f'frame_{i:02d}_{timestamp}.png'
        
        path, error = adb_screenshot(device, save_path)
        if error:
            print(f"   ⚠️ 第 {i+1} 张失败: {error}")
            continue
        
        screenshot_paths.append(path)
        print(f"   ✅ {i+1}/{num_frames}: {Path(path).name}")
        
        if i < num_frames - 1:
            import time
            time.sleep(interval)
    
    if len(screenshot_paths) < 2:
        print(f"❌ 至少需要 2 张截图，实际获取 {len(screenshot_paths)} 张")
        return None
    
    print(f"✅ 共获取 {len(screenshot_paths)} 张截图")
    
    # Step 3: GLM 分析最后一张
    print(f"\n[3/5] 🧠 GLM 分析最后一张截图...")
    
    last_screenshot = screenshot_paths[-1]
    print(f"   分析: {Path(last_screenshot).name}")
    
    if user_prompt is None:
        user_prompt = "分析这张游戏截图，推荐色彩优化方案和滤镜参数，生成短视频"
    
    full_prompt = f"""
你正在分析一张游戏截图。用户请求：{user_prompt}

请返回 JSON 格式的分析结果：
{{
    "filter": "简单的 FFmpeg 滤镜，如 eq=brightness=0.1:saturation=1.2",
    "duration": 视频时长（秒）,
    "title": "视频标题",
    "style": "风格: vintage/cinematic/vibrant/noir/warm",
    "description": "简短描述"
}}

重要要求：
1. filter 必须是简单的滤镜表达式（如 eq=, hue=, colorbalance=）
2. 不要使用 filter_complex、graph 描述或复杂语法
3. 不要包含方括号 [a][b] 等图信号语法
4. duration 是整数秒（1-10）
5. style 必须是指定选项之一
6. 只返回 JSON，不要其他文字
"""
    
    response, error = call_glm(last_screenshot, full_prompt)
    
    if error:
        print(f"❌ API 调用失败: {error}")
        return None
    
    print(f"   GLM 响应:")
    for line in response.strip().split('\n')[:5]:
        print(f"   └─ {line}")
    
    # 解析指令
    try:
        # 查找 JSON 块
        json_start = response.find('{')
        json_end = response.rfind('}') + 1
        if json_start >= 0 and json_end > json_start:
            parsed = json.loads(response[json_start:json_end])
            instruction = parsed
            
            # 清理 filter：移除复杂语法
            raw_filter = instruction.get('filter', '')
            if raw_filter:
                # 移除 filter_complex 和图信号语法
                if 'filter_complex' in raw_filter or '[' in raw_filter:
                    # 尝试提取简单滤镜部分
                    import re
                    simple_filters = []
                    # 匹配 eq=, hue=, colorbalance=, unsharp=, etc.
                    for m in re.finditer(r'(eq|hue|colorbalance|colorchannelmixer|curves|lutrgb|unsharp|boxblur|gblur|vignette|fade|saturation|brightness|contrast|lumaconvert|vintage|lomo|negate|grayworld|blackandwhite)\s*=\s*[^,\s]+', raw_filter):
                        simple_filters.append(m.group())
                    if simple_filters:
                        instruction['filter'] = ','.join(simple_filters[:3])  # 最多 3 个
                    else:
                        instruction['filter'] = ''
                else:
                    instruction['filter'] = raw_filter
        else:
            instruction = {'filter': '', 'duration': 5, 'title': '游戏截图', 'style': 'normal'}
    except:
        print(f"⚠️ JSON 解析失败，使用默认参数")
        instruction = {'filter': '', 'duration': 5, 'title': '游戏截图', 'style': 'normal'}
    
    # Step 4: 生成视频
    print(f"\n[4/5] 🎬 生成视频...")
    print(f"   滤镜: {instruction.get('filter', 'none')}")
    print(f"   风格: {instruction.get('style', 'normal')}")
    print(f"   标题: {instruction.get('title', '游戏视频')}")
    
    CONFIG['output_dir'].mkdir(parents=True, exist_ok=True)
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    output_path = CONFIG['output_dir'] / f'game_video_{timestamp}.mp4'
    
    success, result = generate_video_from_screenshots(screenshot_paths, instruction, output_path)
    
    if not success:
        print(f"❌ 视频生成失败: {result}")
        return None
    
    file_size = os.path.getsize(result) / (1024 * 1024)
    print(f"✅ 视频已生成: {result}")
    print(f"   大小: {file_size:.2f} MB")
    
    # Step 5: 保存记录
    record_file = CONFIG['output_dir'] / f'record_{timestamp}.json'
    with open(record_file, 'w', encoding='utf-8') as f:
        json.dump({
            'device': device,
            'screenshots': screenshot_paths,
            'user_prompt': user_prompt,
            'glm_response': response,
            'instruction': instruction,
            'output': str(result),
            'timestamp': datetime.now().isoformat()
        }, f, ensure_ascii=False, indent=2)
    
    print(f"\n📝 记录已保存: {record_file}")
    
    return result


# ============== CLI ==============

def main():
    print("=" * 60)
    print("  🎮 AI 游戏视频生成器")
    print("  一键完成：ADB截图 → GLM分析 → 视频生成")
    print("=" * 60)
    
    # 初始化 FFmpeg
    if not init_ffmpeg():
        print("\n❌ FFmpeg 不可用")
        sys.exit(1)
    print(f"\n✅ FFmpeg: {FFmpeg_exe}")
    
    # 检查设备
    devices = get_adb_devices()
    if not devices:
        print("\n❌ 没有连接的设备")
        sys.exit(1)
    
    print(f"✅ 设备: {CONFIG['adb_device'] or devices[0]}")
    
    # 询问参数
    print("\n" + "-" * 40)
    print("  配置选项（直接回车使用默认）")
    print("-" * 40)
    
    frames_input = input("  截图张数 [默认 5]: ").strip()
    num_frames = int(frames_input) if frames_input else 5
    
    interval_input = input("  截图间隔(秒) [默认 1]: ").strip()
    interval = float(interval_input) if interval_input else 1.0
    
    print("\n  用户需求（描述你想要的效果）:")
    user_prompt = input("  → ").strip()
    
    if not user_prompt:
        user_prompt = "分析这张游戏截图，推荐色彩优化方案，生成短视频"
    
    # 运行
    print("\n" + "=" * 60)
    print("  开始处理...")
    print("=" * 60)
    
    result = run_full_pipeline(num_frames, interval, user_prompt)
    
    if result:
        print("\n" + "=" * 60)
        print("  🎉 完成！")
        print("=" * 60)
        print(f"\n  📹 视频文件: {result}")
        print(f"\n  在播放器中打开查看效果:")
        print(f"  start {result}")


if __name__ == '__main__':
    main()
