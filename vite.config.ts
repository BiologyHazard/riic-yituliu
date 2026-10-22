import ui from '@nuxt/ui/vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vueDevTools from 'vite-plugin-vue-devtools';
import { defaultTheme } from './src/utils/theme/defaultTheme.ts';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    ui(defaultTheme),
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
});
