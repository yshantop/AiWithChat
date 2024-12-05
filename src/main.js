import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'
import './style/global.scss'
import './style/themes.scss'

const app = createApp(App)
app.use(ElementPlus)
app.mount('#app')

// 设置默认主题
document.documentElement.className = 'theme-dark'
