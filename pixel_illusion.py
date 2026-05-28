#!/usr/bin/env python3
"""
像素扰动生成器 - 纯粹好玩
用原图生成多张"看起来一样但 base64 不同"的图片
"""

from PIL import Image
import base64
import io
import random
import hashlib
import os

def create_base_image():
    """创建一个有趣的测试图"""
    img = Image.new('RGB', (200, 200), color='#2D3748')
    
    # 画个简单的图案
    from PIL import ImageDraw
    draw = ImageDraw.Draw(img)
    
    # 背景渐变模拟（用色块）
    colors = ['#4299E1', '#667EEA', '#805AD5']
    for i, c in enumerate(colors):
        draw.rectangle([i*70, 0, (i+1)*70, 200], fill=c)
    
    # 中间画个笑脸
    draw.ellipse([70, 60, 130, 130], fill='white')
    draw.ellipse([85, 80, 95, 90], fill='black')  # 左眼
    draw.ellipse([105, 80, 115, 90], fill='black')  # 右眼
    draw.arc([80, 95, 120, 120], 0, 180, fill='black', width=3)  # 嘴巴
    
    # 文字
    draw.text((65, 140), 'HELLO', fill='white')
    
    return img

def pixel_perturb(img, seed=None, perturbation=0.5):
    """
    像素级扰动
    
    perturbation: 扰动强度 0-2
        0.3  ~ 肉眼完全看不出来
        0.5  ~ 仔细看能感觉到
        1.0  ~ 明显噪点
        2.0  ~ 像老旧电视雪花
    """
    random.seed(seed)
    new_img = img.copy()
    pixels = new_img.load()
    width, height = new_img.size
    
    for y in range(height):
        for x in range(width):
            r, g, b = pixels[x, y]
            
            # 高斯噪声
            noise_r = int(random.gauss(0, perturbation * 8))
            noise_g = int(random.gauss(0, perturbation * 8))
            noise_b = int(random.gauss(0, perturbation * 8))
            
            pixels[x, y] = (
                max(0, min(255, r + noise_r)),
                max(0, min(255, g + noise_g)),
                max(0, min(255, b + noise_b))
            )
    
    return new_img

def img_to_base64(img, format='JPEG', quality=85):
    """图片转 base64"""
    buffer = io.BytesIO()
    img.save(buffer, format=format, quality=quality, optimize=True)
    data = base64.b64encode(buffer.getvalue()).decode()
    return data

def compute_phash(img):
    """感知哈希 - 衡量视觉相似度"""
    from imagehash import phash
    return phash(img.convert('L').resize((32, 32)))

def main():
    print("=" * 60)
    print("  🎨 像素幻觉生成器")
    print("  生成多张'看起来一样但数据不同'的图片")
    print("=" * 60)
    
    os.makedirs('/tmp/base64_artifacts', exist_ok=True)
    
    # 1. 创建原图
    original = create_base_image()
    original_b64 = img_to_base64(original)
    original_hash = compute_phash(original)
    
    print(f"\n原图: {original.size[0]}x{original.size[1]}")
    print(f"Base64 长度: {len(original_b64)} 字符")
    print(f"感知哈希: {original_hash}")
    
    # 2. 生成扰动版本
    versions = []
    for i in range(5):
        # 每次用不同种子 + 微调扰动
        seed = 100 + i * 7  # 不同种子
        perturb = 0.3 + i * 0.2  # 递增扰动
        
        modified = pixel_perturb(original, seed=seed, perturbation=perturb)
        modified_b64 = img_to_base64(modified)
        modified_hash = compute_phash(modified)
        
        hash_diff = original_hash - modified_hash
        save_path = f'/tmp/base64_artifacts/version_{i}.jpg'
        modified.save(save_path, quality=85)
        
        versions.append({
            'seed': seed,
            'perturb': perturb,
            'b64_len': len(modified_b64),
            'hash': modified_hash,
            'hash_diff': hash_diff,
            'path': save_path,
            'b64_sample': modified_b64[:40] + '...'
        })
        
        print(f"\n--- Version {i} (seed={seed}, perturbation={perturb}) ---")
        print(f"  Base64 长度: {len(modified_b64)} 字符")
        print(f"  感知哈希: {modified_hash}")
        print(f"  哈希距离: {hash_diff} (越大越不像)")
        print(f"  Base64 前缀: {modified_b64[:40]}...")
    
    # 3. 对比分析
    print("\n" + "=" * 60)
    print("  对比分析")
    print("=" * 60)
    print(f"{'版本':<8} {'扰动':<8} {'哈希距离':<10} {'Base64相同率':<15}")
    print("-" * 50)
    
    for v in versions:
        # 计算 base64 与原图的相同字符比例
        same_chars = sum(1 for a, b in zip(original_b64, v['b64_sample']) if a == b)
        similarity = same_chars / len(v['b64_sample']) * 100 if v['b64_sample'] else 0
        print(f"V{v['seed']:03d}   {v['perturb']:<8.1f} {v['hash_diff']:<10} {similarity:.1f}%")
    
    # 4. 生成一个"几乎一样但 base64 完全不同"的例子
    print("\n" + "=" * 60)
    print("  🔬 极限实验：用极低扰动生成 base64 完全不同的图片")
    print("=" * 60)
    
    # JPEG 压缩本身会产生变化！
    for quality in [100, 95, 90, 85, 80]:
        img = pixel_perturb(original, seed=42, perturbation=0.01)
        b64 = img_to_base64(img, quality=quality)
        print(f"  质量 {quality:3d} → Base64 长度 {len(b64):6d} 字符")
    
    # 5. 结论
    print("\n" + "=" * 60)
    print("  📝 结论")
    print("=" * 60)
    print("""
1. 像素扰动 + JPEG 重压缩 = 稳定生成"视觉相同但数据不同"的图片
2. 扰动 0.3 以下肉眼完全看不出区别
3. 每张图片的 base64 都是唯一的，但感知哈希几乎不变
4. 这就是"同一张图的无数种数字分身"

生成的图片文件在: /tmp/base64_artifacts/
可以对比看看效果！
    """)

if __name__ == '__main__':
    main()
