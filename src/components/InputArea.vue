<template>
  <div class="input-area">
    <div class="input-wrapper">
      <!-- 引用内容显示 -->
      <div v-if="quoteMessage" class="quote-preview">
        <div class="quote-content">{{ quoteMessage }}</div>
        <button class="cancel-quote" @click="$emit('cancel-quote')">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      <!-- 输入框部分 -->
      <div class="input-container">
        <el-input
          v-model="inputValue"
          type="text"
          :placeholder="placeholder"
          @keyup.enter="handleSend"
        />
        <div class="input-actions">
          <!-- 创建新对话 -->
          <button class="action-btn" @click="handleNewChat" title="新对话">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>
          <!-- 发送按钮 -->
          <button class="action-btn send-btn" @click="handleSend" :disabled="loading || !inputValue.trim()">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  loading: {
    type: Boolean,
    default: false
  },
  quoteMessage: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['send', 'new-chat', 'cancel-quote'])
const inputValue = ref('')

const placeholder = computed(() => {
  return props.loading ? '正在回答中...' : '输入消息，按回车发送'
})

const handleSend = () => {
  if (props.loading || !inputValue.value.trim()) return
  emit('send', inputValue.value)
  inputValue.value = ''
}

const handleNewChat = async () => {
  await emit('new-chat')
  inputValue.value = ''
}
</script>

<style lang="scss" scoped>
.input-area {
  padding: 20px;
  background-color: var(--bg-primary);
  display: flex;
  align-items: center;
  justify-content: center;

  .input-wrapper {
    width: 100%;
    max-width: 800px;
    margin: 0 auto;
    padding: 0 20px;
  }

  .quote-preview {
    margin-bottom: 12px;
    padding: 12px;
    background-color: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    display: flex;
    align-items: flex-start;
    gap: 12px;
    animation: slideDown 0.3s ease;

    .quote-content {
      flex: 1;
      font-size: 14px;
      color: var(--text-secondary);
      line-height: 1.5;
      max-height: 100px;
      overflow-y: auto;
      white-space: pre-wrap;
      position: relative;
      padding-left: 12px;
      
      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 4px;
        background-color: var(--primary-color);
        border-radius: 2px;
        opacity: 0.5;
      }

      &::-webkit-scrollbar {
        width: 4px;
        height: 4px;
      }

      &::-webkit-scrollbar-thumb {
        background-color: var(--border-color);
        border-radius: 2px;
        
        &:hover {
          background-color: var(--text-tertiary);
        }
      }

      &::-webkit-scrollbar-track {
        background-color: transparent;
      }
    }

    .cancel-quote {
      flex-shrink: 0;
      width: 20px;
      height: 20px;
      border: none;
      background: transparent;
      color: var(--text-tertiary);
      cursor: pointer;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;

      &:hover {
        color: var(--text-primary);
        transform: rotate(90deg);
      }
    }
  }

  .input-container {
    position: relative;
    background-color: var(--bg-secondary);
    border: 1px solid var(--border-color);
    box-shadow: 0 2px 6px var(--shadow-color);
    display: flex;
    align-items: center;
    padding: 0;
    overflow: hidden;
    border-radius: 50px;

    :deep(.el-input__wrapper) {
      background-color: transparent;
      box-shadow: none;
      border-radius: 24px;
      padding: 0;

      &.is-focus,
      &:hover {
        box-shadow: none !important;
      }
    }

    :deep(.el-input__inner) {
      height: 48px;
      border: none;
      background-color: transparent;
      padding: 0 20px;
      font-size: 14px;
      color: var(--text-primary);

      &:focus {
        box-shadow: none;
      }

      &::placeholder {
        color: var(--text-tertiary);
      }
    }

    .input-actions {
      display: flex;
      align-items: center;
      gap: 8px;
      padding-right: 12px;

      .action-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        border: none;
        background: transparent;
        border-radius: 50%;
        cursor: pointer;
        color: var(--text-secondary);
        transition: all 0.2s;
        padding: 0;

        &:hover {
          background-color: var(--hover-color);
          color: var(--primary-color);
        }

        &.send-btn {
          color: var(--primary-color);
          
          &:hover {
            background-color: var(--primary-light);
          }

          &:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }
        }
      }
    }
  }
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .input-area {
    padding: 12px;

    .input-wrapper {
      padding: 0 12px;
    }

    .input-container {
      border-radius: 24px;

      :deep(.el-input__inner) {
        height: 44px;
      }
    }
  }
}
</style> 