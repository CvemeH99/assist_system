<template>
  <div class="page-header">
    <div class="page-heading">
      <div v-if="icon" class="page-icon">
        <el-icon :size="24"><component :is="icon" /></el-icon>
      </div>
      <div>
        <h1>{{ title }}</h1>
        <p v-if="subtitle">{{ subtitle }}</p>
      </div>
    </div>
    <div v-if="$slots.actions" class="page-actions">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Component } from 'vue'

defineProps<{
  title: string
  subtitle?: string
  icon?: Component
}>()
</script>

<style scoped>
.page-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 22px;
}

.page-heading {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 14px;
}

.page-icon {
  display: grid;
  width: 48px;
  height: 48px;
  flex: 0 0 48px;
  place-items: center;
  color: var(--brand);
  background: var(--brand-soft);
  border: 1px solid var(--brand-border);
  border-radius: 8px;
}

h1 {
  color: var(--ink);
  font-size: 25px;
  line-height: 1.2;
  letter-spacing: -0.02em;
}

p {
  margin-top: 5px;
  color: var(--muted);
  font-size: 13px;
}

.page-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
}

@media (max-width: 720px) {
  .page-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .page-actions {
    width: 100%;
    justify-content: flex-start;
  }

  h1 {
    font-size: 22px;
  }
}
</style>
