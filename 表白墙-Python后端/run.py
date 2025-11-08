#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
表白墙应用启动脚本
"""
import os
import sys

# 添加项目根目录到系统路径
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from api.app import create_app

def main():
    """主函数"""
    # 创建Flask应用
    app = create_app()
    
    # 获取配置
    host = os.environ.get('HOST', '0.0.0.0')
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('DEBUG', 'True').lower() in ['true', '1', 'yes']
    
    print("=" * 50)
    print("校园表白墙 - Python后端版本")
    print("=" * 50)
    print(f"服务地址: http://{host}:{port}")
    print(f"首页地址: http://{host}:{port}/")
    print(f"管理后台: http://{host}:{port}/admin")
    print(f"默认管理员账号: admin")
    print(f"默认管理员密码: 123456")
    print("=" * 50)
    
    # 初始化数据库（如果不存在）
    with app.app_context():
        from api.models import db
        try:
            db.create_all()
            print("数据库初始化完成")
            
            # 检查是否有管理员账户，没有则创建
            from api.models import Admin
            from werkzeug.security import generate_password_hash
            
            admin = Admin.query.filter_by(username='admin').first()
            if not admin:
                admin = Admin(
                    username='admin',
                    password=generate_password_hash('123456'),
                    role='admin',
                    is_active=True
                )
                db.session.add(admin)
                db.session.commit()
                print("默认管理员账户创建成功")
        except Exception as e:
            print(f"数据库初始化失败: {e}")
    
    print("=" * 50)
    print("启动服务器...")
    print("按 Ctrl+C 停止服务器")
    print("=" * 50)
    
    # 启动服务器
    app.run(host=host, port=port, debug=debug)

if __name__ == '__main__':
    main()