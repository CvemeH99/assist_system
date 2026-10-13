<template>
  <div class="medication-page">
    <PageHeader
      title="用药管理"
      subtitle="维护当前用药方案，清晰掌握剂量、频次与服用时机"
      :icon="FirstAidKit"
    >
      <template #actions>
        <el-button :icon="Refresh" :loading="loading" @click="load">刷新</el-button>
        <el-button type="primary" :icon="Plus" @click="focusForm">添加用药</el-button>
      </template>
    </PageHeader>

    <section class="metric-grid">
      <MetricCard
        label="当前方案"
        :value="medications.length"
        unit="项"
        caption="全部处于用药中"
        :icon="FirstAidKit"
      />
      <MetricCard
        label="口服药"
        :value="oralCount"
        unit="项"
        :caption="`${typePercent(oralCount)}% 的当前方案`"
        :icon="Sunny"
        tone="lime"
      />
      <MetricCard
        label="胰岛素"
        :value="insulinCount"
        unit="项"
        :caption="`${typePercent(insulinCount)}% 的当前方案`"
        :icon="MagicStick"
        tone="amber"
      />
      <MetricCard
        label="本月新增"
        :value="newThisMonth"
        unit="项"
        caption="最近 30 天内开始"
        :icon="Calendar"
        tone="slate"
      />
    </section>

    <section class="medication-layout section-spacer">
      <div class="plan-section">
        <div class="card-head">
          <div class="card-heading">
            <h3>当前用药方案</h3>
            <p>所有方案均从后端实时读取</p>
          </div>
          <span class="status-pill">{{ medications.length }} 项进行中</span>
        </div>

        <div v-if="medications.length" class="plan-grid">
          <article v-for="medication in medications" :key="medication.id" class="plan-card">
            <div class="plan-top">
              <div class="drug-icon">
                <el-icon :size="20"><FirstAidKit /></el-icon>
              </div>
              <div class="drug-title">
                <h3>{{ medication.drug_name }}</h3>
                <span>{{ medication.drug_type || '药品' }}</span>
              </div>
              <span :class="['plan-state', { inactive: !medication.is_active }]">
                {{ medication.is_active ? '用药中' : '已停用' }}
              </span>
            </div>

            <div class="plan-schedule">
              <div>
                <span>单次剂量</span>
                <strong>{{ medication.dosage }}</strong>
              </div>
              <div>
                <span>服用频次</span>
                <strong>{{ medication.frequency || '按医嘱' }}</strong>
              </div>
              <div>
                <span>服用时机</span>
                <strong>{{ medication.timing || '未设置' }}</strong>
              </div>
            </div>

            <div class="plan-foot">
              <span>开始日期 {{ medication.start_date }}</span>
              <div>
                <el-button type="primary" link @click="openEdit(medication)">编辑</el-button>
                <el-button type="danger" link @click="confirmDelete(medication)">删除</el-button>
              </div>
            </div>
          </article>
        </div>

        <div v-else class="surface-card empty-plans">
          <el-empty description="当前没有进行中的用药方案" :image-size="76">
            <el-button type="primary" @click="focusForm">添加第一项用药</el-button>
          </el-empty>
        </div>
      </div>

      <div ref="formPanel" class="surface-card form-panel">
        <div class="form-title">
          <div>
            <span>{{ editForm ? '调整方案' : '新增方案' }}</span>
            <h3>{{ editForm ? '更新用药信息' : '添加用药方案' }}</h3>
          </div>
          <div class="form-icon"><el-icon :size="20"><EditPen /></el-icon></div>
        </div>
        <el-form :model="form" label-position="top">
          <el-form-item label="药品名称">
            <el-input v-model="form.drug_name" placeholder="请输入药品名称" />
          </el-form-item>
          <el-form-item label="药品类型">
            <el-select v-model="form.drug_type">
              <el-option label="口服药" value="口服药" />
              <el-option label="胰岛素" value="胰岛素" />
              <el-option label="其他" value="其他" />
            </el-select>
          </el-form-item>
          <div class="form-grid">
            <el-form-item label="单次剂量">
              <el-input v-model="form.dosage" placeholder="如 500mg" />
            </el-form-item>
            <el-form-item label="服用频次">
              <el-input v-model="form.frequency" placeholder="如 每日 2 次" />
            </el-form-item>
          </div>
          <el-form-item label="服用时机">
            <el-input v-model="form.timing" placeholder="如 早餐后、睡前" />
          </el-form-item>
          <el-form-item label="开始日期">
            <el-date-picker
              v-model="form.start_date"
              type="date"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              placeholder="选择开始日期"
            />
          </el-form-item>
          <div class="form-actions">
            <el-button type="primary" :loading="submitting" @click="submit">
              {{ editForm ? '保存修改' : '添加方案' }}
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
  Calendar,
  EditPen,
  FirstAidKit,
  MagicStick,
  Plus,
  Refresh,
  Sunny,
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import PageHeader from '../components/PageHeader.vue'
import MetricCard from '../components/MetricCard.vue'
import { usePatientStore } from '../stores/patient'
import { medicationApi } from '../api/medication'
import type { Medication } from '../types'

const patientStore = usePatientStore()
const medications = ref<Medication[]>([])
const submitting = ref(false)
const loading = ref(false)
const editForm = ref<Medication | null>(null)
const formPanel = ref<HTMLElement>()

const defaultForm = () => ({
  drug_name: '',
  drug_type: '口服药',
  dosage: '',
  frequency: '',
  timing: '',
  start_date: new Date().toISOString().slice(0, 10),
})

const form = reactive(defaultForm())

const oralCount = computed(
  () => medications.value.filter((item) => item.drug_type?.includes('口服')).length,
)
const insulinCount = computed(
  () => medications.value.filter((item) => item.drug_type?.includes('胰岛素')).length,
)
const newThisMonth = computed(() => {
  const since = Date.now() - 30 * 24 * 60 * 60 * 1000
  return medications.value.filter(
    (item) => new Date(`${item.start_date}T00:00:00`).getTime() >= since,
  ).length
})

function typePercent(count: number) {
  if (!medications.value.length) return 0
  return Math.round((count / medications.value.length) * 100)
}

async function load() {
  if (!patientStore.currentPatient) return
  loading.value = true
  try {
    const { data } = await medicationApi.list(patientStore.currentPatient.id)
    medications.value = data
  } finally {
    loading.value = false
  }
}

function focusForm() {
  resetForm()
  formPanel.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function openEdit(row: Medication) {
  editForm.value = row
  Object.assign(form, {
    drug_name: row.drug_name,
    drug_type: row.drug_type || '口服药',
    dosage: row.dosage,
    frequency: row.frequency || '',
    timing: row.timing || '',
    start_date: row.start_date,
  })
  formPanel.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function resetForm() {
  editForm.value = null
  Object.assign(form, defaultForm())
}

async function confirmDelete(row: Medication) {
  try {
    await ElMessageBox.confirm(`确定删除「${row.drug_name}」用药方案吗？`, '删除确认', {
      type: 'warning',
      confirmButtonText: '删除',
      cancelButtonText: '取消',
    })
    await medicationApi.delete(row.id)
    ElMessage.success('用药方案已删除')
    await load()
  } catch (error) {
    if (error !== 'cancel' && error !== 'close') ElMessage.error('删除失败')
  }
}

async function submit() {
  if (!patientStore.currentPatient) return
  if (!form.drug_name.trim() || !form.dosage.trim()) {
    ElMessage.warning('请填写药品名称和单次剂量')
    return
  }

  submitting.value = true
  try {
    if (editForm.value) {
      await medicationApi.update(editForm.value.id, form)
      ElMessage.success('用药方案已更新')
      resetForm()
    } else {
      await medicationApi.create({ ...form, patient_id: patientStore.currentPatient.id })
      ElMessage.success('用药方案已添加')
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
.medication-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.55fr) minmax(330px, 0.72fr);
  gap: 18px;
}

.plan-section {
  min-width: 0;
}

.plan-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  margin-top: 16px;
}

.plan-card {
  padding: 18px;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 8px;
  box-shadow: var(--shadow-sm);
}

.plan-top {
  display: flex;
  align-items: center;
  gap: 11px;
}

.drug-icon {
  display: grid;
  width: 40px;
  height: 40px;
  flex: 0 0 40px;
  place-items: center;
  color: var(--brand);
  background: var(--brand-soft);
  border-radius: 8px;
}

.drug-title {
  min-width: 0;
  flex: 1;
}

.drug-title h3 {
  overflow: hidden;
  color: var(--ink);
  font-size: 15px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.drug-title span {
  display: block;
  margin-top: 4px;
  color: var(--muted);
  font-size: 10px;
}

.plan-state {
  flex: 0 0 auto;
  padding: 4px 8px;
  color: #4d7c0f;
  background: #f1f9df;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 600;
}

.plan-state.inactive {
  color: #7b8a89;
  background: #eef2f1;
}

.plan-schedule {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  margin-top: 16px;
  padding: 12px;
  background: var(--surface-soft);
  border-radius: 7px;
}

.plan-schedule div {
  display: flex;
  min-width: 0;
  flex-direction: column;
}

.plan-schedule span {
  color: var(--muted);
  font-size: 9px;
}

.plan-schedule strong {
  margin-top: 5px;
  overflow: hidden;
  color: var(--ink-soft);
  font-size: 11px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.plan-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px solid var(--line);
}

.plan-foot > span {
  color: var(--muted);
  font-size: 10px;
}

.empty-plans {
  display: grid;
  min-height: 280px;
  margin-top: 16px;
  place-items: center;
}

.form-panel {
  position: sticky;
  top: 96px;
  align-self: start;
  padding: 18px;
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

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

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
  .medication-layout {
    grid-template-columns: 1fr;
  }

  .form-panel {
    position: static;
  }
}

@media (max-width: 720px) {
  .plan-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 520px) {
  .plan-schedule,
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
