import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import vitePublish from 'vite-plugin-publish'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react(), vitePublish()],
  resolve: {
    alias: {
      '@': '/src/',
    },
  },
  base: mode === 'production' ? 'https://cdn200.oss-cn-hangzhou.aliyuncs.com/svg-charts/' : '/',
}))

