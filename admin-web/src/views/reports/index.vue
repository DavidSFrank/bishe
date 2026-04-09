<script setup>
import { ref, onMounted } from 'vue'
import request from '@/api/request'
import { ElMessage } from 'element-plus'
import { usePagedList } from '@/composables/usePagedList'

const { list: reports, loading, total, page, pageSize, setPagedResult } = usePagedList(10)
const dialogVisible = ref(false)
const form = ref({ appointment: '', result_summary: '', doctor: '', report_date: '', file_url: '' })
const appointmentOptions = ref([])
const appointmentKeyword = ref('')
const appointmentLoading = ref(false)

const loadData = async () => {
  loading.value = true
  try {
    const data = await request.get('/reports/', {
      params: {
        page: page.value,
        page_size: pageSize.value
      }
    })
    setPagedResult(data)
  } catch (e) {} finally { loading.value = false }
}

const loadAppointmentOptions = async (keyword = '') => {
  appointmentLoading.value = true
  try {
    const data = await request.get('/reports/appointment-options/', { params: { keyword } })
    appointmentOptions.value = Array.isArray(data) ? data : []
  } catch (e) {
    appointmentOptions.value = []
  } finally {
    appointmentLoading.value = false
  }
}

const formatAppointmentLabel = (item) => {
  return `${item.order_no} | ${item.name} | ${item.phone} | ${item.package_name} | ${item.appointment_date} ${item.time_slot}`
}

const onAppointmentSearch = (keyword) => {
  appointmentKeyword.value = keyword || ''
  loadAppointmentOptions(appointmentKeyword.value)
}

const handleAdd = async () => {
  form.value = { appointment: '', result_summary: '', doctor: '', report_date: '', file_url: '' }
  dialogVisible.value = true
  await loadAppointmentOptions('')
}

const handleEdit = async (row) => {
  form.value = {
    ...row,
    appointment: row.appointment?.id || row.appointment
  }
  dialogVisible.value = true
  await loadAppointmentOptions('')
}

const handleSubmit = async () => {
  const payload = {
    appointment: form.value.appointment,
    doctor: form.value.doctor,
    report_date: form.value.report_date,
    file_url: form.value.file_url,
    result_summary: form.value.result_summary
  }
  if (form.value.id) await request.patch(`/reports/${form.value.id}/`, payload)
  else await request.post('/reports/', payload)
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

const onPageChange = (nextPage) => {
  page.value = nextPage
  loadData()
}

const onSizeChange = (nextSize) => {
  pageSize.value = nextSize
  page.value = 1
  loadData()
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

    <div class="pager">
      <el-pagination
        background
        layout="total, sizes, prev, pager, next"
        :total="total"
        :current-page="page"
        :page-size="pageSize"
        :page-sizes="[10, 20, 50]"
        @current-change="onPageChange"
        @size-change="onSizeChange"
      />
    </div>

    <el-dialog v-model="dialogVisible" :title="form.id ? '编辑报告' : '录入报告'" width="500px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="关联预约">
          <el-select
            v-model="form.appointment"
            filterable
            remote
            reserve-keyword
            :remote-method="onAppointmentSearch"
            :loading="appointmentLoading"
            placeholder="输入姓名/手机号/订单号搜索"
            style="width: 100%"
          >
            <el-option
              v-for="item in appointmentOptions"
              :key="item.id"
              :label="formatAppointmentLabel(item)"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
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
.pager { margin-top: 16px; display: flex; justify-content: flex-end; }
</style>
