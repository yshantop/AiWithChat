<template>
  <div class="chat-messages" ref="messagesContainer">
    <div v-for="(msg, index) in messages" :key="index">
      <ChatMessage
        :role="msg.role"
        :content="msg.content"
        @quote="$emit('quote', msg.content)"
        @copy="$emit('copy', msg.content)"
        @delete="$emit('delete', index)"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import ChatMessage from './ChatMessage.vue'

const props = defineProps({
  messages: {
    type: Array,
    default: () => []
  }
})

const messagesContainer = ref(null)

const scrollToBottom = () => {
  setTimeout(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  }, 100)
}

watch(() => props.messages, () => {
  scrollToBottom()
}, { deep: true })

onMounted(() => {
  scrollToBottom()
})
</script>

<style lang="scss" scoped>
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background-color: var(--bg-primary);

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: var(--border-color);
    border-radius: 4px;
    
    &:hover {
      background-color: var(--text-tertiary);
    }
  }

  &::-webkit-scrollbar-track {
    background-color: transparent;
  }

  scrollbar-width: thin;
  scrollbar-color: var(--border-color) transparent;
}

@media (max-width: 768px) {
  .chat-messages {
    padding: 16px;
  }
}
</style> 