import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const isProd = process.env.NODE_ENV === 'production';
  const distPath = path.resolve(__dirname, 'dist');
  const hasDist = fs.existsSync(distPath) && fs.existsSync(path.resolve(distPath, 'index.html'));

  app.use(express.json());

  // Health check endpoint for Cloud Run
  app.get('/api/health', (_req, res) => {
    res.status(200).json({ status: 'ok', time: new Date().toISOString() });
  });

  if (isProd || hasDist) {
    // Serve static files from production build directory
    app.use(express.static(distPath));

    // Catch-all route to serve SPA
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  } else {
    // In dev mode when dist does not exist
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Application server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error('Fatal error starting application server:', error);
  process.exit(1);
});
