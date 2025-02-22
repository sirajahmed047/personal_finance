import express from 'express';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 8080;

// Serve static files with proper MIME types
app.use(express.static(__dirname, {
    setHeaders: (res, path) => {
        if (path.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
        }
    }
}));

// Handle module resolution
app.use((req, res, next) => {
    if (req.path.endsWith('.js') && !req.path.includes('node_modules')) {
        res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    }
    next();
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
}); 