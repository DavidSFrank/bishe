<script setup>
import { ref, onMounted } from 'vue'
import request from '@/api/request'
import { ElMessage, ElMessageBox } from 'element-plus'

const appointments = ref([])
const loading = ref(false)
const statusOptions = [
  { value: 0, label: '待审核', type: 'warning' },
  { value: 1, label: '已确认', type: 'primary' },
  { value: 2, label: '已完成', type: 'success' },
  { value: 3, label: '已取消', type: 'info' },
  { value: 4, label: '已拒绝', type: 'danger' }
]

const loadData = async () => {
  loading.value = true
  try {
    const data = await request.get('/appointments/')
    appointments.value = data.list || data
  } catch (e) {} finally { loading.value = false }
}

const handleApprove = async (id) => {
  await request.put(`/appointments/${id}/`, { status: 1 })
  ElMessage.success('已确认')
  loadData()
}

const handleReject = async (id) => {
  const { value } = await ElMessageBox.prompt('请输入拒绝原因', '提示')
  await request.put(`/appointments/${id}/`, { status: 4, reject_reason: value })
  ElMessage.success('已拒绝')
  loadData()
}

onMounted(loadData)
</script>

<template>
  <div class="appointments-page">
    <h2>预约管理</h2>
    <el-table :data="appointments" v-loading="loading" stripe>
      <el-table-column prop="order_no" label="订单号" width="180" />
      <el-table-column prop="name" label="体检人" width="100" />
      <el-table-column prop="phone" label="电话" width="130" />
      <el-table-column prop="appointment_date" label="预约日期" width="120" />
      <el-table-column prop="time_slot" label="时段" width="100" />
      <el-table-column prop="amount" label="金额" width="100"><template #default="{row}">¥{{ row.amount }}</template></el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{row}">
          <el-tag :type="statusOptions.find(s => s.value === row.status)?.type">{{ statusOptions.find(s => s.value === row.status)?.label }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150">
        <template #default="{row}">
          <template v-if="row.status === 0">
            <el-button link type="success" @click="handleApprove(row.id)">确认</el-button>
            <el-button link type="danger" @click="handleReject(row.id)">拒绝</el-button>
          </template>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<style scoped>h2 { margin-bottom: 20px; }</style>
