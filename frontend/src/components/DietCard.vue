<template>
  <article class="diet-item">
    <div class="food-head">
      <div>
        <strong>{{ item.name || item.food_name }}</strong>
        <span>{{ item.tip || '建议结合餐后血糖情况调整份量' }}</span>
      </div>
      <span class="gi-badge" :class="giTone">GI {{ item.gi_value ?? item.gi }}</span>
    </div>
    <div class="nutrition">
      <span><strong>{{ item.calories }}</strong> kcal</span>
      <span><strong>{{ item.carbs }}</strong> g 碳水</span>
      <span v-if="item.protein != null"><strong>{{ item.protein }}</strong> g 蛋白</span>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ item: Record<string, unknown> }>()

const giTone = computed(() => {
  const gi = Number(props.item.gi_value ?? props.item.gi ?? 0)
  if (gi <= 55) return 'low'
  if (gi <= 70) return 'medium'
  return 'high'
})
</script>

<style scoped>
.diet-item {
  padding: 14px 0;
  border-bottom: 1px solid #edf2f1;
}

.diet-item:last-child {
  border-bottom: 0;
}

.food-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.food-head > div {
  display: flex;
  min-width: 0;
  flex-direction: column;
}

.food-head strong {
  color: var(--ink);
  font-size: 14px;
}

.food-head div span {
  margin-top: 5px;
  color: var(--muted);
  font-size: 11px;
  line-height: 1.5;
}

.gi-badge {
  flex: 0 0 auto;
  padding: 4px 7px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 700;
}

.gi-badge.low {
  color: #4d7c0f;
  background: #f1f9df;
}

.gi-badge.medium {
  color: #b45309;
  background: #fff5df;
}

.gi-badge.high {
  color: #c63e37;
  background: #fff0ee;
}

.nutrition {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 12px;
  color: var(--muted);
  font-size: 11px;
}

.nutrition strong {
  color: var(--ink-soft);
  font-size: 13px;
}
</style>
