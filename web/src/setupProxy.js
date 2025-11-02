const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Proxy API requests to the backend server
  app.use(
    '/api',
    createProxyMiddleware({
      target: process.env.REACT_APP_PROXY_TARGET || 'http://10.230.66.32:8080',
      changeOrigin: true,
      secure: false, // Set to false to allow self-signed certificates
      logLevel: 'debug',
      onProxyReq: (proxyReq, req, res) => {
        // Add any custom headers if needed
        if (req.headers.authorization) {
          proxyReq.setHeader('Authorization', req.headers.authorization);
        }
      },
      onError: (err, req, res) => {
        console.error('Proxy error:', err);
      }
    })
  );

  // Proxy v1 requests (OpenAI compatible API)
  app.use(
    '/v1',
    createProxyMiddleware({
      target: process.env.REACT_APP_PROXY_TARGET || 'http://10.230.66.32:8080',
      changeOrigin: true,
      secure: false, // Set to false to allow self-signed certificates
      logLevel: 'debug',
      ws: false, // Disable WebSocket proxying
      followRedirects: true,
      onProxyReq: (proxyReq, req, res) => {
        console.log(`Proxying ${req.method} ${req.url} to ${proxyReq.path}`);
        // Add any custom headers if needed
        if (req.headers.authorization) {
          proxyReq.setHeader('Authorization', req.headers.authorization);
        }
        // Preserve original headers, don't override Accept
        // The server will decide the response content type
      },
      onProxyRes: (proxyRes, req, res) => {
        console.log(`Proxy response status: ${proxyRes.statusCode}`);
        // Ensure proper headers for streaming response
        proxyRes.headers['Access-Control-Allow-Origin'] = '*';
        proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
        proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
      },
      onError: (err, req, res) => {
        console.error('Proxy error:', err);
        console.error('Error details:', {
          message: err.message,
          code: err.code,
          target: req.url
        });
        if (!res.headersSent) {
          res.status(500).json({ 
            error: 'Proxy error', 
            message: err.message,
            details: 'Failed to proxy request to backend server'
          });
        }
      }
    })
  );
};

