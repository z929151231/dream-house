#!/usr/bin/env python3
"""
一键游戏截图分析工具
支持：ADB截图 + GLM-4.6v-flashx 图像分析 + 结果输出
"""

import os
import json
import urllib.request
import base64
import subprocess
import sys
from datetime import datetime
from pathlib import Path

# ============== 配置区 ==============
CONFIG = {
    # 智谱 API（替换成你自己的）
    'glm_api_key': '4c5103ef14254a5da223e5de0bd27879.Pt0orCbAoQGgXwSU',
    'glm_model': 'glm-4.6v-flashx',
    'glm_timeout': 120,
    
    # 设备配置（自动获取第一个设备）
    'adb_device': None,  # 设为 None 自动获取第一个，或指定设备ID如 'R5CW91XQEGF'
    
    # 截图保存路径
    'screenshot_dir': Path(__file__).parent / 'screenshots',
    
    # 分析结果保存
    'result_dir': Path(__file__).parent / 'analysis_results',
}

# 分区域标注 prompt 模板（根据你的游戏调整）
DEFAULT_PROMPT_TEMPLATE = """
你正在分析一款2D横版卷轴游戏的截图，请仔细观察画面并回答：

【场景识别】
先描述这是什么场景（战斗/探索/解谜/商店等）

【区域分析】（按此结构逐项观察）
┌─────────────────────────────────────┐
│【区域1 - 左上角小地图】              │
│  • 绿色圆点（自身位置）坐标          │
│  • 红色/黄色点（敌人/目标）位置      │
│  • 灰色区域（已探索/未探索）         │
│                                     │
│【区域2 - 角色正上方区域】            │
│  • 有无天花板/障碍物                 │
│  • 有无可互动元素（开关/道具）       │
│                                     │
│【区域3 - 角色正下方区域】            │
│  • 地面类型（平路/坑洞/平台）        │
│  • 有无陷阱/岩浆                     │
│                                     │
│【区域4 - 角色正左方区域】            │
│  • 有无墙壁/障碍物                   │
│  • 距离最近的障碍物多少像素          │
│                                     │
│【区域5 - 角色正右方区域】            │
│  • 有无墙壁/障碍物                   │
│  • 距离最近的障碍物多少像素          │
│                                     │
│【区域6 - 屏幕边缘】                  │
│  • 左边缘：是否可继续向左            │
│  • 右边缘：是否可继续向右            │
│  • 上边缘：有无隐藏平台              │
│  • 下边缘：有无隐藏区域              │
└─────────────────────────────────────┘

【AI人物状态】
• 角色朝向（左/右）
• 角色动作（站立/奔跑/跳跃/攻击）
• 生命值/能量值状态

【导航建议】
基于以上分析，给出明确的移动建议：
1. 当前最优方向：← / → / ↑ / ↓
2. 理由：（简短说明）
3. 风险提示：（如有）

【置信度】
用1-5星表示你的判断信心
★★★★☆ 4/5 - 区域2和区域3的分析比较清晰，但小地图模糊
"""

# ============== 工具函数 ==============

def run_cmd(cmd, cwd=None):
    """执行命令行，返回输出"""
    try:
        result = subprocess.run(
            cmd, shell=True, capture_output=True, text=True, 
            cwd=cwd, timeout=30
        )
        return result.stdout.strip(), result.returncode
    except subprocess.TimeoutExpired:
        return "命令超时", -1
    except Exception as e:
        return str(e), -1


def get_adb_devices():
    """获取所有已连接设备"""
    output, code = run_cmd("adb devices")
    if code != 0:
        return []
    
    devices = []
    for line in output.split('\n'):
        if '\tdevice' in line:
            device_id = line.split('\t')[0]
            devices.append(device_id)
    return devices


def adb_screenshot(device_id=None, save_path=None):
    """ADB截图"""
    if device_id is None:
        devices = get_adb_devices()
        if not devices:
            return None, "没有连接的设备"
        device_id = devices[0]
    
    # 设备端临时路径
    temp_path = "/sdcard/screenshot_temp.png"
    
    # 执行截图
    cmd = f'adb -s {device_id} shell screencap /sdcard/screenshot_temp.png'
    output, code = run_cmd(cmd)
    if code != 0:
        return None, f"截图失败: {output}"
    
    # 拉取到本地
    if save_path is None:
        CONFIG['screenshot_dir'].mkdir(parents=True, exist_ok=True)
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        save_path = CONFIG['screenshot_dir'] / f'screenshot_{timestamp}.png'
    
    cmd = f'adb -s {device_id} pull {temp_path} "{save_path}"'
    output, code = run_cmd(cmd)
    if code != 0:
        return None, f"拉取失败: {output}"
    
    # 清理设备端临时文件
    run_cmd(f'adb -s {device_id} shell rm {temp_path}')
    
    return str(save_path), None


def image_to_base64(image_path):
    """图片转base64"""
    with open(image_path, 'rb') as f:
        return base64.b64encode(f.read()).decode('utf-8')


def call_glm_api(image_b64, prompt, model=None, timeout=None):
    """调用智谱GLM API进行图像分析"""
    model = model or CONFIG['glm_model']
    timeout = timeout or CONFIG['glm_timeout']
    
    payload = json.dumps({
        'model': model,
        'messages': [{
            'role': 'user',
            'content': [
                {
                    'type': 'image_url',
                    'image_url': {
                        'url': 'data:image/png;base64,' + image_b64
                    }
                },
                {'type': 'text', 'text': prompt}
            ]
        }]
    }).encode('utf-8')
    
    url = 'https://open.bigmodel.cn/api/paas/v4/chat/completions'
    req = urllib.request.Request(
        url,
        data=payload,
        headers={
            'Authorization': f'Bearer {CONFIG["glm_api_key"]}',
            'Content-Type': 'application/json'
        }
    )
    
    try:
        resp = urllib.request.urlopen(req, timeout=timeout)
        result = json.loads(resp.read().decode('utf-8'))
        return result['choices'][0]['message']['content'], None
    except urllib.error.HTTPError as e:
        body = e.read().decode() if hasattr(e, 'read') else ''
        return None, f"HTTP {e.code}: {body}"
    except Exception as e:
        return None, str(e)


def save_analysis_result(screenshot_path, prompt, result, error=None):
    """保存分析结果"""
    CONFIG['result_dir'].mkdir(parents=True, exist_ok=True)
    
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    result_file = CONFIG['result_dir'] / f'analysis_{timestamp}.md'
    
    content = f"""# 游戏截图分析结果

**截图:** `{screenshot_path}`
**时间:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
**模型:** {CONFIG['glm_model']}

---

## 用户Prompt
```
{prompt}
```

---

## AI分析结果

{result if not error else f'**❌ 错误:** {error}**'}

---

*Generated by game_analyzer.py*
"""
    
    with open(result_file, 'w', encoding='utf-8') as f:
        f.write(content)
    
    return str(result_file)


# ============== 主流程 ==============

def main():
    print("=" * 60)
    print("  🎮 游戏截图分析工具")
    print("  ADB截图 + GLM-4.6v-flashx 图像分析")
    print("=" * 60)
    
    # 1. 检查ADB设备
    print("\n[1/4] 检查设备连接...")
    devices = get_adb_devices()
    if not devices:
        print("❌ 没有找到设备，请确保：")
        print("   1. USB调试已开启")
        print("   2. 设备已连接并用 `adb devices` 验证")
        sys.exit(1)
    
    device = CONFIG['adb_device'] or devices[0]
    print(f"✅ 找到设备: {device}")
    
    # 2. ADB截图
    print("\n[2/4] 正在截图...")
    screenshot_path, error = adb_screenshot(device)
    if error:
        print(f"❌ 截图失败: {error}")
        sys.exit(1)
    
    file_size = os.path.getsize(screenshot_path) / 1024
    print(f"✅ 截图已保存: {screenshot_path} ({file_size:.1f} KB)")
    
    # 3. 调用GLM分析
    print("\n[3/4] 正在分析图像... (可能需要几十秒)")
    image_b64 = image_to_base64(screenshot_path)
    print(f"   Base64 编码: {len(image_b64):,} 字符")
    
    result, error = call_glm_api(image_b64, DEFAULT_PROMPT_TEMPLATE)
    
    # 4. 保存结果
    print("\n[4/4] 保存分析结果...")
    result_file = save_analysis_result(screenshot_path, DEFAULT_PROMPT_TEMPLATE, result, error)
    
    if error:
        print(f"❌ 分析失败: {error}")
        print(f"   截图已保存: {screenshot_path}")
    else:
        print(f"✅ 分析完成！")
        print(f"   结果文件: {result_file}")
        print("\n" + "=" * 60)
        print("  📋 AI 分析结果摘要")
        print("=" * 60)
        # 显示前500字符
        preview = result[:800].replace('\n', '\n  ')
        print(f"  {preview}...")
        print("\n" + "=" * 60)
    
    return result_file


if __name__ == '__main__':
    main()
