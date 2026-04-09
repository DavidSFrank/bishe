<script setup>
import { ref, onMounted } from 'vue'
import request from '@/api/request'
import { ElMessage, ElMessageBox } from 'element-plus'
import { usePagedList } from '@/composables/usePagedList'

const { list: consultations, loading, total, page, pageSize, setPagedResult } = usePagedList(10)
const dialogVisible = ref(false)
const form = ref({ id: '', reply: '' })

const statusMap = {
  0: { label: '待回复', type: 'warning' },
  1: { label: '已回复', type: 'success' }
}

const loadData = async () => {
  loading.value = true
  try {
    const data = await request.get('/articles/consultations/', {
      params: {
        page: page.value,
        page_size: pageSize.value,
        ordering: '-created_at'
      }
    })
    setPagedResult(data)
  } finally {
    loading.value = false
  }
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
  await request.patch(`/articles/consultations/${form.value.id}/`, { reply: form.value.reply.trim() })
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

const onPageChange = (nextPage) => {
  page.value = nextPage
  loadData()
}

const onSizeChange = (nextSize) => {
  pageSize.value = nextSize
  page.value = 1
  loadData()
}

const getRowNo = (index) => (page.value - 1) * pageSize.value + index + 1

onMounted(loadData)
</script>

<template>
  <div class="consultations-page">
    <div class="header"><h2>在线咨询</h2></div>
    <el-table :data="consultations" v-loading="loading" stripe>
      <el-table-column label="序号" width="80">
        <template #default="{ $index }">{{ getRowNo($index) }}</template>
      </el-table-column>
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
.pager { margin-top: 16px; display: flex; justify-content: flex-end; }
</style>
