<template>
  <article class="metric-card" :class="`tone-${tone}`">
    <div class="metric-top">
      <span class="metric-label">{{ label }}</span>
      <span v-if="icon" class="metric-icon">
        <el-icon :size="18"><component :is="icon" /></el-icon>
      </span>
    </div>
    <div class="metric-value">
      <strong>{{ displayValue }}</strong>
      <span v-if="unit">{{ unit }}</span>
    </div>
    <div class="metric-foot">
      <span v-if="trend" class="metric-trend">{{ trend }}</span>
      <span v-if="caption" class="metric-caption">{{ caption }}</span>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed, type Component } from 'vue'

const props = withDefaults(
  defineProps<{
    label: string
    value: string | number | null | undefined
    unit?: string
    caption?: string
    trend?: string
    icon?: Component
    tone?: 'teal' | 'lime' | 'amber' | 'coral' | 'slate'
  }>(),
  {
    unit: '',
    caption: '',
    trend: '',
    tone: 'teal',
  },
)

const displayValue = computed(() => {
  if (props.value === null || props.value === undefined || props.value === '') return '--'
  return props.value
})
</script>

<style scoped>
.metric-card {
  position: relative;
  min-width: 0;
  padding: 18px;
  overflow: hidden;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 8px;
  box-shadow: var(--shadow-sm);
}

.metric-card::before {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: var(--metric-accent);
  content: '';
}

.tone-teal {
  --metric-accent: #0f766e;
  --metric-soft: #e3f5f2;
}

.tone-lime {
  --metric-accent: #65a30d;
  --metric-soft: #f1f9df;
}

.tone-amber {
  --metric-accent: #d97706;
  --metric-soft: #fff4dd;
}

.tone-coral {
  --metric-accent: #e4574f;
  --metric-soft: #fff0ee;
}

.tone-slate {
  --metric-accent: #526d70;
  --metric-soft: #edf3f3;
}

.metric-top,
.metric-value,
.metric-foot {
  display: flex;
  align-items: center;
}

.metric-top {
  justify-content: space-between;
}

.metric-label {
  color: var(--muted);
  font-size: 12px;
  font-weight: 600;
}

.metric-icon {
  display: grid;
  width: 32px;
  height: 32px;
  place-items: center;
  color: var(--metric-accent);
  background: var(--metric-soft);
  border-radius: 7px;
}

.metric-value {
  min-height: 44px;
  margin-top: 14px;
  align-items: baseline;
  gap: 6px;
}

.metric-value strong {
  color: var(--ink);
  font-size: 28px;
  line-height: 1;
  letter-spacing: -0.03em;
}

.metric-value span {
  color: var(--muted);
  font-size: 12px;
}

.metric-foot {
  min-height: 18px;
  margin-top: 10px;
  gap: 8px;
  font-size: 11px;
}

.metric-trend {
  padding: 2px 6px;
  color: var(--metric-accent);
  background: var(--metric-soft);
  border-radius: 4px;
}

.metric-caption {
  overflow: hidden;
  color: #8b9b99;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
