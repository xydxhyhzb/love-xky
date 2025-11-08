#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
检查服务器状态脚本
"""
import requests
import time

def check_server_status():
    """检查服务器状态"""
    try:
        # 检查API连接
        response = requests.get('http://localhost:5000/api/confessions', timeout=5)
        if response.status_code == 200:
            print("✅ API服务器正在正常运行")
            data = response.json()
            print(f"✅ 当前表白数量: {data.get('total', 0)}")
            return True
        else:
            print(f"❌ API服务器响应异常，状态码: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ 无法连接到API服务器，请确保服务器已启动")
        return False
    except Exception as e:
        print(f"❌ 检查服务器状态时出错: {str(e)}")
        return False

def add_test_confession():
    """添加一条测试表白"""
    try:
        test_data = {
            "to": "测试接收者",
            "from": "测试发送者",
            "content": "这是一条来自检查脚本的测试表白",
            "type": "love"
        }
        
        response = requests.post(
            'http://localhost:5000/api/confessions',
            json=test_data,
            headers={'Content-Type': 'application/json'},
            timeout=5
        )
        
        if response.status_code == 201:
            print("✅ 测试表白添加成功")
            return True
        else:
            print(f"❌ 添加测试表白失败，状态码: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ 添加测试表白时出错: {str(e)}")
        return False

if __name__ == '__main__':
    print("=" * 50)
    print("校园表白墙服务器状态检查")
    print("=" * 50)
    
    # 检查服务器状态
    if check_server_status():
        # 询问是否添加测试表白
        choice = input("是否添加一条测试表白? (y/n): ").lower().strip()
        if choice == 'y' or choice == 'yes':
            if add_test_confession():
                print("✅ 测试完成！")
            else:
                print("❌ 添加测试表白失败")
    else:
        print("\n请先启动服务器:")
        print("1. 运行 start_server.bat")
        print("2. 或者直接运行: python run.py")
    
    print("=" * 50)