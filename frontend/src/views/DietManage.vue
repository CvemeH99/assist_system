<template>
  <div class="diet-page">
    <PageHeader
      title="饮食管理"
      subtitle="记录每餐营养摄入，结合 GI 获取更稳妥的饮食建议"
      :icon="Food"
    >
      <template #actions>
        <el-button :icon="Refresh" :loading="loading" @click="loadPage">刷新数据</el-button>
        <el-button type="primary" :icon="Plus" @click="focusForm">记录饮食</el-button>
      </template>
    </PageHeader>

    <section class="metric-grid">
      <MetricCard
        label="今日热量"
        :value="formatNumber(dietStore.dailyNutrition?.total_calories)"
        unit="kcal"
        :caption="dietStore.dailyNutrition?.calorie_status || '暂无记录'"
        :icon="Lightning"
      />
      <MetricCard
        label="碳水摄入"
        :value="formatNumber(dietStore.dailyNutrition?.total_carbs)"
        unit="g"
        :caption="dietStore.dailyNutrition?.carb_status || '暂无记录'"
        :icon="Sugar"
        tone="amber"
      />
      <MetricCard
        label="蛋白质"
        :value="formatNumber(dietStore.dailyNutrition?.total_protein)"
        unit="g"
        :caption="`脂肪 ${formatNumber(dietStore.dailyNutrition?.total_fat)} g`"
        :icon="Food"
        tone="lime"
      />
      <MetricCard
        label="平均 GI"
        :value="formatNumber(dietStore.dailyNutrition?.avg_gi, 0)"
        :trend="giTrend"
        :caption="`${dietStore.dailyNutrition?.meal_count || 0} 餐已记录`"
        :icon="DataAnalysis"
        :tone="giTone"
      />
    </section>

    <section class="diet-layout section-spacer">
      <div class="stack">
        <div ref="formPanel" class="surface-card form-panel">
          <div class="card-head">
            <div class="card-heading">
              <h3>{{ editId ? '编辑饮食记录' : '记录一餐' }}</h3>
              <p>填写食物与营养数据后会同步更新今日汇总</p>
            </div>
            <el-button v-if="editId" link type="primary" @click="cancelEdit">取消编辑</el-button>
          </div>
          <el-form ref="formRef" :model="form" label-position="top" class="diet-form">
            <div class="form-grid main">
              <el-form-item label="食物名称" required>
                <el-input v-model="form.food_name" placeholder="如：杂粮饭、清蒸鱼" />
              </el-form-item>
              <el-form-item label="餐别" required>
                <el-select v-model="form.meal_type">
                  <el-option label="早餐" value="早餐" />
                  <el-option label="午餐" value="午餐" />
                  <el-option label="晚餐" value="晚餐" />
                  <el-option label="加餐" value="加餐" />
                </el-select>
              </el-form-item>
              <el-form-item label="进食时间" required>
                <el-date-picker
                  v-model="form.eaten_at"
                  type="datetime"
                  format="YYYY-MM-DD HH:mm"
                  value-format="YYYY-MM-DD HH:mm:ss"
                  placeholder="选择时间"
                />
              </el-form-item>
            </div>
            <div class="form-grid nutrition-grid">
              <el-form-item label="热量 (kcal)">
                <el-input-number v-model="form.calories" :min="0" controls-position="right" />
              </el-form-item>
              <el-form-item label="碳水 (g)">
                <el-input-number v-model="form.carbs" :min="0" controls-position="right" />
              </el-form-item>
              <el-form-item label="蛋白质 (g)">
                <el-input-number v-model="form.protein" :min="0" controls-position="right" />
              </el-form-item>
              <el-form-item label="脂肪 (g)">
                <el-input-number v-model="form.fat" :min="0" controls-position="right" />
              </el-form-item>
              <el-form-item label="GI 值">
                <el-input-number v-model="form.gi_value" :min="0" :max="100" controls-position="right" />
              </el-form-item>
              <el-form-item label="份数">
                <el-input-number v-model="form.portion" :min="0" :step="0.5" controls-position="right" />
              </el-form-item>
            </div>
            <div class="form-actions">
              <el-button type="primary" :loading="submitting" @click="submit">
                {{ editId ? '保存修改' : '保存记录' }}
              </el-button>
            </div>
          </el-form>
        </div>

        <div class="surface-card records-panel">
          <div class="card-head">
            <div class="card-heading">
              <h3>饮食记录</h3>
              <p>最近 {{ dietStore.records.length }} 条记录</p>
            </div>
          </div>
          <div class="table-wrap">
            <el-table :data="dietStore.records" v-loading="loading">
              <el-table-column label="食物" min-width="150">
                <template #default="{ row }">
                  <div class="food-cell">
                    <span>{{ row.food_name.slice(0, 1) }}</span>
                    <div>
                      <strong>{{ row.food_name }}</strong>
                      <small>{{ row.meal_type || '未分类' }} · {{ formatDateTime(row.eaten_at) }}</small>
                    </div>
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="热量" min-width="90">
                <template #default="{ row }">{{ row.calories ?? '--' }} kcal</template>
              </el-table-column>
              <el-table-column label="碳水" min-width="80">
                <template #default="{ row }">{{ row.carbs ?? '--' }} g</template>
              </el-table-column>
              <el-table-column label="GI" min-width="90">
                <template #default="{ row }">
                  <span v-if="row.gi_value != null" :class="['gi-pill', giClass(row.gi_value)]">
                    {{ row.gi_value }}
                  </span>
                  <span v-else class="muted">--</span>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="126" fixed="right" align="right">
                <template #default="{ row }">
                  <el-button type="primary" link @click="editRecord(row)">编辑</el-button>
                  <el-button type="danger" link @click="removeRecord(row.id)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </div>

      <div class="stack">
        <div class="surface-card recommendation-panel">
          <div class="card-head">
            <div class="card-heading">
              <h3>膳食推荐</h3>
              <p>可切换餐次查看低 GI 选择</p>
            </div>
            <el-radio-group v-model="mealType" size="small" @change="loadRecommend">
              <el-radio-button value="早餐">早餐</el-radio-button>
              <el-radio-button value="午餐">午餐</el-radio-button>
              <el-radio-button value="晚餐">晚餐</el-radio-button>
            </el-radio-group>
          </div>
          <div class="recommendation-list">
            <DietCard
              v-for="item in dietStore.recommendations"
              :key="String(item.name || item.food_name)"
              :item="item"
            />
            <el-empty
              v-if="!dietStore.recommendations.length"
              description="暂无推荐内容"
              :image-size="64"
            />
          </div>
        </div>

        <div class="surface-card nutrition-panel">
          <div class="card-head">
            <div class="card-heading">
              <h3>今日营养结构</h3>
              <p>{{ dietStore.dailyNutrition?.date || '今天' }}</p>
            </div>
          </div>
          <div class="macro-chart">
            <div class="macro-total">
              <strong>{{ formatNumber(dietStore.dailyNutrition?.total_calories, 0) }}</strong>
              <span>kcal</span>
            </div>
            <div class="macro-bars">
              <div>
                <span>碳水</span>
                <i><b :style="{ width: percentage('total_carbs', 250) }" /></i>
                <strong>{{ formatNumber(dietStore.dailyNutrition?.total_carbs) }} g</strong>
              </div>
              <div>
                <span>蛋白质</span>
                <i><b :style="{ width: percentage('total_protein', 100) }" /></i>
                <strong>{{ formatNumber(dietStore.dailyNutrition?.total_protein) }} g</strong>
              </div>
              <div>
                <span>脂肪</span>
                <i><b :style="{ width: percentage('total_fat', 70) }" /></i>
                <strong>{{ formatNumber(dietStore.dailyNutrition?.total_fat) }} g</strong>
              </div>
            </div>
          </div>
          <div class="nutrition-note">
            <el-icon><InfoFilled /></el-icon>
            <span>{{ dietStore.dailyNutrition?.carb_status || '记录饮食后生成营养判断' }}</span>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import {
  DataAnalysis,
  Food,
  InfoFilled,
  Lightning,
  Plus,
  Refresh,
  Sugar,
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox, type FormInstance } from 'element-plus'
import PageHeader from '../components/PageHeader.vue'
import MetricCard from '../components/MetricCard.vue'
import DietCard from '../components/DietCard.vue'
import { usePatientStore } from '../stores/patient'
import { useDietStore } from '../stores/diet'
import { dietApi } from '../api/diet'
import { formatDateTime } from '../utils/date'
import type { DietRecord } from '../types'

const patientStore = usePatientStore()
const dietStore = useDietStore()
const mealType = ref('早餐')
const formRef = ref<FormInstance>()
const editId = ref<number | null>(null)
const submitting = ref(false)
const loading = ref(false)
const formPanel = ref<HTMLElement>()

const defaultForm = () => ({
  food_name: '',
  meal_type: '早餐',
  eaten_at: '',
  calories: null as number | null,
  portion: 1,
  carbs: null as number | null,
  protein: null as number | null,
  fat: null as number | null,
  gi_value: null as number | null,
})

const form = ref(defaultForm())

const giTone = computed<'teal' | 'amber' | 'coral'>(() => {
  const gi = Number(dietStore.dailyNutrition?.avg_gi || 0)
  if (!gi) return 'teal'
  if (gi <= 55) return 'teal'
  if (gi <= 70) return 'amber'
  return 'coral'
})

const giTrend = computed(() => {
  const gi = Number(dietStore.dailyNutrition?.avg_gi || 0)
  if (!gi) return ''
  if (gi <= 55) return '低 GI'
  if (gi <= 70) return '中等'
  return '偏高'
})

function formatNumber(value: unknown, digits = 1) {
  const number = Number(value)
  if (!Number.isFinite(number)) return '--'
  return number.toFixed(digits)
}

function percentage(key: string, target: number) {
  const value = Number(dietStore.dailyNutrition?.[key as keyof typeof dietStore.dailyNutrition] || 0)
  return `${Math.min(100, Math.max(4, (value / target) * 100))}%`
}

function giClass(gi: number) {
  if (gi <= 55) return 'low'
  if (gi <= 70) return 'medium'
  return 'high'
}

async function loadPage() {
  if (!patientStore.currentPatient) return
  loading.value = true
  const patientId = patientStore.currentPatient.id
  try {
    await Promise.all([
      dietStore.fetchDaily(patientId),
      dietStore.fetchRecords(patientId),
      dietStore.fetchRecommend(mealType.value, patientId),
    ])
  } finally {
    loading.value = false
  }
}

async function loadRecommend() {
  if (!patientStore.currentPatient) return
  await dietStore.fetchRecommend(mealType.value, patientStore.currentPatient.id)
}

function focusForm() {
  cancelEdit()
  formPanel.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function editRecord(row: DietRecord) {
  editId.value = row.id
  form.value = {
    food_name: row.food_name,
    meal_type: row.meal_type || '早餐',
    eaten_at: row.eaten_at,
    calories: row.calories,
    portion: row.portion ?? 1,
    carbs: row.carbs,
    protein: row.protein,
    fat: row.fat,
    gi_value: row.gi_value,
  }
  formPanel.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function cancelEdit() {
  editId.value = null
  form.value = defaultForm()
  formRef.value?.clearValidate()
}

async function submit() {
  if (!patientStore.currentPatient) {
    ElMessage.warning('请先选择患者')
    return
  }
  if (!formRef.value) return
  try {
    await formRef.value.validate()
  } catch {
    return
  }
  if (!form.value.food_name.trim() || !form.value.eaten_at) {
    ElMessage.warning('请填写食物名称和进食时间')
    return
  }

  submitting.value = true
  try {
    const payload = { ...form.value, note: null }
    if (editId.value) {
      await dietApi.update(editId.value, payload)
      ElMessage.success('饮食记录已更新')
    } else {
      await dietApi.create({ patient_id: patientStore.currentPatient.id, ...payload })
      ElMessage.success('饮食记录已保存')
    }
    cancelEdit()
    await loadPage()
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '保存失败')
  } finally {
    submitting.value = false
  }
}

async function removeRecord(id: number) {
  try {
    await ElMessageBox.confirm('确定删除这条饮食记录吗？', '删除确认', {
      type: 'warning',
      confirmButtonText: '删除',
      cancelButtonText: '取消',
    })
    await dietApi.remove(id)
    ElMessage.success('饮食记录已删除')
    await loadPage()
  } catch (error) {
    if (error !== 'cancel' && error !== 'close') ElMessage.error('删除失败')
  }
}

onMounted(loadPage)
watch(() => patientStore.currentPatient?.id, loadPage)
</script>

<style scoped>
.diet-layout {
  display: grid;
  min-width: 0;
  grid-template-columns: minmax(0, 1.55fr) minmax(330px, 0.75fr);
  gap: 18px;
}

.form-panel,
.records-panel,
.recommendation-panel,
.nutrition-panel {
  min-width: 0;
  padding: 18px;
}

.diet-form {
  margin-top: 18px;
}

.form-grid {
  display: grid;
  min-width: 0;
  gap: 12px;
}

.form-grid.main {
  grid-template-columns: 1.2fr 0.7fr 1fr;
}

.form-grid.nutrition-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.diet-form :deep(.el-input-number),
.diet-form :deep(.el-select),
.diet-form :deep(.el-date-editor) {
  width: 100%;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  padding-top: 4px;
}

.form-actions .el-button {
  min-width: 130px;
  min-height: 38px;
}

.table-wrap {
  width: 100%;
  min-width: 0;
  margin-top: 16px;
  overflow-x: auto;
}

.food-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.food-cell > span {
  display: grid;
  width: 34px;
  height: 34px;
  flex: 0 0 34px;
  place-items: center;
  color: var(--brand);
  background: var(--brand-soft);
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
}

.food-cell > div {
  display: flex;
  min-width: 0;
  flex-direction: column;
}

.food-cell strong {
  color: var(--ink);
  font-size: 13px;
}

.food-cell small {
  margin-top: 3px;
  color: var(--muted);
  font-size: 10px;
}

.gi-pill {
  display: inline-flex;
  min-width: 34px;
  justify-content: center;
  padding: 3px 7px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 700;
}

.gi-pill.low {
  color: #4d7c0f;
  background: #f1f9df;
}

.gi-pill.medium {
  color: #b45309;
  background: #fff5df;
}

.gi-pill.high {
  color: #c63e37;
  background: #fff0ee;
}

.recommendation-panel {
  min-height: 408px;
}

.recommendation-list {
  margin-top: 8px;
}

.macro-chart {
  display: grid;
  grid-template-columns: 108px minmax(0, 1fr);
  align-items: center;
  gap: 16px;
  margin-top: 22px;
}

.macro-total {
  display: grid;
  width: 104px;
  height: 104px;
  place-content: center;
  text-align: center;
  background: #102a2e;
  border-radius: 50%;
  box-shadow: inset 0 0 0 12px #18383c;
}

.macro-total strong {
  color: #fff;
  font-size: 21px;
}

.macro-total span {
  color: #85a3a1;
  font-size: 10px;
}

.macro-bars {
  display: grid;
  gap: 13px;
}

.macro-bars > div {
  display: grid;
  grid-template-columns: 42px minmax(40px, 1fr) 46px;
  align-items: center;
  gap: 7px;
  color: var(--muted);
  font-size: 10px;
}

.macro-bars i {
  height: 6px;
  overflow: hidden;
  background: #e8efed;
  border-radius: 999px;
}

.macro-bars b {
  display: block;
  height: 100%;
  background: #0f766e;
  border-radius: inherit;
}

.macro-bars strong {
  color: var(--ink-soft);
  font-size: 11px;
  text-align: right;
}

.nutrition-note {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-top: 22px;
  padding: 11px;
  color: #5d7472;
  background: var(--surface-soft);
  border: 1px solid var(--line);
  border-radius: 7px;
  font-size: 11px;
  line-height: 1.5;
}

.nutrition-note .el-icon {
  flex: 0 0 auto;
  margin-top: 1px;
  color: var(--brand);
}

@media (max-width: 1220px) {
  .diet-layout {
    grid-template-columns: minmax(0, 1fr);
  }
}

@media (max-width: 720px) {
  .form-grid.main,
  .form-grid.nutrition-grid {
    grid-template-columns: 1fr;
  }

  .recommendation-panel .card-head {
    align-items: flex-start;
    flex-direction: column;
  }
}

@media (max-width: 520px) {
  .macro-chart {
    grid-template-columns: 1fr;
  }
}
</style>
