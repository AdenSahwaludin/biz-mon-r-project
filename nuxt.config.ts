// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: true,
  srcDir: 'app',
  serverDir: 'server',
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },

  routeRules: {
    '/login': { prerender: true },
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

  modules: ['@nuxtjs/tailwindcss', '@pinia/nuxt', '@vueuse/nuxt'],

  tailwindcss: {
    cssPath: '~/assets/css/main.css',
  },

  app: {
    head: {
      title: 'PantauBisnis — Monitoring & Penjualan Multi Bisnis',
      meta: [
        { name: 'description', content: 'Sistem monitoring dan penjualan multi bisnis — Wonton, Es Teh, Dimsum, Warung Sembako' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no' },
        { name: 'theme-color', content: '#0f172a' },
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/logo.png' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'preload', as: 'style', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap', media: 'print', onload: "this.media='all'" },
        { rel: 'preload', as: 'image', href: '/bg.webp', type: 'image/webp' },
        { rel: 'preload', as: 'image', href: '/logo-sm.webp', type: 'image/webp' },
      ],
    },
    pageTransition: { name: 'page', mode: 'out-in' },
  },
})

