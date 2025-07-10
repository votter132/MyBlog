import { createApp } from 'vue'
import App from './App.vue'
import router, { addDynamicRoutes } from './router'
import pinia from './stores'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
// v-md
import VueMarkdownEditor from '@kangc/v-md-editor';
import '@kangc/v-md-editor/lib/style/base-editor.css';
import vuepressTheme from '@kangc/v-md-editor/lib/theme/vuepress.js';
import Prism from 'prismjs';
import '@kangc/v-md-editor/lib/theme/style/vuepress.css';
import '@/assets/style.scss'
const app = createApp(App)

VueMarkdownEditor.use(vuepressTheme, {
  Prism,
});

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}
app.use(pinia)
app.use(router)
app.use(VueMarkdownEditor);
addDynamicRoutes()
app.mount('#app')
