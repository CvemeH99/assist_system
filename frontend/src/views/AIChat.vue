<template>
  <div class="chat-page">
    <PageHeader
      title="AI 健康助手"
      subtitle="结合患者档案与健康数据，提供连续的问答支持"
      :icon="ChatDotRound"
    >
      <template #actions>
        <span class="status-pill">智能服务在线</span>
      </template>
    </PageHeader>

    <section class="chat-layout">
      <div class="surface-card chat-card">
        <div ref="chatBox" class="chat-messages">
          <div v-if="!chatStore.messages.length" class="chat-welcome">
            <div class="welcome-icon">
              <el-icon :size="28"><MagicStick /></el-icon>
            </div>
            <h2>今天想了解哪方面？</h2>
            <p>可直接询问血糖波动、饮食搭配、运动安排或用药注意事项。</p>
            <div class="welcome-prompts">
              <button
                v-for="prompt in quickPrompts"
                :key="prompt"
                type="button"
                @click="sendSuggestion(prompt)"
              >
                {{ prompt }}
                <el-icon><Right /></el-icon>
              </button>
            </div>
          </div>

          <ChatMessage
            v-for="message in chatStore.messages"
            :key="message.id"
            :msg="message"
            :user-initial="patientStore.currentPatient?.name?.slice(0, 1)"
          />

          <div v-if="chatStore.loading" class="message assistant">
            <div class="bubble-avatar assistant">
              <el-icon :size="18"><MagicStick /></el-icon>
            </div>
            <div class="thinking-bubble">
              <span />
              <span />
              <span />
            </div>
          </div>
        </div>

        <div class="chat-composer">
          <div v-if="chatStore.messages.length" class="prompt-strip">
            <button
              v-for="prompt in quickPrompts.slice(0, 3)"
              :key="prompt"
              type="button"
              :disabled="chatStore.loading"
              @click="sendSuggestion(prompt)"
            >
              {{ prompt }}
            </button>
          </div>
          <div class="composer-box">
            <el-input
              v-model="input"
              type="textarea"
              :rows="2"
              resize="none"
              placeholder="输入健康问题，按 Enter 发送，Shift + Enter 换行"
              :disabled="chatStore.loading"
              @keydown.enter.exact.prevent="send"
            />
            <el-button
              type="primary"
              circle
              :icon="Promotion"
              :disabled="!input.trim() || chatStore.loading"
              @click="send"
            />
          </div>
          <div class="composer-note">回答仅作健康管理参考，紧急情况请及时就医。</div>
        </div>
      </div>

      <aside class="chat-aside">
        <div class="surface-card context-card">
          <div class="card-heading">
            <h3>本次咨询对象</h3>
            <p>回答将结合以下档案信息</p>
          </div>
          <div v-if="patientStore.currentPatient" class="context-patient">
            <div class="context-avatar">{{ patientStore.currentPatient.name.slice(0, 1) }}</div>
            <div>
              <strong>{{ patientStore.currentPatient.name }}</strong>
              <span>{{ patientStore.currentPatient.gender }} · {{ patientStore.currentPatient.age }} 岁</span>
            </div>
          </div>
          <div v-if="patientStore.currentPatient" class="context-list">
            <div>
              <span>糖尿病类型</span>
              <strong>{{ patientStore.currentPatient.diabetes_type }}</strong>
            </div>
            <div>
              <span>BMI</span>
              <strong>
                {{ patientStore.currentPatient.bmi?.toFixed(1) || '--' }}
                {{ patientStore.currentPatient.bmi_status ? ` · ${patientStore.currentPatient.bmi_status}` : '' }}
              </strong>
            </div>
            <div>
              <span>确诊日期</span>
              <strong>{{ patientStore.currentPatient.diagnosis_date || '--' }}</strong>
            </div>
          </div>
          <el-empty v-else description="请先选择患者" :image-size="56" />
        </div>

        <div class="surface-card guide-card">
          <div class="card-heading">
            <h3>常用问题</h3>
            <p>选择后直接发送</p>
          </div>
          <button
            v-for="prompt in sidePrompts"
            :key="prompt"
            type="button"
            :disabled="chatStore.loading"
            @click="sendSuggestion(prompt)"
          >
            <span>{{ prompt }}</span>
            <el-icon><Right /></el-icon>
          </button>
        </div>
      </aside>
    </section>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue'
import {
  ChatDotRound,
  MagicStick,
  Promotion,
  Right,
} from '@element-plus/icons-vue'
import PageHeader from '../components/PageHeader.vue'
import ChatMessage from '../components/ChatMessage.vue'
import { usePatientStore } from '../stores/patient'
import { useChatStore } from '../stores/chat'

const patientStore = usePatientStore()
const chatStore = useChatStore()
const input = ref('')
const chatBox = ref<HTMLElement | null>(null)

const quickPrompts = [
  '今天的血糖波动正常吗？',
  '晚餐怎么搭配更稳血糖？',
  '运动前后要注意什么？',
]

const sidePrompts = [
  '如何降低餐后血糖？',
  '低血糖时应该怎么处理？',
  '近期饮食有哪些调整建议？',
]

async function send() {
  const content = input.value.trim()
  if (!content || !patientStore.currentPatient || chatStore.loading) return
  input.value = ''
  await chatStore.sendMessage(patientStore.currentPatient.id, content)
  await scrollToBottom()
}

async function sendSuggestion(content: string) {
  if (chatStore.loading) return
  input.value = content
  await send()
}

async function scrollToBottom() {
  await nextTick()
  chatBox.value?.scrollTo({ top: chatBox.value.scrollHeight, behavior: 'smooth' })
}

async function loadHistory() {
  if (patientStore.currentPatient) {
    await chatStore.fetchHistory(patientStore.currentPatient.id)
    await scrollToBottom()
  }
}

onMounted(loadHistory)
watch(() => patientStore.currentPatient?.id, loadHistory)
</script>

<style scoped>
.chat-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 300px;
  gap: 18px;
  height: calc(100vh - 190px);
  min-height: 620px;
}

.chat-card {
  display: flex;
  min-width: 0;
  overflow: hidden;
  flex-direction: column;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  scroll-behavior: smooth;
}

.chat-welcome {
  display: flex;
  min-height: 100%;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: 30px;
  text-align: center;
}

.welcome-icon {
  display: grid;
  width: 58px;
  height: 58px;
  place-items: center;
  color: var(--brand);
  background: var(--brand-soft);
  border: 1px solid var(--brand-border);
  border-radius: 8px;
}

.chat-welcome h2 {
  margin-top: 18px;
  color: var(--ink);
  font-size: 21px;
}

.chat-welcome p {
  max-width: 470px;
  margin-top: 8px;
  color: var(--muted);
  font-size: 12px;
  line-height: 1.7;
}

.welcome-prompts {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  width: 100%;
  max-width: 680px;
  margin-top: 24px;
}

.welcome-prompts button,
.guide-card button {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  color: var(--ink-soft);
  background: var(--surface-soft);
  border: 1px solid var(--line);
  cursor: pointer;
  transition: border-color 0.18s ease, color 0.18s ease, transform 0.18s ease;
}

.welcome-prompts button {
  min-height: 76px;
  padding: 12px;
  border-radius: 8px;
  font-size: 11px;
  line-height: 1.5;
  text-align: left;
}

.welcome-prompts button:hover,
.guide-card button:hover {
  color: var(--brand);
  border-color: var(--brand-border);
  transform: translateY(-1px);
}

.thinking-bubble {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 13px 16px;
  background: #f6f9f8;
  border: 1px solid #e5edeb;
  border-radius: 8px 8px 8px 2px;
}

.thinking-bubble span {
  width: 6px;
  height: 6px;
  background: #7ca39f;
  border-radius: 50%;
  animation: thinking 1.1s infinite ease-in-out;
}

.thinking-bubble span:nth-child(2) {
  animation-delay: 0.15s;
}

.thinking-bubble span:nth-child(3) {
  animation-delay: 0.3s;
}

@keyframes thinking {
  0%,
  70%,
  100% {
    opacity: 0.35;
    transform: translateY(0);
  }
  35% {
    opacity: 1;
    transform: translateY(-3px);
  }
}

.chat-composer {
  padding: 14px 18px 16px;
  background: #fff;
  border-top: 1px solid var(--line);
}

.prompt-strip {
  display: flex;
  gap: 7px;
  margin-bottom: 10px;
  overflow-x: auto;
}

.prompt-strip button {
  flex: 0 0 auto;
  padding: 5px 9px;
  color: var(--muted);
  background: var(--surface-soft);
  border: 1px solid var(--line);
  border-radius: 999px;
  font-size: 10px;
  cursor: pointer;
}

.composer-box {
  display: flex;
  align-items: flex-end;
  gap: 10px;
}

.composer-box :deep(.el-textarea__inner) {
  min-height: 54px !important;
  padding: 11px 12px;
}

.composer-box .el-button {
  width: 42px;
  height: 42px;
  flex: 0 0 42px;
}

.composer-note {
  margin-top: 7px;
  color: #9aaba9;
  font-size: 9px;
}

.chat-aside {
  display: grid;
  align-content: start;
  gap: 14px;
}

.context-card,
.guide-card {
  padding: 17px;
}

.context-patient {
  display: flex;
  align-items: center;
  gap: 11px;
  margin-top: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--line);
}

.context-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  flex: 0 0 42px;
  line-height: 1;
  color: #102a2e;
  background: #d9ff93;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 800;
}

.context-patient > div {
  display: flex;
  min-width: 0;
  flex-direction: column;
}

.context-patient strong {
  color: var(--ink);
  font-size: 14px;
}

.context-patient span {
  margin-top: 4px;
  color: var(--muted);
  font-size: 10px;
}

.context-list {
  display: grid;
  gap: 13px;
  margin-top: 16px;
}

.context-list div {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.context-list span {
  color: var(--muted);
  font-size: 10px;
}

.context-list strong {
  color: var(--ink-soft);
  font-size: 11px;
  text-align: right;
}

.guide-card {
  display: grid;
  gap: 8px;
}

.guide-card button {
  width: 100%;
  padding: 11px 0;
  border-width: 0 0 1px;
  border-radius: 0;
  font-size: 11px;
  text-align: left;
}

.guide-card button:last-child {
  border-bottom: 0;
}

.guide-card button .el-icon {
  color: #99aaa8;
}

@media (max-width: 1120px) {
  .chat-layout {
    grid-template-columns: 1fr;
    height: auto;
  }

  .chat-card {
    height: calc(100vh - 190px);
    min-height: 600px;
  }

  .chat-aside {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 720px) {
  .chat-card {
    height: calc(100vh - 175px);
    min-height: 520px;
  }

  .chat-messages {
    padding: 16px;
  }

  .welcome-prompts {
    grid-template-columns: 1fr;
  }

  .welcome-prompts button {
    min-height: 52px;
  }

  .chat-aside {
    grid-template-columns: 1fr;
  }
}
</style>
