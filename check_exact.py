d = open(r'C:\Users\zxr\.qclaw\workspace\house-sim-minigame\game.js', encoding='utf-8').read()

# Check exact string for tree base
idx = d.find('// 树冠底部（落在格子上）')
print("Tree base context:")
print(repr(d[idx:idx+250]))
print()

# Check emoji section
idx2 = d.find("ctx.fillStyle=night?'#ffe080':'#ffffff';")
if idx2 >= 0:
    print("Emoji section context:")
    print(repr(d[idx2-50:idx2+80]))
