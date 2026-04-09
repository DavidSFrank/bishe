<script setup>
import { ref, onMounted } from 'vue'
import request from '@/api/request'
import { ElMessage, ElMessageBox } from 'element-plus'
import { usePagedList } from '@/composables/usePagedList'

const { list: categories, loading, total, page, pageSize, setPagedResult } = usePagedList(10)
const dialogVisible = ref(false)
const form = ref({ name: '', description: '', icon: '', sort_order: 0, is_active: true })

const loadData = async () => {
  loading.value = true
  try {
    const data = await request.get('/packages/categories/', {
      params: {
        page: page.value,
        page_size: pageSize.value
      }
    })
    setPagedResult(data)
  } catch (e) {} finally { loading.value = false }
}

const handleAdd = () => { form.value = { name: '', description: '', icon: '', sort_order: 0, is_active: true }; dialogVisible.value = true }
const handleEdit = (row) => { form.value = { ...row }; dialogVisible.value = true }
const handleDelete = async (id) => {
  await ElMessageBox.confirm('确定删除？', '提示')
  await request.delete(`/packages/categories/${id}/`)
  ElMessage.success('删除成功')
  loadData()
}
const handleSubmit = async () => {
  if (form.value.id) {
    await request.put(`/packages/categories/${form.value.id}/`, form.value)
  } else {
    await request.post('/packages/categories/', form.value)
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

onMounted(loadData)
</script>

<template>
  <div class="categories-page">
    <div class="header"><h2>分类管理</h2><el-button type="primary" @click="handleAdd">新增分类</el-button></div>
    <el-table :data="categories" v-loading="loading" stripe>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" label="分类名称" />
      <el-table-column label="关联套餐" min-width="240">
        <template #default="{row}">
          <div class="pkg-meta">共 {{ row.package_count || 0 }} 个</div>
          <div class="pkg-names" v-if="row.package_names && row.package_names.length">
            {{ row.package_names.join('、') }}
          </div>
          <div class="pkg-empty" v-else>暂无套餐</div>
        </template>
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

    <el-dialog v-model="dialogVisible" :title="form.id ? '编辑分类' : '新增分类'" width="500px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="名称"><el-input v-model="form.name" /></el-form-item>
        <el-form-item label="描述"><el-input v-model="form.description" /></el-form-item>
        <el-form-item label="图标"><el-input v-model="form.icon" placeholder="可填写emoji或图标类名" /></el-form-item>
        <el-form-item label="排序"><el-input-number v-model="form.sort_order" :min="0" /></el-form-item>
        <el-form-item label="启用"><el-switch v-model="form.is_active" /></el-form-item>
      </el-form>
      <template #footer><el-button @click="dialogVisible = false">取消</el-button><el-button type="primary" @click="handleSubmit">确定</el-button></template>
    </el-dialog>
  </div>
</template>

<style scoped>
.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.pager { margin-top: 16px; display: flex; justify-content: flex-end; }
.pkg-meta { font-size: 12px; color: #666; }
.pkg-names { margin-top: 4px; color: #333; }
.pkg-empty { margin-top: 4px; color: #999; }
</style>
