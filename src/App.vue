<template>
  <div class="app-container">
    <!-- 左侧边栏 -->
    <Sidebar
      :width="sidebarWidth"
      :histories="histories"
      :current-history-id="currentHistoryId"
      @select-history="loadHistory"
      @delete-history="deleteHistory"
    />
    
    <!-- 添加拖动条 -->
    <div 
      class="resize-handle"
      @mousedown="startResize"
      :style="{ left: sidebarWidth + 'px' }"
    ></div>

    <!-- 主聊天区域 -->
    <div class="main-content" :style="{ 
      marginLeft: sidebarWidth + 'px',
      width: `calc(100% - ${sidebarWidth}px)`
    }">
      <!-- 顶部标题栏 -->
      <ChatHeader
        :is-dark-theme="isDarkTheme"
        :is-max-model="isMaxModel"
        @toggle-theme="toggleTheme"
        @change-model="handleModelSwitch"
      />

      <!-- 聊天消息区域 -->
      <ChatMain
        :messages="messages"
        @quote="quoteContent"
        @copy="copyMessage"
        @delete="deleteMessage"
      />

      <!-- 推荐问题列表 -->
      <SuggestedQuestions
        :questions="suggestedQuestions"
        :show="showSuggestions"
        @toggle="toggleSuggestions"
        @select="handleQuestionClick"
      />

      <!-- 底部输入区 -->
      <InputArea
        :loading="loading"
        :quote-message="quoteMessage"
        @send="sendMessage"
        @new-chat="createNewChat"
        @cancel-quote="cancelQuote"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { ElMessage } from 'element-plus'
import SparkApi from './utils/sparkApi'
import Sidebar from './components/Sidebar.vue'
import ChatHeader from './components/ChatHeader.vue'
import ChatMain from './components/ChatMain.vue'
import SuggestedQuestions from './components/SuggestedQuestions.vue'
import InputArea from './components/InputArea.vue'
import 'element-plus/dist/index.css'
import './style/themes.scss'
import './style/markdown.scss'
import 'highlight.js/styles/github-dark.css'

const messages = ref([])
const loading = ref(false)
const isMaxModel = ref(false)
let sparkApi = null

const histories = ref([])
const currentHistoryId = ref(null)

// 添加引用状态
const quoteMessage = ref(null)

// 添加问题列表显示状态
const showSuggestions = ref(true)

// 添加侧边栏宽度状态
const sidebarWidth = ref(280) // 默认宽度
const minWidth = 200 // 最小宽度
const maxWidth = 600 // 最大宽度

// 添加主题相关的状态
const isDarkTheme = ref(true)

// 修改推荐问题列表
const suggestedQuestions = [
  "你是谁？你能做什么？",
  "鲁迅和周树人是同一个人吗？",
  "你和ChatGPT有什么区别？",
  "如何使用AI助手？",
  "用java写一个冒泡排序",
  "如何学习编程？",
  "讲个笑话",
  "帮我写个正则表达式",
]

// 添加自我介绍的回答
const SELF_INTRO = "您好，我是Mr.L的小助手，我的名字叫讯飞星火认知大模型。我可以和人类进行自然交流，解答问题，高效完成各领域认知智能需求。"

// 自我介绍相关的问题匹配
const SELF_INTRO_PATTERNS = [
  /你是谁/,
  /你叫什么/,
  /你的名字/,
  /介绍.*自己/,
  /你.*是.*什么/,
  /你.*是谁开发的/,
  /谁.*开发.*你/,
  /你.*的开发者/,
]

const initSparkApi = (model = 'lite') => {
  sparkApi = new SparkApi({
    appId: '178379cd',
    apiKey: '06d990b1869837a7a71d7231836490e7',
    apiSecret: 'ZDdmZTYyNGFkNDI1NjAyNDA3YzUwZmMz',
    model: model,
    onMessage: handleApiMessage,
    onError: handleApiError,
    onClose: handleApiClose
  })
}

const handleModelSwitch = (value) => {
  isMaxModel.value = value
  const model = value ? 'max' : 'lite'
  initSparkApi(model)
  ElMessage.success(`已切换到 ${model.toUpperCase()} 模型`)
}

const handleApiMessage = (data) => {
  if (data.header.code !== 0) {
    ElMessage.error(`请求错误: ${data.header.code}`)
    loading.value = false
    return
  }

  const choice = data.payload.choices
  if (choice.status === 2) {
    loading.value = false
    return
  }

  // 更新最后一条消息或添加新消息
  const content = choice.text[0].content
  const lastMessage = messages.value[messages.value.length - 1]
  
  if (lastMessage && lastMessage.role === 'assistant') {
    lastMessage.content += content
  } else {
    messages.value.push({
      role: 'assistant',
      content: content
    })
  }

  // 保存对话但不更新标题
  saveCurrentChat(false)
}

const handleApiError = (error) => {
  ElMessage.error(`连接错误: ${error}`)
  loading.value = false
}

const handleApiClose = () => {
  loading.value = false
}

const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

const getHistoryTitle = (messages) => {
  const firstMessage = messages.find(msg => msg.role === 'user')
  return firstMessage ? firstMessage.content.slice(0, 20) + '...' : '新对话'
}

const saveCurrentChat = () => {
  // 如果没有消息或者只有一条空消息，不保存
  if (messages.value.length === 0 || 
      (messages.value.length === 1 && !messages.value[0].content)) {
    return
  }

  const history = {
    id: currentHistoryId.value || generateId(),
    title: currentHistoryId.value ? histories.value.find(h => h.id === currentHistoryId.value)?.title || '新对话' : '新对话',
    messages: [...messages.value],
    timestamp: new Date().toISOString()
  }

  const existingIndex = histories.value.findIndex(h => h.id === history.id)
  if (existingIndex !== -1) {
    histories.value[existingIndex] = history
  } else {
    histories.value.unshift(history)
  }
  
  // 保存到本地存储
  saveHistoriesToStorage()
}

const createNewChat = () => {
  // 保存当前对话到历史记录
  if (messages.value.length > 0) {
    // 在保存前更新当前对话的标题
    const currentHistory = histories.value.find(h => h.id === currentHistoryId.value)
    if (currentHistory) {
      currentHistory.title = getHistoryTitle(messages.value)
      saveHistoriesToStorage()
    } else {
      saveCurrentChat()
    }
  }
  
  // 清空当前对话
  messages.value = []
  
  // 创建新的历史记录
  const newId = generateId()
  currentHistoryId.value = newId
  
  // 添加新的历史记录
  const newHistory = {
    id: newId,
    title: '新对话',
    messages: [],
    timestamp: new Date().toISOString()
  }
  histories.value.unshift(newHistory)
  saveHistoriesToStorage()
  
  // 重置引用
  quoteMessage.value = null

  // 显示欢迎消息
  showTypingMessage(SELF_INTRO)
}

const loadHistory = (history) => {
  // 保存当前对话，不更新标题
  saveCurrentChat(false)
  
  // 加载选中历史对话
  messages.value = [...history.messages]
  currentHistoryId.value = history.id
}

// 添加删除历史记录功能
const deleteHistory = (historyId) => {
  histories.value = histories.value.filter(h => h.id !== historyId)
  saveHistoriesToStorage()
  
  if (currentHistoryId.value === historyId) {
    createNewChat()
  }
}

// 切换主题的函数
const toggleTheme = () => {
  isDarkTheme.value = !isDarkTheme.value
  document.documentElement.className = isDarkTheme.value ? 'theme-dark' : 'theme-light'
  // 保存主题设置到本地存储
  localStorage.setItem('theme', isDarkTheme.value ? 'dark' : 'light')
}

// 初始化主题
const initTheme = () => {
  const savedTheme = localStorage.getItem('theme') || 'dark'
  isDarkTheme.value = savedTheme === 'dark'
  document.documentElement.className = isDarkTheme.value ? 'theme-dark' : 'theme-light'
}

// 添加地存相关的函数
const STORAGE_KEY = 'vue-spark-chat-histories'

const loadHistoriesFromStorage = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      histories.value = JSON.parse(stored)
    }
  } catch (error) {
    console.error('Failed to load histories:', error)
  }
}

const saveHistoriesToStorage = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(histories.value))
  } catch (error) {
    console.error('Failed to save histories:', error)
  }
}

// 添加复制功能
const copyMessage = (content) => {
  navigator.clipboard.writeText(content).then(() => {
    ElMessage.success('复制成功')
  }).catch(() => {
    ElMessage.error('复制失败')
  })
}

// 添加删除消息的方法
const deleteMessage = (index) => {
  ElMessage.success('已删除该消息')
  messages.value.splice(index, 1)
  // 如果删除后对话为空，创建新对话
  if (messages.value.length === 0) {
    createNewChat()
  } else {
    saveCurrentChat() // 保存更改
  }
}

// 添加引用消息的方法
const quoteContent = (content) => {
  quoteMessage.value = content
}

// 取消引用
const cancelQuote = () => {
  quoteMessage.value = null
}

// 添加切换显示的方法
const toggleSuggestions = () => {
  showSuggestions.value = !showSuggestions.value
  // 保存用户偏好
  localStorage.setItem('showSuggestions', showSuggestions.value)
}

// 添加拖动相关方法
const startResize = (e) => {
  e.preventDefault()
  
  const startX = e.clientX
  const startWidth = sidebarWidth.value
  
  const handleMouseMove = (e) => {
    const delta = e.clientX - startX
    const newWidth = Math.min(Math.max(startWidth + delta, minWidth), maxWidth)
    sidebarWidth.value = newWidth
    
    // 保存宽度到本地存储
    localStorage.setItem('sidebarWidth', newWidth)
  }
  
  const handleMouseUp = () => {
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  }
  
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
}

// 处理问题点击
const handleQuestionClick = (question) => {
  sendMessage(question)
}

// 添加模拟打字效果的函数
const simulateTyping = (text, onChar) => {
  let index = 0
  const interval = setInterval(() => {
    if (index < text.length) {
      onChar(text[index])
      index++
    } else {
      clearInterval(interval)
      loading.value = false
    }
  }, 50) // 每50毫秒输出一个字符
}

// 修改发送消息方法
const sendMessage = async (message) => {
  if (!message.trim()) {
    ElMessage.warning('请输入内容')
    return
  }

  if (loading.value) return

  // 如果是新对话，生成新的ID
  if (!currentHistoryId.value) {
    currentHistoryId.value = generateId()
    // 创建新的历史记录
    const newHistory = {
      id: currentHistoryId.value,
      title: '新对话',
      messages: [],
      timestamp: new Date().toISOString()
    }
    histories.value.unshift(newHistory)
    saveHistoriesToStorage()
  }

  let finalMessage = message
  
  // 如果有引用内容，加到消息中
  if (quoteMessage.value) {
    finalMessage = `> ${quoteMessage.value}\n\n${message}`
    quoteMessage.value = null // 发送后清除引用
  }
  
  // 检查是否是自我介绍相关的问题
  const isAskingAboutSelf = SELF_INTRO_PATTERNS.some(pattern => 
    pattern.test(finalMessage)
  )

  loading.value = true
  messages.value.push({
    role: 'user',
    content: finalMessage
  })

  try {
    if (isAskingAboutSelf) {
      // 如果是自我介绍相关的问题，使用模拟打字效果
      messages.value.push({
        role: 'assistant',
        content: ''
      })
      simulateTyping(SELF_INTRO, (char) => {
        const lastMessage = messages.value[messages.value.length - 1]
        lastMessage.content += char
      })
      saveCurrentChat(false)
    } else {
      // 其他问题正常发送到 API
      await sparkApi.sendMessage(finalMessage)
      saveCurrentChat(false)
    }
  } catch (error) {
    ElMessage.error(`发送失败: ${error}`)
    loading.value = false
  }
}

onMounted(() => {
  initSparkApi()
  loadHistoriesFromStorage()
  initTheme()
  const savedShowSuggestions = localStorage.getItem('showSuggestions')
  if (savedShowSuggestions !== null) {
    showSuggestions.value = savedShowSuggestions === 'true'
  }
  const savedWidth = localStorage.getItem('sidebarWidth')
  if (savedWidth) {
    sidebarWidth.value = parseInt(savedWidth)
  }
})

onBeforeUnmount(() => {
  saveCurrentChat()
})
</script>

<style lang="scss" scoped>
.app-container {
  position: relative;
  height: 100vh;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  overflow: hidden;
}

.resize-handle {
  position: fixed;
  top: 0;
  width: 4px;
  height: 100vh;
  background: transparent;
  cursor: col-resize;
  z-index: 11;
  transition: none;
  
  &:hover,
  &:active {
    background: var(--primary-color);
    opacity: 0.2;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: -3px;
    right: -3px;
    bottom: 0;
    z-index: 1;
  }
  
  @media (max-width: 768px) {
    display: none;
  }
}

.main-content {
  transition: none;
  display: flex;
  flex-direction: column;
  height: 100vh;
  
  @media (max-width: 768px) {
    margin-left: 0 !important;
    width: 100% !important;
  }
}

:global(body.resizing) {
  cursor: col-resize;
  user-select: none;
}
</style>
