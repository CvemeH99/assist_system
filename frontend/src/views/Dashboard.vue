<template>
  <div class="dashboard-page">
    <PageHeader
      title="健康总览"
      subtitle="聚合血糖、饮食、用药与运动数据，快速掌握当前管理状态"
      :icon="Odometer"
    >
      <template #actions>
        <el-button :icon="Refresh" :loading="loading" @click="loadAll">刷新数据</el-button>
        <el-button type="primary" :icon="Plus" @click="router.push('/blood-sugar')">
          记录血糖
        </el-button>
      </template>
    </PageHeader>

    <template v-if="patientStore.currentPatient">
      <section class="patient-banner">
        <div class="patient-identity">
          <div class="patient-avatar">{{ patientStore.currentPatient.name.slice(0, 1) }}</div>
          <div>
            <div class="patient-name-line">
              <h2>{{ patientStore.currentPatient.name }}</h2>
              <span :class="['status-pill', riskClass]">
                {{ bloodStore.stats?.risk_level || '等待数据' }}
              </span>
            </div>
            <p>
              {{ patientStore.currentPatient.gender }} ·
              {{ patientStore.currentPatient.age }} 岁 ·
              {{ patientStore.currentPatient.diabetes_type }}
            </p>
          </div>
        </div>
        <div class="patient-profile">
          <div>
            <span>BMI</span>
            <strong>{{ patientStore.currentPatient.bmi?.toFixed(1) || '--' }}</strong>
            <small>{{ patientStore.currentPatient.bmi_status || '未录入' }}</small>
          </div>
          <div>
            <span>确诊日期</span>
            <strong class="date-value">{{ patientStore.currentPatient.diagnosis_date || '--' }}</strong>
            <small>病程档案</small>
          </div>
          <div>
            <span>今日记录</span>
            <strong>{{ todayRecordCount }}</strong>
            <small>条健康数据</small>
          </div>
        </div>
      </section>

      <section class="metric-grid section-spacer">
        <MetricCard
          label="平均血糖"
          :value="formatNumber(bloodStore.stats?.avg)"
          unit="mmol/L"
          :trend="bloodStore.stats?.trend"
          caption="近 7 天"
          :icon="TrendCharts"
        />
        <MetricCard
          label="血糖达标率"
          :value="formatNumber(bloodStore.stats?.time_in_range)"
          unit="%"
          :trend="tirLabel"
          caption="目标范围 3.9–10.0"
          :icon="Aim"
          :tone="tirTone"
        />
        <MetricCard
          label="今日摄入"
          :value="formatNumber(dietStore.dailyNutrition?.total_calories)"
          unit="kcal"
          :caption="`碳水 ${formatNumber(dietStore.dailyNutrition?.total_carbs)} g`"
          :icon="Food"
          tone="amber"
        />
        <MetricCard
          label="本周运动"
          :value="weeklyExerciseMinutes"
          unit="分钟"
          :trend="exerciseTrend"
          :caption="`消耗 ${weeklyCalories} kcal`"
          :icon="Bicycle"
          tone="lime"
        />
      </section>

      <section class="two-column section-spacer">
        <div class="surface-card chart-panel">
          <div class="card-head">
            <div class="card-heading">
              <h3>血糖趋势</h3>
              <p>虚线表示低血糖、目标上限和高血糖参考线</p>
            </div>
            <el-button link type="primary" @click="router.push('/blood-sugar')">查看详情</el-button>
          </div>
          <BloodSugarChart
            v-if="bloodStore.records.length"
            :records="bloodStore.records"
            compact
          />
          <div v-else class="empty-state">
            <el-empty description="暂无血糖数据" :image-size="72" />
          </div>
        </div>

        <div class="surface-card score-panel">
          <div class="card-head">
            <div class="card-heading">
              <h3>综合健康评分</h3>
              <p>结合近期达标率与风险状态计算</p>
            </div>
          </div>
          <HealthScore :score="healthScore" />
          <div class="score-summary">
            <span>当前评估</span>
            <strong>{{ scoreTip }}</strong>
          </div>
          <el-button class="score-action" plain @click="router.push('/reports')">
            查看健康报告
          </el-button>
        </div>
      </section>

      <section class="three-column section-spacer">
        <div class="surface-card info-panel">
          <div class="card-head">
            <div class="card-heading">
              <h3>当前用药</h3>
              <p>{{ medications.length }} 项活跃方案</p>
            </div>
            <el-button link type="primary" @click="router.push('/medication')">管理</el-button>
          </div>
          <div class="info-list">
            <MedicationReminder
              v-for="medication in medications.slice(0, 3)"
              :key="medication.id"
              :med="medication"
            />
            <el-empty
              v-if="!medications.length"
              description="暂无用药记录"
              :image-size="58"
            />
          </div>
        </div>

        <div class="surface-card info-panel">
          <div class="card-head">
            <div class="card-heading">
              <h3>今日营养</h3>
              <p>{{ dietStore.dailyNutrition?.meal_count || 0 }} 餐已记录</p>
            </div>
            <el-button link type="primary" @click="router.push('/diet')">管理</el-button>
          </div>
          <div class="nutrition-ring">
            <div class="ring-value">
              <template v-if="Number(dietStore.dailyNutrition?.meal_count || 0) > 0">
                <strong>{{ formatNumber(dietStore.dailyNutrition?.total_calories) }}</strong>
                <span>kcal</span>
              </template>
            </div>
            <div class="nutrition-bars">
              <div>
                <span>碳水</span>
                <div><i :style="{ width: nutritionBar('carbs', 250) }" /></div>
                <strong>{{ formatNumber(dietStore.dailyNutrition?.total_carbs) }}g</strong>
              </div>
              <div>
                <span>蛋白</span>
                <div><i :style="{ width: nutritionBar('protein', 100) }" /></div>
                <strong>{{ formatNumber(dietStore.dailyNutrition?.total_protein) }}g</strong>
              </div>
              <div>
                <span>脂肪</span>
                <div><i :style="{ width: nutritionBar('fat', 70) }" /></div>
                <strong>{{ formatNumber(dietStore.dailyNutrition?.total_fat) }}g</strong>
              </div>
            </div>
          </div>
        </div>

        <div class="surface-card info-panel">
          <div class="card-head">
            <div class="card-heading">
              <h3>近期血糖</h3>
              <p>最近 4 次测量</p>
            </div>
            <el-button link type="primary" @click="router.push('/blood-sugar')">记录</el-button>
          </div>
          <div class="glucose-list">
            <div v-for="record in bloodStore.records.slice(0, 4)" :key="record.id" class="glucose-row">
              <span class="glucose-dot" :style="{ background: glucoseColor(record.value) }" />
              <div>
                <strong>{{ record.value }} <small>mmol/L</small></strong>
                <span>{{ record.measure_type }} · {{ formatShortDateTime(record.measured_at) }}</span>
              </div>
              <em :style="{ color: glucoseColor(record.value) }">
                {{ record.status || glucoseLabel(record.value) }}
              </em>
            </div>
            <el-empty
              v-if="!bloodStore.records.length"
              description="暂无测量记录"
              :image-size="58"
            />
          </div>
        </div>
      </section>
    </template>

    <div v-else class="surface-card empty-patient">
      <el-empty description="请先添加患者档案">
        <el-button type="primary" @click="router.push('/patients')">前往患者档案</el-button>
      </el-empty>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Aim, Bicycle, Food, Odometer, Plus, Refresh, TrendCharts } from '@element-plus/icons-vue'
import PageHeader from '../components/PageHeader.vue'
import MetricCard from '../components/MetricCard.vue'
import BloodSugarChart from '../components/BloodSugarChart.vue'
import HealthScore from '../components/HealthScore.vue'
import MedicationReminder from '../components/MedicationReminder.vue'
import { formatShortDateTime } from '../utils/date'
import { usePatientStore } from '../stores/patient'
import { useBloodSugarStore } from '../stores/bloodSugar'
import { useDietStore } from '../stores/diet'
import { medicationApi } from '../api/medication'
import { exerciseApi } from '../api/exercise'
import type { Exercise, Medication } from '../types'

const router = useRouter()
const patientStore = usePatientStore()
const bloodStore = useBloodSugarStore()
const dietStore = useDietStore()
const medications = ref<Medication[]>([])
const exercises = ref<Exercise[]>([])
const loading = ref(false)

const healthScore = computed(() => {
  const tir = bloodStore.stats?.time_in_range
  if (tir === undefined || tir === null) return 0
  if (bloodStore.stats?.risk_level?.includes('高')) return Math.min(52, Math.round(tir * 0.72))
  if (tir >= 90) return 92
  if (tir >= 70) return Math.round(68 + (tir - 70) * 0.85)
  if (tir >= 50) return Math.round(52 + (tir - 50) * 0.8)
  return Math.max(20, Math.round(tir * 0.9))
})

const scoreTip = computed(() => {
  if (healthScore.value >= 85) return '状态稳定，继续保持当前管理节奏'
  if (healthScore.value >= 65) return '整体可控，建议关注波动时段'
  if (healthScore.value > 0) return '需要加强干预，建议尽快复核方案'
  return '暂无足够数据生成评估'
})

const tirTone = computed<'teal' | 'amber' | 'coral'>(() => {
  const tir = bloodStore.stats?.time_in_range ?? 0
  if (tir >= 70) return 'teal'
  if (tir >= 50) return 'amber'
  return 'coral'
})

const tirLabel = computed(() => {
  const tir = bloodStore.stats?.time_in_range
  if (tir === undefined || tir === null) return ''
  return tir >= 70 ? '达标' : tir >= 50 ? '待改善' : '偏低'
})

const riskClass = computed(() => {
  const risk = bloodStore.stats?.risk_level
  if (risk?.includes('高')) return 'danger'
  if (risk?.includes('中')) return 'warning'
  return ''
})

const recentExercises = computed(() => {
  const since = Date.now() - 7 * 24 * 60 * 60 * 1000
  return exercises.value.filter((item) => new Date(item.performed_at).getTime() >= since)
})

const weeklyExerciseMinutes = computed(() =>
  recentExercises.value.reduce((sum, item) => sum + item.duration_min, 0),
)

const weeklyCalories = computed(() =>
  Math.round(recentExercises.value.reduce((sum, item) => sum + (item.calories_burned || 0), 0)),
)

const exerciseTrend = computed(() =>
  weeklyExerciseMinutes.value >= 150 ? '已达标' : weeklyExerciseMinutes.value > 0 ? '继续积累' : '',
)

const todayRecordCount = computed(() => {
  const today = new Date().toDateString()
  const glucoseCount = bloodStore.records.filter(
    (item) => new Date(item.measured_at).toDateString() === today,
  ).length
  return glucoseCount + Number(dietStore.dailyNutrition?.meal_count || 0)
})

function formatNumber(value: unknown, digits = 1) {
  const number = Number(value)
  if (!Number.isFinite(number)) return '--'
  return Number.isInteger(number) ? String(number) : number.toFixed(digits)
}

function nutritionBar(key: string, target: number) {
  const values: Record<string, number | undefined> = {
    carbs: dietStore.dailyNutrition?.total_carbs,
    protein: dietStore.dailyNutrition?.total_protein,
    fat: dietStore.dailyNutrition?.total_fat,
  }
  const value = Number(values[key] || 0)
  return `${Math.min(100, Math.max(4, (value / target) * 100))}%`
}

function glucoseColor(value: number) {
  if (value < 3.9) return '#d97706'
  if (value <= 7) return '#65a30d'
  if (value <= 10) return '#d97706'
  return '#e4574f'
}

function glucoseLabel(value: number) {
  if (value < 3.9) return '偏低'
  if (value <= 7) return '达标'
  if (value <= 10) return '偏高'
  return '过高'
}

async function loadAll() {
  const patient = patientStore.currentPatient
  if (!patient) return

  loading.value = true
  const patientId = patient.id
  try {
    const [medicationResult, exerciseResult] = await Promise.all([
      bloodStore.fetchRecords(patientId),
      bloodStore.fetchStats(patientId),
      dietStore.fetchDaily(patientId),
      medicationApi.list(patientId),
      exerciseApi.list(patientId),
    ]).then((results) => [results[3], results[4]] as const)
    medications.value = medicationResult.data
    exercises.value = exerciseResult.data
  } finally {
    loading.value = false
  }
}

onMounted(loadAll)
watch(() => patientStore.currentPatient?.id, loadAll)
</script>

<style scoped>
.patient-banner {
  position: relative;
  display: flex;
  min-height: 116px;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 22px 24px;
  overflow: hidden;
  color: #fff;
  background: #102a2e;
  border-radius: 8px;
  box-shadow: 0 14px 34px rgba(16, 42, 46, 0.14);
}

.patient-banner::before {
  position: absolute;
  top: 0;
  right: 0;
  width: 34%;
  height: 100%;
  background:
    linear-gradient(135deg, transparent 35%, rgba(163, 230, 53, 0.16) 35%, rgba(163, 230, 53, 0.16) 55%, transparent 55%),
    rgba(20, 184, 166, 0.08);
  content: '';
}

.patient-identity,
.patient-profile {
  position: relative;
  z-index: 1;
  display: flex;
}

.patient-identity {
  align-items: center;
  gap: 16px;
}

.patient-avatar {
  display: grid;
  width: 58px;
  height: 58px;
  flex: 0 0 58px;
  place-items: center;
  color: #102a2e;
  background: #d9ff93;
  border-radius: 8px;
  font-size: 22px;
  font-weight: 800;
}

.patient-name-line {
  display: flex;
  align-items: center;
  gap: 10px;
}

.patient-name-line h2 {
  color: #fff;
  font-size: 21px;
}

.patient-name-line .status-pill {
  color: #dbe9e7;
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.12);
}

.patient-identity p {
  margin-top: 7px;
  color: #91aaa8;
  font-size: 12px;
}

.patient-profile {
  min-width: 420px;
  justify-content: space-between;
  gap: 34px;
}

.patient-profile div {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.patient-profile span,
.patient-profile small {
  color: #7f9b99;
  font-size: 10px;
}

.patient-profile strong {
  margin: 4px 0;
  color: #fff;
  font-size: 20px;
}

.patient-profile strong.date-value {
  font-size: 14px;
}

.chart-panel,
.score-panel,
.info-panel {
  padding: 18px;
}

.chart-panel {
  min-width: 0;
}

.score-panel {
  display: flex;
  flex-direction: column;
}

.score-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 4px;
  padding: 11px 12px;
  background: var(--surface-soft);
  border-radius: 7px;
}

.score-summary span {
  color: var(--muted);
  font-size: 11px;
}

.score-summary strong {
  color: var(--ink-soft);
  font-size: 12px;
  text-align: right;
}

.score-action {
  width: 100%;
  margin-top: 12px;
}

.info-list {
  margin-top: 8px;
}

.nutrition-ring {
  display: grid;
  grid-template-columns: 112px minmax(0, 1fr);
  align-items: center;
  gap: 16px;
  margin-top: 20px;
}

.ring-value {
  display: grid;
  width: 108px;
  height: 108px;
  place-content: center;
  text-align: center;
  background: conic-gradient(#0f766e 0 72%, #e6efed 72% 100%);
  border-radius: 50%;
  box-shadow: inset 0 0 0 13px #fff;
}

.ring-value strong {
  color: var(--ink);
  font-size: 22px;
}

.ring-value span {
  color: var(--muted);
  font-size: 10px;
}

.nutrition-bars {
  display: grid;
  gap: 12px;
}

.nutrition-bars > div {
  display: grid;
  grid-template-columns: 34px minmax(40px, 1fr) 48px;
  align-items: center;
  gap: 7px;
  color: var(--muted);
  font-size: 10px;
}

.nutrition-bars > div > div {
  height: 5px;
  overflow: hidden;
  background: #e8efed;
  border-radius: 999px;
}

.nutrition-bars i {
  display: block;
  height: 100%;
  background: #0f766e;
  border-radius: inherit;
}

.nutrition-bars strong {
  color: var(--ink-soft);
  font-size: 11px;
  text-align: right;
}

.glucose-list {
  margin-top: 8px;
}

.glucose-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 0;
  border-bottom: 1px solid #edf2f1;
}

.glucose-row:last-child {
  border-bottom: 0;
}

.glucose-dot {
  width: 8px;
  height: 8px;
  flex: 0 0 8px;
  border-radius: 50%;
}

.glucose-row > div {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
}

.glucose-row strong {
  color: var(--ink);
  font-size: 14px;
}

.glucose-row strong small {
  color: var(--muted);
  font-size: 10px;
  font-weight: 400;
}

.glucose-row div span {
  margin-top: 3px;
  color: var(--muted);
  font-size: 10px;
}

.glucose-row em {
  font-size: 11px;
  font-style: normal;
  font-weight: 600;
}

.empty-patient {
  display: grid;
  min-height: 420px;
  place-items: center;
}

@media (max-width: 1080px) {
  .patient-banner {
    align-items: flex-start;
    flex-direction: column;
  }

  .patient-profile {
    width: 100%;
    min-width: 0;
  }

  .patient-profile div {
    align-items: flex-start;
  }
}

@media (max-width: 640px) {
  .patient-profile {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 14px;
  }

  .patient-profile strong {
    font-size: 16px;
  }

  .patient-name-line {
    align-items: flex-start;
    flex-direction: column;
    gap: 6px;
  }

  .nutrition-ring {
    grid-template-columns: 96px minmax(0, 1fr);
  }

  .ring-value {
    width: 92px;
    height: 92px;
  }
}
</style>
