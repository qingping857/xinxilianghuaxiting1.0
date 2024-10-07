const express = require('express');
const multer = require('multer');
const app = express();
const port = 3000;

// 设置文件存储
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post('/upload', upload.array('files'), (req, res) => {
    let totalSize = 0;
    req.files.forEach(file => {
        totalSize += file.size;
    });

    res.json({ totalSize });
});

app.listen(port, () => {
    console.log(`服务器正在运行在 http://localhost:${port}`);
});