d = open(r'C:\Users\zxr\.qclaw\workspace\house-sim-minigame\game.js', encoding='utf-8').read()

# =============================================
# PART 1: renderCellItem - 删除3个旧底座，在emoji前插入统一底座
# =============================================

# 旧底座1：树冠底部
old_tree_base = """            // 树冠底部（落在格子上）
            ctx.fillStyle = night ? '#1a3a1a' : '#2a6a28';
            ctx.beginPath();
            ctx.moveTo(cx, cy - hh);
            ctx.lineTo(cx + hw - 2, cy);
            ctx.lineTo(cx, cy + hh - 2);
            ctx.lineTo(cx - hw + 2, cy);
            ctx.closePath();
            ctx.fill();
"""
# 旧底座2：花朵底座
old_flower_base = """            // 花朵底座（贴在格子上，遮住缝隙）
            ctx.fillStyle = night ? '#2a4a2a' : '#3a7a3a';
            ctx.beginPath();
            ctx.moveTo(cx, cy - hh);
            ctx.lineTo(cx + hw - 2, cy);
            ctx.lineTo(cx, cy + hh - 2);
            ctx.lineTo(cx - hw + 2, cy);
            ctx.closePath();
            ctx.fill();
"""
# 旧底座3：装饰物底部
old_deco_base = """        } else if (cell.plant.type === 'deco') {
            // 装饰物底部
            ctx.fillStyle = night ? '#2a3a2a' : '#4a6a3a';
            ctx.beginPath();
            ctx.moveTo(cx, cy - hh);
            ctx.lineTo(cx + hw - 2, cy);
            ctx.lineTo(cx, cy + hh - 2);
            ctx.lineTo(cx - hw + 2, cy);
            ctx.closePath();
            ctx.fill();
        }"""

# 删除这3个旧底座
d = d.replace(old_tree_base, '')
d = d.replace(old_flower_base, '')
d = d.replace(old_deco_base, '        }')

# 在 emoji 图标前插入统一底座
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

old_house_base = """    // 房子底座（和树冠底部一样，贴在格子上遮住缝隙）
    ctx.fillStyle = baseColor;
    ctx.beginPath();
    ctx.moveTo(cx, cy - hh);         // 上顶点
    ctx.lineTo(cx + hw, cy);         // 右顶点
    ctx.lineTo(cx, cy + hh);         // 下顶点
    ctx.lineTo(cx - hw, cy);         // 左顶点
    ctx.closePath();
    ctx.fill();

    // 左侧面"""

new_house = """    // 左侧面"""

d = d.replace(old_house_base, new_house)

# 在 emoji 本体后加底座
old_emoji_section = """    ctx.fillStyle=night?'#ffe080':'#ffffff';
    ctx.fillText(emoji,cx,cy-bh+emojiSize*0.1);
}"""

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
}"""

d = d.replace(old_emoji_section, new_emoji_with_base, 1)

with open(r'C:\Users\zxr\.qclaw\workspace\house-sim-minigame\game.js', 'w', encoding='utf-8') as f:
    f.write(d)
print('Done')
