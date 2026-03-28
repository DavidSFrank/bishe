<script setup>
import { ref, onMounted } from 'vue'
import request from '@/api/request'

const users = ref([])
const loading = ref(false)

const loadData = async () => {
  loading.value = true
  try {
    const data = await request.get('/users/')
    users.value = data.list || data
  } catch (e) {} finally { loading.value = false }
}

onMounted(loadData)
</script>

<template>
  <div class="users-page">
    <h2>用户管理</h2>
    <el-table :data="users" v-loading="loading" stripe>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="nickname" label="昵称" />
      <el-table-column prop="phone" label="手机号" width="130" />
      <el-table-column prop="real_name" label="姓名" width="100" />
      <el-table-column prop="gender" label="性别" width="80"><template #default="{row}">{{ row.gender === 1 ? '男' : row.gender === 2 ? '女' : '未知' }}</template></el-table-column>
      <el-table-column prop="created_at" label="注册时间" width="180" />
      <el-table-column prop="is_active" label="状态" width="80"><template #default="{row}"><el-tag :type="row.is_active ? 'success' : 'danger'">{{ row.is_active ? '正常' : '禁用' }}</el-tag></template></el-table-column>
    </el-table>
  </div>
</template>

<style scoped>h2 { margin-bottom: 20px; }</style>
