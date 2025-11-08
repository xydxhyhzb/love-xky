// 管理员后台JavaScript

// 全局变量
let authToken = localStorage.getItem('adminToken');
let currentPage = 1;
let currentSearch = '';
let currentTypeFilter = '';
let deleteTargetId = null;

// DOM加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 检查认证状态
    checkAuth();
    
    // 绑定事件
    bindEvents();
});

// 检查认证状态
function checkAuth() {
    if (authToken) {
        // 验证令牌有效性
        fetch('/api/admin/stats', {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        })
        .then(response => {
            if (response.ok) {
                // 令牌有效，显示仪表盘
                showDashboard();
                return response.json();
            } else {
                // 令牌无效，显示登录页面
                showLoginPage();
                throw new Error('Token invalid');
            }
        })
        .then(data => {
            updateStats(data);
        })
        .catch(error => {
            showLoginPage();
        });
    } else {
        // 没有令牌，显示登录页面
        showLoginPage();
    }
}

// 显示登录页面
function showLoginPage() {
    document.getElementById('loginPage').classList.remove('d-none');
    document.getElementById('dashboardPage').classList.add('d-none');
}

// 显示仪表盘
function showDashboard() {
    document.getElementById('loginPage').classList.add('d-none');
    document.getElementById('dashboardPage').classList.remove('d-none');
    
    // 加载数据
    loadStats();
    loadConfessions();
    updateSystemInfo();
}

// 绑定事件
function bindEvents() {
    // 登录表单提交
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    
    // 退出登录
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
    
    // 侧边栏导航
    document.querySelectorAll('.sidebar .nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('data-section');
            switchSection(section);
        });
    });
    
    // 搜索和筛选
    document.getElementById('searchBtn').addEventListener('click', performSearch);
    document.getElementById('searchInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') performSearch();
    });
    document.getElementById('typeFilter').addEventListener('change', performSearch);
    
    // 数据操作按钮
    document.getElementById('exportDataBtn').addEventListener('click', exportData);
    document.getElementById('clearDataBtn').addEventListener('click', confirmClearData);
    
    // 删除确认按钮
    document.getElementById('confirmDeleteBtn').addEventListener('click', confirmDelete);
}

// 处理登录
function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('errorMessage');
    
    // 发送登录请求
    fetch('/api/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.token) {
            // 登录成功，保存令牌
            authToken = data.token;
            localStorage.setItem('adminToken', authToken);
            
            // 更新用户名显示
            document.getElementById('adminUsername').textContent = data.user.username;
            
            // 显示仪表盘
            showDashboard();
        } else {
            // 登录失败，显示错误信息
            errorMessage.textContent = data.message || '登录失败';
            errorMessage.classList.remove('d-none');
            
            // 清空密码框
            document.getElementById('password').value = '';
            
            // 3秒后隐藏错误信息
            setTimeout(() => {
                errorMessage.classList.add('d-none');
            }, 3000);
        }
    })
    .catch(error => {
        console.error('登录失败:', error);
        errorMessage.textContent = '登录失败，请重试';
        errorMessage.classList.remove('d-none');
    });
}

// 处理退出登录
function handleLogout() {
    localStorage.removeItem('adminToken');
    authToken = null;
    showLoginPage();
}

// 切换内容区域
function switchSection(sectionName) {
    // 更新导航状态
    document.querySelectorAll('.sidebar .nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-section') === sectionName) {
            link.classList.add('active');
        }
    });
    
    // 切换内容区域
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.add('d-none');
    });
    
    const targetSection = document.getElementById(`${sectionName}Section`);
    if (targetSection) {
        targetSection.classList.remove('d-none');
    }
}

// 加载统计信息
function loadStats() {
    fetch('/api/admin/stats', {
        headers: {
            'Authorization': `Bearer ${authToken}`
        }
    })
    .then(response => response.json())
    .then(data => {
        updateStats(data);
    })
    .catch(error => {
        console.error('加载统计信息失败:', error);
        showToast('加载统计信息失败', 'error');
    });
}

// 更新统计信息
function updateStats(data) {
    document.getElementById('totalConfessions').textContent = data.total_confessions;
    document.getElementById('loveCount').textContent = data.love_count;
    document.getElementById('friendshipCount').textContent = data.friendship_count;
    document.getElementById('totalLikes').textContent = data.total_likes;
    document.getElementById('todayConfessions').textContent = data.today_confessions;
    document.getElementById('totalMedia').textContent = data.total_media;
}

// 加载表白列表
function loadConfessions(reset = true) {
    if (reset) {
        currentPage = 1;
    }
    
    // 构建API请求URL
    let url = `/api/confessions?page=${currentPage}&per_page=10`;
    
    // 添加搜索参数
    if (currentSearch) {
        url += `&search=${encodeURIComponent(currentSearch)}`;
    }
    
    // 添加类型筛选参数
    if (currentTypeFilter) {
        url += `&type=${encodeURIComponent(currentTypeFilter)}`;
    }
    
    // 显示加载状态
    if (reset) {
        document.getElementById('confessionsTableBody').innerHTML = '<tr><td colspan="8" class="text-center">加载中...</td></tr>';
    }
    
    // 发送请求
    fetch(url)
    .then(response => response.json())
    .then(data => {
        if (data.confessions) {
            // 渲染表格
            renderConfessionsTable(data.confessions);
            
            // 更新分页
            updatePagination(data.current_page, data.pages);
        }
    })
    .catch(error => {
        console.error('加载表白列表失败:', error);
        showToast('加载表白列表失败', 'error');
        document.getElementById('confessionsTableBody').innerHTML = '<tr><td colspan="8" class="text-center text-danger">加载失败</td></tr>';
    });
}

// 渲染表白表格
function renderConfessionsTable(confessions) {
    const tbody = document.getElementById('confessionsTableBody');
    
    if (confessions.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center">没有找到匹配的表白</td></tr>';
        return;
    }
    
    // 获取类型标签
    const typeLabels = {
        love: '爱情表白',
        friendship: '友情表白',
        admiration: '欣赏表白',
        thanks: '感谢表白'
    };
    
    // 生成表格内容
    tbody.innerHTML = confessions.map(confession => {
        const typeLabel = typeLabels[confession.type] || '其他';
        const content = confession.content.length > 50 ? 
            confession.content.substring(0, 50) + '...' : 
            confession.content;
        
        return `
            <tr>
                <td>${confession.id}</td>
                <td>${confession.to}</td>
                <td>${confession.from}</td>
                <td title="${confession.content}">${content}</td>
                <td><span class="type-badge type-${confession.type}">${typeLabel}</span></td>
                <td>${confession.likes}</td>
                <td>${confession.timestamp}</td>
                <td>
                    <button class="btn btn-sm btn-danger" onclick="deleteConfession(${confession.id})">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// 更新分页
function updatePagination(currentPage, totalPages) {
    const pagination = document.getElementById('pagination');
    
    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }
    
    let paginationHTML = '';
    
    // 上一页
    if (currentPage > 1) {
        paginationHTML += `
            <li class="page-item">
                <a class="page-link" href="#" onclick="changePage(${currentPage - 1})">上一页</a>
            </li>
        `;
    }
    
    // 页码
    for (let i = 1; i <= totalPages; i++) {
        if (i === currentPage || i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
            paginationHTML += `
                <li class="page-item ${i === currentPage ? 'active' : ''}">
                    <a class="page-link" href="#" onclick="changePage(${i})">${i}</a>
                </li>
            `;
        } else if (i === currentPage - 2 || i === currentPage + 2) {
            paginationHTML += `
                <li class="page-item disabled">
                    <span class="page-link">...</span>
                </li>
            `;
        }
    }
    
    // 下一页
    if (currentPage < totalPages) {
        paginationHTML += `
            <li class="page-item">
                <a class="page-link" href="#" onclick="changePage(${currentPage + 1})">下一页</a>
            </li>
        `;
    }
    
    pagination.innerHTML = paginationHTML;
}

// 切换页面
function changePage(page) {
    currentPage = page;
    loadConfessions(false);
}

// 执行搜索
function performSearch() {
    currentSearch = document.getElementById('searchInput').value.trim();
    currentTypeFilter = document.getElementById('typeFilter').value;
    loadConfessions();
}

// 删除表白
function deleteConfession(id) {
    deleteTargetId = id;
    const modal = new bootstrap.Modal(document.getElementById('confirmDeleteModal'));
    modal.show();
}

// 确认删除
function confirmDelete() {
    if (!deleteTargetId || !authToken) return;
    
    fetch(`/api/confessions/${deleteTargetId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${authToken}`
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.message) {
            showToast('删除成功', 'success');
            loadConfessions(false);
            loadStats(); // 更新统计信息
        } else {
            showToast('删除失败', 'error');
        }
    })
    .catch(error => {
        console.error('删除失败:', error);
        showToast('删除失败', 'error');
    })
    .finally(() => {
        // 关闭模态框
        const modal = bootstrap.Modal.getInstance(document.getElementById('confirmDeleteModal'));
        if (modal) modal.hide();
        
        deleteTargetId = null;
    });
}

// 导出数据
function exportData() {
    fetch('/api/admin/export', {
        headers: {
            'Authorization': `Bearer ${authToken}`
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.confessions) {
            // 创建下载链接
            const dataStr = JSON.stringify(data, null, 2);
            const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
            
            const exportFileDefaultName = `confessions_${new Date().toISOString().slice(0,10)}.json`;
            
            const linkElement = document.createElement('a');
            linkElement.setAttribute('href', dataUri);
            linkElement.setAttribute('download', exportFileDefaultName);
            linkElement.click();
            
            showToast('数据导出成功', 'success');
        } else {
            showToast('数据导出失败', 'error');
        }
    })
    .catch(error => {
        console.error('导出数据失败:', error);
        showToast('导出数据失败', 'error');
    });
}

// 确认清空数据
function confirmClearData() {
    if (confirm('确定要清空所有表白数据吗？此操作不可恢复！')) {
        clearAllData();
    }
}

// 清空所有数据
function clearAllData() {
    // 这里需要实现清空数据的API
    showToast('清空数据功能尚未实现', 'warning');
}

// 更新系统信息
function updateSystemInfo() {
    // 更新当前时间
    const updateTime = () => {
        document.getElementById('currentTime').textContent = new Date().toLocaleString('zh-CN');
    };
    updateTime();
    setInterval(updateTime, 1000);
    
    // 更新浏览器信息
    document.getElementById('userAgent').textContent = navigator.userAgent.substring(0, 50) + '...';
    document.getElementById('screenResolution').textContent = `${window.screen.width} × ${window.screen.height}`;
    document.getElementById('language').textContent = navigator.language;
}

// 显示Toast通知
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    const toastBody = toast.querySelector('.toast-body');
    
    // 设置消息
    toastBody.textContent = message;
    
    // 设置样式
    const toastHeader = toast.querySelector('.toast-header');
    const icon = toastHeader.querySelector('i');
    
    // 重置图标类
    icon.className = 'bi me-2';
    
    // 根据类型设置图标和颜色
    switch (type) {
        case 'success':
            icon.classList.add('bi-check-circle-fill', 'text-success');
            break;
        case 'error':
            icon.classList.add('bi-exclamation-triangle-fill', 'text-danger');
            break;
        case 'warning':
            icon.classList.add('bi-exclamation-triangle-fill', 'text-warning');
            break;
        default:
            icon.classList.add('bi-info-circle-fill', 'text-primary');
    }
    
    // 显示Toast
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
}