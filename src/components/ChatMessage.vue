<template>
  <div :class="['message', role]">
    <div class="message-avatar">
      <el-avatar size="small">
        <!-- 用户头像使用人形图标 -->
        <template v-if="role === 'user'">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </template>
        <!-- AI头像使用机器人图标 -->
        <template v-else>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="11" width="18" height="10" rx="2"></rect>
            <circle cx="12" cy="5" r="2"></circle>
            <path d="M12 7v4"></path>
            <line x1="8" y1="16" x2="8" y2="16"></line>
            <line x1="16" y1="16" x2="16" y2="16"></line>
          </svg>
        </template>
      </el-avatar>
    </div>
    <div class="message-content" @mouseenter="showActions = true" @mouseleave="showActions = false">
      <!-- 用户消息直接显示 -->
      <div v-if="role === 'user'" class="text-content">
        {{ content }}
      </div>
      <!-- AI消息使用markdown渲染 -->
      <div v-else class="markdown-main-style" v-html="renderedContent"></div>
      
      <!-- 操作按钮组 -->
      <div class="message-actions" v-show="showActions">
        <button class="action-btn quote-btn" @click="$emit('quote', content)" title="引用">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"></path>
            <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"></path>
          </svg>
        </button>
        <button class="action-btn copy-btn" @click="$emit('copy', content)" title="复制">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
        </button>
        <button class="action-btn delete-btn" @click="$emit('delete')" title="删除">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'

const props = defineProps({
  role: {
    type: String,
    required: true,
    validator: (value) => ['user', 'assistant'].includes(value)
  },
  content: {
    type: String,
    required: true
  }
})

const showActions = ref(false)

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        const code = hljs.highlight(str, { language: lang, ignoreIllegals: true }).value
        return `<pre class="hljs"><div class="lang">${lang}</div><code>${code}</code></pre>`
      } catch (__) {}
    }
    return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + '</code></pre>'
  }
})

const renderedContent = computed(() => {
  return md.render(props.content)
})
</script>

<style lang="scss" scoped>
.message {
  display: flex;
  gap: 12px;
  margin-bottom: 32px;
  padding: 4px 0;
  align-items: flex-start;
  position: relative;

  &.user {
    flex-direction: row-reverse;
    justify-content: flex-start;

    .message-avatar :deep(.el-avatar) {
      background-color: var(--primary-color) !important;
      color: var(--text-primary) !important;
    }

    .message-content {
      background-color: var(--primary-color) !important;
      color: var(--text-primary) !important;
      border-radius: 12px 12px 0 12px;
      margin-right: 8px;
      font-weight: 500;
    }

    .message-actions {
      right: auto;
      left: 0;
    }
  }

  &.assistant {
    .message-avatar :deep(.el-avatar) {
      background-color: var(--bg-tertiary);
      color: var(--text-primary);
    }

    .message-content {
      background-color: var(--bg-secondary);
      color: var(--text-primary);
      box-shadow: 0 2px 6px var(--shadow-color);
      border-radius: 12px 12px 12px 0;
      margin-left: 8px;

      .markdown-main-style {
        max-width: 100%;
        overflow-x: auto;

        > *:first-child {
          margin-top: 0;
        }

        > *:last-child {
          margin-bottom: 0;
        }
      }
    }
  }

  .message-avatar {
    flex-shrink: 0;

    :deep(.el-avatar) {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      transition: all 0.3s ease;

      svg {
        width: 18px;
        height: 18px;
      }
    }
  }

  .message-content {
    flex: 0 1 auto;
    padding: 12px 16px;
    border-radius: 12px;
    line-height: 1.5;
    font-size: 14px;
    max-width: 80%;
    word-break: break-word;
    position: relative;
    transition: all 0.3s ease;

    .text-content {
      white-space: pre-wrap;
    }
  }

  .message-actions {
    position: absolute;
    bottom: -28px;
    right: 0;
    display: flex;
    gap: 4px;
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
    transform: translateY(4px);
    z-index: 1;
    background-color: var(--bg-secondary);
    padding: 2px;
    border-radius: 6px;
    box-shadow: 0 2px 6px var(--shadow-color);
    border: 1px solid var(--border-color);

    .action-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      border: none;
      background: transparent;
      border-radius: 4px;
      color: var(--text-secondary);
      cursor: pointer;
      transition: all 0.2s ease;
      padding: 0;

      svg {
        transition: transform 0.2s ease;
      }

      &:hover {
        background-color: var(--primary-light);
        color: var(--primary-color);

        svg {
          transform: scale(1.1);
        }
      }

      &:active {
        transform: translateY(1px);
      }

      &.delete-btn:hover {
        background-color: rgba(255, 77, 79, 0.1);
        color: #ff4d4f;
      }
    }
  }

  &:hover {
    .message-actions {
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
    }
  }
}

@media (max-width: 768px) {
  .message {
    .message-content {
      max-width: 90%;
    }
  }
}
</style> 