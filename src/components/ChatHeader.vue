<template>
  <div class="chat-header">
    <span class="title">Mr.L'Assistant</span>
    <div class="header-actions">
      <button class="theme-toggle" @click="$emit('toggle-theme')">
        <!-- 月亮图标 (深色主题) -->
        <svg v-if="!isDarkTheme" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        </svg>
        <!-- 太阳图标 (浅色主题) -->
        <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="5"></circle>
          <line x1="12" y1="1" x2="12" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="23"></line>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
          <line x1="1" y1="12" x2="3" y2="12"></line>
          <line x1="21" y1="12" x2="23" y2="12"></line>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        </svg>
      </button>
      <div class="model-switch-container">
        <el-switch
          v-model="modelValue"
          active-text="Max"
          inactive-text="Lite"
          @change="$emit('change-model', modelValue)"
          class="model-switch"
          inline-prompt
          style="--el-switch-on-color: #356BFD; --el-switch-off-color: #94ABFF;"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'

const props = defineProps({
  isDarkTheme: {
    type: Boolean,
    default: false
  },
  isMaxModel: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['toggle-theme', 'change-model'])
const modelValue = ref(props.isMaxModel)

// 在组件挂载时读取存储的主题设置
onMounted(() => {
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme) {
    emit('toggle-theme', savedTheme === 'dark')
  }
})

// 监听主题变化并保存到localStorage
watch(() => props.isDarkTheme, (newValue) => {
  localStorage.setItem('theme', newValue ? 'dark' : 'light')
})
</script>

<style lang="scss" scoped>
.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid var(--border-color);
  background-color: var(--bg-secondary);
  box-shadow: 0 1px 2px var(--shadow-color);

  .title {
    font-size: 16px;
    font-weight: 500;
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .theme-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border: none;
    background: transparent;
    border-radius: 50%;
    color: var(--text-secondary);
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      background-color: var(--hover-color);
      color: var(--primary-color);
    }
  }

  .model-switch-container {
    display: flex;
    align-items: center;
    padding: 3px 10px;
    background-color: var(--bg-tertiary);
    border: 1px solid var(--border-color);
    border-radius: 20px;
    box-shadow: 0 2px 4px var(--shadow-color);
    transition: all 0.3s ease;

    &:hover {
      border-color: var(--primary-color);
      background-color: var(--primary-light);
    }

    :deep(.el-switch) {
      --el-switch-on-color: var(--primary-color) !important;
      --el-switch-off-color: var(--primary-color) !important;
      --el-switch-border-color: var(--border-color);
      
      .el-switch__core {
        background-color: var(--bg-secondary) !important;
        border-color: var(--border-color) !important;
        
        .el-switch__action {
          background-color: #fff;
          box-shadow: 0 2px 4px var(--shadow-color);
        }
      }

      &.is-checked {
        .el-switch__core {
          .el-switch__action {
            background-color: #fff;
          }
        }
      }

      .el-switch__label {
        color: var(--text-secondary);
        font-size: 12px;
        font-weight: 500;
        
        &.is-active {
          color: var(--primary-color);
        }
      }
    }
  }

  @media (max-width: 768px) {
    padding: 12px 16px;

    .model-switch-container {
      padding: 2px;
      
      :deep(.el-switch) {
        transform: scale(0.9);
        
        .el-switch__label {
          font-size: 11px;
        }
      }
    }
  }
}
</style> 