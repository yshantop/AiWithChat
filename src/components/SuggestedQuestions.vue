<template>
  <div class="suggested-questions-container">
    <div class="suggestions-header">
      <button class="toggle-btn" @click="$emit('toggle')">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>
    </div>
    <div class="suggested-questions" v-show="show">
      <button class="scroll-btn scroll-left" @click="scrollQuestions('left')" v-show="canScrollLeft">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>
      <div class="questions-list" ref="questionsList">
        <button v-for="question in questions" 
                :key="question" 
                class="question-item" 
                @click="$emit('select', question)">
          {{ question }}
        </button>
      </div>
      <button class="scroll-btn scroll-right" @click="scrollQuestions('right')" v-show="canScrollRight">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  questions: {
    type: Array,
    default: () => []
  },
  show: {
    type: Boolean,
    default: true
  }
})

const questionsList = ref(null)
const canScrollLeft = ref(false)
const canScrollRight = ref(false)

const checkScrollable = () => {
  if (!questionsList.value) return
  const container = questionsList.value
  canScrollLeft.value = container.scrollLeft > 0
  canScrollRight.value = container.scrollLeft < (container.scrollWidth - container.clientWidth)
}

const scrollQuestions = (direction) => {
  if (!questionsList.value) return
  const container = questionsList.value
  const scrollAmount = 200
  if (direction === 'left') {
    container.scrollLeft -= scrollAmount
  } else {
    container.scrollLeft += scrollAmount
  }
}

onMounted(() => {
  if (questionsList.value) {
    questionsList.value.addEventListener('scroll', checkScrollable)
    checkScrollable()
  }
})

onBeforeUnmount(() => {
  if (questionsList.value) {
    questionsList.value.removeEventListener('scroll', checkScrollable)
  }
})
</script>

<style lang="scss" scoped>
.suggested-questions-container {
  position: relative;
  
  .suggestions-header {
    position: absolute;
    top: -16px;
    right: 20px;
    z-index: 1;
    
    .toggle-btn {
      width: 24px;
      height: 24px;
      border: 1px solid var(--border-color);
      border-radius: 50%;
      background-color: var(--bg-secondary);
      color: var(--text-secondary);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
      padding: 0;
      box-shadow: 0 2px 4px var(--shadow-color);
      
      svg {
        transition: transform 0.3s ease;
      }
      
      &:hover {
        background-color: var(--primary-light);
        border-color: var(--primary-color);
        color: var(--primary-color);
      }
    }
  }
  
  .suggested-questions {
    position: relative;
    padding: 0 40px;
    margin-bottom: 10px;
    
    .scroll-btn {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      width: 28px;
      height: 28px;
      border: 1px solid var(--border-color);
      border-radius: 50%;
      background-color: var(--bg-secondary);
      color: var(--text-primary);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
      z-index: 2;
      padding: 0;
      box-shadow: 0 2px 4px var(--shadow-color);

      &:hover {
        background-color: var(--primary-light);
        border-color: var(--primary-color);
        color: var(--primary-color);
        transform: translateY(-50%) scale(1.05);
      }

      &:active {
        transform: translateY(-50%) scale(0.95);
      }

      &.scroll-left {
        left: 6px;
      }

      &.scroll-right {
        right: 6px;
      }

      &::before {
        content: '';
        position: absolute;
        top: -10px;
        bottom: -10px;
        width: 40px;
        z-index: -1;
        pointer-events: none;
      }

      &.scroll-left::before {
        left: 0;
        background: linear-gradient(to right, var(--bg-primary), transparent);
      }

      &.scroll-right::before {
        right: 0;
        background: linear-gradient(to left, var(--bg-primary), transparent);
      }
    }

    .questions-list {
      display: flex;
      gap: 10px;
      overflow-x: auto;
      scroll-behavior: smooth;
      padding: 4px 0;
      scrollbar-width: none;
      -ms-overflow-style: none;
      position: relative;
      
      &::-webkit-scrollbar {
        display: none;
      }

      .question-item {
        flex-shrink: 0;
        padding: 8px 16px;
        background-color: var(--bg-secondary);
        border: 1px solid var(--border-color);
        border-radius: 20px;
        color: var(--text-secondary);
        font-size: 13px;
        cursor: pointer;
        transition: all 0.2s ease;
        white-space: nowrap;
        position: relative;
        overflow: hidden;

        &::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 100%;
          height: 100%;
          background: radial-gradient(circle, 
            color-mix(in srgb, var(--primary-color) 10%, transparent) 0%, 
            transparent 70%
          );
          transform: translate(-50%, -50%) scale(0);
          transition: transform 0.3s ease;
        }

        &:hover::after {
          transform: translate(-50%, -50%) scale(2);
        }

        &:hover {
          background-color: var(--primary-light);
          border-color: var(--primary-color);
          color: var(--primary-color);
          transform: translateY(-1px);
        }
        
        &:active {
          transform: translateY(0);
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .suggested-questions-container {
    .suggestions-header {
      right: 12px;
    }
    
    .suggested-questions {
      padding: 0 32px;
      
      .scroll-btn {
        width: 24px;
        height: 24px;
      }
    }
  }
}
</style> 