import re

d = open(r'C:\Users\zxr\.qclaw\workspace\house-sim-minigame\game.js', encoding='utf-8').read()
lines = d.split('\n')

# ==========================================
# PART 1: 修复 renderCellItem
# ==========================================
for i, l in enumerate(lines):
    if 'function renderCellItem' in l:
        cs = i; break
brace = 0; ce = None
for i in range(cs, len(lines)):
    if '{' in lines[i]: brace += lines[i].count('{')
    if '}' in lines[i]: brace -= lines[i].count('}')
    if brace == 0 and i > cs: ce = i; break

# 找需要删除的底座菱形区域
to_delete = set()
keywords = [
    '// 树冠底部（落在格子上）',
    '// 花朵底座（贴在格子上，遮住缝隙）',
    '// 装饰物底部'
]
for kw in keywords:
    for i in range(cs, ce+1):
        if kw in lines[i]:
            start = i
            end = None
            for j in range(i, min(i+10, ce+1)):
                if 'ctx.fill();' in lines[j]:
                    end = j; break
            if end:
                for x in range(start, end+1):
                    to_delete.add(x)
            break

print("cellItem - lines to delete:", [x+1 for x in sorted(to_delete)])

# 找 emoji 注释行
for i in range(cs, ce+1):
    if '// === emoji 图标 ===' in lines[i]:
        emoji_comment_line = i; break

print("emoji comment at line:", emoji_comment_line+1)

# 构建新函数
new_func_lines = []
for i in range(cs, emoji_comment_line):
    if i not in to_delete:
        new_func_lines.append(lines[i])

# 插入统一底座
new_func_lines += [
    '',
    '    // === 统一底座（最后画=盖在上层=落地感）===',
    '    if (bh > 0) {',
    "        const baseColor = night ? '#2a3a2a' : '#4a6a3a';",
    '        const baseHW = hw - 1;',
    '        const baseHH = hh - 1;',
    '        ctx.fillStyle = baseColor;',
    '        ctx.beginPath();',
    '        ctx.moveTo(cx, cy - baseHH);',
    '        ctx.lineTo(cx + baseHW, cy);',
    '        ctx.lineTo(cx, cy + baseHH);',
    '        ctx.lineTo(cx - baseHW, cy);',
    '        ctx.closePath();',
    '        ctx.fill();',
    '    }'
]

for i in range(emoji_comment_line, ce+1):
    if i not in to_delete:
        new_func_lines.append(lines[i])

new_func_text = '\n'.join(new_func_lines)
before1 = '\n'.join(lines[:cs])
after1 = '\n'.join(lines[ce+1:])
new_d = before1 + '\n' + new_func_text + '\n' + after1

# ==========================================
# PART 2: 修复 renderHouse - 底座移到最后
# ==========================================
lines2 = new_d.split('\n')
for i, l in enumerate(lines2):
    if 'function renderHouse' in l:
        hs = i; break
brace = 0; he = None
for i in range(hs, len(lines2)):
    if '{' in lines2[i]: brace += lines2[i].count('{')
    if '}' in lines2[i]: brace -= lines2[i].count('}')
    if brace == 0 and i > hs: he = i; break

# 找底座代码
for i in range(hs, he+1):
    if '// 房子底座（和树冠底部一样' in lines2[i]:
        house_base_start = i; break
for i in range(house_base_start, he+1):
    if 'ctx.fill();' in lines2[i] and i > house_base_start:
        house_base_end = i; break

print(f"House base: lines {house_base_start+1}-{house_base_end+1}")

# 提取底座代码
house_base_code = lines2[house_base_start:house_base_end+1]

# 找 emoji 本体行
for i in range(hs, he+1):
    if "ctx.fillStyle = night ? '#d0e8d0' : '#ffffff';" in lines2[i]:
        emoji_line = i; break

print(f"emoji at line: {emoji_line+1}")

# 重组: before + 中间 + 底座 + emoji后
before_h = '\n'.join(lines2[:hs])
middle_h_no_base = '\n'.join(lines2[hs:house_base_start]) + '\n'.join(lines2[house_base_end+1:emoji_line+1])
after_h = '\n'.join(lines2[emoji_line+1:he])
after_all = '\n'.join(lines2[he+1:])

new_house = before_h + '\n' + middle_h_no_base + '\n\n' + '\n'.join(house_base_code) + '\n' + after_h

new_d2 = new_house + '\n' + after_all

with open(r'C:\Users\zxr\.qclaw\workspace\house-sim-minigame\game.js', 'w', encoding='utf-8') as f:
    f.write(new_d2)
print('Done writing')
