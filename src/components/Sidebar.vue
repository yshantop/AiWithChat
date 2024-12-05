<template>
  <div class="sidebar" :style="{ width: width + 'px' }">
    <div class="user-info">
      <div class="logo">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
          <circle cx="12" cy="12" r="3"/>
          <line x1="12" y1="9" x2="12" y2="15"/>
          <line x1="9" y1="12" x2="15" y2="12"/>
        </svg>
      </div>
      <span class="app-title">AiWithCode</span>
    </div>
    <div class="search-box">
      <div class="search-container">
        <input
          type="text"
          placeholder="搜索"
          class="search-input"
          v-model="searchQuery"
          @input="handleSearch"
        >
        <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
      </div>
    </div>
    <div class="history-list">
      <div v-for="(group, groupName) in groupedHistories" :key="groupName" class="history-group">
        <div class="group-title">{{ groupName }}</div>
        <div v-for="history in group" 
             :key="history.id" 
             :class="['history-item', { active: currentHistoryId === history.id }]"
             @click="$emit('select-history', history)">
          <span class="history-title">{{ history.title }}</span>
          <button class="delete-btn" @click.stop="$emit('delete-history', history.id)">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
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
  width: {
    type: Number,
    default: 280
  },
  histories: {
    type: Array,
    default: () => []
  },
  currentHistoryId: {
    type: String,
    default: null
  }
})

const searchQuery = ref('')

const filteredHistories = computed(() => {
  if (!searchQuery.value) {
    return props.histories
  }
  const query = searchQuery.value.toLowerCase()
  return props.histories.filter(history => 
    history.title.toLowerCase().includes(query)
  )
})

const groupedHistories = computed(() => {
  const groups = {}
  filteredHistories.value.forEach(history => {
    const groupName = formatDate(history.timestamp)
    if (!groups[groupName]) {
      groups[groupName] = []
    }
    groups[groupName].push(history)
  })
  return groups
})

const handleSearch = () => {
  // 搜索时自动触发 computed 属性重新计算
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now - date

  if (diff < 24 * 60 * 60 * 1000) {
    return '今天'
  }
  if (diff < 48 * 60 * 60 * 1000) {
    return '昨天'
  }
  if (diff < 7 * 24 * 60 * 60 * 1000) {
    return '本周'
  }
  if (date.getMonth() === now.getMonth()) {
    return '本月'
  }
  return `${date.getFullYear()}年${date.getMonth() + 1}月`
}
</script>

<style lang="scss" scoped>
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  background-color: var(--bg-secondary);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  padding: 20px 0;
  overflow-x: hidden;
  z-index: 10;

  .user-info {
    padding: 0 20px;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 12px;

    .logo {
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--primary-color);
    }

    .app-title {
      font-size: 18px;
      font-weight: 600;
      color: var(--text-primary);
      letter-spacing: 0.5px;
    }
  }

  .search-box {
    padding: 0 16px;
    margin-bottom: 20px;
    width: 100%;
    box-sizing: border-box;
  }

  .search-container {
    position: relative;
    width: 100%;
    box-sizing: border-box;

    .search-input {
      width: 100%;
      height: 40px;
      background-color: var(--bg-tertiary);
      border: 1px solid transparent;
      border-radius: 20px;
      padding: 0 36px 0 14px;
      font-size: 14px;
      color: var(--text-primary);
      transition: all 0.3s ease;
      outline: none;
      box-sizing: border-box;

      &:hover {
        border-color: var(--primary-color);
      }

      &:focus {
        background-color: var(--bg-secondary);
        border-color: var(--primary-color);

        & + .search-icon {
          color: var(--primary-color);
        }
      }

      &::placeholder {
        color: var(--text-tertiary);
      }
    }

    .search-icon {
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-tertiary);
      pointer-events: none;
    }
  }

  .history-list {
    flex: 1;
    overflow-y: auto;
    padding: 0 10px;
    margin-right: 4px;
    scrollbar-gutter: stable;

    &::-webkit-scrollbar {
      width: 4px;
      height: 4px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
      margin: 4px 0;
    }

    &::-webkit-scrollbar-thumb {
      background-color: var(--border-color);
      border-radius: 4px;
      transition: background-color 0.3s ease;

      &:hover {
        background-color: var(--text-tertiary);
      }

      &:active {
        background-color: var(--primary-color);
      }
    }

    scrollbar-width: thin;
    scrollbar-color: var(--border-color) transparent;

    &:hover {
      &::-webkit-scrollbar-thumb {
        background-color: var(--text-tertiary);
      }
    }

    .history-group {
      margin-bottom: 20px;

      .group-title {
        padding: 0 10px;
        color: var(--text-tertiary);
        font-size: 12px;
        margin-bottom: 12px;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 1px;
      }

      .history-item {
        padding: 12px 16px;
        border-radius: 8px;
        cursor: pointer;
        color: var(--text-primary);
        transition: all 0.2s ease;
        margin-bottom: 4px;
        display: flex;
        align-items: center;
        position: relative;

        .history-title {
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-size: 14px;
        }

        .delete-btn {
          opacity: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          border: none;
          background: transparent;
          border-radius: 4px;
          color: var(--text-tertiary);
          cursor: pointer;
          transition: all 0.2s ease;
          padding: 0;

          &:hover {
            background-color: rgba(255, 77, 79, 0.1);
            color: #ff4d4f;
          }
        }

        &:hover {
          .delete-btn {
            opacity: 1;
          }
        }

        &::before {
          content: '';
          position: absolute;
          left: 0;
          width: 4px;
          background-color: #356BFD;
          border-radius: 2px;
          transition: height 0.2s ease;
        }

        &:hover {
          background-color: var(--bg-tertiary);
          padding-left: 18px;
        }

        &.active {
          background-color: var(--primary-light);
          color: var(--primary-color);
          font-weight: 500;

          &::before {
            height: 70%;
            top: 15%;
          }
        }
      }
    }
  }

  @media (max-width: 768px) {
    display: none;
  }
}
</style> 