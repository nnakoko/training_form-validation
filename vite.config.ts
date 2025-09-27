import { defineConfig } from 'vite'

export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/training_form-validation/' : '/',
  server: {
    port: 3000,
    open: true,
    watch: {
      usePolling: true,
      interval: 100
    },
    hmr: {
      overlay: true
    },
    // Chrome拡張機能の警告を抑制
    headers: {
      'Cross-Origin-Embedder-Policy': 'unsafe-none',
      'Cross-Origin-Opener-Policy': 'unsafe-none',
      'Content-Security-Policy': "default-src 'self' 'unsafe-inline' 'unsafe-eval' https: data: blob: chrome-extension:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https: chrome-extension:; style-src 'self' 'unsafe-inline' https: chrome-extension:; img-src 'self' data: https: chrome-extension:; font-src 'self' https: chrome-extension:; connect-src 'self' https: ws: wss: chrome-extension:; object-src 'none'; base-uri 'self';"
    },
    // 開発サーバーの設定を最適化
    cors: true,
    strictPort: false,
    // Chrome拡張機能の干渉を防ぐ
    fs: {
      strict: false,
      allow: ['..', './node_modules']
    }
  },
  publicDir: 'public',
  build: {
    outDir: 'dist',
    sourcemap: true,
    watch: {
      include: ['src/**/*.{ts,scss,html}']
    },
    rollupOptions: {
      input: {
        main: 'index.html'
      },
      output: {
        entryFileNames: 'js/[name].js',
        chunkFileNames: 'js/[name].js',
        assetFileNames: (assetInfo) => {
          const name = assetInfo.name || 'asset'
          const info = name.split('.')
          const ext = info[info.length - 1]
          if (/\.(css|scss)$/.test(name)) {
            return `css/[name].${ext}`
          }
          if (/\.(png|jpe?g|svg|gif|tiff|bmp|ico)$/i.test(name)) {
            return `images/[name].${ext}`
          }
          return `assets/[name].${ext}`
        }
      },
      external: (id) => {
        // Chrome拡張機能のモジュールを外部として扱う
        return id.includes('chrome-extension') ||
               id.includes('main.ts') ||
               id.includes('Failed to fetch dynamically imported module') ||
               id.includes('3b77c895-37d6-47ef-90a0-7750c15d140b');
      }
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "./src/styles/variables.scss" as *;`
      }
    }
  },
  plugins: [
    {
      name: 'chrome-extension-filter',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          // Chrome拡張機能のリクエストをフィルタリング
          if (req.url && (
            req.url.includes('chrome-extension') ||
            req.url.includes('3b77c895-37d6-47ef-90a0-7750c15d140b') ||
            req.url.includes('main.ts')
          )) {
            res.statusCode = 404;
            res.end('Not Found');
            return;
          }
          next();
        });
      }
    }
  ],
  optimizeDeps: {
    include: ['typescript', 'wanakana'],
    exclude: ['chrome-extension']
  },
  resolve: {
    alias: {
      path: 'path-browserify'
    }
  },
  // Chrome拡張機能の干渉を防ぐ
  define: {
    __VUE_PROD_DEVTOOLS__: false,
    'process.env.NODE_ENV': '"development"',
    'global': 'globalThis'
  },
  esbuild: {
    target: 'es2020',
    logOverride: {
      'this-is-undefined-in-esm': 'silent'
    }
  },
  // Chrome拡張機能の干渉を防ぐための追加設定
  clearScreen: false,
  logLevel: 'warn'
})