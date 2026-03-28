<script setup>
import { ref, onMounted } from 'vue'
import request from '@/api/request'
import { ElMessage, ElMessageBox } from 'element-plus'

const packages = ref([])
const loading = ref(false)
const dialogVisible = ref(false)
const form = ref({ name: '', category: '', price: '', description: '', suitable_for: '' })

const loadData = async () => {
  loading.value = true
  try {
    const data = await request.get('/packages/')
    packages.value = data.list || data
  } catch (e) {} finally { loading.value = false }
}

const handleAdd = () => { form.value = { name: '', price: '', description: '' }; dialogVisible.value = true }
const handleEdit = (row) => { form.value = { ...row }; dialogVisible.value = true }
const handleDelete = async (id) => {
  await ElMessageBox.confirm('确定删除？', '提示')
  await request.delete(`/packages/${id}/`)
  ElMessage.success('删除成功')
  loadData()
}
const handleSubmit = async () => {
  if (form.value.id) {
    await request.put(`/packages/${form.value.id}/`, form.value)
  } else {
    await request.post('/packages/', form.value)
  }
  ElMessage.success('保存成功')
  dialogVisible.value = false
  loadData()
}

onMounted(loadData)
</script>

<template>
  <div class="packages-page">
    <div class="header"><h2>套餐管理</h2><el-button type="primary" @click="handleAdd">新增套餐</el-button></div>
    <el-table :data="packages" v-loading="loading" stripe>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" label="套餐名称" />
      <el-table-column prop="price" label="价格" width="120"><template #default="{row}">¥{{ row.price }}</template></el-table-column>
      <el-table-column prop="sales_count" label="销量" width="100" />
      <el-table-column prop="is_hot" label="热门" width="80"><template #default="{row}"><el-tag v-if="row.is_hot" type="danger">热门</el-tag></template></el-table-column>
      <el-table-column label="操作" width="180">
        <template #default="{row}">
          <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
          <el-button link type="danger" @click="handleDelete(row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" :title="form.id ? '编辑套餐' : '新增套餐'" width="500px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="名称"><el-input v-model="form.name" /></el-form-item>
        <el-form-item label="价格"><el-input-number v-model="form.price" :min="0" /></el-form-item>
        <el-form-item label="适用人群"><el-input v-model="form.suitable_for" /></el-form-item>
        <el-form-item label="描述"><el-input v-model="form.description" type="textarea" rows="3" /></el-form-item>
      </el-form>
      <template #footer><el-button @click="dialogVisible = false">取消</el-button><el-button type="primary" @click="handleSubmit">确定</el-button></template>
    </el-dialog>
  </div>
</template>

<style scoped>
.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
</style>
