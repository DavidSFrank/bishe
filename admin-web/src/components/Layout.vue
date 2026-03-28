<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()
const route = useRoute()

const menuItems = [
  { path: '/dashboard', title: '控制台', icon: '📊' },
  { path: '/packages', title: '套餐管理', icon: '📦' },
  { path: '/categories', title: '分类管理', icon: '🗂️' },
  { path: '/appointments', title: '预约管理', icon: '📅' },
  { path: '/reports', title: '报告管理', icon: '📋' },
  { path: '/users', title: '用户管理', icon: '👥' },
  { path: '/profile', title: '管理员资料', icon: '⚙️' },
  { path: '/articles', title: '内容管理', icon: '📰' },
  { path: '/banners', title: '轮播图管理', icon: '🖼️' },
  { path: '/consultations', title: '在线咨询', icon: '💬' }
]

const isCollapse = ref(false)

const handleLogout = () => {
  ElMessageBox.confirm('确定退出登录？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    localStorage.removeItem('token')
    router.push('/login')
    ElMessage.success('已退出登录')
  })
}
</script>

<template>
  <el-container class="layout-container">
    <el-aside :width="isCollapse ? '64px' : '220px'" class="layout-aside">
      <div class="logo">
        <h2 v-if="!isCollapse">体检管理系统</h2>
        <span v-else>🏥</span>
      </div>
      <el-menu
        :default-active="route.path"
        :collapse="isCollapse"
        router
        class="aside-menu"
      >
        <el-menu-item v-for="item in menuItems" :key="item.path" :index="item.path">
          <span class="menu-icon">{{ item.icon }}</span>
          <template #title>{{ item.title }}</template>
        </el-menu-item>
      </el-menu>
    </el-aside>
    
    <el-container>
      <el-header class="layout-header">
        <el-icon class="collapse-btn" @click="isCollapse = !isCollapse">
          <span>{{ isCollapse ? '☰' : '✕' }}</span>
        </el-icon>
        <div class="header-right">
          <span class="admin-name">管理员</span>
          <el-button link @click="handleLogout">退出</el-button>
        </div>
      </el-header>
      <el-main class="layout-main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
.layout-container {
  min-height: 100vh;
}

.layout-aside {
  background: #304156;
  transition: width 0.3s;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  background: #263445;
}

.logo h2 {
  font-size: 16px;
  white-space: nowrap;
}

.aside-menu {
  border-right: none;
  background: transparent;
}

.aside-menu .el-menu-item {
  color: #bfcbd9;
}

.aside-menu .el-menu-item.is-active {
  background: #409eff;
  color: #fff;
}

.menu-icon {
  margin-right: 10px;
}

.layout-header {
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.collapse-btn {
  cursor: pointer;
  font-size: 20px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.admin-name {
  color: #666;
}

.layout-main {
  background: #f5f7fa;
  padding: 20px;
}
</style>
