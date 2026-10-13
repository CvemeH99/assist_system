<template>
  <article class="medication-row">
    <div class="medication-mark">
      <el-icon :size="18"><FirstAidKit /></el-icon>
    </div>
    <div class="medication-main">
      <div class="medication-title">
        <strong>{{ med.drug_name }}</strong>
        <span :class="['medication-state', { inactive: !med.is_active }]">
          {{ med.is_active ? '用药中' : '已停用' }}
        </span>
      </div>
      <div class="medication-meta">
        <span>{{ med.dosage }}</span>
        <i />
        <span>{{ med.frequency || '按医嘱' }}</span>
        <i />
        <span>{{ med.timing || '未设置' }}</span>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { FirstAidKit } from '@element-plus/icons-vue'
import type { Medication } from '../types'

defineProps<{ med: Medication }>()
</script>

<style scoped>
.medication-row {
  display: flex;
  gap: 12px;
  padding: 13px 0;
  border-bottom: 1px solid #edf2f1;
}

.medication-row:last-child {
  border-bottom: 0;
}

.medication-mark {
  display: grid;
  width: 36px;
  height: 36px;
  flex: 0 0 36px;
  place-items: center;
  color: var(--brand);
  background: var(--brand-soft);
  border-radius: 8px;
}

.medication-main {
  min-width: 0;
  flex: 1;
}

.medication-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.medication-title strong {
  overflow: hidden;
  color: var(--ink);
  font-size: 14px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.medication-state {
  flex: 0 0 auto;
  padding: 3px 7px;
  color: #4d7c0f;
  background: #f1f9df;
  border-radius: 4px;
  font-size: 10px;
}

.medication-state.inactive {
  color: #7b8a89;
  background: #eef2f1;
}

.medication-meta {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-top: 7px;
  color: var(--muted);
  font-size: 11px;
}

.medication-meta i {
  width: 3px;
  height: 3px;
  background: #b6c5c3;
  border-radius: 50%;
}
</style>
