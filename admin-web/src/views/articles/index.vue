<script setup>
import { ref, onMounted } from 'vue'
import request from '@/api/request'
import { ElMessage, ElMessageBox } from 'element-plus'
import { usePagedList } from '@/composables/usePagedList'

const { list: articles, loading, total, page, pageSize, setPagedResult } = usePagedList(10)
const dialogVisible = ref(false)
const form = ref({ title: '', content: '', cover_image: '' })

const loadData = async () => {
  loading.value = true
  try {
    const data = await request.get('/articles/', {
      params: {
        page: page.value,
        page_size: pageSize.value
      }
    })
    setPagedResult(data)
  } finally {
    loading.value = false
  }
}

const handleAdd = () => {
  form.value = { title: '', content: '', cover_image: '' }
  dialogVisible.value = true
}

const handleEdit = (row) => {
  form.value = { ...row }
  dialogVisible.value = true
}

const handleDelete = async (id) => {
  await ElMessageBox.confirm('确定删除？', '提示')
  await request.delete(`/articles/${id}/`)
  ElMessage.success('删除成功')
  loadData()
}

const handleSubmit = async () => {
  if (form.value.id) {
    await request.put(`/articles/${form.value.id}/`, form.value)
  } else {
    await request.post('/articles/', form.value)
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
  <div class="articles-page">
    <div class="header">
      <h2>内容管理</h2>
      <el-button type="primary" @click="handleAdd">发布文章</el-button>
    </div>

    <el-table :data="articles" v-loading="loading" stripe>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="title" label="标题" />
      <el-table-column prop="views_count" label="浏览量" width="100" />
      <el-table-column prop="created_at" label="发布时间" width="180" />
      <el-table-column prop="is_active" label="状态" width="80">
        <template #default="{ row }">
          <el-tag :type="row.is_active ? 'success' : 'info'">{{ row.is_active ? '发布' : '草稿' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150">
        <template #default="{ row }">
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

    <el-dialog v-model="dialogVisible" :title="form.id ? '编辑文章' : '发布文章'" width="600px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="标题"><el-input v-model="form.title" /></el-form-item>
        <el-form-item label="内容"><el-input v-model="form.content" type="textarea" rows="6" /></el-form-item>
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
.pager { margin-top: 16px; display: flex; justify-content: flex-end; }
</style>
