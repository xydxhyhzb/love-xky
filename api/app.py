"""
表白墙后端API
"""
import os
import sys
from datetime import datetime, timedelta
from flask import Flask, request, jsonify, render_template, send_from_directory
from flask_cors import CORS
from werkzeug.security import check_password_hash, generate_password_hash
import jwt
import uuid

# 添加项目根目录到系统路径
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from api.models import db, Confession, Media, Admin

def create_app():
    """创建Flask应用"""
    app = Flask(__name__, 
                template_folder=os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'templates'),
                static_folder=os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'static'))
    
    # 配置
    basedir = os.path.abspath(os.path.dirname(__file__))
    db_path = os.path.join(os.path.dirname(basedir), 'database', 'confessions.db')
    uploads_dir = os.path.join(os.path.dirname(basedir), 'uploads')
    
    app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_path}'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SECRET_KEY'] = 'your-secret-key-here'  # 用于JWT
    app.config['UPLOAD_FOLDER'] = uploads_dir
    app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 限制上传大小为50MB
    
    # 初始化
    db.init_app(app)
    CORS(app)  # 启用CORS
    
    # 确保上传目录存在
    os.makedirs(uploads_dir, exist_ok=True)
    
    return app

app = create_app()

# JWT认证装饰器
def token_required(f):
    """JWT认证装饰器"""
    from functools import wraps
    
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(" ")[1]  # Bearer <token>
            except IndexError:
                return jsonify({'message': 'Token格式错误!'}), 401
        
        if not token:
            return jsonify({'message': '缺少认证令牌!'}), 401
        
        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user = Admin.query.filter_by(id=data['user_id']).first()
            
            if not current_user:
                return jsonify({'message': '用户不存在!'}), 401
                
        except Exception as e:
            return jsonify({'message': f'令牌无效: {str(e)}'}), 401
            
        return f(current_user, *args, **kwargs)
    
    return decorated

# ====================
# 首页路由
# ====================
@app.route('/')
def index():
    """返回首页"""
    return render_template('index.html')

@app.route('/admin')
def admin():
    """返回管理员页面"""
    return render_template('admin.html')

@app.route('/test')
def test():
    """返回测试页面"""
    return render_template('test.html')

# ====================
# 认证路由
# ====================
@app.route('/api/login', methods=['POST'])
def login():
    """管理员登录"""
    auth = request.get_json()
    
    if not auth or not auth.get('username') or not auth.get('password'):
        return jsonify({'message': '用户名和密码不能为空!'}), 400
    
    admin = Admin.query.filter_by(username=auth['username']).first()
    
    if not admin:
        return jsonify({'message': '用户名或密码错误!'}), 401
    
    if check_password_hash(admin.password, auth['password']):
        # 更新最后登录时间
        admin.last_login = datetime.now()
        db.session.commit()
        
        # 生成JWT令牌
        token = jwt.encode({
            'user_id': admin.id,
            'username': admin.username,
            'exp': datetime.utcnow() + timedelta(hours=24)  # 24小时有效期
        }, app.config['SECRET_KEY'], algorithm="HS256")
        
        return jsonify({
            'token': token,
            'user': {
                'id': admin.id,
                'username': admin.username,
                'role': admin.role
            }
        })
    
    return jsonify({'message': '用户名或密码错误!'}), 401

# ====================
# 表白相关路由
# ====================
@app.route('/api/confessions', methods=['GET'])
def get_confessions():
    """获取表白列表"""
    try:
        # 获取查询参数
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        search = request.args.get('search', '', type=str)
        type_filter = request.args.get('type', '', type=str)
        
        # 构建查询
        query = Confession.query
        
        # 添加搜索条件
        if search:
            query = query.filter(
                db.or_(
                    Confession.to.contains(search),
                    Confession.from_.contains(search),
                    Confession.content.contains(search)
                )
            )
        
        # 添加类型过滤
        if type_filter:
            query = query.filter(Confession.type == type_filter)
        
        # 按时间倒序排列
        query = query.order_by(Confession.timestamp.desc())
        
        # 分页查询
        confessions = query.paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )
        
        # 转换为字典格式并包含媒体文件
        result = []
        for confession in confessions.items:
            data = confession.to_dict()
            # 添加媒体文件信息
            media_list = Media.query.filter_by(confession_id=confession.id).all()
            data['media'] = [media.to_dict() for media in media_list]
            result.append(data)
        
        return jsonify({
            'confessions': result,
            'total': confessions.total,
            'pages': confessions.pages,
            'current_page': page
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/confessions', methods=['POST'])
def create_confession():
    """创建新表白"""
    try:
        data = request.get_json()
        
        # 验证必要字段
        if not data or not data.get('to') or not data.get('from') or not data.get('content'):
            return jsonify({'error': '缺少必要字段: to, from, content'}), 400
        
        # 创建新表白
        confession = Confession(
            to=data['to'],
            from_=data['from'],
            content=data['content'],
            type=data.get('type', 'love'),
            likes=0
        )
        
        db.session.add(confession)
        db.session.commit()
        
        return jsonify(confession.to_dict()), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/confessions/<int:confession_id>', methods=['GET'])
def get_confession(confession_id):
    """获取单个表白详情"""
    try:
        confession = Confession.query.get_or_404(confession_id)
        data = confession.to_dict()
        
        # 添加媒体文件信息
        media_list = Media.query.filter_by(confession_id=confession_id).all()
        data['media'] = [media.to_dict() for media in media_list]
        
        return jsonify(data)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/confessions/<int:confession_id>/like', methods=['POST'])
def like_confession(confession_id):
    """点赞表白"""
    try:
        confession = Confession.query.get_or_404(confession_id)
        confession.likes += 1
        db.session.commit()
        
        return jsonify({
            'id': confession.id,
            'likes': confession.likes
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/confessions/<int:confession_id>', methods=['DELETE'])
@token_required
def delete_confession(current_user, confession_id):
    """删除表白（需要管理员权限）"""
    try:
        confession = Confession.query.get_or_404(confession_id)
        
        # 删除关联的媒体文件
        media_files = Media.query.filter_by(confession_id=confession_id).all()
        for media in media_files:
            # 删除物理文件
            try:
                if os.path.exists(media.filepath):
                    os.remove(media.filepath)
            except Exception as e:
                print(f"删除文件失败: {e}")
            
            # 删除数据库记录
            db.session.delete(media)
        
        # 删除表白记录
        db.session.delete(confession)
        db.session.commit()
        
        return jsonify({'message': '表白删除成功'})
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# ====================
# 媒体文件路由
# ====================
@app.route('/api/upload', methods=['POST'])
def upload_file():
    """上传媒体文件"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': '没有文件部分'}), 400
        
        file = request.files['file']
        confession_id = request.form.get('confession_id', type=int)
        
        if file.filename == '':
            return jsonify({'error': '未选择文件'}), 400
        
        if confession_id is None:
            return jsonify({'error': '缺少表白ID'}), 400
        
        # 检查表白是否存在
        confession = Confession.query.get(confession_id)
        if not confession:
            return jsonify({'error': '表白不存在'}), 404
        
        # 保存文件
        filename = str(uuid.uuid4()) + '_' + file.filename
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        # 获取文件类型
        file_type = file.content_type or 'application/octet-stream'
        file_size = os.path.getsize(filepath)
        
        # 创建媒体记录
        media = Media(
            confession_id=confession_id,
            filename=file.filename,
            filetype=file_type,
            filepath=filepath,
            file_size=file_size
        )
        
        db.session.add(media)
        db.session.commit()
        
        return jsonify(media.to_dict()), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/media/<int:media_id>')
def get_media_file(media_id):
    """获取媒体文件"""
    try:
        media = Media.query.get_or_404(media_id)
        
        if not os.path.exists(media.filepath):
            return jsonify({'error': '文件不存在'}), 404
        
        return send_from_directory(
            os.path.dirname(media.filepath), 
            os.path.basename(media.filepath),
            as_attachment=False
        )
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ====================
# 管理员路由
# ====================
@app.route('/api/admin/stats')
@token_required
def get_admin_stats(current_user):
    """获取统计信息（需要管理员权限）"""
    try:
        # 统计表白总数
        total_confessions = Confession.query.count()
        
        # 按类型统计
        love_count = Confession.query.filter_by(type='love').count()
        friendship_count = Confession.query.filter_by(type='friendship').count()
        admiration_count = Confession.query.filter_by(type='admiration').count()
        thanks_count = Confession.query.filter_by(type='thanks').count()
        
        # 总点赞数
        total_likes = db.session.query(db.func.sum(Confession.likes)).scalar() or 0
        
        # 今日新增表白
        today = datetime.now().date()
        today_confessions = Confession.query.filter(
            db.func.date(Confession.timestamp) == today
        ).count()
        
        # 媒体文件统计
        total_media = Media.query.count()
        
        return jsonify({
            'total_confessions': total_confessions,
            'love_count': love_count,
            'friendship_count': friendship_count,
            'admiration_count': admiration_count,
            'thanks_count': thanks_count,
            'total_likes': total_likes,
            'today_confessions': today_confessions,
            'total_media': total_media
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/export')
@token_required
def export_data(current_user):
    """导出所有数据（需要管理员权限）"""
    try:
        # 获取所有表白
        confessions = Confession.query.order_by(Confession.timestamp.desc()).all()
        
        # 构建导出数据
        export_data = []
        for confession in confessions:
            data = confession.to_dict()
            
            # 添加媒体文件信息
            media_list = Media.query.filter_by(confession_id=confession.id).all()
            data['media'] = [media.to_dict() for media in media_list]
            
            export_data.append(data)
        
        return jsonify({
            'confessions': export_data,
            'export_time': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ====================
# 错误处理
# ====================
@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': '资源未找到'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': '服务器内部错误'}), 500

# ====================
# 初始化数据库
# ====================
# 在创建应用后立即初始化数据库
with app.app_context():
    db.create_all()

if __name__ == '__main__':
    # 开发环境设置
    app.run(host='0.0.0.0', port=5000, debug=True)