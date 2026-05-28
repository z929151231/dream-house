d = open(r'C:\Users\zxr\.qclaw\workspace\house-sim-minigame\game.js', encoding='utf-8').read()
lines = d.split('\n')

# renderHouse: 底座从572-580移到emoji后
hs = None
for i, l in enumerate(lines):
    if 'function renderHouse' in l:
        hs = i; break
brace = 0; he = None
for i in range(hs, len(lines)):
    if '{' in lines[i]: brace += lines[i].count('{')
    if '}' in lines[i]: brace -= lines[i].count('}')
    if brace == 0 and i > hs: he = i; break

# 找 emoji house fillStyle 那行
emoji_line = None
for i in range(hs, he+1):
    if "ctx.fillStyle=night?'#ffe080':'#ffffff';" in lines[i]:
        emoji_line = i; break

# 找底座 572-580
house_base_start = None
house_base_end = None
for i in range(hs, he+1):
    if '// 房子底座（和树冠底部一样' in lines[i]:
        house_base_start = i
    if house_base_start and 'ctx.fill();' in lines[i] and i > house_base_start:
        house_base_end = i; break

print(f"renderHouse: {hs+1}-{he+1}, emoji at {emoji_line+1}, base at {house_base_start+1}-{house_base_end+1}")

# 重组 renderHouse
# 保留: 554-571 + 581-653(emoji fill前) + 底座572-580 + 653(emoji fill) + 654}
# 即: before_base + after_base_until_emoji + base + emoji + after

before_base = '\n'.join(lines[hs:house_base_start])
after_base_until_emoji = '\n'.join(lines[house_base_end+1:emoji_line+1])
base_code = '\n'.join(lines[house_base_start:house_base_end+1])
after_emoji = '\n'.join(lines[emoji_line+1:he+1])
after_house = '\n'.join(lines[he+1:])

new_house = before_base + '\n' + after_base_until_emoji + '\n\n' + base_code + '\n' + after_emoji

new_d = new_house + '\n' + after_house

with open(r'C:\Users\zxr\.qclaw\workspace\house-sim-minigame\game.js', 'w', encoding='utf-8') as f:
    f.write(new_d)
print('Done')

# 验证
d2 = open(r'C:\Users\zxr\.qclaw\workspace\house-sim-minigame\game.js', encoding='utf-8').read()
lines2 = d2.split('\n')
for i, l in enumerate(lines2):
    if 'function renderHouse' in l:
        hs2 = i; break
brace = 0; he2 = None
for i in range(hs2, len(lines2)):
    if '{' in lines2[i]: brace += lines2[i].count('{')
    if '}' in lines2[i]: brace -= lines2[i].count('}')
    if brace == 0 and i > hs2: he2 = i; break
print(f'New renderHouse: {hs2+1}-{he2+1}')
# 找底座位置
for i in range(hs2, he2+1):
    if '// 房子底座' in lines2[i]:
        print(f'Base at line {i+1} (was {house_base_start+1})')
    if "ctx.fillStyle=night?'#ffe080'" in lines2[i]:
        print(f'Emoji at line {i+1} (was {emoji_line+1})')
