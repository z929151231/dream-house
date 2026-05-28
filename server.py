"""
智能场景滤镜 - Flask 后端 API 服务

提供完整的图片上传、场景分析、滤镜应用、视频生成功能
"""

import logging
from flask import Flask, request, jsonify, send_file, send_from_directory
from flask_cors import CORS
from functools import lru_cache
import json
import subprocess
import tempfile
from pathlib import Path
import shutil
import os
from datetime import datetime

# 日志配置 - 输出到控制台和文件
log_file = Path(__file__).parent / 'server.log'
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler(log_file, encoding='utf-8', mode='a')
    ]
)
logger = logging.getLogger(__name__)

# 导入场景滤镜和 GLM 调用
from dynamic_filter_agent import SCENE_FILTERS
from ai_video_agent import call_glm
import imageio_ffmpeg
import re

app = Flask(__name__, static_folder='.', static_url_path='')
CORS(app)

# 配置
UPLOAD_DIR = Path(__file__).parent / 'upload_temp'
OUTPUT_DIR = Path(__file__).parent / 'output_videos'
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# ============== 首页 ==============
@app.route('/')
def index():
    logger.info("GET / - 首页")
    return send_file('index.html')


# ============== 全局请求日志中间件 ==============
@app.before_request
def log_request_info():
    logger.info(f"📡 {request.method} {request.path} - 来源: {request.remote_addr} (port {request.remote_port})")
    if request.content_type:
        logger.info(f"   Content-Type: {request.content_type}")
    if request.content_length:
        logger.info(f"   Content-Length: {request.content_length} bytes")


# ============== 图片上传 ==============
@app.route('/api/upload', methods=['POST'])
def upload_images():
    """上传图片"""
    logger.info(f"📤 上传图片: 文件数={len(request.files.getlist('images'))}")
    if 'images' not in request.files:
        logger.warning("没有图片文件")
        return jsonify({'error': '没有图片文件'}), 400
    
    files = request.files.getlist('images')
    image_data = []
    
    for file in files:
        if file.filename and file.filename.lower().endswith(('.jpg', '.jpeg', '.png', '.webp')):
            logger.info(f"   保存文件: {file.filename}")
            # 保存上传的文件
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            
            ext = Path(file.filename).suffix.lower()
            if ext == '.jpeg':
                ext = '.jpg'
            
            filename = f"upload_{timestamp}_{len(image_data)}{ext}"
            save_path = UPLOAD_DIR / filename
            file.save(save_path)
            
            image_data.append({
                'id': filename,
                'original_name': file.filename,
                'path': str(save_path)
            })
    
    return jsonify({
        'success': True,
        'images': image_data,
        'count': len(image_data)
    })


# ============== 场景分析 ==============
@app.route('/api/analyze', methods=['POST'])
def analyze_scenes():
    """AI 场景分析"""
    logger.info("🔍 场景分析请求")
    data = request.get_json()
    logger.info(f"   请求体: {json.dumps(data, indent=2, ensure_ascii=False) if data else 'null'}")
    image_ids = data.get('image_ids', [])
    logger.info(f"   图片 ID: {image_ids}")
    
    if not image_ids:
        return jsonify({'error': '没有图片 ID'}), 400
    
    analyses = []
    
    for img_id in image_ids:
        img_path = UPLOAD_DIR / img_id
        if not img_path.exists():
            analyses.append({
                'scene': 'unknown',
                'confidence': 0.3,
                'filters': SCENE_FILTERS['unknown'],
                'description': '文件不存在'
            })
            continue
        
        # 调用 GLM 分析
        logger.info(f"   分析图片 {img_id}...")
        result = call_glm(
            str(img_path),
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
        
        # 解析结果
        if isinstance(result, tuple):
            content, error = result
            if error:
                analyses.append({
                    'scene': 'unknown',
                    'confidence': 0.3,
                    'filters': SCENE_FILTERS['unknown'],
                    'description': f'分析错误: {error}'
                })
                continue
        else:
            content = result
        
        # 清理和提取 JSON
        content = re.sub(r'[\n\r\x00-\x1f]', '', content)
        json_match = re.search(r'\{[^{}]*\}', content)
        
        scene_type = 'unknown'
        confidence = 0.5
        description = '分析失败'
        
        if json_match:
            try:
                data = json.loads(json_match.group(0))
                scene_type = data.get('scene_type', 'unknown')
                confidence = float(data.get('confidence', 0.5))
                description = data.get('description', '')
                
                # 映射英文到中文分类
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
                scene_type = scene_mapping.get(scene_type.lower(), scene_type)
                
            except Exception as e:
                print(f"JSON 解析失败: {e}")
        
        filters = SCENE_FILTERS.get(scene_type, SCENE_FILTERS['unknown'])
        
        analyses.append({
            'image_id': img_id,
            'scene': scene_type,
            'confidence': confidence,
            'filters': filters,
            'description': description
        })
    
    return jsonify({
        'success': True,
        'scenes': analyses
    })


# ============== 生成滤镜预览 ==============
@app.route('/api/filter-preview', methods=['POST'])
def filter_preview():
    """生成单张图的滤镜预览"""
    data = request.get_json()
    image_id = data.get('image_id')
    scene_type = data.get('scene', 'menu')
    
    if not image_id:
        return jsonify({'error': '缺少 image_id'}), 400
    
    img_path = UPLOAD_DIR / image_id
    if not img_path.exists():
        return jsonify({'error': '文件不存在'}), 404
    
    filters = SCENE_FILTERS.get(scene_type, SCENE_FILTERS['unknown'])
    
    # 生成滤镜版本
    temp_dir = Path(tempfile.mkdtemp(prefix='filter_preview_'))
    output_path = temp_dir / f"filtered_{image_id}"
    
    # 构建 FFmpeg 滤镜
    parts = []
    if filters['brightness'] != 1.0:
        parts.append(f"brightness={filters['brightness']}")
    if filters['saturation'] != 1.0:
        parts.append(f"saturation={filters['saturation']}")
    if filters['contrast'] != 1.0:
        parts.append(f"contrast={filters['contrast']}")
    
    vf = ','.join(parts) if parts else 'null'
    
    subprocess.run([
        imageio_ffmpeg.get_ffmpeg_exe(),
        '-y',
        '-i', str(img_path),
        '-vf', vf,
        '-q:v', '2',
        str(output_path)
    ], capture_output=True)
    
    return jsonify({
        'success': True,
        'original': f'/api/image/{image_id}',
        'filtered': f'/api/image/{output_path.name}',
        'filters': filters
    })


# ============== 获取图片 ==============
@app.route('/api/image/<filename>')
def get_image(filename):
    """获取上传的图片"""
    # 优先在上传目录查找
    upload_path = UPLOAD_DIR / filename
    if upload_path.exists():
        return send_file(upload_path)
    
    # 在临时目录查找
    temp_dir = Path(tempfile.gettempdir())
    for d in temp_dir.glob('filter_preview_*'):
        img = d / filename
        if img.exists():
            return send_file(img)
    
    return jsonify({'error': '图片不存在'}), 404


# ============== 生成视频 ==============
@app.route('/api/generate-video', methods=['POST'])
def generate_video():
    """生成场景滤镜视频"""
    logger.info("🎬 视频生成请求")
    data = request.get_json()
    logger.info(f"   请求体: {json.dumps(data, indent=2, ensure_ascii=False) if data else 'null'}")
    image_ids = data.get('image_ids', [])
    scenes = data.get('scenes', [])
    logger.info(f"   图片ID: {image_ids}")
    logger.info(f"   场景数: {len(scenes)}")
    frame_duration = data.get('frame_duration', 2.0)  # 每张图显示秒数
    
    if not image_ids or not scenes:
        return jsonify({'error': '缺少图片 ID 或场景信息'}), 400
    
    # 创建临时目录
    temp_dir = Path(tempfile.mkdtemp(prefix='video_gen_'))
    
    # 处理每张图：应用滤镜
    processed_images = []
    frames_per_image = int(frame_duration * 30)  # 30fps
    
    for img_data, scene_data in zip(image_ids, scenes):
        img_path = UPLOAD_DIR / img_data
        if not img_path.exists():
            continue
        
        filters = SCENE_FILTERS.get(scene_data.get('scene', 'unknown'), SCENE_FILTERS['unknown'])
        
        # 应用滤镜
        processed_path = temp_dir / f"p_{img_data}"
        
        # 构建 FFmpeg 滤镜
        parts = []
        if filters['brightness'] != 1.0:
            parts.append(f"brightness={filters['brightness']}")
        if filters['saturation'] != 1.0:
            parts.append(f"saturation={filters['saturation']}")
        if filters['contrast'] != 1.0:
            parts.append(f"contrast={filters['contrast']}")
        
        vf = ','.join(parts) if parts else 'null'
        
        subprocess.run([
            imageio_ffmpeg.get_ffmpeg_exe(),
            '-y',
            '-i', str(img_path),
            '-vf', vf,
            '-q:v', '2',
            str(processed_path)
        ], capture_output=True)
        
        if processed_path.exists():
            processed_images.append(processed_path)
    
    if not processed_images:
        logger.error("没有成功处理图片")
        return jsonify({'error': '没有成功处理图片'}), 500
    
    logger.info(f"处理了 {len(processed_images)} 张图片")
    
    # 创建 concat 文件
    concat_file = temp_dir / 'list.txt'
    with open(concat_file, 'w') as f:
        for img in processed_images:
            for _ in range(frames_per_image):
                f.write(f"file '{img.absolute().as_posix()}'\n")
    
    # 生成视频
    timestamp = subprocess.run(
        ['date', '+%Y%m%d_%H%M%S'],
        capture_output=True, text=True
    ).stdout.strip()
    
    output_video = OUTPUT_DIR / f"smart_video_{timestamp}.mp4"
    
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
        duration = len(processed_images) * frame_duration
        
        # 保存分析报告
        report = {
            'scenes': scenes,
            'total_duration': duration,
            'output_file': output_video.name
        }
        report_path = output_video.with_suffix('.json')
        with open(report_path, 'w') as f:
            json.dump(report, f, indent=2, ensure_ascii=False)
        
        return jsonify({
            'success': True,
            'video_path': output_video.name,
            'duration': duration,
            'size': f'{size_kb:.1f} KB',
            'report': report
        })
    
    return jsonify({'error': '视频生成失败'}), 500


# ============== 获取视频 ==============
@app.route('/api/video/<filename>')
def get_video(filename):
    """获取生成的视频"""
    video_path = OUTPUT_DIR / filename
    if video_path.exists():
        return send_file(video_path, mimetype='video/mp4')
    return jsonify({'error': '视频不存在'}), 404


# ============== 清理临时文件 ==============
@app.route('/api/clean', methods=['POST'])
def clean_temp():
    """清理临时文件"""
    try:
        # 清理上传目录
        for f in UPLOAD_DIR.glob('*'):
            if f.is_file():
                f.unlink()
        
        # 清理输出目录的老文件（保留最近的10个）
        videos = sorted(OUTPUT_DIR.glob('*.mp4'), key=lambda p: p.stat().st_mtime, reverse=True)
        for v in videos[10:]:
            v.unlink()
            v.with_suffix('.json').unlink(missing_ok=True)
        
        return jsonify({'success': True, 'message': '清理完成'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ============== 启动 ==============
if __name__ == '__main__':
    print("=" * 50)
    print("🚀 智能场景滤镜 - Web 服务启动")
    print("=" * 50)
    print(f"\n📍 访问地址: http://localhost:5000")
    print(f"📁 上传目录: {UPLOAD_DIR}")
    print(f"📹 输出目录: {OUTPUT_DIR}")
    print("\n🔧 API 端点:")
    print("   POST /api/upload        - 上传图片")
    print("   POST /api/analyze       - 场景分析")
    print("   POST /api/generate-video - 生成视频")
    print("   GET  /api/video/<name>  - 获取视频")
    print("=" * 50)
    
    app.run(host='0.0.0.0', port=5000, debug=True)
    logger.info("👋 服务器已停止")
