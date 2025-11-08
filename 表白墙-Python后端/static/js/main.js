// 校园表白墙前端JavaScript

// 全局变量
let currentPage = 1;
let isLoading = false;
let currentSearch = '';
let currentTypeFilter = '';

// DOM加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 加载表白列表
    loadConfessions();
    
    // 绑定事件
    bindEvents();
});

// 绑定事件函数
function bindEvents() {
    // 表单提交事件
    document.getElementById('confessionForm').addEventListener('submit', handleConfessionSubmit);
    
    // 搜索和筛选事件
    document.getElementById('searchBtn').addEventListener('click', performSearch);
    document.getElementById('searchInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') performSearch();
    });
    document.getElementById('typeFilter').addEventListener('change', performSearch);
    
    // 加载更多按钮事件
    document.getElementById('loadMoreBtn').addEventListener('click', loadMoreConfessions);
    
    // 媒体文件选择事件
    document.getElementById('media').addEventListener('change', handleMediaSelection);
}

// 加载表白列表
function loadConfessions(reset = true) {
    if (isLoading) return;
    
    isLoading = true;
    
    // 重置页码或加载更多
    if (reset) {
        currentPage = 1;
        document.getElementById('confessionsContainer').innerHTML = '';
    }
    
    // 构建API请求URL
    let url = `/api/confessions?page=${currentPage}&per_page=6`;
    
    // 添加搜索参数
    if (currentSearch) {
        url += `&search=${encodeURIComponent(currentSearch)}`;
    }
    
    // 添加类型筛选参数
    if (currentTypeFilter) {
        url += `&type=${encodeURIComponent(currentTypeFilter)}`;
    }
    
    // 发送请求
    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.confessions && data.confessions.length > 0) {
                // 渲染表白卡片
                data.confessions.forEach(confession => {
                    renderConfessionCard(confession);
                });
                
                // 更新加载更多按钮状态
                document.getElementById('loadMoreBtn').style.display = 
                    data.confessions.length >= 6 && currentPage < data.pages ? 'block' : 'none';
                
                currentPage++;
            } else {
                if (reset) {
                    document.getElementById('confessionsContainer').innerHTML = `
                        <div class="col-12">
                            <div class="card text-center py-5">
                                <div class="card-body">
                                    <h5 class="card-title">还没有表白</h5>
                                    <p class="card-text">成为第一个表白的人吧！</p>
                                </div>
                            </div>
                        </div>
                    `;
                }
                document.getElementById('loadMoreBtn').style.display = 'none';
            }
        })
        .catch(error => {
            console.error('加载表白失败:', error);
            showToast('加载表白失败，请重试', 'error');
        })
        .finally(() => {
            isLoading = false;
        });
}

// 渲染表白卡片
function renderConfessionCard(confession) {
    // 获取类型标签和图标
    const typeLabels = {
        love: { text: '爱情表白', icon: '💘' },
        friendship: { text: '友情表白', icon: '🤝' },
        admiration: { text: '欣赏表白', icon: '🌟' },
        thanks: { text: '感谢表白', icon: '🙏' }
    };
    
    const type = typeLabels[confession.type] || typeLabels.love;
    
    // 构建媒体内容HTML
    let mediaHTML = '';
    if (confession.media && confession.media.length > 0) {
        mediaHTML = '<div class="media-preview">';
        confession.media.forEach(media => {
            if (media.filetype.startsWith('image/')) {
                mediaHTML += `<img src="/api/media/${media.id}" class="media-item" alt="${media.filename}" data-bs-toggle="modal" data-bs-target="#confessionModal" data-id="${confession.id}">`;
            } else if (media.filetype.startsWith('video/')) {
                mediaHTML += `<video src="/api/media/${media.id}" class="media-item media-video" controls></video>`;
            }
        });
        mediaHTML += '</div>';
    }
    
    // 创建卡片HTML
    const cardHTML = `
        <div class="col-lg-6 col-xl-4 mb-4">
            <div class="card confession-card h-100">
                <div class="confession-header">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <h6 class="mb-0">致: <strong>${confession.to}</strong></h6>
                            <h6 class="mb-0">来自: <strong>${confession.from}</strong></h6>
                        </div>
                        <span class="confession-type type-${confession.type}">${type.icon} ${type.text}</span>
                    </div>
                </div>
                <div class="confession-body">
                    <p class="confession-content">${confession.content}</p>
                    ${mediaHTML}
                </div>
                <div class="confession-footer">
                    <span class="confession-timestamp">${confession.timestamp}</span>
                    <div class="confession-actions">
                        <button class="btn btn-like btn-sm" onclick="likeConfession(${confession.id}, this)">
                            <i class="bi bi-heart-fill"></i> ${confession.likes || 0}
                        </button>
                        <button class="btn btn-outline-primary btn-sm" data-bs-toggle="modal" data-bs-target="#confessionModal" data-id="${confession.id}">
                            <i class="bi bi-eye"></i> 详情
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // 添加到容器
    document.getElementById('confessionsContainer').insertAdjacentHTML('beforeend', cardHTML);
}

// 处理表白表单提交
function handleConfessionSubmit(event) {
    event.preventDefault();
    
    // 获取表单数据
    const formData = {
        to: document.getElementById('to').value.trim(),
        from: document.getElementById('from').value.trim(),
        content: document.getElementById('content').value.trim(),
        type: document.getElementById('type').value
    };
    
    // 提交表白数据
    fetch('/api/confessions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.id) {
            // 提交成功
            showToast('表白发表成功！', 'success');
            
            // 处理媒体文件上传
            const mediaFiles = document.getElementById('media').files;
            if (mediaFiles.length > 0) {
                uploadMediaFiles(data.id, mediaFiles);
            }
            
            // 重置表单
            document.getElementById('confessionForm').reset();
            document.getElementById('mediaPreview').innerHTML = '';
            
            // 重新加载表白列表
            loadConfessions();
        } else {
            showToast('表白发表失败，请重试', 'error');
        }
    })
    .catch(error => {
        console.error('提交表白失败:', error);
        showToast('提交表白失败，请重试', 'error');
    });
}

// 上传媒体文件
function uploadMediaFiles(confessionId, files) {
    Array.from(files).forEach(file => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('confession_id', confessionId);
        
        fetch('/api/upload', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            console.log('文件上传成功:', data);
            // 更新表白详情
            loadConfessionDetails(confessionId);
        })
        .catch(error => {
            console.error('文件上传失败:', error);
        });
    });
}

// 点赞表白
function likeConfession(confessionId, button) {
    fetch(`/api/confessions/${confessionId}/like`, {
        method: 'POST'
    })
    .then(response => response.json())
    .then(data => {
        if (data.likes !== undefined) {
            // 更新点赞数
            button.innerHTML = `<i class="bi bi-heart-fill"></i> ${data.likes}`;
            button.classList.add('liked');
        }
    })
    .catch(error => {
        console.error('点赞失败:', error);
        showToast('点赞失败，请重试', 'error');
    });
}

// 加载更多表白
function loadMoreConfessions() {
    loadConfessions(false);
}

// 执行搜索
function performSearch() {
    currentSearch = document.getElementById('searchInput').value.trim();
    currentTypeFilter = document.getElementById('typeFilter').value;
    loadConfessions();
}

// 处理媒体文件选择预览
function handleMediaSelection(event) {
    const files = event.target.files;
    const preview = document.getElementById('mediaPreview');
    preview.innerHTML = '';
    
    Array.from(files).forEach(file => {
        const fileURL = URL.createObjectURL(file);
        let previewElement;
        
        if (file.type.startsWith('image/')) {
            previewElement = document.createElement('img');
            previewElement.className = 'media-item';
            previewElement.src = fileURL;
            previewElement.alt = file.name;
        } else if (file.type.startsWith('video/')) {
            previewElement = document.createElement('video');
            previewElement.className = 'media-item media-video';
            previewElement.src = fileURL;
            previewElement.controls = true;
        }
        
        if (previewElement) {
            preview.appendChild(previewElement);
        }
    });
}

// 加载表白详情
function loadConfessionDetails(confessionId) {
    fetch(`/api/confessions/${confessionId}`)
    .then(response => response.json())
    .then(data => {
        // 如果详情模态框已打开，更新内容
        const modal = document.getElementById('confessionModal');
        if (modal.classList.contains('show')) {
            renderConfessionDetails(data);
        }
    })
    .catch(error => {
        console.error('加载表白详情失败:', error);
    });
}

// 渲染表白详情
function renderConfessionDetails(confession) {
    // 获取类型标签和图标
    const typeLabels = {
        love: { text: '爱情表白', icon: '💘' },
        friendship: { text: '友情表白', icon: '🤝' },
        admiration: { text: '欣赏表白', icon: '🌟' },
        thanks: { text: '感谢表白', icon: '🙏' }
    };
    
    const type = typeLabels[confession.type] || typeLabels.love;
    
    // 构建媒体内容HTML
    let mediaHTML = '';
    if (confession.media && confession.media.length > 0) {
        mediaHTML = '<div class="mt-3"><h5>媒体文件:</h5><div class="row">';
        confession.media.forEach(media => {
            if (media.filetype.startsWith('image/')) {
                mediaHTML += `
                    <div class="col-md-4 mb-3">
                        <img src="/api/media/${media.id}" class="img-fluid rounded" alt="${media.filename}">
                        <p class="text-center small">${media.filename}</p>
                    </div>
                `;
            } else if (media.filetype.startsWith('video/')) {
                mediaHTML += `
                    <div class="col-md-4 mb-3">
                        <video src="/api/media/${media.id}" class="img-fluid rounded" controls></video>
                        <p class="text-center small">${media.filename}</p>
                    </div>
                `;
            }
        });
        mediaHTML += '</div></div>';
    }
    
    // 创建详情HTML
    const detailsHTML = `
        <div class="confession-details">
            <div class="row mb-3">
                <div class="col-md-6">
                    <h6>致: <strong>${confession.to}</strong></h6>
                </div>
                <div class="col-md-6">
                    <h6>来自: <strong>${confession.from}</strong></h6>
                </div>
            </div>
            <div class="row mb-3">
                <div class="col-md-6">
                    <h6>类型: <span class="badge bg-primary">${type.icon} ${type.text}</span></h6>
                </div>
                <div class="col-md-6">
                    <h6>时间: ${confession.timestamp}</h6>
                </div>
            </div>
            <div class="mb-3">
                <h6>内容:</h6>
                <p>${confession.content}</p>
            </div>
            ${mediaHTML}
            <div class="text-center mt-3">
                <button class="btn btn-outline-primary" onclick="likeConfession(${confession.id}, document.querySelector('[data-id="${confession.id}"].btn-like'))">
                    <i class="bi bi-heart-fill"></i> 点赞 (${confession.likes || 0})
                </button>
            </div>
        </div>
    `;
    
    document.getElementById('confessionDetails').innerHTML = detailsHTML;
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

// 监听模态框打开事件，加载表白详情
document.getElementById('confessionModal').addEventListener('show.bs.modal', function(event) {
    const button = event.relatedTarget;
    const confessionId = button.getAttribute('data-id');
    
    if (confessionId) {
        fetch(`/api/confessions/${confessionId}`)
        .then(response => response.json())
        .then(data => {
            renderConfessionDetails(data);
        })
        .catch(error => {
            console.error('加载表白详情失败:', error);
            document.getElementById('confessionDetails').innerHTML = '<p class="text-center text-danger">加载失败，请重试</p>';
        });
    }
});