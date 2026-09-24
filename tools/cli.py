#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
MineContext CLI 测试客户端
直接通过 HTTP 调用后端 API，测试截图分析全链路
"""

import argparse
import base64
import io
import json
import os
import sys
import time
import urllib.request
import urllib.error
from datetime import datetime

BASE_URL = "http://127.0.0.1:1733"


def api_get(path):
    url = f"{BASE_URL}{path}"
    req = urllib.request.Request(url)
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return json.loads(r.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8") if e.fp else ""
        return {"error": f"HTTP {e.code}", "body": body[:500]}
    except Exception as e:
        return {"error": str(e)}


def api_post(path, data):
    url = f"{BASE_URL}{path}"
    body = json.dumps(data).encode("utf-8")
    req = urllib.request.Request(url, data=body, headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return json.loads(r.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8") if e.fp else ""
        return {"error": f"HTTP {e.code}", "body": body[:500]}
    except Exception as e:
        return {"error": str(e)}


def print_json(data):
    print(json.dumps(data, ensure_ascii=False, indent=2))


def cmd_health():
    """检查后端健康状态"""
    print("=== 后端健康检查 ===")
    r = api_get("/api/health")
    print_json(r)
    return r.get("data", {}).get("status") == "healthy"


def cmd_model_config():
    """查看当前模型配置"""
    print("=== 模型配置 ===")
    r = api_get("/api/model_settings/get")
    print_json(r.get("data", r))


def cmd_stats():
    """查看截图处理统计"""
    print("=== 录制统计 ===")
    r = api_get("/api/monitoring/recording-stats")
    print_json(r.get("data", r))

    print("\n=== 数据统计 (24h) ===")
    r = api_get("/api/monitoring/data-stats?hours=24")
    print_json(r.get("data", r))

    print("\n=== 处理错误 (24h) ===")
    r = api_get("/api/monitoring/processing-errors?hours=24")
    print_json(r.get("data", r))


def cmd_send_screenshot(filepath):
    """发送单张截图给后端分析"""
    if not os.path.exists(filepath):
        print(f"文件不存在: {filepath}")
        return

    now = datetime.now().isoformat()
    print(f"=== 发送截图: {filepath} ===")
    data = {
        "path": os.path.abspath(filepath),
        "window": "",
        "create_time": now,
        "source": "cli_test"
    }
    r = api_post("/api/add_screenshot", data)
    print_json(r)

    print("\n等待 15 秒让 VLM 处理...")
    time.sleep(15)

    print("=== 处理后的录制统计 ===")
    r = api_get("/api/monitoring/recording-stats")
    print_json(r.get("data", r))

    print("\n=== 数据统计 ===")
    r = api_get("/api/monitoring/data-stats?hours=1")
    print_json(r.get("data", r))

    print("\n=== 处理错误 ===")
    r = api_get("/api/monitoring/processing-errors?hours=1")
    print_json(r.get("data", r))


def cmd_gen_test_image():
    """生成一张测试图片和对应的 JSON 数据内容，然后发送到后端"""
    from PIL import Image, ImageDraw

    img = Image.new("RGB", (800, 500), color=(40, 42, 54))
    draw = ImageDraw.Draw(img)
    code_lines = [
        "def login_user(username, password):",
        "    user = db.query(username)",
        "    if user.check_password(password):",
        "        return create_token(user)",
        "    return None",
        "",
        "TODO: fix the login bug",
    ]
    for i, line in enumerate(code_lines):
        draw.text((20, 20 + i * 30), line, fill=(248, 248, 242))

    path = os.path.abspath("test_screenshot.png")
    img.save(path, "PNG")
    print(f"测试图片已生成: {path} ({os.path.getsize(path)} bytes)")
    return path


def cmd_test_full():
    """完整全链路测试：生成图片 → 发送 → 等待处理 → 查看结果"""
    print("=" * 60)
    print("MineContext CLI 全链路测试")
    print("=" * 60)

    # 1. 健康检查
    if not cmd_health():
        print("后端未就绪，无法继续测试")
        return
    print()

    # 2. 模型配置
    cmd_model_config()
    print()

    # 3. 当前状态
    print("=== 测试前录制统计 ===")
    r = api_get("/api/monitoring/recording-stats")
    before = r.get("data", {})
    print_json(before)
    print()

    # 4. 生成并发送测试图片
    test_img = cmd_gen_test_image()
    cmd_send_screenshot(test_img)
    print()

    # 5. 等待处理完成
    print("=== 再等 20 秒确保处理完成 ===")
    time.sleep(20)

    # 6. 最终状态
    print("=== 最终录制统计 ===")
    r = api_get("/api/monitoring/recording-stats")
    after = r.get("data", {})
    print_json(after)

    # 7. 对比
    print()
    print("=" * 60)
    print("对比结果:")
    print(f"  截图总数: {before.get('total_screenshots', 0)} → {after.get('total_screenshots', 0)}")
    print(f"  成功处理: {before.get('processed', 0)} → {after.get('processed', 0)}")
    print(f"  处理失败: {before.get('failed', 0)} → {after.get('failed', 0)}")

    # 8. 错误详情
    print()
    print("=== 处理错误详情 ===")
    r = api_get("/api/monitoring/processing-errors?hours=1&top=10")
    errors = r.get("data", [])
    if errors:
        for e in errors:
            print(f"  错误: {e}")
    else:
        print("  无错误")

    print()
    print("=== VLM 模型直连测试 (验证 Qwen3.5 是否可用) ===")
    cmd_test_vlm_direct(test_img)

    # 清理
    os.remove(test_img)
    print(f"\n测试图片已清理: {test_img}")


def cmd_test_vlm_direct(image_path=None):
    """直接测试 VLM 模型（不走 MineContext 后端，直连网关）"""
    if not image_path:
        image_path = "test_screenshot.png"
        if not os.path.exists(image_path):
            cmd_gen_test_image()
            image_path = "test_screenshot.png"

    print(f"使用图片: {image_path}")

    try:
        from openai import OpenAI
        with open(image_path, "rb") as f:
            img_b64 = base64.b64encode(f.read()).decode()

        client = OpenAI(
            api_key="sk-anything",
            base_url="https://t.eshore.cn:10443/v1/gdai/api/3vq9d7t42l8g/model/common",
            timeout=60,
        )

        resp = client.chat.completions.create(
            model="Qwen3.5-397B-A17B",
            messages=[{"role": "user", "content": [
                {"type": "text", "text": "Describe what you see in this screenshot in one sentence."},
                {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{img_b64}"}},
            ]}],
            max_tokens=200,
        )
        print(f"VLM 响应: {resp.choices[0].message.content}")
        print("VLM 直连测试: [OK] 成功")
    except Exception as e:
        print(f"VLM 直连测试: [FAIL] - {e}")


def cmd_test_ollama_embedding():
    """测试本地 Ollama embedding"""
    import urllib.request, json
    url = "http://localhost:11434/v1/embeddings"
    body = json.dumps({"model": "nomic-embed-text", "input": ["test embedding"]}).encode()
    req = urllib.request.Request(url, data=body, headers={
        "Authorization": "Bearer ollama",
        "Content-Type": "application/json"
    })
    try:
        with urllib.request.urlopen(req, timeout=15) as r:
            data = json.loads(r.read().decode("utf-8"))
            emb = data.get("data", [{}])[0].get("embedding", [])
            print(f"Ollama embedding 维度: {len(emb)}")
            print("Ollama embedding 测试: [OK] 成功")
    except Exception as e:
        print(f"Ollama embedding 测试: [FAIL] - {e}")


def cmd_test_embedding():
    """测试 embedding 全链路"""
    cmd_test_ollama_embedding()
    print()


def main():
    parser = argparse.ArgumentParser(description="MineContext CLI 测试客户端")
    sub = parser.add_subparsers(dest="cmd")

    sub.add_parser("health", help="健康检查")
    sub.add_parser("config", help="查看模型配置")
    sub.add_parser("stats", help="查看处理统计")
    sub.add_parser("embedding", help="测试 Ollama embedding")
    sp_send = sub.add_parser("send", help="发送截图")
    sp_send.add_argument("filepath", help="截图文件路径")
    sp_gen = sub.add_parser("gen", help="生成测试图片")
    sp_gen.add_argument("--output", default="test_screenshot.png", help="输出路径")
    sub.add_parser("vlm", help="直连测试 VLM 模型")
    sub.add_parser("test", help="全链路测试")

    args = parser.parse_args()

    if args.cmd == "health":
        cmd_health()
    elif args.cmd == "config":
        cmd_model_config()
    elif args.cmd == "stats":
        cmd_stats()
    elif args.cmd == "embedding":
        cmd_test_embedding()
    elif args.cmd == "send":
        cmd_send_screenshot(args.filepath)
    elif args.cmd == "gen":
        path = cmd_gen_test_image()
        if args.output != "test_screenshot.png":
            os.rename(path, args.output)
            path = args.output
            print(f"图片保存到: {path}")
    elif args.cmd == "vlm":
        cmd_test_vlm_direct()
    elif args.cmd == "test":
        cmd_test_full()
    else:
        parser.print_help()


if __name__ == "__main__":
    main()