const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from a directory (optional)
app.use(express.static('public'));

// Range request handler
app.get('/files/:filename', (req, res) => {
    const filePath = path.join(__dirname, 'files', req.params.filename); // Adjust the path as needed
    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
        const parts = range.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

        if (start >= fileSize || end >= fileSize) {
            res.status(416).send('Requested range not satisfiable\n' + start + ' >= ' + fileSize);
            return;
        }

        const chunksize = end - start + 1;
        const fileStream = fs.createReadStream(filePath, { start, end });
        res.writeHead(206, {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunksize,
            'Content-Type': getContentType(filePath), // Determine content type
        });
        fileStream.pipe(res);
    } else {
        res.writeHead(200, { 'Content-Length': fileSize, 'Content-Type': getContentType(filePath) });
        fs.createReadStream(filePath).pipe(res);
    }
});

// Helper function to determine content type
function getContentType(filePath) {
    const extname = path.extname(filePath).toLowerCase();
    if (extname === '.pdf') return 'application/pdf';
    if (extname === '.jpg' || extname === '.jpeg') return 'image/jpeg';
    if (extname === '.png') return 'image/png';
    if (extname === '.gif') return 'image/gif';
    return 'application/octet-stream'; // Default
}

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});