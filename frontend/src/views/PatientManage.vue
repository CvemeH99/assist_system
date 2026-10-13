<template>
  <div class="patient-page">
    <PageHeader
      title="患者档案"
      subtitle="集中维护基础信息、确诊情况与体重指数"
      :icon="User"
    >
      <template #actions>
        <el-button type="primary" :icon="Plus" @click="startCreate">添加患者</el-button>
      </template>
    </PageHeader>

    <section class="patient-overview">
      <div class="overview-item">
        <span>档案总数</span>
        <strong>{{ patients.length }}</strong>
        <small>已建档患者</small>
      </div>
      <div class="overview-item">
        <span>平均年龄</span>
        <strong>{{ averageAge }}</strong>
        <small>岁</small>
      </div>
      <div class="overview-item">
        <span>平均 BMI</span>
        <strong>{{ averageBmi }}</strong>
        <small>{{ bmiSummary }}</small>
      </div>
      <div class="overview-item current">
        <span>当前管理对象</span>
        <strong>{{ patientStore.currentPatient?.name || '未选择' }}</strong>
        <small>{{ patientStore.currentPatient?.diabetes_type || '请选择患者' }}</small>
      </div>
    </section>

    <div class="patient-layout section-spacer">
      <div class="surface-card list-panel">
        <div class="card-head">
          <div class="card-heading">
            <h3>患者列表</h3>
            <p>点击一行即可切换当前管理对象</p>
          </div>
          <el-input
            v-model="searchKeyword"
            class="search-input"
            placeholder="搜索姓名或电话"
            clearable
          >
            <template #prefix><el-icon><Search /></el-icon></template>
          </el-input>
        </div>

        <div class="table-wrap">
          <el-table
            :data="filteredPatients"
            highlight-current-row
            :current-row-key="patientStore.currentPatient?.id"
            row-key="id"
            @row-click="selectPatient"
          >
            <el-table-column label="患者" min-width="170">
              <template #default="{ row }">
                <div class="patient-cell">
                  <span class="table-avatar">{{ row.name.slice(0, 1) }}</span>
                  <div>
                    <strong>{{ row.name }}</strong>
                    <span>ID {{ String(row.id).padStart(4, '0') }}</span>
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="基础信息" min-width="130">
              <template #default="{ row }">
                <div class="cell-stack">
                  <strong>{{ row.age }} 岁 · {{ row.gender }}</strong>
                  <span>{{ row.phone || '未填写电话' }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="diabetes_type" label="糖尿病类型" min-width="120" />
            <el-table-column label="BMI" min-width="110">
              <template #default="{ row }">
                <div v-if="row.bmi" class="bmi-cell">
                  <strong>{{ row.bmi.toFixed(1) }}</strong>
                  <span>{{ row.bmi_status }}</span>
                </div>
                <span v-else class="muted">未录入</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="126" fixed="right" align="right">
              <template #default="{ row }">
                <el-button type="primary" link @click.stop="editPatient(row)">编辑</el-button>
                <el-button type="danger" link @click.stop="deletePatient(row.id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>

      <div ref="formPanel" class="surface-card form-panel">
        <div class="form-header">
          <div>
            <span>{{ isEditing ? '编辑档案' : '新建档案' }}</span>
            <h3>{{ isEditing ? '更新患者信息' : '录入患者信息' }}</h3>
          </div>
          <div class="form-icon">
            <el-icon :size="20"><EditPen /></el-icon>
          </div>
        </div>

        <el-form ref="formRef" :model="form" label-position="top" :rules="rules">
          <el-form-item label="姓名" prop="name">
            <el-input v-model="form.name" placeholder="请输入患者姓名" />
          </el-form-item>
          <div class="form-grid">
            <el-form-item label="年龄" prop="age">
              <el-input-number v-model="form.age" :min="1" :max="120" controls-position="right" />
            </el-form-item>
            <el-form-item label="性别" prop="gender">
              <el-select v-model="form.gender">
                <el-option label="男" value="男" />
                <el-option label="女" value="女" />
              </el-select>
            </el-form-item>
          </div>
          <el-form-item label="糖尿病类型" prop="diabetes_type">
            <el-select v-model="form.diabetes_type">
              <el-option label="1 型糖尿病" value="1型糖尿病" />
              <el-option label="2 型糖尿病" value="2型糖尿病" />
              <el-option label="妊娠糖尿病" value="妊娠糖尿病" />
              <el-option label="其他类型" value="其他类型" />
            </el-select>
          </el-form-item>
          <el-form-item label="确诊日期">
            <el-date-picker
              v-model="form.diagnosis_date"
              type="date"
              placeholder="选择确诊日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
            />
          </el-form-item>
          <div class="form-grid">
            <el-form-item label="身高 (cm)">
              <el-input-number v-model="form.height" :min="50" :max="250" controls-position="right" />
            </el-form-item>
            <el-form-item label="体重 (kg)">
              <el-input-number v-model="form.weight" :min="20" :max="300" controls-position="right" />
            </el-form-item>
          </div>
          <el-form-item label="联系电话">
            <el-input v-model="form.phone" placeholder="请输入联系电话" />
          </el-form-item>
          <div class="form-actions">
            <el-button type="primary" :loading="submitting" @click="submit">
              {{ isEditing ? '保存修改' : '创建档案' }}
            </el-button>
            <el-button v-if="isEditing" @click="cancelEdit">取消编辑</el-button>
          </div>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import {
  EditPen,
  Plus,
  Search,
  User,
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import PageHeader from '../components/PageHeader.vue'
import { patientApi } from '../api/patient'
import { usePatientStore } from '../stores/patient'
import type { Patient } from '../types'

const patientStore = usePatientStore()
const patients = ref<Patient[]>([])
const searchKeyword = ref('')
const isEditing = ref(false)
const editingId = ref<number | null>(null)
const submitting = ref(false)
const formRef = ref<FormInstance>()
const formPanel = ref<HTMLElement>()

const defaultForm = () => ({
  name: '',
  age: 30,
  gender: '男',
  diabetes_type: '2型糖尿病',
  diagnosis_date: null as string | null,
  height: undefined as number | undefined,
  weight: undefined as number | undefined,
  phone: '',
})

const form = reactive(defaultForm())

const rules: FormRules = {
  name: [{ required: true, message: '请输入患者姓名', trigger: 'blur' }],
  age: [{ required: true, message: '请输入年龄', trigger: 'blur' }],
  gender: [{ required: true, message: '请选择性别', trigger: 'change' }],
  diabetes_type: [{ required: true, message: '请选择糖尿病类型', trigger: 'change' }],
}

const filteredPatients = computed(() => {
  const keyword = searchKeyword.value.trim().toLowerCase()
  if (!keyword) return patients.value
  return patients.value.filter(
    (patient) =>
      patient.name.toLowerCase().includes(keyword) ||
      (patient.phone && patient.phone.includes(keyword)),
  )
})

const averageAge = computed(() => {
  if (!patients.value.length) return '--'
  return Math.round(patients.value.reduce((sum, patient) => sum + patient.age, 0) / patients.value.length)
})

const averageBmi = computed(() => {
  const values = patients.value.map((patient) => patient.bmi).filter((bmi): bmi is number => Boolean(bmi))
  if (!values.length) return '--'
  return (values.reduce((sum, bmi) => sum + bmi, 0) / values.length).toFixed(1)
})

const bmiSummary = computed(() => {
  const bmi = Number(averageBmi.value)
  if (!Number.isFinite(bmi)) return '暂无数据'
  if (bmi < 18.5) return '偏低'
  if (bmi < 24) return '正常'
  if (bmi < 28) return '偏高'
  return '肥胖'
})

async function loadPatients() {
  try {
    const { data } = await patientApi.list()
    patients.value = data
    patientStore.patients = data
    if (data.length && !patientStore.currentPatient) {
      patientStore.selectPatient(data[0])
    }
  } catch {
    ElMessage.error('患者列表加载失败')
  }
}

function selectPatient(row: Patient) {
  patientStore.selectPatient(row)
}

function startCreate() {
  resetForm()
  formPanel.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function resetForm() {
  Object.assign(form, defaultForm())
  editingId.value = null
  isEditing.value = false
  formRef.value?.clearValidate()
}

function editPatient(patient: Patient) {
  isEditing.value = true
  editingId.value = patient.id
  Object.assign(form, {
    name: patient.name,
    age: patient.age,
    gender: patient.gender,
    diabetes_type: patient.diabetes_type,
    diagnosis_date: patient.diagnosis_date,
    height: patient.height ?? undefined,
    weight: patient.weight ?? undefined,
    phone: patient.phone || '',
  })
  formPanel.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function cancelEdit() {
  resetForm()
}

async function submit() {
  if (!formRef.value) return
  try {
    await formRef.value.validate()
  } catch {
    return
  }

  submitting.value = true
  try {
    if (isEditing.value && editingId.value) {
      await patientApi.update(editingId.value, form)
      ElMessage.success('患者信息已更新')
    } else {
      await patientApi.create(form)
      ElMessage.success('患者档案已创建')
    }
    resetForm()
    await loadPatients()
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '保存失败')
  } finally {
    submitting.value = false
  }
}

async function deletePatient(id: number) {
  const patient = patients.value.find((item) => item.id === id)
  try {
    await ElMessageBox.confirm(`确定删除「${patient?.name || '该患者'}」及其全部健康记录吗？`, '删除确认', {
      type: 'warning',
      confirmButtonText: '确认删除',
      cancelButtonText: '取消',
    })
    await patientApi.delete(id)
    ElMessage.success('患者档案已删除')
    if (patientStore.currentPatient?.id === id) {
      patientStore.selectPatient(patients.value.find((item) => item.id !== id) || null)
    }
    await loadPatients()
  } catch (error) {
    if (error !== 'cancel' && error !== 'close') ElMessage.error('删除失败')
  }
}

onMounted(loadPatients)
</script>

<style scoped>
.patient-overview {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  overflow: hidden;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 8px;
  box-shadow: var(--shadow-sm);
}

.overview-item {
  display: flex;
  min-height: 96px;
  justify-content: center;
  flex-direction: column;
  padding: 18px 22px;
  border-right: 1px solid var(--line);
}

.overview-item:last-child {
  border-right: 0;
}

.overview-item.current {
  color: #fff;
  background: #102a2e;
}

.overview-item span {
  color: var(--muted);
  font-size: 11px;
}

.overview-item strong {
  margin: 6px 0 3px;
  color: var(--ink);
  font-size: 23px;
}

.overview-item small {
  color: #8b9b99;
  font-size: 10px;
}

.overview-item.current span,
.overview-item.current small {
  color: #8eaaa7;
}

.overview-item.current strong {
  color: #fff;
}

.patient-layout {
  display: grid;
  min-width: 0;
  grid-template-columns: minmax(0, 1.55fr) minmax(330px, 0.72fr);
  gap: 18px;
}

.list-panel,
.form-panel {
  min-width: 0;
  padding: 18px;
}

.search-input {
  width: 210px;
}

.table-wrap {
  width: 100%;
  min-width: 0;
  margin-top: 16px;
  overflow-x: auto;
}

.patient-cell,
.bmi-cell,
.cell-stack {
  display: flex;
}

.patient-cell {
  align-items: center;
  gap: 11px;
}

.table-avatar {
  display: grid;
  width: 36px;
  height: 36px;
  flex: 0 0 36px;
  place-items: center;
  color: var(--brand);
  background: var(--brand-soft);
  border: 1px solid var(--brand-border);
  border-radius: 8px;
  font-size: 13px;
  font-weight: 700;
}

.patient-cell > div,
.bmi-cell,
.cell-stack {
  flex-direction: column;
}

.patient-cell strong,
.cell-stack strong,
.bmi-cell strong {
  color: var(--ink);
  font-size: 13px;
}

.patient-cell span:not(.table-avatar),
.cell-stack span,
.bmi-cell span {
  margin-top: 3px;
  color: var(--muted);
  font-size: 10px;
}

.form-panel {
  align-self: start;
  position: sticky;
  top: 96px;
}

.form-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
  padding-bottom: 15px;
  border-bottom: 1px solid var(--line);
}

.form-header > div:first-child {
  display: flex;
  flex-direction: column;
}

.form-header span {
  color: var(--brand);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.form-header h3 {
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

.form-panel :deep(.el-input-number),
.form-panel :deep(.el-select),
.form-panel :deep(.el-date-editor) {
  width: 100%;
}

.form-actions {
  display: flex;
  gap: 10px;
  padding-top: 4px;
}

.form-actions .el-button {
  min-height: 38px;
  flex: 1;
  margin: 0;
}

@media (max-width: 1220px) {
  .patient-overview {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .overview-item:nth-child(2) {
    border-right: 0;
  }

  .overview-item:nth-child(-n + 2) {
    border-bottom: 1px solid var(--line);
  }

  .patient-layout {
    grid-template-columns: minmax(0, 1fr);
  }

  .form-panel {
    position: static;
  }
}

@media (max-width: 640px) {
  .patient-overview {
    grid-template-columns: 1fr;
  }

  .overview-item {
    min-height: 78px;
    border-right: 0;
    border-bottom: 1px solid var(--line);
  }

  .overview-item:last-child {
    border-bottom: 0;
  }

  .list-panel .card-head {
    align-items: flex-start;
    flex-direction: column;
  }

  .search-input {
    width: 100%;
  }

  .form-grid {
    grid-template-columns: 1fr;
    gap: 0;
  }
}
</style>
