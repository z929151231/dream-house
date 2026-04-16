d = open(r'C:\Users\zxr\.qclaw\workspace\house-sim-minigame\game.js', encoding='utf-8').read()

# =============================================
# PART 1: renderCellItem - 删除3个旧底座，在emoji前插入统一底座
# =============================================

old_tree_base = "    // 树冠底部（落在格子上）\n            ctx.fillStyle = night ? '#1a3a1a' : '#2a6a28';\n            ctx.beginPath();\n            ctx.moveTo(cx, cy - hh);\n            ctx.lineTo(cx + hw - 2, cy);\n            ctx.lineTo(cx, cy + hh - 2);\n            ctx.lineTo(cx - hw + 2, cy);\n            ctx.closePath();\n            ctx.fill();\n"
old_flower_base = "    // 花朵底座（贴在格子上，遮住缝隙）\n            ctx.fillStyle = night ? '#2a4a2a' : '#3a7a3a';\n            ctx.beginPath();\n            ctx.moveTo(cx, cy - hh);\n            ctx.lineTo(cx + hw - 2, cy);\n            ctx.lineTo(cx, cy + hh - 2);\n            ctx.lineTo(cx - hw + 2, cy);\n            ctx.closePath();\n            ctx.fill();\n"
old_deco_base = "    // 装饰物底部\n            ctx.fillStyle = night ? '#2a3a2a' : '#4a6a3a';\n            ctx.beginPath();\n            ctx.moveTo(cx, cy - hh);\n            ctx.lineTo(cx + hw - 2, cy);\n            ctx.lineTo(cx, cy + hh - 2);\n            ctx.lineTo(cx - hw + 2, cy);\n            ctx.closePath();\n            ctx.fill();\n"

d = d.replace(old_tree_base, '')
d = d.replace(old_flower_base, '')
d = d.replace(old_deco_base, '')

# 插入统一底座（在 emoji 图标注释前）
new_base = """
    // === 统一底座（最后画=盖在上层=落地感）===
    if (bh > 0) {
        const baseColor = night ? '#2a3a2a' : '#4a6a3a';
        const baseHW = hw - 1;
        const baseHH = hh - 1;
        ctx.fillStyle = baseColor;
        ctx.beginPath();
        ctx.moveTo(cx, cy - baseHH);
        ctx.lineTo(cx + baseHW, cy);
        ctx.lineTo(cx, cy + baseHH);
        ctx.lineTo(cx - baseHW, cy);
        ctx.closePath();
        ctx.fill();
    }

    // === emoji 图标 ==="""

d = d.replace('    // === emoji 图标 ===', new_base, 1)

# =============================================
# PART 2: renderHouse - 底座移到emoji后
# =============================================

old_house_base = "    // 房子底座（和树冠底部一样，贴在格子上遮住缝隙）\n    ctx.fillStyle = baseColor;\n    ctx.beginPath();\n    ctx.moveTo(cx, cy - hh);         // 上顶点\n    ctx.lineTo(cx + hw, cy);         // 右顶点\n    ctx.lineTo(cx, cy + hh);         // 下顶点\n    ctx.lineTo(cx - hw, cy);         // 左顶点\n    ctx.closePath();\n    ctx.fill();\n\n    // 左侧面：从底座往上延伸"

new_house = "    // 左侧面：从底座往上延伸"

d = d.replace(old_house_base, new_house, 1)

# emoji 后加底座
old_emoji_section = """    ctx.fillStyle=night?'#ffe080':'#ffffff';
    ctx.fillText(emoji,cx,cy-bh+emojiSize*0.1);
}

// ============================================================"""

new_emoji_with_base = """    ctx.fillStyle=night?'#ffe080':'#ffffff';
    ctx.fillText(emoji,cx,cy-bh+emojiSize*0.1);

    // 底座（最后画=盖在上层=落地感）
    ctx.fillStyle=baseColor;
    ctx.beginPath();
    ctx.moveTo(cx,cy-hh);
    ctx.lineTo(cx+hw,cy);
    ctx.lineTo(cx,cy+hh);
    ctx.lineTo(cx-hw,cy);
    ctx.closePath();
    ctx.fill();
}

// ============================================================"""

d = d.replace(old_emoji_section, new_emoji_with_base, 1)

# 验证替换成功
changed = (
    old_tree_base not in d and
    old_flower_base not in d and
    old_deco_base not in d
)
print("Old bases removed:", changed)
print("New base inserted:", "统一底座" in d)

with open(r'C:\Users\zxr\.qclaw\workspace\house-sim-minigame\game.js', 'w', encoding='utf-8') as f:
    f.write(d)
print('Done writing')
