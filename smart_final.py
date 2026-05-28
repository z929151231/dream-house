"""
智能场景滤镜 - 最终版

核心流程：
1. GLM 分析每张图片的场景类型
2. 根据场景类型应用不同的滤镜
3. 生成视频，每张图显示 2 秒
"""

import json
import subprocess
import tempfile
from pathlib import Path
import imageio_ffmpeg
import shutil
import re

# 场景滤镜配置
SCENE_FILTERS = {
    "battle": {
        "brightness": 1.1, "saturation": 1.5, "contrast": 1.2,
        "description": "战斗激烈，增强视觉冲击"
    },
    "peaceful": {
        "brightness": 1.0, "saturation": 1.1, "contrast": 0.95,
        "description": "平静探索，自然柔和"
    },
    "story": {
        "brightness": 1.05, "saturation": 0.95, "contrast": 0.9,
        "description": "剧情对话，突出文字"
    },
    "victory": {
        "brightness": 1.2, "saturation": 1.4, "contrast": 1.1,
        "description": "胜利时刻，炫酷高光"
    },
    "defeat": {
        "brightness": 0.85, "saturation": 0.7, "contrast": 1.0,
        "description": "失败场景，暗淡压抑"
    },
    "menu": {
        "brightness": 1.0, "saturation": 1.0, "contrast": 1.0,
        "description": "菜单界面，原色显示"
    },
    "cutscene": {
        "brightness": 1.0, "saturation": 1.1, "contrast": 1.0,
        "description": "过场动画，电影感"
    },
    "unknown": {
        "brightness": 1.0, "saturation": 1.0, "contrast": 1.0,
        "description": "未知场景"
    }
}

def call_glm_simple(image_path: str, prompt: str) -> tuple:
    """简化版 GLM 调用"""
    from ai_video_agent import call_glm
    return call_glm(image_path, prompt)


def analyze_image(image_path: Path) -> dict:
    """分析单张图片"""
    result = call_glm_simple(
        str(image_path),
        '''分析这张游戏/视频画面，必须从以下7种场景类型中选择一种，返回纯JSON：

场景类型选项（必须选其一）：
- battle: 战斗激烈场景
- peaceful: 平静探索场景  
- story: 剧情对话场景
- victory: 胜利时刻场景
- defeat: 失败场景
- menu: 菜单界面
- cutscene: 过场动画

返回格式（严格JSON，不要任何其他文字）：
{"scene_type": "上面7种之一", "confidence": 0.85, "description": "中文简短描述"}'''
    )
    
    if isinstance(result, tuple):
        content, error = result
        if error:
            return {'scene': 'unknown', 'confidence': 0.3, 'error': error}
    else:
        content = result
    
    # 清理控制字符和换行
    content = re.sub(r'[\n\r\x00-\x1f]', '', content)
    
    # 提取 JSON
    json_match = re.search(r'\{[^{}]*\}', content)
    if json_match:
        try:
            data = json.loads(json_match.group(0))
            scene = data.get('scene_type', 'unknown')
            # 如果返回了英文，映射到中文分类
            scene_mapping = {
                'battle': 'battle', 'fight': 'battle', 'combat': 'battle',
                'peaceful': 'peaceful', 'explore': 'peaceful', 'exploration': 'peaceful',
                'story': 'story', 'dialogue': 'story', 'conversation': 'story',
                'victory': 'victory', 'win': 'victory', 'success': 'victory',
                'defeat': 'defeat', 'lose': 'defeat', 'failure': 'defeat',
                'menu': 'menu', 'interface': 'menu', 'ui': 'menu',
                'cutscene': 'cutscene', 'cinematic': 'cutscene',
                'presentation': 'menu', 'slide': 'menu'
            }
            scene = scene_mapping.get(scene.lower(), scene)
            
            return {
                'scene': scene,
                'confidence': float(data.get('confidence', 0.5)),
                'description': data.get('description', '')
            }
        except Exception as e:
            return {'scene': 'unknown', 'confidence': 0.3, 'error': str(e)}
    
    return {'scene': 'unknown', 'confidence': 0.3, 'error': 'JSON解析失败'}


def apply_filter(input_path: Path, output_path: Path, filters: dict):
    """应用滤镜"""
    ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
    
    parts = []
    if filters['brightness'] != 1.0:
        parts.append(f"brightness={filters['brightness']}")
    if filters['saturation'] != 1.0:
        parts.append(f"saturation={filters['saturation']}")
    if filters['contrast'] != 1.0:
        parts.append(f"contrast={filters['contrast']}")
    
    vf = ','.join(parts) if parts else 'null'
    
    subprocess.run([
        ffmpeg, '-y',
        '-i', str(input_path),
        '-vf', vf,
        '-q:v', '2',
        str(output_path)
    ], capture_output=True)


def main():
    print("=" * 50)
    print("🎬 智能场景滤镜系统")
    print("=" * 50)
    
    # 1. 输入图片
    input_dir = Path('input_images')
    images = sorted(input_dir.glob('*.jpg')) + sorted(input_dir.glob('*.png'))
    
    if not images:
        print("❌ 没有找到图片")
        return
    
    print(f"\n📸 {len(images)} 张图片")
    
    # 2. 场景分析
    print("\n🧠 场景分析:")
    analyses = []
    
    for img in images:
        af = analyze_image(img)
        filters = SCENE_FILTERS.get(af['scene'], SCENE_FILTERS['unknown'])
        analyses.append({
            'path': img,
            'scene': af['scene'],
            'confidence': af['confidence'],
            'filters': filters,
            'description': af.get('description', '')
        })
        print(f"  {img.name}: {af['scene']} ({af['confidence']:.0%}) - {filters['description']}")
    
    # 3. 应用滤镜
    print("\n🎨 滤镜处理:")
    temp_dir = Path(tempfile.mkdtemp(prefix='smart_'))
    processed = []
    
    for af in analyses:
        output_path = temp_dir / f"p_{af['scene']}_{af['path'].stem}.jpg"
        apply_filter(af['path'], output_path, af['filters'])
        if output_path.exists():
            processed.append(output_path)
            print(f"  ✓ {af['path'].name} → {af['scene']} 滤镜")
    
    # 4. 生成视频
    print("\n🎬 生成视频:")
    
    # concat 文件
    concat_file = temp_dir / 'list.txt'
    frame_duration = 2.0  # 每张图 2 秒
    frames_per_img = int(frame_duration * 30)  # 30fps
    
    with open(concat_file, 'w') as f:
        for p in processed:
            for _ in range(frames_per_img):
                f.write(f"file '{p.absolute().as_posix()}'\n")
    
    output_video = Path('output_videos/smart_scene_filter.mp4')
    output_video.parent.mkdir(parents=True, exist_ok=True)
    
    subprocess.run([
        imageio_ffmpeg.get_ffmpeg_exe(),
        '-f', 'concat', '-safe', '0',
        '-i', str(concat_file),
        '-c:v', 'libx264', '-crf', '18', '-preset', 'medium',
        '-pix_fmt', 'yuv420p', '-y',
        str(output_video)
    ], capture_output=True)
    
    if output_video.exists():
        size_kb = output_video.stat().st_size / 1024
        duration = len(processed) * frame_duration
        
        print(f"\n✅ 成功!")
        print(f"   视频: {output_video}")
        print(f"   大小: {size_kb:.1f} KB")
        print(f"   时长: {duration:.1f}秒 ({len(processed)} 张 × {frame_duration}s)")
        
        # 保存报告（转换 Path 为字符串）
        report = {
            'scenes': [
                {
                    'file': str(a['path']),
                    'scene': a['scene'],
                    'confidence': a['confidence'],
                    'filters': a['filters'],
                    'description': a['description']
                }
                for a in analyses
            ],
            'total_duration': duration,
            'output': str(output_video)
        }
        report_path = output_video.with_suffix('.json')
        with open(report_path, 'w') as f:
            json.dump(report, f, indent=2, ensure_ascii=False)
        print(f"   报告: {report_path}")
    else:
        print("❌ 视频生成失败")


if __name__ == '__main__':
    main()
