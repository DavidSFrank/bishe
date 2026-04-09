<script setup>
import { ref, onMounted } from 'vue'
import request from '@/api/request'
import { ElMessage, ElMessageBox } from 'element-plus'
import { usePagedList } from '@/composables/usePagedList'

const { list: packages, loading, total, page, pageSize, setPagedResult } = usePagedList(10)
const dialogVisible = ref(false)
const form = ref({ name: '', category: null, price: '', description: '', suitable_for: '' })
const categoryOptions = ref([])

const loadData = async () => {
  loading.value = true
  try {
    const data = await request.get('/packages/', {
      params: {
        page: page.value,
        page_size: pageSize.value
      }
    })
    setPagedResult(data)
  } catch (e) {} finally { loading.value = false }
}

const loadCategories = async () => {
  try {
    const data = await request.get('/packages/categories/', { params: { page_size: 200 } })
    categoryOptions.value = Array.isArray(data?.list) ? data.list : (Array.isArray(data) ? data : [])
  } catch (e) {
    categoryOptions.value = []
  }
}

const handleAdd = () => {
  form.value = { name: '', category: null, price: '', description: '', suitable_for: '' }
  dialogVisible.value = true
}

const handleEdit = (row) => {
  form.value = {
    ...row,
    category: row.category?.id || null
  }
  dialogVisible.value = true
}
const handleDelete = async (id) => {
  await ElMessageBox.confirm('确定删除？', '提示')
  await request.delete(`/packages/${id}/`)
  ElMessage.success('删除成功')
  loadData()
}
const handleSubmit = async () => {
  const payload = {
    name: form.value.name,
    category: form.value.category || null,
    price: form.value.price,
    description: form.value.description,
    suitable_for: form.value.suitable_for
  }
  if (form.value.id) {
    await request.patch(`/packages/${form.value.id}/`, payload)
  } else {
    await request.post('/packages/', payload)
  }
  ElMessage.success('保存成功')
  dialogVisible.value = false
  loadData()
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

onMounted(() => {
  loadData()
  loadCategories()
})
</script>

<template>
  <div class="packages-page">
    <div class="header"><h2>套餐管理</h2><el-button type="primary" @click="handleAdd">新增套餐</el-button></div>
    <el-table :data="packages" v-loading="loading" stripe>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" label="套餐名称" />
      <el-table-column label="所属分类" width="160">
        <template #default="{row}">{{ row.category?.name || '未分类' }}</template>
      </el-table-column>
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

    <el-dialog v-model="dialogVisible" :title="form.id ? '编辑套餐' : '新增套餐'" width="500px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="名称"><el-input v-model="form.name" /></el-form-item>
        <el-form-item label="分类">
          <el-select v-model="form.category" clearable placeholder="请选择分类" style="width: 100%">
            <el-option v-for="item in categoryOptions" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
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
.pager { margin-top: 16px; display: flex; justify-content: flex-end; }
</style>
