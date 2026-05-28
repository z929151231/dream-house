"""
动态场景感知滤镜系统

核心功能：
1. 从视频/图片序列提取关键帧
2. GLM 分析每帧画面场景类型
3. 根据场景类型动态分配滤镜参数
4. 时间线平滑过渡，避免滤镜跳变
"""

import json
import subprocess
import tempfile
from pathlib import Path
from dataclasses import dataclass
from typing import List, Optional
import imageio_ffmpeg


# 场景类型到滤镜的映射表
SCENE_FILTERS = {
    "battle": {  # 战斗激烈
        "brightness": 1.1,
        "saturation": 1.5,
        "contrast": 1.2,
        "vibrance": 0.8,
        "warmth": 0.3,
        "description": "激烈战斗场景，增强视觉冲击力"
    },
    "peaceful": {  # 平静/探索
        "brightness": 1.0,
        "saturation": 1.1,
        "contrast": 0.95,
        "vibrance": 0.0,
        "warmth": 0.0,
        "description": "平静探索场景，自然柔和"
    },
    "story": {  # 剧情/对话
        "brightness": 1.05,
        "saturation": 0.95,
        "contrast": 0.9,
        "vibrance": -0.1,
        "warmth": -0.1,
        "description": "剧情对话场景，突出文字和角色"
    },
    "victory": {  # 胜利/成就
        "brightness": 1.2,
        "saturation": 1.4,
        "contrast": 1.1,
        "vibrance": 1.0,
        "warmth": 0.2,
        "description": "胜利时刻，炫酷高光效果"
    },
    "defeat": {  # 失败/挫折
        "brightness": 0.85,
        "saturation": 0.7,
        "contrast": 1.0,
        "vibrance": -0.3,
        "warmth": -0.3,
        "description": "失败场景，压抑暗淡氛围"
    },
    "menu": {  # 菜单/界面
        "brightness": 1.0,
        "saturation": 1.0,
        "contrast": 1.0,
        "vibrance": 0.0,
        "warmth": 0.0,
        "description": "菜单界面，原色显示"
    },
    "cutscene": {  # 过场动画
        "brightness": 1.0,
        "saturation": 1.1,
        "contrast": 1.0,
        "vibrance": 0.1,
        "warmth": 0.0,
        "description": "过场动画，电影感调色"
    },
    "unknown": {  # 未知
        "brightness": 1.0,
        "saturation": 1.0,
        "contrast": 1.0,
        "vibrance": 0.0,
        "warmth": 0.0,
        "description": "未知场景，保持原样"
    }
}


@dataclass
class FrameAnalysis:
    """单帧分析结果"""
    frame_index: int
    timestamp: float
    scene_type: str
    confidence: float
    filter_params: dict
    description: str


class DynamicFilterAgent:
    """动态场景感知滤镜引擎"""
    
    def __init__(
        self,
        keyframe_interval: float = 3.0,
        output_dir: Optional[Path] = None,
        model: str = "glm-4.6v-flashx"
    ):
        """
        初始化动态滤镜引擎
        
        Args:
            keyframe_interval: 关键帧间隔（秒），建议 2-5 秒
            output_dir: 输出目录
            model: 使用的视觉模型
        """
        self.keyframe_interval = keyframe_interval
        self.output_dir = output_dir or Path("output_videos")
        self.model = model
        self.output_dir.mkdir(parents=True, exist_ok=True)
    
    def extract_keyframes(
        self,
        input_path: str,
        temp_dir: Path
    ) -> List[Path]:
        """
        从输入视频/图片序列提取关键帧
        
        Args:
            input_path: 输入视频或图片目录
            temp_dir: 临时目录存放提取的帧
        
        Returns:
            关键帧文件路径列表
        """
        input_p = Path(input_path)
        keyframes = []
        
        if input_p.is_file() and input_p.suffix in ['.mp4', '.mov', '.avi']:
            # 从视频提取关键帧
            cmd = [
                imageio_ffmpeg.get_ffmpeg_exe(),
                '-i', str(input_path),
                '-vf', f'fps=1/{self.keyframe_interval}',
                '-q:v', '2',
                str(temp_dir / 'keyframe_%04d.png')
            ]
            subprocess.run(cmd, capture_output=True)
            
            keyframes = sorted(temp_dir.glob('keyframe_*.png'))
            
        elif input_p.is_dir():
            # 从图片目录复制关键帧
            images = sorted(input_p.glob('*.jpg')) + sorted(input_p.glob('*.png'))
            for i, img in enumerate(images):
                dest = temp_dir / f'keyframe_{i:04d}{img.suffix}'
                import shutil
                shutil.copy2(img, dest)
                keyframes.append(dest)
        
        print(f"  提取关键帧 {len(keyframes)} 张 (间隔 {self.keyframe_interval}s)")
        return keyframes
    
    def analyze_frame(self, image_path: Path, frame_idx: int) -> FrameAnalysis:
        """
        分析单帧画面，返回场景类型和推荐滤镜
        """
        from ai_video_agent import call_glm
        
        prompt = """分析这张游戏画面，返回JSON格式的分析结果。

要求：
1. 判断画面类型（battle/peaceful/story/victory/defeat/menu/cutscene）
2. 给出置信度 (0-1)
3. 简要描述画面内容

返回格式（严格的JSON）：
{
    "scene_type": "battle",
    "confidence": 0.85,
    "description": "简短描述"
}"""

        try:
            result = call_glm(
                str(image_path),
                prompt,
                model=self.model
            )
            
            # call_glm 返回 (content, error) 元组
            if isinstance(result, tuple):
                response, error = result
                if error:
                    raise Exception(error)
                if response is None:
                    raise Exception("API返回空内容")
            else:
                response = result
            
            # 处理 markdown 代码块格式（```json ... ```）
            import re
            json_match = re.search(r'\{[^{}]+\}', response)
            if json_match:
                response = json_match.group(0)
            
            data = json.loads(response)
            scene_type = data.get('scene_type', 'unknown')
            confidence = float(data.get('confidence', 0.5))
            description = data.get('description', '')
            
        except Exception as e:
            print(f"  ⚠️ 帧 {frame_idx} 分析失败: {e}")
            scene_type = 'unknown'
            confidence = 0.3
            description = '分析失败，使用默认滤镜'
        
        # 获取该场景的滤镜参数
        filter_params = SCENE_FILTERS.get(scene_type, SCENE_FILTERS['unknown']).copy()
        
        return FrameAnalysis(
            frame_index=frame_idx,
            timestamp=frame_idx * self.keyframe_interval,
            scene_type=scene_type,
            confidence=confidence,
            filter_params=filter_params,
            description=description
        )
    
    def analyze_all_frames(self, keyframes: List[Path]) -> List[FrameAnalysis]:
        """分析所有关键帧"""
        analyses = []
        total = len(keyframes)
        
        print(f"\n  🧠 GLM 逐帧分析 {total} 张关键帧...")
        for i, kf in enumerate(keyframes):
            print(f"  [{i+1}/{total}] 分析第 {i} 帧...", end=" ")
            analysis = self.analyze_frame(kf, i)
            analyses.append(analysis)
            print(f"→ {analysis.scene_type} ({analysis.confidence:.0%})")
        
        return analyses
    
    def interpolate_filters(
        self,
        analyses: List[FrameAnalysis],
        total_frames: int
    ) -> List[dict]:
        """
        根据关键帧分析结果，插值生成每帧的滤镜参数
        
        在两个关键帧之间，滤镜参数线性过渡，避免跳变
        """
        if not analyses:
            return [SCENE_FILTERS['unknown']] * total_frames
        
        frame_filters = []
        
        for frame_idx in range(total_frames):
            # 计算当前帧属于哪个区间
            current_time = frame_idx / 30  # 假设30fps
            
            # 找到前后两个关键帧
            prev_analysis = analyses[0]
            next_analysis = analyses[-1]
            progress = 0.0
            
            for i in range(len(analyses) - 1):
                curr = analyses[i]
                next_f = analyses[i + 1]
                
                t_start = curr.timestamp
                t_end = next_f.timestamp
                
                if t_start <= current_time <= t_end:
                    prev_analysis = curr
                    next_analysis = next_f
                    if t_end > t_start:
                        progress = (current_time - t_start) / (t_end - t_start)
                    else:
                        progress = 0.0
                    break
            
            # 线性插值滤镜参数
            interpolated = {}
            for param in ['brightness', 'saturation', 'contrast', 'vibrance', 'warmth']:
                v1 = prev_analysis.filter_params.get(param, 1.0 if 'brightness' == param else 0.0)
                v2 = next_analysis.filter_params.get(param, 1.0 if 'brightness' == param else 0.0)
                interpolated[param] = v1 + (v2 - v1) * progress
            
            frame_filters.append(interpolated)
        
        return frame_filters
    
    def filters_to_ffmpeg(self, filters: dict) -> str:
        """
        将滤镜参数字典转换为 FFmpeg 滤镜字符串
        """
        parts = []
        
        if filters.get('brightness', 1.0) != 1.0:
            parts.append(f"eq=brightness={filters['brightness']}")
        
        if filters.get('saturation', 1.0) != 1.0:
            if parts:
                parts[-1] += f":saturation={filters['saturation']}"
            else:
                parts.append(f"eq=saturation={filters['saturation']}")
        
        if filters.get('contrast', 1.0) != 1.0:
            if parts:
                parts[-1] += f":contrast={filters['contrast']}"
            else:
                parts.append(f"eq=contrast={filters['contrast']}")
        
        return ','.join(parts) if parts else 'null'
    
    def generate_video(
        self,
        input_path: str,
        output_name: str = None,
        target_duration: float = None
    ) -> Optional[Path]:
        """
        主流程：智能滤镜视频生成
        
        Args:
            input_path: 输入视频或图片目录
            output_name: 输出文件名（不含扩展名）
            target_duration: 目标时长（秒），None则保持原视频时长
        
        Returns:
            输出视频路径
        """
        print("=" * 60)
        print("🎬 动态场景感知滤镜系统")
        print("=" * 60)
        
        # 1. 创建临时目录
        temp_dir = Path(tempfile.mkdtemp(prefix='smart_filter_'))
        
        # 2. 获取视频时长
        input_p = Path(input_path)
        if input_p.is_file() and input_p.suffix in ['.mp4', '.mov', '.avi']:
            # 获取视频时长
            cmd = [
                imageio_ffmpeg.get_ffmpeg_exe(),
                '-i', str(input_path),
            ]
            result = subprocess.run(cmd, capture_output=True, text=True)
            for line in result.stderr.split('\n'):
                if 'Duration' in line:
                    import re
                    m = re.search(r'Duration: (\d{2}):(\d{2}):(\d{2}\.\d{2})', line)
                    if m:
                        h, m_val, s = m.groups()
                        total_duration = int(h)*3600 + int(m_val)*60 + float(s)
                        break
            else:
                total_duration = target_duration or 30.0
        else:
            total_duration = target_duration or 10.0
        
        print(f"\n  输入: {input_path}")
        print(f"  视频时长: {total_duration:.1f}s")
        print(f"  关键帧间隔: {self.keyframe_interval}s")
        
        # 3. 提取关键帧
        print(f"\n  [1/4] 提取关键帧...")
        keyframes = self.extract_keyframes(input_path, temp_dir)
        
        if not keyframes:
            print("  ❌ 未提取到关键帧")
            return None
        
        # 4. GLM 分析关键帧
        print(f"\n  [2/4] 场景分析...")
        analyses = self.analyze_all_frames(keyframes)
        
        # 5. 生成滤镜时间线
        print(f"\n  [3/4] 生成滤镜时间线...")
        total_frames = int(total_duration * 30)  # 30fps
        frame_filters = self.interpolate_filters(analyses, total_frames)
        
        # 显示滤镜变化趋势
        print(f"  时间线滤镜分布:")
        scene_counts = {}
        for af in analyses:
            scene_counts[af.scene_type] = scene_counts.get(af.scene_type, 0) + 1
        for scene, count in scene_counts.items():
            print(f"    {scene}: {count} 个关键帧")
        
        # 6. 生成视频
        print(f"\n  [4/4] 渲染视频...")
        
        # 简化版：使用分段滤镜（实际可改为逐帧滤镜）
        # 这里演示基于关键帧的分段处理
        output_name = output_name or f"dyanmic_filter_{Path(input_path).stem}"
        output_path = self.output_dir / f"{output_name}.mp4"
        
        # 创建分段滤镜指令
        # 简化处理：每张关键帧对应的区间用该场景的滤镜
        concat_entries = []
        
        for i, analysis in enumerate(analyses):
            # 计算这一段的起止帧
            start_frame = i * len(keyframes) // len(analyses) if analyses else i
            end_frame = (i + 1) * len(keyframes) // len(analyses) if i < len(analyses) - 1 else total_frames
            
            segment_duration = (end_frame - start_frame) / 30
            if segment_duration < 0.1:
                segment_duration = 0.1
            
            # 生成该段的滤镜
            filter_str = self.filters_to_ffmpeg(analysis.filter_params)
            
            # 提取原始视频这一段
            start_time = analysis.timestamp
            segment_path = temp_dir / f"segment_{i}.mp4"
            
            cmd = [
                imageio_ffmpeg.get_ffmpeg_exe(),
                '-ss', str(start_time),
                '-t', str(segment_duration),
                '-i', str(input_path),
                '-vf', filter_str,
                '-c:v', 'libx264',
                '-crf', '18',
                '-preset', 'medium',
                '-pix_fmt', 'yuv420p',
                '-y',
                str(segment_path)
            ]
            
            print(f"    处理片段 {i}: {analysis.scene_type} ({segment_duration:.1f}s)")
            subprocess.run(cmd, capture_output=True)
            
            if segment_path.exists():
                concat_entries.append(segment_path)
        
        # 拼接所有片段
        if len(concat_entries) > 1:
            concat_list = temp_dir / 'concat.txt'
            with open(concat_list, 'w') as f:
                for seg in concat_entries:
                    f.write(f"file '{seg.absolute().as_posix()}'\n")
            
            cmd = [
                imageio_ffmpeg.get_ffmpeg_exe(),
                '-f', 'concat',
                '-safe', '0',
                '-i', str(concat_list),
                '-c', 'copy',
                '-y',
                str(output_path)
            ]
            subprocess.run(cmd, capture_output=True)
        elif len(concat_entries) == 1:
            import shutil
            shutil.copy2(concat_entries[0], output_path)
        
        # 清理临时文件（保留用于调试）
        # shutil.rmtree(temp_dir)
        
        print(f"\n✅ 视频已生成: {output_path}")
        
        # 保存分析报告
        report_path = output_path.with_suffix('.json')
        report_data = {
            "input": str(input_path),
            "output": str(output_path),
            "keyframes": len(analyses),
            "interval": self.keyframe_interval,
            "scenes": [
                {
                    "index": a.frame_index,
                    "timestamp": a.timestamp,
                    "scene_type": a.scene_type,
                    "confidence": a.confidence,
                    "filters": a.filter_params,
                    "description": a.description
                }
                for a in analyses
            ]
        }
        with open(report_path, 'w', encoding='utf-8') as f:
            json.dump(report_data, f, ensure_ascii=False, indent=2)
        print(f"📋 分析报告: {report_path}")
        
        return output_path


def create_test_filter_script():
    """创建测试脚本"""
    script = '''#!/usr/bin/env python
"""测试动态智能滤镜系统"""

from dynamic_filter_agent import DynamicFilterAgent
from pathlib import Path

def test_on_input_images():
    """用 input_images 测试"""
    agent = DynamicFilterAgent(
        keyframe_interval=2.0,  # 每2秒分析一帧
        output_dir=Path("output_videos")
    )
    
    result = agent.generate_video(
        input_path="input_images",
        output_name="smart_test_input",
        target_duration=10.0
    )
    
    if result:
        print(f"\\n✅ 测试完成: {result}")
    return result

def test_on_screenshots():
    """用 screenshots 测试"""
    agent = DynamicFilterAgent(
        keyframe_interval=1.5,
        output_dir=Path("output_videos")
    )
    
    result = agent.generate_video(
        input_path="screenshots",
        output_name="smart_test_screenshots",
        target_duration=5.0
    )
    
    if result:
        print(f"\\n✅ 测试完成: {result}")
    return result

if __name__ == "__main__":
    print("选择测试模式:")
    print("1. 用 input_images (5张游戏截图)")
    print("2. 用 screenshots (游戏连续截图)")
    
    choice = input("输入 1 或 2: ").strip()
    
    if choice == "1":
        test_on_input_images()
    elif choice == "2":
        test_on_screenshots()
    else:
        print("无效选择")
'''
    
    script_path = Path("test_dynamic_filter.py")
    with open(script_path, 'w', encoding='utf-8') as f:
        f.write(script)
    
    print(f"测试脚本已创建: {script_path}")
    return script_path


if __name__ == "__main__":
    # 直接运行测试
    create_test_filter_script()
    
    print("\n运行测试:")
    print("  python test_dynamic_filter.py")
