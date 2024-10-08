let dailyAccumulatedSize = 0;
let uploadedFiles = [];
let userName = '';
let totalAccumulatedSize = 0; // 新增：总累计大小
let reminderTime = '';

// 从 localStorage 加载数据
function loadData() {
    try {
        userName = localStorage.getItem('userName') || '';
        reminderTime = localStorage.getItem('reminderTime') || '';
        dailyAccumulatedSize = parseInt(localStorage.getItem('dailyAccumulatedSize')) || 0;
        uploadedFiles = JSON.parse(localStorage.getItem('uploadedFiles')) || [];
        totalAccumulatedSize = parseFloat(localStorage.getItem('totalAccumulatedSize')) || 0; // 新增：加载总累计大小

        // 检查是否需要重置每日数据
        const lastUploadDate = localStorage.getItem('lastUploadDate');
        const today = new Date().toDateString();
        if (lastUploadDate !== today) {
            resetDailyData();
        }

        // 恢复用户名和提醒时间
        document.getElementById('userName').value = userName;
        document.getElementById('reminderTime').value = reminderTime;
        document.getElementById('pageTitle').innerText = userName ? `${userName}的人生信息库` : '人生信息库';
        
        // 更新文件列表和结果显示
        updateFileList();

        // 设置提醒
        setReminder();
    } catch (error) {
        console.error('Error loading data from localStorage:', error);
    }
}

// 重置每日数据
function resetDailyData() {
    const previousTotal = dailyAccumulatedSize;
    dailyAccumulatedSize = 0;
    uploadedFiles = [];
    saveData();
    
    // 将前一天的总量添加到历史数据中
    addToHistoryData(previousTotal);
}

// 添加数据到历史记录
function addToHistoryData(size) {
    const historyData = JSON.parse(localStorage.getItem('historyData')) || [];
    const today = new Date().toISOString().split('T')[0];
    const sizeInGB = size / (1024 * 1024 * 1024); // 转换为GB
    
    // 检查是否已经有今天的数据
    const todayIndex = historyData.findIndex(item => item.date === today);
    if (todayIndex !== -1) {
        // 如果有，更新今天的数据
        historyData[todayIndex].value += sizeInGB;
    } else {
        // 如果没有，添加新的数据点
        historyData.push({ date: today, value: sizeInGB });
    }
    
    totalAccumulatedSize += sizeInGB; // 更新总累计大小
    localStorage.setItem('historyData', JSON.stringify(historyData));
    localStorage.setItem('totalAccumulatedSize', totalAccumulatedSize.toString());
}

// 保存数据到 localStorage
function saveData() {
    try {
        localStorage.setItem('userName', userName);
        localStorage.setItem('dailyAccumulatedSize', dailyAccumulatedSize.toString());
        localStorage.setItem('uploadedFiles', JSON.stringify(uploadedFiles));
        localStorage.setItem('lastUploadDate', new Date().toDateString());
        localStorage.setItem('totalAccumulatedSize', totalAccumulatedSize.toString()); // 新增：保存总累计大小
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
    saveData();
}

document.getElementById('fileInput').addEventListener('change', function(event) {
    const files = event.target.files;
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
                          'audio/mpeg', 'audio/wav', 'audio/ogg', 
                          'video/mp4', 'video/x-msvideo', 'video/x-matroska',
                          'image/jpeg', 'image/png', 'image/gif'];

    for (let file of files) {
        if (allowedTypes.includes(file.type)) {
            dailyAccumulatedSize += file.size;
            totalAccumulatedSize += file.size / (1024 * 1024 * 1024); // 更新总累计大小（转换为GB）
            uploadedFiles.push({ 
                name: file.name, 
                size: file.size, 
                uploadDate: new Date().toISOString() 
            });
        } else {
            alert(`文件类型不被支持: ${file.name}`);
        }
    }

    saveData();
    updateFileList();
});

document.getElementById('unitSelect').addEventListener('change', updateFileList);

function updateFileList() {
    const unit = document.getElementById('unitSelect').value;
    let fileListHtml = '<ul>';
    
    uploadedFiles.forEach(file => {
        const fileSize = convertSize(file.size, unit);
        fileListHtml += `<li>${file.name} - ${fileSize} ${unit}</li>`;
    });
    fileListHtml += '</ul>';

    const dailySizeConverted = convertSize(dailyAccumulatedSize, unit);
    document.getElementById('fileList').innerHTML = fileListHtml;
    document.getElementById('result').innerHTML = `当日文件总大小: <span class="number">${dailySizeConverted}</span> ${unit}`;
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

function updateUserInfo() {
    userName = document.getElementById('userName').value;
    reminderTime = document.getElementById('reminderTime').value;
    const pageTitle = document.getElementById('pageTitle');
    pageTitle.innerText = userName ? `${userName}的人生信息库` : '人生信息库';
    saveData();
    setReminder();
}

function setReminder() {
    if (reminderTime) {
        const [hours, minutes] = reminderTime.split(':');
        const now = new Date();
        const reminderDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);
        
        if (reminderDate <= now) {
            reminderDate.setDate(reminderDate.getDate() + 1);
        }

        const timeUntilReminder = reminderDate.getTime() - now.getTime();

        setTimeout(() => {
            showNotification();
            setReminder(); // 设置下一天的提醒
        }, timeUntilReminder);
    }
}

function showNotification() {
    if ("Notification" in window) {
        Notification.requestPermission().then(function (permission) {
            if (permission === "granted") {
                new Notification("清平宝宝", {
                    body: "提醒你来记录今天的信息啦！",
                    icon: "path/to/your/icon.png" // 你可以添加一个图标
                });
            }
        });
    }
}

function updateReminder() {
    reminderTime = document.getElementById('reminderTime').value;
    localStorage.setItem('reminderTime', reminderTime);
    updateReminderStatus();
    setReminder();
}

function updateReminderStatus() {
    const statusElement = document.getElementById('reminderStatus');
    if (reminderTime) {
        statusElement.textContent = `提醒已设置为每天 ${reminderTime}`;
    } else {
        statusElement.textContent = '未设置提醒';
    }
}

// 页面加载时执行
document.addEventListener('DOMContentLoaded', () => {
    // 设置默认单位为KB
    const unitSelect = document.getElementById('unitSelect');
    unitSelect.value = 'KB';

    // 监听文件输入变化
    const fileInput = document.getElementById('fileInput');
    fileInput.addEventListener('change', handleFileSelection);
});

function handleFileSelection(event) {
    const files = event.target.files;
    const fileList = document.getElementById('fileList');
    fileList.innerHTML = ''; // 清空之前的文件列表

    Array.from(files).forEach(file => {
        const sizeInKB = (file.size / 1024).toFixed(2); // 将字节转换为KB
        const listItem = document.createElement('li');
        listItem.textContent = `${file.name} - ${sizeInKB} KB`;
        fileList.appendChild(listItem);
    });
}

function updateTitle() {
    userName = document.getElementById('userName').value;
    const pageTitle = document.getElementById('pageTitle');
    pageTitle.innerText = userName ? `${userName}的人生信息库` : '人生信息库';
    saveData();
}

document.getElementById('fileInput').addEventListener('change', function(event) {
    const files = event.target.files;
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
                          'audio/mpeg', 'audio/wav', 'audio/ogg', 
                          'video/mp4', 'video/x-msvideo', 'video/x-matroska',
                          'image/jpeg', 'image/png', 'image/gif'];

    for (let file of files) {
        if (allowedTypes.includes(file.type)) {
            dailyAccumulatedSize += file.size;
            totalAccumulatedSize += file.size / (1024 * 1024 * 1024); // 更新总累计大小（转换为GB）
            uploadedFiles.push({ 
                name: file.name, 
                size: file.size, 
                uploadDate: new Date().toISOString() 
            });
        } else {
            alert(`文件类型不被支持: ${file.name}`);
        }
    }

    saveData();
    updateFileList();
});

document.getElementById('unitSelect').addEventListener('change', updateFileList);

function updateFileList() {
    const unit = document.getElementById('unitSelect').value;
    let fileListHtml = '<ul>';
    
    uploadedFiles.forEach(file => {
        const fileSize = convertSize(file.size, unit);
        fileListHtml += `<li>${file.name} - ${fileSize} ${unit}</li>`;
    });
    fileListHtml += '</ul>';

    const dailySizeConverted = convertSize(dailyAccumulatedSize, unit);
    document.getElementById('fileList').innerHTML = fileListHtml;
    document.getElementById('result').innerHTML = `当日文件总大小: <span class="number">${dailySizeConverted}</span> ${unit}`;
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

function updateUserInfo() {
    userName = document.getElementById('userName').value;
    reminderTime = document.getElementById('reminderTime').value;
    const pageTitle = document.getElementById('pageTitle');
    pageTitle.innerText = userName ? `${userName}的人生信息库` : '人生信息库';
    saveData();
    setReminder();
}

function setReminder() {
    if (reminderTime) {
        const [hours, minutes] = reminderTime.split(':');
        const now = new Date();
        const reminderDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);
        
        if (reminderDate <= now) {
            reminderDate.setDate(reminderDate.getDate() + 1);
        }

        const timeUntilReminder = reminderDate.getTime() - now.getTime();

        setTimeout(() => {
            showNotification();
            setReminder(); // 设置下一天的提醒
        }, timeUntilReminder);
    }
}

function showNotification() {
    if ("Notification" in window) {
        Notification.requestPermission().then(function (permission) {
            if (permission === "granted") {
                new Notification("清平宝宝", {
                    body: "提醒你来记录今天的信息啦！",
                    icon: "path/to/your/icon.png" // 你可以添加一个图标
                });
            }
        });
    }
}

function updateReminder() {
    reminderTime = document.getElementById('reminderTime').value;
    localStorage.setItem('reminderTime', reminderTime);
    updateReminderStatus();
    setReminder();
}

function updateReminderStatus() {
    const statusElement = document.getElementById('reminderStatus');
    if (reminderTime) {
        statusElement.textContent = `提醒已设置为每天 ${reminderTime}`;
    } else {
        statusElement.textContent = '未设置提醒';
    }
}

// 页面加载时执行
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    setReminder();
});