const express = require('express');
const multer = require('multer');
const app = express();
const port = 3000;

// 设置文件存储
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

let accumulatedSize = 0; // 累积文件大小

app.post('/upload', upload.array('files'), (req, res) => {
    let totalSize = 0;
    req.files.forEach(file => {
        totalSize += file.size;
    });

    accumulatedSize += totalSize; // 更新累积大小

    res.json({ totalSize: accumulatedSize });
});

app.listen(port, () => {
    console.log(`服务器正在运行在 http://localhost:${port}`);
});