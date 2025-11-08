from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import os

# 数据库配置
basedir = os.path.abspath(os.path.dirname(__file__))
db_path = os.path.join(basedir, '..', 'database', 'confessions.db')

# 初始化数据库
db = SQLAlchemy()

class Confession(db.Model):
    """表白表"""
    __tablename__ = 'confessions'
    
    id = db.Column(db.Integer, primary_key=True)
    to = db.Column(db.String(100), nullable=False, comment='致')
    from_ = db.Column('from', db.String(100), nullable=False, comment='来自')
    content = db.Column(db.Text, nullable=False, comment='内容')
    type = db.Column(db.String(20), nullable=False, default='love', comment='类型')
    likes = db.Column(db.Integer, default=0, comment='点赞数')
    timestamp = db.Column(db.DateTime, default=datetime.now, comment='时间戳')
    
    def __repr__(self):
        return f'<Confession {self.id}: {self.from_} -> {self.to}>'
    
    def to_dict(self):
        """转换为字典格式"""
        return {
            'id': self.id,
            'to': self.to,
            'from': self.from_,
            'content': self.content,
            'type': self.type,
            'likes': self.likes,
            'timestamp': self.timestamp.strftime('%Y-%m-%d %H:%M:%S')
        }

class Media(db.Model):
    """媒体文件表"""
    __tablename__ = 'media'
    
    id = db.Column(db.Integer, primary_key=True)
    confession_id = db.Column(db.Integer, db.ForeignKey('confessions.id'), nullable=False)
    filename = db.Column(db.String(255), nullable=False, comment='文件名')
    filetype = db.Column(db.String(50), nullable=False, comment='文件类型')
    filepath = db.Column(db.String(500), nullable=False, comment='文件路径')
    file_size = db.Column(db.Integer, comment='文件大小')
    timestamp = db.Column(db.DateTime, default=datetime.now, comment='上传时间')
    
    # 关系
    confession = db.relationship('Confession', backref=db.backref('media', lazy=True))
    
    def __repr__(self):
        return f'<Media {self.id}: {self.filename}>'
    
    def to_dict(self):
        """转换为字典格式"""
        return {
            'id': self.id,
            'confession_id': self.confession_id,
            'filename': self.filename,
            'filetype': self.filetype,
            'filepath': self.filepath,
            'file_size': self.file_size,
            'timestamp': self.timestamp.strftime('%Y-%m-%d %H:%M:%S')
        }

class Admin(db.Model):
    """管理员表"""
    __tablename__ = 'admins'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False, comment='用户名')
    password = db.Column(db.String(255), nullable=False, comment='密码')
    role = db.Column(db.String(20), default='admin', comment='角色')
    is_active = db.Column(db.Boolean, default=True, comment='是否激活')
    last_login = db.Column(db.DateTime, comment='最后登录时间')
    created_at = db.Column(db.DateTime, default=datetime.now, comment='创建时间')
    
    def __repr__(self):
        return f'<Admin {self.id}: {self.username}>'
    
    def to_dict(self):
        """转换为字典格式"""
        return {
            'id': self.id,
            'username': self.username,
            'role': self.role,
            'is_active': self.is_active,
            'last_login': self.last_login.strftime('%Y-%m-%d %H:%M:%S') if self.last_login else None,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S')
        }