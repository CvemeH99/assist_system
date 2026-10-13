<template>
  <div class="exercise-page">
    <PageHeader
      title="运动管理"
      subtitle="记录运动时长、强度与运动前后血糖变化"
      :icon="Bicycle"
    >
      <template #actions>
        <el-button :icon="Refresh" :loading="loading" @click="load">刷新</el-button>
        <el-button type="primary" :icon="Plus" @click="focusForm">记录运动</el-button>
      </template>
    </PageHeader>

    <section class="metric-grid">
      <MetricCard
        label="运动次数"
        :value="records.length"
        unit="次"
        caption="最近记录"
        :icon="Calendar"
      />
      <MetricCard
        label="累计时长"
        :value="totalMinutes"
        unit="分钟"
        :trend="totalMinutes >= 150 ? '本周达标' : ''"
        caption="所有已记录运动"
        :icon="Timer"
        tone="lime"
      />
      <MetricCard
        label="累计消耗"
        :value="totalCalories"
        unit="kcal"
        caption="根据记录自动汇总"
        :icon="Lightning"
        tone="amber"
      />
      <MetricCard
        label="平均血糖变化"
        :value="averageChange"
        unit="mmol/L"
        :caption="changeCaption"
        :icon="TrendCharts"
        :tone="changeTone"
      />
    </section>

    <section class="two-column section-spacer">
      <div class="surface-card records-panel">
        <div class="card-head">
          <div class="card-heading">
            <h3>运动记录</h3>
            <p>包含运动强度、热量消耗与血糖响应</p>
          </div>
          <span class="record-count">{{ records.length }} 条</span>
        </div>
        <div class="table-wrap">
          <el-table :data="records" v-loading="loading">
            <el-table-column label="运动项目" min-width="150">
              <template #default="{ row }">
                <div class="exercise-cell">
                  <span class="exercise-mark">
                    <el-icon><Bicycle /></el-icon>
                  </span>
                  <div>
                    <strong>{{ row.exercise_type }}</strong>
                    <span>{{ formatShortDateTime(row.performed_at) }}</span>
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="时长" min-width="90">
              <template #default="{ row }"><strong>{{ row.duration_min }}</strong> 分钟</template>
            </el-table-column>
            <el-table-column label="强度" min-width="90">
              <template #default="{ row }">
                <el-tag :type="intensityTag(row.intensity)" effect="light" round>
                  {{ row.intensity }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="消耗" min-width="100">
              <template #default="{ row }">
                {{ row.calories_burned ? `${row.calories_burned} kcal` : '--' }}
              </template>
            </el-table-column>
            <el-table-column label="血糖变化" min-width="150">
              <template #default="{ row }">
                <div v-if="row.blood_sugar_before != null && row.blood_sugar_after != null" class="bs-change">
                  <span>{{ row.blood_sugar_before }}</span>
                  <el-icon><Right /></el-icon>
                  <strong>{{ row.blood_sugar_after }}</strong>
                  <small>{{ formatChange(row.blood_sugar_after - row.blood_sugar_before) }}</small>
                </div>
                <span v-else class="muted">未记录</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="126" fixed="right" align="right">
              <template #default="{ row }">
                <el-button type="primary" link @click="openEdit(row)">编辑</el-button>
                <el-button type="danger" link @click="confirmDelete(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-empty v-if="!records.length && !loading" description="暂无运动记录" :image-size="70" />
        </div>
      </div>

      <div ref="formPanel" class="surface-card form-panel">
        <div class="form-title">
          <div>
            <span>{{ editForm ? '编辑记录' : '新建记录' }}</span>
            <h3>{{ editForm ? '更新运动数据' : '记录本次运动' }}</h3>
          </div>
          <div class="form-icon"><el-icon :size="20"><Timer /></el-icon></div>
        </div>
        <el-form :model="form" label-position="top">
          <el-form-item label="运动类型">
            <el-select v-model="form.exercise_type">
              <el-option label="快走" value="快走" />
              <el-option label="慢跑" value="慢跑" />
              <el-option label="游泳" value="游泳" />
              <el-option label="骑自行车" value="骑自行车" />
              <el-option label="瑜伽" value="瑜伽" />
              <el-option label="太极" value="太极" />
            </el-select>
          </el-form-item>
          <div class="form-grid">
            <el-form-item label="时长 (分钟)">
              <el-input-number v-model="form.duration_min" :min="5" :max="240" controls-position="right" />
            </el-form-item>
            <el-form-item label="运动强度">
              <el-select v-model="form.intensity">
                <el-option label="低" value="低" />
                <el-option label="中等" value="中等" />
                <el-option label="高" value="高" />
              </el-select>
            </el-form-item>
          </div>
          <el-form-item label="运动时间">
            <el-date-picker v-model="form.performed_at" type="datetime" placeholder="选择运动时间" />
          </el-form-item>
          <el-form-item label="消耗热量 (kcal)">
            <el-input-number v-model="form.calories_burned" :min="0" :step="10" controls-position="right" />
          </el-form-item>
          <div class="bs-inputs">
            <el-form-item label="运动前血糖">
              <el-input-number
                v-model="form.blood_sugar_before"
                :min="1"
                :max="33"
                :step="0.1"
                controls-position="right"
              />
            </el-form-item>
            <el-form-item label="运动后血糖">
              <el-input-number
                v-model="form.blood_sugar_after"
                :min="1"
                :max="33"
                :step="0.1"
                controls-position="right"
              />
            </el-form-item>
          </div>
          <el-form-item label="备注">
            <el-input v-model="form.note" type="textarea" :rows="2" placeholder="记录体感或特殊情况" />
          </el-form-item>
          <div class="form-actions">
            <el-button type="primary" :loading="submitting" @click="submit">
              {{ editForm ? '保存修改' : '保存记录' }}
            </el-button>
            <el-button v-if="editForm" @click="resetForm">取消编辑</el-button>
          </div>
        </el-form>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import {
  Bicycle,
  Calendar,
  Lightning,
  Plus,
  Refresh,
  Right,
  Timer,
  TrendCharts,
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import PageHeader from '../components/PageHeader.vue'
import MetricCard from '../components/MetricCard.vue'
import { usePatientStore } from '../stores/patient'
import { exerciseApi } from '../api/exercise'
import { formatShortDateTime } from '../utils/date'
import type { Exercise } from '../types'

const patientStore = usePatientStore()
const records = ref<Exercise[]>([])
const submitting = ref(false)
const loading = ref(false)
const editForm = ref<Exercise | null>(null)
const formPanel = ref<HTMLElement>()

const defaultForm = () => ({
  exercise_type: '快走',
  duration_min: 30,
  intensity: '中等',
  calories_burned: undefined as number | undefined,
  performed_at: new Date() as Date,
  blood_sugar_before: undefined as number | undefined,
  blood_sugar_after: undefined as number | undefined,
  note: '',
})

const form = reactive(defaultForm())

const totalMinutes = computed(() => records.value.reduce((sum, item) => sum + item.duration_min, 0))
const totalCalories = computed(() =>
  Math.round(records.value.reduce((sum, item) => sum + (item.calories_burned || 0), 0)),
)

const changeRecords = computed(() =>
  records.value.filter(
    (item) => item.blood_sugar_before != null && item.blood_sugar_after != null,
  ),
)

const averageChange = computed(() => {
  if (!changeRecords.value.length) return '--'
  const total = changeRecords.value.reduce(
    (sum, item) => sum + Number(item.blood_sugar_after) - Number(item.blood_sugar_before),
    0,
  )
  return (total / changeRecords.value.length).toFixed(1)
})

const changeCaption = computed(() =>
  changeRecords.value.length ? `${changeRecords.value.length} 次有效对比` : '暂无前后血糖对比',
)

const changeTone = computed<'teal' | 'lime' | 'amber' | 'coral'>(() => {
  const change = Number(averageChange.value)
  if (!Number.isFinite(change)) return 'teal'
  if (change <= 0) return 'lime'
  if (change <= 1) return 'amber'
  return 'coral'
})

function intensityTag(intensity: string): 'success' | 'warning' | 'danger' {
  if (intensity === '高') return 'danger'
  if (intensity === '中等') return 'warning'
  return 'success'
}

function formatChange(change: number) {
  if (Math.abs(change) < 0.05) return '持平'
  return `${change > 0 ? '+' : ''}${change.toFixed(1)}`
}

async function load() {
  if (!patientStore.currentPatient) return
  loading.value = true
  try {
    const { data } = await exerciseApi.list(patientStore.currentPatient.id)
    records.value = data
  } finally {
    loading.value = false
  }
}

function focusForm() {
  resetForm()
  formPanel.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function openEdit(row: Exercise) {
  editForm.value = row
  Object.assign(form, {
    exercise_type: row.exercise_type,
    duration_min: row.duration_min,
    intensity: row.intensity,
    calories_burned: row.calories_burned ?? undefined,
    performed_at: new Date(row.performed_at),
    blood_sugar_before: row.blood_sugar_before ?? undefined,
    blood_sugar_after: row.blood_sugar_after ?? undefined,
    note: row.note || '',
  })
  formPanel.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function resetForm() {
  editForm.value = null
  Object.assign(form, defaultForm())
}

async function confirmDelete(row: Exercise) {
  try {
    await ElMessageBox.confirm(`确定删除「${row.exercise_type}」记录吗？`, '删除确认', {
      type: 'warning',
      confirmButtonText: '删除',
      cancelButtonText: '取消',
    })
    await exerciseApi.delete(row.id)
    ElMessage.success('运动记录已删除')
    await load()
  } catch (error) {
    if (error !== 'cancel' && error !== 'close') ElMessage.error('删除失败')
  }
}

async function submit() {
  if (!patientStore.currentPatient) return
  if (!form.duration_min || form.duration_min < 5) {
    ElMessage.warning('请填写有效的运动时长')
    return
  }

  submitting.value = true
  try {
    const performedAt =
      form.performed_at instanceof Date ? form.performed_at : new Date(form.performed_at as unknown as string)
    const payload = {
      exercise_type: form.exercise_type,
      duration_min: form.duration_min,
      intensity: form.intensity,
      calories_burned: form.calories_burned,
      performed_at: performedAt.toISOString(),
      blood_sugar_before: form.blood_sugar_before,
      blood_sugar_after: form.blood_sugar_after,
      note: form.note || undefined,
    }
    if (editForm.value) {
      await exerciseApi.update(editForm.value.id, payload)
      ElMessage.success('运动记录已更新')
      resetForm()
    } else {
      await exerciseApi.create({ patient_id: patientStore.currentPatient.id, ...payload })
      ElMessage.success('运动记录已保存')
    }
    await load()
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '保存失败')
  } finally {
    submitting.value = false
  }
}

onMounted(load)
watch(() => patientStore.currentPatient?.id, load)
</script>

<style scoped>
.records-panel,
.form-panel {
  padding: 18px;
}

.records-panel {
  min-width: 0;
}

.record-count {
  color: var(--muted);
  font-size: 11px;
}

.table-wrap {
  margin-top: 16px;
  overflow-x: auto;
}

.exercise-cell,
.bs-change {
  display: flex;
  align-items: center;
}

.exercise-cell {
  gap: 10px;
}

.exercise-mark {
  display: grid;
  width: 34px;
  height: 34px;
  flex: 0 0 34px;
  place-items: center;
  color: var(--brand);
  background: var(--brand-soft);
  border-radius: 7px;
}

.exercise-cell > div {
  display: flex;
  flex-direction: column;
}

.exercise-cell strong {
  color: var(--ink);
  font-size: 13px;
}

.exercise-cell span:not(.exercise-mark) {
  margin-top: 3px;
  color: var(--muted);
  font-size: 10px;
}

.bs-change {
  gap: 6px;
  color: var(--muted);
  font-size: 11px;
}

.bs-change strong {
  color: var(--ink);
  font-size: 13px;
}

.bs-change small {
  padding: 2px 5px;
  color: var(--brand);
  background: var(--brand-soft);
  border-radius: 4px;
  font-size: 9px;
}

.form-panel {
  position: sticky;
  top: 96px;
  align-self: start;
}

.form-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
  padding-bottom: 15px;
  border-bottom: 1px solid var(--line);
}

.form-title > div:first-child {
  display: flex;
  flex-direction: column;
}

.form-title span {
  color: var(--brand);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.form-title h3 {
  margin-top: 4px;
  color: var(--ink);
  font-size: 17px;
}

.form-icon {
  display: grid;
  width: 38px;
  height: 38px;
  place-items: center;
  color: var(--brand);
  background: var(--brand-soft);
  border-radius: 8px;
}

.form-grid,
.bs-inputs {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.form-panel :deep(.el-input-number),
.form-panel :deep(.el-select),
.form-panel :deep(.el-date-editor) {
  width: 100%;
}

.form-actions {
  display: flex;
  gap: 10px;
}

.form-actions .el-button {
  min-height: 38px;
  flex: 1;
  margin: 0;
}

@media (max-width: 1220px) {
  .form-panel {
    position: static;
  }
}

@media (max-width: 640px) {
  .form-grid,
  .bs-inputs {
    grid-template-columns: 1fr;
    gap: 0;
  }
}
</style>
