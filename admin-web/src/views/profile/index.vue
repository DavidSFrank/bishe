<script setup>
import { ref, onMounted } from 'vue'
import request from '@/api/request'
import { ElMessage } from 'element-plus'

const form = ref({ username: '', name: '', old_password: '', new_password: '' })

const loadProfile = async () => {
  const data = await request.get('/users/admin/profile/')
  form.value.username = data.username
  form.value.name = data.name || ''
}

const handleSubmit = async () => {
  const payload = { name: form.value.name }
  if (form.value.new_password) {
    payload.old_password = form.value.old_password
    payload.new_password = form.value.new_password
  }
  await request.put('/users/admin/profile/', payload)
  ElMessage.success('保存成功')
  form.value.old_password = ''
  form.value.new_password = ''
}

onMounted(loadProfile)
</script>

<template>
  <div class="profile-page">
    <div class="header"><h2>管理员资料</h2></div>
    <el-form :model="form" label-width="100px" class="card">
      <el-form-item label="账号">
        <el-input v-model="form.username" disabled />
      </el-form-item>
      <el-form-item label="姓名">
        <el-input v-model="form.name" />
      </el-form-item>
      <el-form-item label="原密码">
        <el-input v-model="form.old_password" type="password" show-password />
      </el-form-item>
      <el-form-item label="新密码">
        <el-input v-model="form.new_password" type="password" show-password />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSubmit">保存</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<style scoped>
.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.card { background: #fff; padding: 20px; border-radius: 8px; max-width: 520px; }
</style>
