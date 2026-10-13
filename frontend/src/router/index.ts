import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'Dashboard', component: () => import('../views/Dashboard.vue'), meta: { title: '健康总览' } },
    { path: '/blood-sugar', name: 'BloodSugar', component: () => import('../views/BloodSugar.vue'), meta: { title: '血糖管理' } },
    { path: '/diet', name: 'DietManage', component: () => import('../views/DietManage.vue'), meta: { title: '饮食管理' } },
    { path: '/medication', name: 'Medication', component: () => import('../views/Medication.vue'), meta: { title: '用药管理' } },
    { path: '/exercise', name: 'Exercise', component: () => import('../views/Exercise.vue'), meta: { title: '运动管理' } },
    { path: '/reports', name: 'HealthReport', component: () => import('../views/HealthReport.vue'), meta: { title: '健康报告' } },
    { path: '/chat', name: 'AIChat', component: () => import('../views/AIChat.vue'), meta: { title: 'AI 健康助手' } },
    { path: '/patients', name: 'PatientManage', component: () => import('../views/PatientManage.vue'), meta: { title: '患者档案' } },
  ],
})

export default router
