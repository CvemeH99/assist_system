<template>
  <div :class="['message', msg.role]">
    <div :class="['bubble-avatar', msg.role]">
      <el-icon v-if="msg.role === 'assistant'" :size="18"><MagicStick /></el-icon>
      <span v-else>{{ userInitial }}</span>
    </div>
    <div class="bubble">
      <div class="content" v-html="formattedContent" />
      <div class="time">{{ formatTime(msg.created_at) }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { MagicStick } from '@element-plus/icons-vue'
import type { ChatMessage } from '../types'
import { formatTime as fmtTime } from '../utils/date'

const props = defineProps<{ msg: ChatMessage; userInitial?: string }>()
const formattedContent = computed(() =>
  props.msg.content
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br>'),
)
const userInitial = computed(() => props.userInitial || '我')
const formatTime = fmtTime
</script>

<style scoped>
.message {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.message.user {
  flex-direction: row-reverse;
}

.bubble-avatar {
  display: grid;
  width: 36px;
  height: 36px;
  flex: 0 0 36px;
  place-items: center;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
}

.bubble-avatar.assistant {
  color: var(--brand);
  background: var(--brand-soft);
  border: 1px solid var(--brand-border);
}

.bubble-avatar.user {
  color: #fff;
  background: var(--brand);
}

.bubble {
  max-width: min(72%, 720px);
  padding: 12px 15px;
  border-radius: 8px;
}

.message.user .bubble {
  color: #fff;
  background: var(--brand);
  border-top-right-radius: 2px;
  box-shadow: 0 8px 20px rgba(15, 118, 110, 0.14);
}

.message.assistant .bubble {
  color: var(--ink-soft);
  background: #f6f9f8;
  border: 1px solid #e5edeb;
  border-top-left-radius: 2px;
}

.content {
  font-size: 13px;
  line-height: 1.75;
  overflow-wrap: anywhere;
}

.time {
  margin-top: 6px;
  color: #8b9b99;
  font-size: 10px;
  text-align: right;
}

.message.user .time {
  color: rgba(255, 255, 255, 0.66);
}

@media (max-width: 640px) {
  .bubble {
    max-width: 84%;
  }
}
</style>
