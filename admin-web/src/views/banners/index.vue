<script setup>
import { ref, onMounted } from 'vue'
import request from '@/api/request'
import { ElMessage, ElMessageBox } from 'element-plus'

const banners = ref([])
const loading = ref(false)
const dialogVisible = ref(false)
const form = ref({ title: '', image: '', link: '', sort_order: 0, is_active: true })

const loadData = async () => {
  loading.value = true
  try {
    const data = await request.get('/articles/banners/')
    banners.value = data.list || data
  } catch (e) {} finally { loading.value = false }
}

const handleAdd = () => { form.value = { title: '', image: '', link: '', sort_order: 0, is_active: true }; dialogVisible.value = true }
const handleEdit = (row) => { form.value = { ...row }; dialogVisible.value = true }
const handleDelete = async (id) => {
  await ElMessageBox.confirm('确定删除？', '提示')
  await request.delete(`/articles/banners/${id}/`)
  ElMessage.success('删除成功')
  loadData()
}
const handleSubmit = async () => {
  if (form.value.id) {
    await request.put(`/articles/banners/${form.value.id}/`, form.value)
  } else {
    await request.post('/articles/banners/', form.value)
  }
  ElMessage.success('保存成功')
  dialogVisible.value = false
  loadData()
}

onMounted(loadData)
</script>

<template>
  <div class="banners-page">
    <div class="header"><h2>轮播图管理</h2><el-button type="primary" @click="handleAdd">新增轮播图</el-button></div>
    <el-table :data="banners" v-loading="loading" stripe>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="title" label="标题" />
      <el-table-column prop="image" label="图片" width="200">
        <template #default="{row}"><el-image :src="row.image" style="width: 120px; height: 60px" fit="cover" /></template>
      </el-table-column>
      <el-table-column prop="sort_order" label="排序" width="100" />
      <el-table-column prop="is_active" label="状态" width="100">
        <template #default="{row}">
          <el-tag :type="row.is_active ? 'success' : 'danger'">{{ row.is_active ? '启用' : '禁用' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="160">
        <template #default="{row}">
          <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
          <el-button link type="danger" @click="handleDelete(row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" :title="form.id ? '编辑轮播图' : '新增轮播图'" width="520px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="标题"><el-input v-model="form.title" /></el-form-item>
        <el-form-item label="图片URL"><el-input v-model="form.image" /></el-form-item>
        <el-form-item label="跳转链接"><el-input v-model="form.link" /></el-form-item>
        <el-form-item label="排序"><el-input-number v-model="form.sort_order" :min="0" /></el-form-item>
        <el-form-item label="启用"><el-switch v-model="form.is_active" /></el-form-item>
      </el-form>
      <template #footer><el-button @click="dialogVisible = false">取消</el-button><el-button type="primary" @click="handleSubmit">确定</el-button></template>
    </el-dialog>
  </div>
</template>

<style scoped>
.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
</style>
