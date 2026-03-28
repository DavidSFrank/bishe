<script setup>
import { ref, onMounted } from 'vue'
import request from '@/api/request'
import { ElMessage, ElMessageBox } from 'element-plus'

const consultations = ref([])
const loading = ref(false)
const dialogVisible = ref(false)
const form = ref({ id: '', reply: '' })

const statusMap = {
  0: { label: '待回复', type: 'warning' },
  1: { label: '已回复', type: 'success' }
}

const loadData = async () => {
  loading.value = true
  try {
    const data = await request.get('/articles/consultations/')
    consultations.value = data.list || data
  } catch (e) {} finally { loading.value = false }
}

const handleReply = (row) => {
  form.value = { id: row.id, reply: row.reply || '' }
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!form.value.reply.trim()) {
    ElMessage.error('请输入回复内容')
    return
  }
  await request.put(`/articles/consultations/${form.value.id}/`, { reply: form.value.reply })
  ElMessage.success('回复已保存')
  dialogVisible.value = false
  loadData()
}

const handleDelete = async (id) => {
  await ElMessageBox.confirm('确定删除该咨询？', '提示', { type: 'warning' })
  await request.delete(`/articles/consultations/${id}/`)
  ElMessage.success('已删除')
  loadData()
}

onMounted(loadData)
</script>

<template>
  <div class="consultations-page">
    <div class="header"><h2>在线咨询</h2></div>
    <el-table :data="consultations" v-loading="loading" stripe>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column label="用户" width="160">
        <template #default="{ row }">
          <div>{{ row.user_info?.nickname || '用户' }}</div>
          <div class="sub">{{ row.user_info?.phone || '未绑定手机' }}</div>
        </template>
      </el-table-column>
      <el-table-column prop="content" label="咨询内容" show-overflow-tooltip />
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="statusMap[row.status]?.type">{{ statusMap[row.status]?.label }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="reply" label="回复内容" show-overflow-tooltip />
      <el-table-column prop="created_at" label="提交时间" width="160" />
      <el-table-column label="操作" width="140">
        <template #default="{ row }">
          <el-button link type="primary" @click="handleReply(row)">回复</el-button>
          <el-button link type="danger" @click="handleDelete(row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" title="回复咨询" width="500px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="回复内容">
          <el-input v-model="form.reply" type="textarea" rows="4" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.sub { font-size: 12px; color: #999; }
</style>
