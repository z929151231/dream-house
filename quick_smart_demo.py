"""
快速演示：智能滤镜视频生成

简化版：直接用关键帧分析结果，为每张图片应用不同的滤镜
"""

from dynamic_filter_agent import DynamicFilterAgent, SCENE_FILTERS
from ai_video_agent import call_glm
from pathlib import Path
import json
import subprocess
import imageio_ffmpeg
import tempfile
import re
from PIL import Image


def quick_demo():
    """快速演示智能滤镜"""
    
    # 1. 获取输入图片
    input_dir = Path('input_images')
    images = sorted(input_dir.glob('*.jpg')) + sorted(input_dir.glob('*.png'))
    
    if not images:
        print("❌ 没有找到输入图片")
        return None
    
    print(f"📸 找到 {len(images)} 张图片")
    
    # 2. 分析每张图
    print("\n🧠 场景分析...")
    analyses = []
    
    for i, img in enumerate(images):
        print(f"  [{i+1}/{len(images)}] {img.name}...", end=" ")
        
        result = call_glm(
            str(img),
            '分析这张图片，返回纯JSON。格式：{"scene_type": "battle或peaceful或story或victory或defeat或menu或cutscene", "confidence": 0.85, "description": "简短描述"}'
        )
        
        # 解析返回
        if isinstance(result, tuple):
            content, error = result
            if error:
                print(f"❌ {error}")
                continue
        else:
            content = result
        
        # 提取JSON
        json_match = re.search(r'\{[^{}]+\}', content)
        if json_match:
            data = json.loads(json_match.group(0))
            scene_type = data.get('scene_type', 'unknown')
            confidence = float(data.get('confidence', 0.5))
            description = data.get('description', '')
        else:
            scene_type = 'unknown'
            confidence = 0.3
            description = '解析失败'
        
        filters = SCENE_FILTERS.get(scene_type, SCENE_FILTERS['unknown'])
        analyses.append({
            'path': img,
            'scene': scene_type,
            'confidence': confidence,
            'filters': filters,
            'description': description
        })
        
        print(f"→ {scene_type} ({confidence:.0%})")
    
    # 3. 为每张图生成滤镜版本
    print("\n🎨 应用滤镜...")
    temp_dir = Path(tempfile.mkdtemp(prefix='smart_quick_'))
    
    processed = []
    for af in analyses:
        scene = af['scene']
        f = af['filters']
        
        # 生成 FFmpeg 滤镜字符串
        parts = []
        if f['brightness'] != 1.0:
            parts.append(f"brightness={f['brightness']}")
        if f['saturation'] != 1.0:
            parts.append(f"saturation={f['saturation']}")
        if f['contrast'] != 1.0:
            parts.append(f"contrast={f['contrast']}")
        
        filter_str = ','.join(parts) if parts else 'null'
        
        # 应用滤镜
        output_path = temp_dir / f"processed_{scene}_{af['path'].stem}.jpg"
        
        cmd = [
            imageio_ffmpeg.get_ffmpeg_exe(),
            '-y',
            '-i', str(af['path']),
            '-vf', filter_str,
            '-q:v', '2',
            str(output_path)
        ]
        
        print(f"  {scene}: brightness={f['brightness']}, saturation={f['saturation']}, contrast={f['contrast']}")
        subprocess.run(cmd, capture_output=True)
        
        if output_path.exists():
            processed.append(output_path)
    
    # 4. 生成视频
    print("\n🎬 生成视频...")
    
    # 创建 concat 文件
    concat_list = temp_dir / 'concat.txt'
    frame_duration = 2.0  # 每张图显示2秒
    frames_per_image = int(frame_duration * 30)  # 30fps
    
    with open(concat_list, 'w') as f:
        for img in processed:
            for _ in range(frames_per_image):
                f.write(f"file '{img.absolute().as_posix()}'\n")
    
    output_video = Path('output_videos') / 'smart_demo.mp4'
    
    cmd = [
        imageio_ffmpeg.get_ffmpeg_exe(),
        '-f', 'concat',
        '-safe', '0',
        '-i', str(concat_list),
        '-c:v', 'libx264',
        '-crf', '18',
        '-preset', 'medium',
        '-pix_fmt', 'yuv420p',
        '-y',
        str(output_video)
    ]
    
    subprocess.run(cmd, capture_output=True)
    
    if output_video.exists():
        size = output_video.stat().st_size / 1024
        print(f"\n✅ 视频已生成: {output_video}")
        print(f"   大小: {size:.1f} KB")
        print(f"   时长: {len(processed)} 张 × {frame_duration}s = {len(processed) * frame_duration}s")
        
        # 保存分析结果
        report = {
            'scenes': [
                {
                    'scene': af['scene'],
                    'confidence': af['confidence'],
                    'filters': af['filters'],
                    'description': af['description']
                }
                for af in analyses
            ]
        }
        report_path = output_video.with_suffix('.json')
        with open(report_path, 'w') as f:
            json.dump(report, f, indent=2, ensure_ascii=False)
        print(f"📋 分析报告: {report_path}")
        
        return output_video
    
    return None


if __name__ == "__main__":
    quick_demo()
