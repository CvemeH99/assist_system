<template>
  <div class="blood-page">
    <PageHeader
      title="血糖管理"
      subtitle="记录每次测量，观察目标范围内的时间变化"
      :icon="TrendCharts"
    >
      <template #actions>
        <el-radio-group v-model="days" @change="loadData">
          <el-radio-button :value="7">近 7 天</el-radio-button>
          <el-radio-button :value="14">14 天</el-radio-button>
          <el-radio-button :value="30">30 天</el-radio-button>
        </el-radio-group>
        <el-button :icon="Refresh" :loading="loading" @click="loadData">刷新</el-button>
      </template>
    </PageHeader>

    <section class="metric-grid">
      <MetricCard
        label="平均血糖"
        :value="formatNumber(bloodStore.stats?.avg)"
        unit="mmol/L"
        :caption="`${bloodStore.stats?.record_count || 0} 条测量记录`"
        :icon="TrendCharts"
      />
      <MetricCard
        label="目标范围内"
        :value="formatNumber(bloodStore.stats?.time_in_range)"
        unit="%"
        :trend="bloodStore.stats?.trend"
        caption="3.9–10.0 mmol/L"
        :icon="Aim"
        :tone="tirTone"
      />
      <MetricCard
        label="波动范围"
        :value="rangeText"
        unit="mmol/L"
        caption="最低值与最高值"
        :icon="DataLine"
        tone="slate"
      />
      <MetricCard
        label="异常测量"
        :value="(bloodStore.stats?.high_count || 0) + (bloodStore.stats?.low_count || 0)"
        unit="次"
        :caption="`偏高 ${bloodStore.stats?.high_count || 0} · 偏低 ${bloodStore.stats?.low_count || 0}`"
        :icon="Warning"
        :tone="abnormalCount ? 'coral' : 'lime'"
      />
    </section>

    <section class="two-column section-spacer">
      <div class="surface-card chart-panel">
        <div class="card-head">
          <div class="card-heading">
            <h3>血糖趋势</h3>
            <p>按测量时间连续展示，保留目标区间参考线</p>
          </div>
          <span class="status-pill" :class="riskClass">
            {{ bloodStore.stats?.risk_level || '等待数据' }}
          </span>
        </div>
        <BloodSugarChart v-if="bloodStore.records.length" :records="bloodStore.records" />
        <div v-else class="empty-state">
          <el-empty description="当前周期暂无血糖记录" :image-size="74" />
        </div>
      </div>

      <div class="surface-card form-panel">
        <div class="form-title">
          <div>
            <span>{{ editId ? '修改记录' : '快速录入' }}</span>
            <h3>{{ editId ? '更新测量数据' : '记录一次血糖' }}</h3>
          </div>
          <div class="pulse-mark"><el-icon :size="20"><Odometer /></el-icon></div>
        </div>
        <el-form :model="form" label-position="top">
          <el-form-item label="血糖值 (mmol/L)">
            <el-input-number
              v-model="form.value"
              :min="1"
              :max="33.3"
              :step="0.1"
              controls-position="right"
            />
          </el-form-item>
          <el-form-item label="测量类型">
            <el-select v-model="form.measure_type">
              <el-option label="空腹" value="空腹" />
              <el-option label="餐后 2h" value="餐后2h" />
              <el-option label="睡前" value="睡前" />
              <el-option label="随机" value="随机" />
            </el-select>
          </el-form-item>
          <el-form-item label="测量时间">
            <el-date-picker v-model="form.measured_at" type="datetime" placeholder="选择测量时间" />
          </el-form-item>
          <el-form-item label="备注">
            <el-input v-model="form.note" type="textarea" :rows="2" placeholder="可选，如饮食或运动情况" />
          </el-form-item>
          <div class="form-actions">
            <el-button type="primary" :loading="submitting" @click="submitRecord">
              {{ editId ? '保存修改' : '提交记录' }}
            </el-button>
            <el-button v-if="editId" @click="cancelEdit">取消</el-button>
          </div>
        </el-form>
      </div>
    </section>

    <div class="surface-card records-panel section-spacer">
      <div class="card-head">
        <div class="card-heading">
          <h3>测量记录</h3>
          <p>共 {{ bloodStore.records.length }} 条，按时间倒序排列</p>
        </div>
      </div>
      <div class="table-wrap">
        <el-table :data="bloodStore.records" v-loading="loading">
          <el-table-column label="血糖值" min-width="140">
            <template #default="{ row }">
              <div class="value-cell">
                <span class="value-dot" :style="{ background: getColor(row.value) }" />
                <strong :style="{ color: getColor(row.value) }">{{ row.value }}</strong>
                <small>mmol/L</small>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="measure_type" label="测量类型" min-width="100" />
          <el-table-column label="测量时间" min-width="180">
            <template #default="{ row }">{{ formatDateTime(row.measured_at) }}</template>
          </el-table-column>
          <el-table-column label="状态" min-width="90">
            <template #default="{ row }">
              <el-tag :type="statusTag(row.value)" effect="light" round>
                {{ row.status || statusLabel(row.value) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="note" label="备注" min-width="150" show-overflow-tooltip>
            <template #default="{ row }">{{ row.note || '--' }}</template>
          </el-table-column>
          <el-table-column label="操作" width="128" fixed="right" align="right">
            <template #default="{ row }">
              <el-button type="primary" link @click="editRecord(row)">编辑</el-button>
              <el-button type="danger" link @click="removeRecord(row.id)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import {
  Aim,
  DataLine,
  Odometer,
  Refresh,
  TrendCharts,
  Warning,
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import PageHeader from '../components/PageHeader.vue'
import MetricCard from '../components/MetricCard.vue'
import BloodSugarChart from '../components/BloodSugarChart.vue'
import { usePatientStore } from '../stores/patient'
import { useBloodSugarStore } from '../stores/bloodSugar'
import { bloodSugarApi } from '../api/bloodSugar'
import { formatDateTime } from '../utils/date'
import type { BloodSugar } from '../types'

const patientStore = usePatientStore()
const bloodStore = useBloodSugarStore()
const days = ref(7)
const editId = ref<number | null>(null)
const submitting = ref(false)
const loading = ref(false)

const form = reactive({
  value: 5.6,
  measure_type: '空腹',
  measured_at: new Date() as Date,
  note: '',
})

const rangeText = computed(() => {
  if (!bloodStore.stats) return '--'
  return `${Number(bloodStore.stats.min).toFixed(1)}–${Number(bloodStore.stats.max).toFixed(1)}`
})

const abnormalCount = computed(
  () => (bloodStore.stats?.high_count || 0) + (bloodStore.stats?.low_count || 0),
)

const tirTone = computed<'teal' | 'amber' | 'coral'>(() => {
  const tir = bloodStore.stats?.time_in_range ?? 0
  if (tir >= 70) return 'teal'
  if (tir >= 50) return 'amber'
  return 'coral'
})

const riskClass = computed(() => {
  const risk = bloodStore.stats?.risk_level
  if (risk?.includes('高')) return 'danger'
  if (risk?.includes('中')) return 'warning'
  return ''
})

function formatNumber(value: unknown) {
  const number = Number(value)
  return Number.isFinite(number) ? number.toFixed(1) : '--'
}

function getColor(value: number) {
  if (value < 3.9) return '#d97706'
  if (value <= 7) return '#65a30d'
  if (value <= 10) return '#d97706'
  return '#e4574f'
}

function statusTag(value: number): 'success' | 'warning' | 'danger' {
  if (value < 3.9) return 'warning'
  if (value <= 7) return 'success'
  if (value <= 10) return 'warning'
  return 'danger'
}

function statusLabel(value: number) {
  if (value < 3.9) return '偏低'
  if (value <= 7) return '达标'
  if (value <= 10) return '偏高'
  return '过高'
}

async function loadData() {
  if (!patientStore.currentPatient) return
  loading.value = true
  try {
    await Promise.all([
      bloodStore.fetchRecords(patientStore.currentPatient.id, days.value),
      bloodStore.fetchStats(patientStore.currentPatient.id, days.value),
    ])
  } finally {
    loading.value = false
  }
}

async function submitRecord() {
  if (!patientStore.currentPatient) return
  if (!Number.isFinite(form.value)) {
    ElMessage.warning('请输入有效的血糖值')
    return
  }

  submitting.value = true
  try {
    const measuredAt =
      form.measured_at instanceof Date ? form.measured_at : new Date(form.measured_at as unknown as string)
    const payload = {
      value: form.value,
      measure_type: form.measure_type,
      measured_at: measuredAt.toISOString(),
      note: form.note || undefined,
    }
    if (editId.value) {
      await bloodSugarApi.update(editId.value, payload)
      ElMessage.success('记录已更新')
    } else {
      await bloodSugarApi.create({ patient_id: patientStore.currentPatient.id, ...payload })
      ElMessage.success('血糖记录已保存')
    }
    cancelEdit()
    await loadData()
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '操作失败')
  } finally {
    submitting.value = false
  }
}

function editRecord(row: BloodSugar) {
  editId.value = row.id
  form.value = row.value
  form.measure_type = row.measure_type
  form.measured_at = new Date(row.measured_at)
  form.note = row.note || ''
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function cancelEdit() {
  editId.value = null
  form.value = 5.6
  form.measure_type = '空腹'
  form.measured_at = new Date()
  form.note = ''
}

async function removeRecord(id: number) {
  try {
    await ElMessageBox.confirm('确定删除这条血糖记录吗？', '删除确认', {
      type: 'warning',
      confirmButtonText: '删除',
      cancelButtonText: '取消',
    })
    await bloodSugarApi.remove(id)
    ElMessage.success('记录已删除')
    await loadData()
  } catch (error) {
    if (error !== 'cancel' && error !== 'close') ElMessage.error('删除失败')
  }
}

onMounted(loadData)
watch(() => patientStore.currentPatient?.id, loadData)
</script>

<style scoped>
.chart-panel,
.form-panel,
.records-panel {
  padding: 18px;
}

.chart-panel {
  min-width: 0;
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

.pulse-mark {
  display: grid;
  width: 38px;
  height: 38px;
  place-items: center;
  color: var(--brand);
  background: var(--brand-soft);
  border-radius: 8px;
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

.table-wrap {
  margin-top: 16px;
  overflow-x: auto;
}

.value-cell {
  display: flex;
  align-items: baseline;
  gap: 7px;
}

.value-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
}

.value-cell strong {
  font-size: 15px;
}

.value-cell small {
  color: var(--muted);
  font-size: 10px;
}
</style>
