<script setup>
import { ref, onMounted } from 'vue'
import request from '@/api/request'
import { ElMessage, ElMessageBox } from 'element-plus'
import { usePagedList } from '@/composables/usePagedList'

const keyword = ref('')
const statusFilter = ref('')
const { list: users, loading, total, page, pageSize, setPagedResult, resetPager } = usePagedList(10)

const loadData = async () => {
  loading.value = true
  try {
    const params = {
      page: page.value,
      page_size: pageSize.value
    }
    if (keyword.value.trim()) {
      params.search = keyword.value.trim()
    }
    if (statusFilter.value !== '') {
      params.is_active = statusFilter.value
    }
    const data = await request.get('/users/', { params })
    setPagedResult(data)
  } catch (e) {} finally { loading.value = false }
}

const handleSearch = () => {
  resetPager()
  loadData()
}

const handleReset = () => {
  keyword.value = ''
  statusFilter.value = ''
  resetPager()
  loadData()
}

const handleStatusChange = async (row, nextStatus) => {
  const actionText = nextStatus ? '启用' : '禁用'
  await ElMessageBox.confirm(`确定${actionText}该用户吗？`, '提示', { type: 'warning' })
  await request.patch(`/users/${row.id}/`, { is_active: nextStatus })
  ElMessage.success(`${actionText}成功`)
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
  <div class="users-page">
    <h2>用户管理</h2>
    <el-card class="toolbar" shadow="never">
      <el-form inline>
        <el-form-item label="关键词">
          <el-input v-model="keyword" placeholder="昵称/姓名/手机号" clearable @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="statusFilter" placeholder="全部" style="width: 120px">
            <el-option label="全部" value="" />
            <el-option label="正常" :value="true" />
            <el-option label="禁用" :value="false" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-table :data="users" v-loading="loading" stripe>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="nickname" label="昵称" />
      <el-table-column prop="phone" label="手机号" width="130" />
      <el-table-column prop="real_name" label="姓名" width="100" />
      <el-table-column prop="gender" label="性别" width="80"><template #default="{row}">{{ row.gender === 1 ? '男' : row.gender === 2 ? '女' : '未知' }}</template></el-table-column>
      <el-table-column prop="created_at" label="注册时间" width="180" />
      <el-table-column prop="is_active" label="状态" width="80"><template #default="{row}"><el-tag :type="row.is_active ? 'success' : 'danger'">{{ row.is_active ? '正常' : '禁用' }}</el-tag></template></el-table-column>
      <el-table-column label="操作" width="120">
        <template #default="{ row }">
          <el-button
            link
            :type="row.is_active ? 'danger' : 'success'"
            @click="handleStatusChange(row, !row.is_active)"
          >
            {{ row.is_active ? '禁用' : '启用' }}
          </el-button>
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
  </div>
</template>

<style scoped>
h2 { margin-bottom: 20px; }
.toolbar { margin-bottom: 16px; }
.pager { margin-top: 16px; display: flex; justify-content: flex-end; }
</style>
