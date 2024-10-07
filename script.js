let accumulatedSize = 0;
let uploadedFiles = [];
let userName = '';

// 从 localStorage 加载数据
function loadData() {
    try {
        accumulatedSize = parseInt(localStorage.getItem('accumulatedSize')) || 0;
        uploadedFiles = JSON.parse(localStorage.getItem('uploadedFiles')) || [];
        userName = localStorage.getItem('userName') || '';

        // 恢复用户名
        document.getElementById('userName').value = userName;
        document.getElementById('pageTitle').innerText = userName ? `${userName}的人生信息库` : '人生信息库';
        
        // 加载数据后立即更新文件列表
        updateFileList();
    } catch (error) {
        console.error('Error loading data from localStorage:', error);
    }
}

// 保存数据到 localStorage
function saveData() {
    try {
        localStorage.setItem('accumulatedSize', accumulatedSize.toString());
        localStorage.setItem('uploadedFiles', JSON.stringify(uploadedFiles));
        localStorage.setItem('userName', userName);
    } catch (error) {
        console.error('Error saving data to localStorage:', error);
    }
}

// 页面加载时加载数据并更新界面
document.addEventListener('DOMContentLoaded', loadData);

function updateTitle() {
    userName = document.getElementById('userName').value;
    const pageTitle = document.getElementById('pageTitle');
    pageTitle.innerText = userName ? `${userName}的人生信息库` : '人生信息库';
    saveData(); // 保存更新后的用户名
}

document.getElementById('fileInput').addEventListener('change', function(event) {
    const files = event.target.files;
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
                          'audio/mpeg', 'audio/wav', 'audio/ogg', 
                          'video/mp4', 'video/x-msvideo', 'video/x-matroska',
                          'image/jpeg', 'image/png', 'image/gif'];

    for (let file of files) {
        if (allowedTypes.includes(file.type)) {
            accumulatedSize += file.size;
            uploadedFiles.push({ 
                name: file.name, 
                size: file.size, 
                uploadDate: new Date().toISOString() 
            });
        } else {
            alert(`文件类型不被支持: ${file.name}`);
        }
    }

    saveData(); // 保存更新后的数据
    updateFileList();
});

document.getElementById('unitSelect').addEventListener('change', updateFileList);

function updateFileList() {
    const unit = document.getElementById('unitSelect').value;
    let fileListHtml = '<ul>';
    let dailySize = 0;
    const today = new Date().toDateString();
    
    uploadedFiles.forEach(file => {
        const fileDate = new Date(file.uploadDate || new Date()).toDateString();
        if (fileDate === today) {
            dailySize += file.size;
        }
        const fileSize = convertSize(file.size, unit);
        fileListHtml += `<li>${file.name} - ${fileSize} ${unit}</li>`;
    });
    fileListHtml += '</ul>';

    const dailySizeConverted = convertSize(dailySize, unit);
    document.getElementById('fileList').innerHTML = fileListHtml;
    document.getElementById('result').innerText = `当日文件总大小: ${dailySizeConverted} ${unit}`;
}

function convertSize(size, unit) {
    switch (unit) {
        case 'KB':
            return (size / 1024).toFixed(2);
        case 'MB':
            return (size / (1024 * 1024)).toFixed(2);
        case 'GB':
            return (size / (1024 * 1024 * 1024)).toFixed(4);
        default:
            return size;
    }
}

function goToHistory() {
    window.location.href = 'history.html';
}