"""
数据库初始化脚本
"""
import os
import sys

# 添加父目录到系统路径
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from api.models import db, Admin
from flask import Flask
from werkzeug.security import generate_password_hash

def init_database():
    """初始化数据库"""
    # 创建Flask应用
    app = Flask(__name__)
    
    # 配置数据库
    db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'confessions.db')
    app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_path}'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # 初始化数据库
    db.init_app(app)
    
    with app.app_context():
        # 创建所有表
        db.create_all()
        print("数据库表创建成功！")
        
        # 检查是否已有管理员账户
        admin_exists = Admin.query.filter_by(username='admin').first()
        if not admin_exists:
            # 创建默认管理员账户
            admin = Admin(
                username='admin',
                password=generate_password_hash('123456'),  # 默认密码: 123456
                role='admin',
                is_active=True
            )
            db.session.add(admin)
            db.session.commit()
            print("默认管理员账户创建成功！用户名: admin, 密码: 123456")
        else:
            print("管理员账户已存在，跳过创建。")
    
    print("数据库初始化完成！")
    return db_path

if __name__ == '__main__':
    try:
        db_path = init_database()
        print(f"数据库文件位置: {db_path}")
    except Exception as e:
        print(f"数据库初始化失败: {e}")