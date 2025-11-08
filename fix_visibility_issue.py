#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
修复表白可见性问题
"""
import os
import sys
import requests
import time

def check_server_running():
    """检查服务器是否正在运行"""
    try:
        response = requests.get('http://localhost:5000/api/confessions', timeout=5)
        return response.status_code == 200
    except:
        return False

def start_server():
    """启动服务器"""
    print("正在启动服务器...")
    os.system('start cmd /k python run.py')
    
    # 等待服务器启动
    print("等待服务器启动...")
    for i in range(10):
        if check_server_running():
            print("✅ 服务器启动成功！")
            return True
        time.sleep(1)
        print(f"等待中... ({i+1}/10)")
    
    print("❌ 服务器启动失败或超时")
    return False

def add_test_confessions():
    """添加一些测试表白"""
    test_data = [
        {
            "to": "小明",
            "from": "匿名用户",
            "content": "小明，我暗恋你很久了，希望能和你成为朋友！",
            "type": "love"
        },
        {
            "to": "小红",
            "from": "朋友",
            "content": "小红，你总是那么乐于助人，谢谢你的帮助！",
            "type": "thanks"
        },
        {
            "to": "全班的同学",
            "from": "班长",
            "content": "感谢大家这段时间的配合，我们的班级越来越棒了！",
            "type": "friendship"
        }
    ]
    
    success_count = 0
    for i, confession in enumerate(test_data):
        try:
            response = requests.post(
                'http://localhost:5000/api/confessions',
                json=confession,
                headers={'Content-Type': 'application/json'},
                timeout=5
            )
            
            if response.status_code == 201:
                print(f"✅ 测试表白 {i+1} 添加成功")
                success_count += 1
            else:
                print(f"❌ 测试表白 {i+1} 添加失败，状态码: {response.status_code}")
        except Exception as e:
            print(f"❌ 测试表白 {i+1} 添加失败: {str(e)}")
    
    return success_count

def open_browser():
    """打开浏览器访问应用"""
    print("正在打开浏览器...")
    os.system('start http://localhost:5000')
    os.system('start http://localhost:5000/admin')

if __name__ == '__main__':
    print("=" * 60)
    print("校园表白墙 - 修复数据可见性问题")
    print("=" * 60)
    
    # 检查服务器是否正在运行
    if not check_server_running():
        print("❌ 服务器未运行")
        
        # 询问是否启动服务器
        choice = input("是否启动服务器? (y/n): ").lower().strip()
        if choice == 'y' or choice == 'yes':
            if not start_server():
                print("无法启动服务器，请手动运行: python run.py")
                sys.exit(1)
        else:
            print("请先启动服务器: python run.py")
            sys.exit(1)
    else:
        print("✅ 服务器正在运行")
    
    # 询问是否添加测试数据
    choice = input("是否添加一些测试表白? (y/n): ").lower().strip()
    if choice == 'y' or choice == 'yes':
        print("正在添加测试表白...")
        count = add_test_confessions()
        print(f"✅ 成功添加 {count} 条测试表白")
    
    # 打开浏览器
    choice = input("是否打开浏览器访问应用? (y/n): ").lower().strip()
    if choice == 'y' or choice == 'yes':
        open_browser()
    
    print("\n" + "=" * 60)
    print("修复完成！")
    print("前台地址: http://localhost:5000")
    print("管理后台: http://localhost:5000/admin")
    print("默认管理员: admin / 123456")
    print("=" * 60)
    print("提示:")
    print("1. 所有用户访问同一网址将看到相同的表白")
    print("2. 新发布的表白会立即对所有用户可见")
    print("3. 确保后端服务器持续运行以保持数据同步")
    print("=" * 60)