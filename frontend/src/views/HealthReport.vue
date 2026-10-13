<template>
  <div class="report-page">
    <PageHeader
      title="健康报告"
      subtitle="沉淀周期血糖表现，生成结构化总结与后续建议"
      :icon="Document"
    >
      <template #actions>
        <el-button :loading="generating === '周报'" :icon="Calendar" @click="generate('周报')">
          生成周报
        </el-button>
        <el-button
          type="primary"
          :loading="generating === '月报'"
          :icon="DataAnalysis"
          @click="generate('月报')"
        >
          生成月报
        </el-button>
      </template>
    </PageHeader>

    <section v-if="latestReport" class="report-summary">
      <div class="summary-main">
        <div class="summary-copy">
          <span>最新报告 · {{ latestReport.report_type }}</span>
          <h2>{{ reportPeriod(latestReport) }}</h2>
          <p>生成于 {{ formatDateTime(latestReport.generated_at) }}</p>
        </div>
        <span :class="['risk-badge', riskClass(latestReport.risk_level)]">
          {{ latestReport.risk_level || '待评估' }}
        </span>
      </div>
      <div class="summary-metrics">
        <div>
          <span>平均血糖</span>
          <strong>{{ formatNumber(latestReport.avg_blood_sugar) }}</strong>
          <small>mmol/L</small>
        </div>
        <div>
          <span>目标范围内</span>
          <strong>{{ formatNumber(latestReport.time_in_range) }}</strong>
          <small>%</small>
        </div>
        <div>
          <span>血糖标准差</span>
          <strong>{{ formatNumber(latestReport.blood_sugar_std) }}</strong>
          <small>波动值</small>
        </div>
      </div>
    </section>

    <section v-else class="surface-card first-report">
      <div class="first-report-icon"><el-icon :size="28"><Document /></el-icon></div>
      <h2>还没有健康报告</h2>
      <p>选择周报或月报，系统会结合周期内的血糖记录生成总结。</p>
      <el-button type="primary" :loading="generating === '周报'" @click="generate('周报')">
        生成第一份周报
      </el-button>
    </section>

    <section class="report-layout section-spacer">
      <div class="stack">
        <article
          v-for="report in reports"
          :key="report.id"
          :data-report-id="report.id"
          class="surface-card report-card"
        >
          <div class="report-card-head">
            <div class="report-title">
              <span class="report-mark">
                <el-icon :size="19"><Document /></el-icon>
              </span>
              <div>
                <h3>{{ report.report_type }}</h3>
                <p>{{ reportPeriod(report) }}</p>
              </div>
            </div>
            <el-tag :type="riskTag(report.risk_level)" effect="light" round>
              {{ report.risk_level || '未评估' }}
            </el-tag>
          </div>

          <div class="report-values">
            <div>
              <span>平均血糖</span>
              <strong>{{ formatNumber(report.avg_blood_sugar) }}</strong>
              <small>mmol/L</small>
            </div>
            <div>
              <span>达标率 TIR</span>
              <strong>{{ formatNumber(report.time_in_range) }}</strong>
              <small>%</small>
            </div>
            <div>
              <span>标准差</span>
              <strong>{{ formatNumber(report.blood_sugar_std) }}</strong>
              <small>mmol/L</small>
            </div>
          </div>

          <div class="report-section">
            <span>健康总结</span>
            <p>{{ report.summary }}</p>
          </div>
          <div v-if="report.recommendations" class="report-section recommendation">
            <span>管理建议</span>
            <p>{{ report.recommendations }}</p>
          </div>
        </article>

        <div v-if="!reports.length && !loading" class="surface-card empty-report">
          <el-empty description="暂无历史报告" :image-size="70" />
        </div>
      </div>

      <aside class="report-aside">
        <div class="surface-card aside-card">
          <div class="card-heading">
            <h3>报告索引</h3>
            <p>快速定位历史评估</p>
          </div>
          <div class="report-index">
            <button
              v-for="report in reports"
              :key="report.id"
              type="button"
              @click="scrollToReport(report.id)"
            >
              <span
                class="index-dot"
                :style="{ background: riskColor(report.risk_level) }"
              />
              <div>
                <strong>{{ report.report_type }}</strong>
                <small>{{ report.period_start }} 至 {{ report.period_end }}</small>
              </div>
              <el-icon><Right /></el-icon>
            </button>
            <el-empty v-if="!reports.length" description="暂无记录" :image-size="52" />
          </div>
        </div>
      </aside>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import {
  Calendar,
  DataAnalysis,
  Document,
  Right,
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import PageHeader from '../components/PageHeader.vue'
import { usePatientStore } from '../stores/patient'
import { reportApi } from '../api/reports'
import { formatDateTime } from '../utils/date'
import type { HealthReport } from '../types'

const patientStore = usePatientStore()
const reports = ref<HealthReport[]>([])
const loading = ref(false)
const generating = ref('')

const latestReport = computed(() => reports.value[0] || null)

function formatNumber(value: unknown, digits = 1) {
  const number = Number(value)
  if (!Number.isFinite(number)) return '--'
  return number.toFixed(digits)
}

function reportPeriod(report: HealthReport) {
  return `${report.period_start} 至 ${report.period_end}`
}

function riskClass(level: string | null) {
  if (level?.includes('高')) return 'high'
  if (level?.includes('中')) return 'medium'
  return 'low'
}

function riskTag(level: string | null): 'success' | 'warning' | 'danger' | 'info' {
  if (!level) return 'info'
  if (level.includes('高')) return 'danger'
  if (level.includes('中')) return 'warning'
  return 'success'
}

function riskColor(level: string | null) {
  if (level?.includes('高')) return '#e4574f'
  if (level?.includes('中')) return '#d97706'
  return '#65a30d'
}

async function load() {
  if (!patientStore.currentPatient) return
  loading.value = true
  try {
    const { data } = await reportApi.list(patientStore.currentPatient.id)
    reports.value = data
  } finally {
    loading.value = false
  }
}

async function generate(type: string) {
  if (!patientStore.currentPatient) return
  generating.value = type
  try {
    await reportApi.generate(patientStore.currentPatient.id, type)
    ElMessage.success(`${type}生成成功`)
    await load()
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '报告生成失败')
  } finally {
    generating.value = ''
  }
}

function scrollToReport(id: number) {
  document.querySelector(`[data-report-id="${id}"]`)?.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  })
}

onMounted(load)
watch(() => patientStore.currentPatient?.id, load)
</script>

<style scoped>
.report-summary {
  display: grid;
  grid-template-columns: minmax(0, 1.25fr) minmax(360px, 0.75fr);
  overflow: hidden;
  color: #fff;
  background: #102a2e;
  border-radius: 8px;
  box-shadow: 0 14px 34px rgba(16, 42, 46, 0.14);
}

.summary-main {
  display: flex;
  min-height: 148px;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
  padding: 24px;
  background:
    linear-gradient(120deg, transparent 48%, rgba(163, 230, 53, 0.12) 48%, rgba(163, 230, 53, 0.12) 62%, transparent 62%);
}

.summary-copy > span {
  color: #81a09d;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.summary-copy h2 {
  margin-top: 7px;
  color: #fff;
  font-size: 21px;
}

.summary-copy p {
  margin-top: 7px;
  color: #88a4a1;
  font-size: 11px;
}

.risk-badge {
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
}

.risk-badge.low {
  color: #d9ff93;
  background: rgba(163, 230, 53, 0.12);
  border: 1px solid rgba(163, 230, 53, 0.2);
}

.risk-badge.medium {
  color: #fbd38d;
  background: rgba(217, 119, 6, 0.15);
  border: 1px solid rgba(251, 211, 141, 0.2);
}

.risk-badge.high {
  color: #fecaca;
  background: rgba(228, 87, 79, 0.16);
  border: 1px solid rgba(254, 202, 202, 0.2);
}

.summary-metrics {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  background: rgba(255, 255, 255, 0.035);
  border-left: 1px solid rgba(255, 255, 255, 0.08);
}

.summary-metrics > div {
  display: flex;
  justify-content: center;
  flex-direction: column;
  padding: 20px;
  border-right: 1px solid rgba(255, 255, 255, 0.08);
}

.summary-metrics > div:last-child {
  border-right: 0;
}

.summary-metrics span,
.summary-metrics small {
  color: #7f9b99;
  font-size: 10px;
}

.summary-metrics strong {
  margin: 7px 0 3px;
  color: #fff;
  font-size: 22px;
}

.first-report {
  display: flex;
  min-height: 260px;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: 36px;
  text-align: center;
}

.first-report-icon {
  display: grid;
  width: 56px;
  height: 56px;
  place-items: center;
  color: var(--brand);
  background: var(--brand-soft);
  border-radius: 8px;
}

.first-report h2 {
  margin-top: 16px;
  color: var(--ink);
  font-size: 20px;
}

.first-report p {
  max-width: 440px;
  margin: 8px 0 18px;
  color: var(--muted);
  font-size: 12px;
  line-height: 1.7;
}

.report-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.45fr) minmax(270px, 0.55fr);
  gap: 18px;
}

.report-card {
  padding: 20px;
  scroll-margin-top: 100px;
}

.report-card-head,
.report-title {
  display: flex;
  align-items: center;
}

.report-card-head {
  justify-content: space-between;
  gap: 16px;
}

.report-title {
  gap: 11px;
}

.report-mark {
  display: grid;
  width: 40px;
  height: 40px;
  place-items: center;
  color: var(--brand);
  background: var(--brand-soft);
  border-radius: 8px;
}

.report-title h3 {
  color: var(--ink);
  font-size: 15px;
}

.report-title p {
  margin-top: 4px;
  color: var(--muted);
  font-size: 10px;
}

.report-values {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin-top: 18px;
}

.report-values > div {
  display: flex;
  flex-direction: column;
  padding: 12px;
  background: var(--surface-soft);
  border: 1px solid #e9f0ef;
  border-radius: 7px;
}

.report-values span,
.report-values small {
  color: var(--muted);
  font-size: 9px;
}

.report-values strong {
  margin: 5px 0 2px;
  color: var(--ink);
  font-size: 18px;
}

.report-section {
  margin-top: 18px;
}

.report-section > span {
  color: var(--brand);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.report-section p {
  margin-top: 7px;
  color: #4d6462;
  font-size: 12px;
  line-height: 1.8;
  white-space: pre-wrap;
}

.report-section.recommendation {
  padding: 13px;
  background: #f7faf0;
  border-left: 3px solid #a3e635;
  border-radius: 0 7px 7px 0;
}

.report-aside {
  align-self: start;
  position: sticky;
  top: 96px;
}

.aside-card {
  padding: 18px;
}

.report-index {
  margin-top: 12px;
}

.report-index button {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 10px;
  padding: 11px 0;
  color: inherit;
  text-align: left;
  background: none;
  border: 0;
  border-bottom: 1px solid var(--line);
  cursor: pointer;
}

.report-index button:last-child {
  border-bottom: 0;
}

.index-dot {
  width: 8px;
  height: 8px;
  flex: 0 0 8px;
  border-radius: 50%;
}

.report-index button > div {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
}

.report-index strong {
  color: var(--ink);
  font-size: 12px;
}

.report-index small {
  margin-top: 4px;
  overflow: hidden;
  color: var(--muted);
  font-size: 9px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.report-index .el-icon {
  color: #9badaa;
}

.empty-report {
  display: grid;
  min-height: 220px;
  place-items: center;
}

@media (max-width: 1120px) {
  .report-summary {
    grid-template-columns: 1fr;
  }

  .summary-metrics {
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    border-left: 0;
  }

  .report-layout {
    grid-template-columns: 1fr;
  }

  .report-aside {
    position: static;
    order: -1;
  }
}

@media (max-width: 640px) {
  .summary-main {
    flex-direction: column;
  }

  .summary-metrics,
  .report-values {
    grid-template-columns: 1fr;
  }

  .summary-metrics > div {
    border-right: 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }

  .summary-metrics > div:last-child {
    border-bottom: 0;
  }
}
</style>
