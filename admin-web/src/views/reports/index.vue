<script setup>
import { ref, onMounted } from 'vue'
import request from '@/api/request'
import { ElMessage } from 'element-plus'

const reports = ref([])
const loading = ref(false)
const dialogVisible = ref(false)
const form = ref({ appointment: '', result_summary: '', doctor: '', report_date: '', file_url: '' })

const loadData = async () => {
  loading.value = true
  try {
    const data = await request.get('/reports/')
    reports.value = data.list || data
  } catch (e) {} finally { loading.value = false }
}

const handleAdd = () => { form.value = { appointment: '', result_summary: '', doctor: '', report_date: '', file_url: '' }; dialogVisible.value = true }
const handleEdit = (row) => { form.value = { ...row }; dialogVisible.value = true }
const handleSubmit = async () => {
  if (form.value.id) await request.put(`/reports/${form.value.id}/`, form.value)
  else await request.post('/reports/', form.value)
  ElMessage.success('保存成功')
  dialogVisible.value = false
  loadData()
}

const handleUpload = async ({ file }) => {
  const formData = new FormData()
  formData.append('file', file)
  const data = await request.post('/users/upload/', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
  form.value.file_url = data.url
  ElMessage.success('上传成功')
}

onMounted(loadData)
</script>

<template>
  <div class="reports-page">
    <div class="header"><h2>报告管理</h2><el-button type="primary" @click="handleAdd">录入报告</el-button></div>
    <el-table :data="reports" v-loading="loading" stripe>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="appointment.name" label="体检人" width="100" />
      <el-table-column prop="report_date" label="报告日期" width="120" />
      <el-table-column prop="doctor" label="报告医生" width="100" />
      <el-table-column prop="result_summary" label="结果摘要" show-overflow-tooltip />
      <el-table-column label="操作" width="120"><template #default="{row}"><el-button link type="primary" @click="handleEdit(row)">编辑</el-button></template></el-table-column>
    </el-table>
    <el-dialog v-model="dialogVisible" :title="form.id ? '编辑报告' : '录入报告'" width="500px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="预约ID"><el-input v-model="form.appointment" /></el-form-item>
        <el-form-item label="医生"><el-input v-model="form.doctor" /></el-form-item>
        <el-form-item label="报告日期"><el-date-picker v-model="form.report_date" type="date" value-format="YYYY-MM-DD" /></el-form-item>
        <el-form-item label="报告文件">
          <el-upload :show-file-list="false" :http-request="handleUpload">
            <el-button type="primary">上传文件</el-button>
          </el-upload>
          <div class="file-url" v-if="form.file_url">{{ form.file_url }}</div>
        </el-form-item>
        <el-form-item label="结果摘要"><el-input v-model="form.result_summary" type="textarea" rows="4" /></el-form-item>
      </el-form>
      <template #footer><el-button @click="dialogVisible = false">取消</el-button><el-button type="primary" @click="handleSubmit">确定</el-button></template>
    </el-dialog>
  </div>
</template>

<style scoped>
.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.file-url { margin-top: 8px; color: #666; word-break: break-all; }
</style>
