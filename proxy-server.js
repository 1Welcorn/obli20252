import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import cors from 'cors';

const app = express();
const PORT = 3001;

// Enable CORS for all routes
app.use(cors());

// Proxy all requests to your Gemini app
app.use('/api', createProxyMiddleware({
  target: 'https://gemini.google.com/gem/7b0cd16f87e2',
  changeOrigin: true,
  pathRewrite: {
    '^/api': '', // remove /api prefix when forwarding
  },
  onError: (err, req, res) => {
    console.error('Proxy error:', err);
    res.status(500).json({ error: 'Proxy error' });
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log('🔗 Proxying request to:', proxyReq.path);
    console.log('📤 Request method:', req.method);
    console.log('📤 Request body:', req.body);
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log('📥 Response status:', proxyRes.statusCode);
    console.log('📥 Response headers:', proxyRes.headers);
  }
}));

app.listen(PORT, () => {
  console.log(`🚀 Proxy server running on http://localhost:${PORT}`);
  console.log(`📡 Proxying requests to: https://gemini.google.com/gem/7b0cd16f87e2`);
  console.log(`🔗 Use: http://localhost:${PORT}/api for your API calls`);
});
