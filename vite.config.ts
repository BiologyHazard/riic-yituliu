import { fileURLToPath, URL } from 'node:url';
import ui from '@nuxt/ui/vite';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueDevTools from 'vite-plugin-vue-devtools';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    ui({
      ui: {
        colors: {
          primary: 'blue',
          secondary: 'green',
          neutral: 'slate',
        },
      },
    }),
    {
      name: 'dev-generic-proxy',
      configureServer(server) {
        server.middlewares.use('/api/proxy/get', async (req, res) => {
          console.log(`[Proxy] ${req.method} ${req.url}`);
          const qs = req.url?.split('?')[1] ?? '';
          const params = new URLSearchParams(qs);
          const targetUrl = params.get('url');

          if (!targetUrl) {
            res.writeHead(400, { 'Content-Type': 'text/plain' });
            res.end('Missing url query parameter');
            return;
          }

          try {
            const upstream = await fetch(targetUrl, {
              method: req.method,
              headers: {
                Accept: (req.headers['accept'] as string) ?? '*/*',
                Range: (req.headers['range'] as string) ?? '',
                'User-Agent': 'Mozilla/5.0',
              },
            });

            console.log(`[Proxy] Upstream response: ${upstream.status} ${upstream.statusText}`);

            res.writeHead(upstream.status, {
              'Content-Type': upstream.headers.get('Content-Type') ?? 'application/octet-stream',
              'Content-Length': upstream.headers.get('Content-Length') ?? '',
              'Content-Range': upstream.headers.get('Content-Range') ?? '',
              'Accept-Ranges': upstream.headers.get('Accept-Ranges') ?? '',
              'Access-Control-Allow-Origin': '*',
              'Cache-Control': upstream.headers.get('Cache-Control') ?? '',
            });

            const buffer = await upstream.arrayBuffer();
            res.end(Buffer.from(buffer));
          } catch (err) {
            res.writeHead(502, { 'Content-Type': 'text/plain' });
            res.end(err instanceof Error ? err.message : 'Proxy error');
          }
        });
      },
    },
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    proxy: {
      '/api/proxy/monster-siren': {
        target: 'https://monster-siren.hypergryph.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/proxy\/monster-siren/, ''),
      },
    },
  },
  // server: {
  //   proxy: {
  //     // 匹配 /api/proxy/get 路径的请求
  //     '/api/proxy/get': {
  //       // 先设一个占位target（会被动态覆盖）
  //       target: 'https://example.com',
  //       changeOrigin: true,
  //       // 禁用Vite默认的路径重写（我们自己处理）
  //       rewrite: () => '',
  //       // 自定义代理逻辑（核心）
  //       configure: (proxy) => {
  //         proxy.on('proxyReq', (proxyReq, req) => {
  //           // 1. 解析URL参数中的 `url` 值（目标地址）
  //           const urlParams = new URL(req.url || '', `http://${req.headers.host}`).searchParams;
  //           const targetUrl = urlParams.get('url');

  //           if (targetUrl) {
  //             // 2. 解析目标URL，修改代理的请求地址
  //             const parsedTarget = new URL(targetUrl);
  //             // 设置代理的目标协议+域名（如 https://monster-siren.hypergryph.com）
  //             proxyReq.setHeader('Host', parsedTarget.host);
  //             // 重写代理请求的路径+参数（如 /test → 目标URL的path+search）
  //             proxyReq.path = parsedTarget.pathname + parsedTarget.search;
  //             // 动态设置代理的protocol（http/https）
  //             proxy.protocol = parsedTarget.protocol;
  //             // 动态设置代理的host和port
  //             proxy.options.target = `${parsedTarget.protocol}//${parsedTarget.host}`;
  //           }
  //         });
  //       },
  //     },
  //   },
  // },
});
