d = open(r'C:\Users\zxr\.qclaw\workspace\house-sim-minigame\game.js', encoding='utf-8').read()

# Extract exact tree base block
idx = d.find('// 树冠底部（落在格子上）')
end = d.find('ctx.fill();', idx)
print("=== TREE BASE ===")
print(repr(d[idx-4:end+12]))
print()

# Extract exact flower base block
idx = d.find('// 花朵底座（贴在格子上，遮住缝隙）')
end = d.find('ctx.fill();', idx)
print("=== FLOWER BASE ===")
print(repr(d[idx-4:end+12]))
print()

# Extract exact deco block
idx = d.find('// 装饰物底部')
end = d.find('ctx.fill();', idx)
print("=== DECO ===")
print(repr(d[idx-4:end+12]))
print()

# Extract house base block
idx = d.find('// 房子底座（和树冠底部一样')
end = d.find('ctx.fill();', idx)
print("=== HOUSE BASE ===")
print(repr(d[idx-4:end+12]))
print()

# Extract emoji section (house)
idx = d.find("ctx.fillStyle=night?'#ffe080'")
print("=== HOUSE EMOJI SECTION ===")
print(repr(d[idx-200:idx+150]))
