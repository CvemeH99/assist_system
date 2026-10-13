<template>
  <div class="score-chart">
    <v-chart :option="chartOption" autoresize />
    <div class="score-label">
      <strong>{{ score }}</strong>
      <span>综合健康分</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { GaugeChart } from 'echarts/charts'
import { CanvasRenderer } from 'echarts/renderers'
import { getHealthScoreOption } from '../utils/charts'

use([GaugeChart, CanvasRenderer])

const props = defineProps<{ score: number }>()
const chartOption = computed(() => getHealthScoreOption(props.score))
</script>

<style scoped>
.score-chart {
  position: relative;
  height: 208px;
}

.score-chart :deep(canvas) {
  width: 100% !important;
  height: 100% !important;
}

.score-label {
  position: absolute;
  top: 96px;
  left: 50%;
  display: flex;
  align-items: center;
  flex-direction: column;
  pointer-events: none;
  transform: translateX(-50%);
}

.score-label strong {
  color: var(--ink);
  font-size: 34px;
  line-height: 1;
}

.score-label span {
  margin-top: 8px;
  color: var(--muted);
  font-size: 11px;
}
</style>
