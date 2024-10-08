let chart;

function loadHistoryData() {
    // 从localStorage获取历史数据
    const historyData = JSON.parse(localStorage.getItem('historyData')) || [];

    // 如果没有历史数据，生成一些模拟数据
    if (historyData.length === 0) {
        historyData.push(...generateHistoryData(30));
        localStorage.setItem('historyData', JSON.stringify(historyData));
    }

    // 获取总累计大小
    const totalSize = parseFloat(localStorage.getItem('totalAccumulatedSize')) || 0;
    document.getElementById('totalSize').textContent = totalSize.toFixed(2);

    // 创建图表
    createChart(historyData);

    // 设置提醒（如果在主页面设置了的话）
    setReminder();
}

function generateHistoryData(days) {
    const data = [];
    let currentDate = new Date();
    let currentValue = 0;

    for (let i = 0; i < days; i++) {
        currentValue += Math.random() * 0.5; // 每天随机增加0到0.5GB
        data.unshift({
            date: currentDate.toISOString().split('T')[0],
            value: parseFloat(currentValue.toFixed(2))
        });
        currentDate.setDate(currentDate.getDate() - 1);
    }

    return data;
}

function createChart(data) {
    const ctx = document.getElementById('dailyChart').getContext('2d');
    const dates = data.map(item => item.date);
    const sizes = data.map(item => item.value * 1024); // 将GB转换为MB

    const chartWidth = Math.max(dates.length * 50, 800); // 根据数据点数量设置最小宽度
    ctx.canvas.width = chartWidth;

    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: '每日信息量 (MB)', // 更新标签为MB
                data: sizes,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1,
                pointRadius: 3,
                pointHoverRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: '日期'
                    },
                    ticks: {
                        maxRotation: 45,
                        minRotation: 45
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: '信息量 (MB)' // 更新纵轴单位为MB
                    },
                    beginAtZero: true
                }
            },
            plugins: {
                tooltip: {
                    mode: 'index',
                    intersect: false,
                }
            },
            hover: {
                mode: 'nearest',
                intersect: true
            }
        }
    });
}

function goToHome() {
    window.location.href = 'index.html';
}

// 页面加载时执行
window.addEventListener('load', loadHistoryData);

function setReminder() {
    const reminderTime = localStorage.getItem('reminderTime');
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

// 假设有一个函数处理文件上传
function handleFileUpload(file) {
    const allowedFormats = ['audio/m4a', 'audio/mp3'];
    if (!allowedFormats.includes(file.type)) {
        alert('只允许上传 .m4a 和 .mp3 格式的音频文件');
        return;
    }
    // 处理文件上传的其他逻辑
}

// 假设有一个函数初始化图表
function initializeChart(data) {
    const ctx = document.getElementById('dailyChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: data,
        options: {
            scales: {
                y: {
                    title: {
                        display: true,
                        text: 'MB'  // 设置纵轴单位为MB
                    }
                }
            }
        }
    });
}