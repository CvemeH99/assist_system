<template>
  <Transition name="scrim">
    <button
      v-if="open"
      class="sidebar-scrim"
      type="button"
      aria-label="关闭导航"
      @click="$emit('close')"
    />
  </Transition>

  <aside class="sidebar" :class="{ 'is-open': open }">
    <div class="brand">
      <div class="brand-mark">
        <el-icon :size="24"><TrendCharts /></el-icon>
      </div>
      <div class="brand-copy">
        <strong>糖衡</strong>
        <span>糖尿病健康管理</span>
      </div>
      <button class="sidebar-close" type="button" aria-label="关闭导航" @click="$emit('close')">
        <el-icon><Close /></el-icon>
      </button>
    </div>

    <div class="menu-label">管理菜单</div>
    <el-menu
      :default-active="route.path"
      router
      class="side-menu"
      @select="$emit('close')"
    >
      <el-menu-item v-for="item in menuItems" :key="item.path" :index="item.path">
        <el-icon><component :is="item.icon" /></el-icon>
        <span>{{ item.label }}</span>
      </el-menu-item>
    </el-menu>

    <div class="sidebar-foot">
      <div class="system-status">
        <span class="status-dot" />
        <div>
          <strong>健康服务运行中</strong>
          <span>数据实时同步</span>
        </div>
      </div>
      <div class="version">Care OS · v1.0</div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import {
  Bicycle,
  ChatDotRound,
  Close,
  Document,
  FirstAidKit,
  Food,
  Odometer,
  TrendCharts,
  User,
} from '@element-plus/icons-vue'

defineProps<{ open: boolean }>()
defineEmits<{ close: [] }>()

const route = useRoute()
const menuItems = [
  { path: '/', label: '健康总览', icon: Odometer },
  { path: '/patients', label: '患者档案', icon: User },
  { path: '/blood-sugar', label: '血糖管理', icon: TrendCharts },
  { path: '/diet', label: '饮食管理', icon: Food },
  { path: '/medication', label: '用药管理', icon: FirstAidKit },
  { path: '/exercise', label: '运动管理', icon: Bicycle },
  { path: '/reports', label: '健康报告', icon: Document },
  { path: '/chat', label: 'AI 健康助手', icon: ChatDotRound },
]
</script>

<style scoped>
.sidebar {
  position: fixed;
  inset: 0 auto 0 0;
  z-index: 40;
  display: flex;
  width: 240px;
  flex-direction: column;
  overflow: hidden;
  color: #dbe9e7;
  background: #102a2e;
  border-right: 1px solid rgba(255, 255, 255, 0.07);
  box-shadow: 16px 0 40px rgba(16, 42, 46, 0.08);
}

.sidebar::after {
  position: absolute;
  right: -80px;
  bottom: 80px;
  width: 180px;
  height: 180px;
  border: 1px solid rgba(45, 212, 191, 0.12);
  border-radius: 50%;
  content: '';
  pointer-events: none;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  height: 76px;
  padding: 0 18px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.brand-mark {
  display: grid;
  width: 42px;
  height: 42px;
  flex: 0 0 42px;
  place-items: center;
  color: #d9ff93;
  background: rgba(45, 212, 191, 0.14);
  border: 1px solid rgba(94, 234, 212, 0.26);
  border-radius: 8px;
}

.brand-copy {
  display: flex;
  min-width: 0;
  flex-direction: column;
}

.brand-copy strong {
  color: #fff;
  font-size: 18px;
  letter-spacing: 0.06em;
}

.brand-copy span {
  margin-top: 2px;
  color: #8facaa;
  font-size: 11px;
}

.sidebar-close {
  display: none;
  margin-left: auto;
  padding: 6px;
  color: #a7bfbc;
  background: none;
  border: 0;
  cursor: pointer;
}

.menu-label {
  padding: 22px 22px 8px;
  color: #688986;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.12em;
}

.side-menu {
  flex: 1;
  border-right: 0;
  background: transparent;
}

.side-menu :deep(.el-menu-item) {
  height: 48px;
  margin: 4px 12px;
  padding: 0 14px !important;
  color: #a8bfbd;
  border-radius: 7px;
  font-size: 14px;
}

.side-menu :deep(.el-menu-item:hover) {
  color: #fff;
  background: rgba(255, 255, 255, 0.06);
}

.side-menu :deep(.el-menu-item.is-active) {
  color: #d9ff93;
  background: rgba(20, 184, 166, 0.18);
}

.side-menu :deep(.el-menu-item.is-active::before) {
  position: absolute;
  left: 0;
  width: 3px;
  height: 22px;
  background: #5eead4;
  border-radius: 0 4px 4px 0;
  content: '';
}

.sidebar-foot {
  position: relative;
  z-index: 1;
  padding: 16px;
}

.system-status {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.045);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 8px;
}

.system-status div {
  display: flex;
  flex-direction: column;
}

.system-status strong {
  color: #dce9e7;
  font-size: 12px;
}

.system-status span:not(.status-dot) {
  margin-top: 2px;
  color: #6f908d;
  font-size: 10px;
}

.status-dot {
  width: 8px;
  height: 8px;
  flex: 0 0 8px;
  background: #a3e635;
  border-radius: 50%;
  box-shadow: 0 0 0 4px rgba(163, 230, 53, 0.1);
}

.version {
  margin-top: 12px;
  color: #526f6d;
  font-size: 10px;
  text-align: center;
}

.sidebar-scrim {
  display: none;
}

@media (max-width: 960px) {
  .sidebar {
    width: min(280px, 86vw);
    transform: translateX(-105%);
    transition: transform 0.24s ease;
  }

  .sidebar.is-open {
    transform: translateX(0);
  }

  .sidebar-close {
    display: inline-flex;
  }

  .sidebar-scrim {
    position: fixed;
    z-index: 35;
    display: block;
    inset: 0;
    width: 100%;
    height: 100%;
    padding: 0;
    background: rgba(9, 29, 31, 0.48);
    border: 0;
    backdrop-filter: blur(3px);
  }
}
</style>
