import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue' // Import plugin
import path from 'path'

export default defineConfig({
  plugins: [
    vue() // Thêm vào mảng plugins
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // Giúp bạn dùng @ thay cho src
    },
  },
})