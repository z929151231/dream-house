d = open(r'C:\Users\zxr\.qclaw\workspace\house-sim-minigame\game.js', encoding='utf-8').read()
tests = [
    '// 树冠底部（落在格子上）',
    '// 花朵底座（贴在格子上，遮住缝隙）',
    '// 装饰物底部',
    '// === emoji 图标 ===',
    '// 房子底座（和树冠底部一样',
    "ctx.fillStyle=night?'#ffe080':'#ffffff';",
]
for t in tests:
    found = t in d
    print(found, repr(t[:50]))
