// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: true,
  srcDir: 'app',
  serverDir: 'server',
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },

  routeRules: {
    '/login': { prerender: true },
    '/*.webp': { headers: { 'cache-control': 'public, max-age=31536000, immutable' } },
    '/*.png': { headers: { 'cache-control': 'public, max-age=31536000, immutable' } },
    '/*.ico': { headers: { 'cache-control': 'public, max-age=31536000, immutable' } },
  },

  nitro: {
    compressPublicAssets: true,
  },

  vite: {
    vue: {
      template: {
        transformAssetUrls: false
      }
    },
    build: {
      cssCodeSplit: true,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('lucide-vue-next')) return 'vendor-lucide'
              if (id.includes('chart.js') || id.includes('vue-chartjs')) return 'vendor-charts'
              if (id.includes('jspdf')) return 'vendor-pdf'
              if (id.includes('@zxing')) return 'vendor-barcode'
            }
          }
        }
      }
    }
  },

  modules: ['@nuxtjs/tailwindcss', '@pinia/nuxt', '@vueuse/nuxt', '@vite-pwa/nuxt'],

  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'PantauBisnis — Monitoring & Penjualan Multi Bisnis',
      short_name: 'PantauBisnis',
      description: 'Sistem monitoring dan penjualan multi bisnis — Wonton, Es Teh, Dimsum, Warung Sembako',
      theme_color: '#0f172a',
      background_color: '#0f172a',
      display: 'standalone',
      orientation: 'any',
      id: 'https://rapidgumelar.vercel.app/',
      start_url: 'https://rapidgumelar.vercel.app/',
      scope: 'https://rapidgumelar.vercel.app/',
      icons: [
        {
          src: '/logo-sm.webp',
          sizes: '192x192',
          type: 'image/webp',
          purpose: 'any'
        },
        {
          src: '/logo.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any maskable'
        }
      ]
    },
    workbox: {
      navigateFallback: null,
      globPatterns: ['**/*.{js,css,html,png,svg,ico,webp,woff2}'],
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'google-fonts-cache',
            expiration: {
              maxEntries: 10,
              maxAgeSeconds: 60 * 60 * 24 * 365
            },
            cacheableResponse: {
              statuses: [0, 200]
            }
          }
        },
        {
          urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'gstatic-fonts-cache',
            expiration: {
              maxEntries: 10,
              maxAgeSeconds: 60 * 60 * 24 * 365
            },
            cacheableResponse: {
              statuses: [0, 200]
            }
          }
        },
        {
          urlPattern: /\/api\/.*/i,
          handler: 'NetworkFirst',
          options: {
            cacheName: 'api-cache',
            expiration: {
              maxEntries: 50,
              maxAgeSeconds: 60 * 60 * 24
            },
            cacheableResponse: {
              statuses: [0, 200]
            }
          }
        }
      ]
    },
    client: {
      installPrompt: true
    },
    devOptions: {
      enabled: false,
      type: 'classic'
    }
  },

  tailwindcss: {
    cssPath: '~/assets/css/main.css',
  },

  app: {
    head: {
      title: 'PantauBisnis — Monitoring & Penjualan Multi Bisnis',
      meta: [
        { name: 'description', content: 'Sistem monitoring dan penjualan multi bisnis — Wonton, Es Teh, Dimsum, Warung Sembako' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover' },
        { name: 'theme-color', content: '#0f172a' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
        { name: 'apple-mobile-web-app-title', content: 'PantauBisnis' },
        { name: 'mobile-web-app-capable', content: 'yes' },
        { name: 'application-name', content: 'PantauBisnis' },
        { name: 'format-detection', content: 'telephone=no' }
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/logo.png' },
        { rel: 'apple-touch-icon', href: '/logo.png' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/logo.png' },
        { rel: 'canonical', href: 'https://rapidgumelar.vercel.app/' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'preload', as: 'style', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap', media: 'print', onload: "this.media='all'" },
        { rel: 'preload', as: 'image', href: '/logo-sm.webp', type: 'image/webp' },
      ],
    },
    pageTransition: { name: 'page', mode: 'out-in' },
  },
})

