<template>
  <header class="navbar">
    <div class="navbar-left">
      <button class="menu-toggle" type="button" aria-label="打开导航" @click="$emit('toggle-sidebar')">
        <el-icon :size="20"><Menu /></el-icon>
      </button>
      <div class="route-copy">
        <span>当前视图</span>
        <strong>{{ route.meta.title || '健康总览' }}</strong>
      </div>
    </div>

    <div class="navbar-right">
      <div class="today">
        <span>{{ dateText.weekday }}</span>
        <strong>{{ dateText.date }}</strong>
      </div>
      <div class="navbar-divider" />
      <el-select
        v-model="selectedPatient"
        class="patient-select"
        placeholder="选择患者"
        :disabled="!patientStore.patients.length"
        @change="onPatientChange"
      >
        <template #prefix>
          <el-icon><UserFilled /></el-icon>
        </template>
        <el-option v-for="patient in patientStore.patients" :key="patient.id" :label="patient.name" :value="patient.id">
          <div class="patient-option">
            <span class="option-avatar">{{ patient.name.slice(0, 1) }}</span>
            <span>{{ patient.name }}</span>
            <small>{{ patient.diabetes_type }}</small>
          </div>
        </el-option>
      </el-select>
      <div class="user-avatar">
        {{ patientStore.currentPatient?.name?.slice(0, 1) || '糖' }}
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { Menu, UserFilled } from '@element-plus/icons-vue'
import { usePatientStore } from '../stores/patient'

defineEmits<{ 'toggle-sidebar': [] }>()

const route = useRoute()
const patientStore = usePatientStore()
const selectedPatient = ref<number | undefined>()

const now = new Date()
const dateText = {
  weekday: new Intl.DateTimeFormat('zh-CN', { weekday: 'long' }).format(now),
  date: new Intl.DateTimeFormat('zh-CN', { month: 'long', day: 'numeric' }).format(now),
}

onMounted(async () => {
  await patientStore.fetchPatients()
  selectedPatient.value = patientStore.currentPatient?.id
})

function onPatientChange(id: number) {
  const patient = patientStore.patients.find((item) => item.id === id)
  if (patient) patientStore.selectPatient(patient)
}
</script>

<style scoped>
.navbar {
  position: sticky;
  z-index: 20;
  top: 0;
  display: flex;
  height: 76px;
  align-items: center;
  justify-content: space-between;
  padding: 0 28px;
  background: rgba(247, 250, 249, 0.9);
  border-bottom: 1px solid rgba(16, 42, 46, 0.08);
  backdrop-filter: blur(14px);
}

.navbar-left,
.navbar-right {
  display: flex;
  align-items: center;
}

.menu-toggle {
  display: none;
  width: 40px;
  height: 40px;
  margin-right: 12px;
  color: var(--ink);
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 8px;
  cursor: pointer;
}

.route-copy {
  display: flex;
  flex-direction: column;
}

.route-copy span {
  color: var(--muted);
  font-size: 11px;
}

.route-copy strong {
  margin-top: 2px;
  color: var(--ink);
  font-size: 16px;
}

.navbar-right {
  gap: 16px;
}

.today {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.today span {
  color: var(--muted);
  font-size: 11px;
}

.today strong {
  margin-top: 2px;
  color: var(--ink);
  font-size: 13px;
  font-weight: 600;
}

.navbar-divider {
  width: 1px;
  height: 28px;
  background: var(--line);
}

.patient-select {
  width: 178px;
}

.patient-option {
  display: flex;
  width: 100%;
  min-height: 34px;
  align-items: center;
  gap: 8px;
  line-height: 1.2;
}

.patient-option > span:not(.option-avatar),
.patient-option small {
  display: inline-flex;
  align-items: center;
  line-height: 1.2;
}

.patient-option small {
  margin-left: auto;
  color: #849795;
  font-size: 10px;
}

.option-avatar,
.user-avatar {
  display: grid;
  place-items: center;
  color: #0d5e58;
  background: #dff7f2;
  border: 1px solid #bce9e1;
  border-radius: 50%;
  font-weight: 700;
}

.option-avatar {
  width: 24px;
  height: 24px;
  flex: 0 0 24px;
  line-height: 1;
  font-size: 11px;
  text-align: center;
}

.user-avatar {
  width: 40px;
  height: 40px;
  font-size: 15px;
}

@media (max-width: 960px) {
  .navbar {
    height: 68px;
    padding: 0 16px;
  }

  .menu-toggle {
    display: inline-flex;
  }

  .route-copy span,
  .today,
  .navbar-divider {
    display: none;
  }

  .patient-select {
    width: 132px;
  }

  .user-avatar {
    display: none;
  }
}
</style>
