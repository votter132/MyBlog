import { fileURLToPath, URL } from 'node:url'
import postcssPxToRem from 'postcss-pxtorem';
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  // css: {
  //   postcss: {
  //     plugins: [
  //       postcssPxToRem({
  //         rootValue: 16,
  //         propList: ['*', '!border*'], // 排除边框属性
  //         selectorBlackList: [/^ignore-/],
  //         minPixelValue: 2 // 不转换小于2px的单位
  //       })
  //     ]
  //   }
  // }
})
