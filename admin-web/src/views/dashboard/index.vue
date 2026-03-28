<script setup>
import { ref, onMounted } from 'vue'
import request from '@/api/request'

const stats = ref({ todayAppointments: 0, totalUsers: 0, totalPackages: 0, pendingAppointments: 0 })

onMounted(async () => {
  try {
    const data = await request.get('/users/admin/dashboard/')
    stats.value = data
  } catch (e) {
    console.error(e)
  }
})
</script>

<template>
  <div class="dashboard">
    <h2>控制台</h2>
    <div class="stats-grid">
      <el-card class="stat-card">
        <div class="stat-value">{{ stats.todayAppointments }}</div>
        <div class="stat-label">今日预约</div>
      </el-card>
      <el-card class="stat-card">
        <div class="stat-value">{{ stats.pendingAppointments }}</div>
        <div class="stat-label">待审核</div>
      </el-card>
      <el-card class="stat-card">
        <div class="stat-value">{{ stats.totalUsers }}</div>
        <div class="stat-label">用户总数</div>
      </el-card>
      <el-card class="stat-card">
        <div class="stat-value">{{ stats.totalPackages }}</div>
        <div class="stat-label">套餐数量</div>
      </el-card>
    </div>
  </div>
</template>

<style scoped>
.dashboard h2 { margin-bottom: 20px; }
.stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
.stat-card { text-align: center; padding: 20px; }
.stat-value { font-size: 36px; font-weight: bold; color: #409eff; }
.stat-label { margin-top: 10px; color: #666; }
</style>
