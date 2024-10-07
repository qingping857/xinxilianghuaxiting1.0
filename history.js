let chart;

function loadHistoryData() {
    const uploadedFiles = JSON.parse(localStorage.getItem('uploadedFiles')) || [];
    const accumulatedSize = parseInt(localStorage.getItem('accumulatedSize')) || 0;

    // 显示人生总信息量（以GB为单位）
    const totalInfoHtml = `<h2>我已经活出了 ${convertSize(accumulatedSize, 'GB')} GB 的人生</h2>`;
    document.getElementById('totalInfo').innerHTML = totalInfoHtml;

    // 计算每日统计数据
    const dailyStats = calculateDailyStats(uploadedFiles);
    
    // 创建折线图
    createChart(dailyStats);
}

function calculateDailyStats(files) {
    const dailyStats = {};
    files.forEach(file => {
        const date = new Date(file.uploadDate || new Date()).toISOString().split('T')[0];
        if (dailyStats[date]) {
            dailyStats[date] += file.size;
        } else {
            dailyStats[date] = file.size;
        }
    });
    return dailyStats;
}

function createChart(dailyStats) {
    const ctx = document.getElementById('dailyChart').getContext('2d');
    const dates = Object.keys(dailyStats).sort();
    const sizes = dates.map(date => convertSize(dailyStats[date], 'GB'));

    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: '每日信息量 (GB)',
                data: sizes,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: '日期'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: '信息量 (GB)'
                    }
                }
            }
        }
    });
}

function convertSize(size, unit) {
    switch (unit) {
        case 'KB':
            return (size / 1024).toFixed(2);
        case 'MB':
            return (size / (1024 * 1024)).toFixed(2);
        case 'GB':
            return (size / (1024 * 1024 * 1024)).toFixed(4); // 使用4位小数以提高精度
        default:
            return size;
    }
}

function goBack() {
    window.location.href = 'index.html';
}

document.addEventListener('DOMContentLoaded', loadHistoryData);