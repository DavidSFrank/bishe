import { createRouter, createWebHistory } from 'vue-router'

const routes = [
    {
        path: '/login',
        name: 'Login',
        component: () => import('@/views/login/index.vue'),
        meta: { title: '登录' }
    },
    {
        path: '/',
        component: () => import('@/components/Layout.vue'),
        redirect: '/dashboard',
        children: [
            {
                path: 'dashboard',
                name: 'Dashboard',
                component: () => import('@/views/dashboard/index.vue'),
                meta: { title: '控制台' }
            },
            {
                path: 'packages',
                name: 'Packages',
                component: () => import('@/views/packages/index.vue'),
                meta: { title: '套餐管理' }
            },
            {
                path: 'categories',
                name: 'Categories',
                component: () => import('@/views/categories/index.vue'),
                meta: { title: '分类管理' }
            },
            {
                path: 'appointments',
                name: 'Appointments',
                component: () => import('@/views/appointments/index.vue'),
                meta: { title: '预约管理' }
            },
            {
                path: 'reports',
                name: 'Reports',
                component: () => import('@/views/reports/index.vue'),
                meta: { title: '报告管理' }
            },
            {
                path: 'users',
                name: 'Users',
                component: () => import('@/views/users/index.vue'),
                meta: { title: '用户管理' }
            },
            {
                path: 'profile',
                name: 'Profile',
                component: () => import('@/views/profile/index.vue'),
                meta: { title: '管理员资料' }
            },
            {
                path: 'articles',
                name: 'Articles',
                component: () => import('@/views/articles/index.vue'),
                meta: { title: '内容管理' }
            },
            {
                path: 'banners',
                name: 'Banners',
                component: () => import('@/views/banners/index.vue'),
                meta: { title: '轮播图管理' }
            },
            {
                path: 'consultations',
                name: 'Consultations',
                component: () => import('@/views/consultations/index.vue'),
                meta: { title: '在线咨询' }
            }
        ]
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
    document.title = to.meta.title ? `${to.meta.title} - 医院体检管理系统` : '医院体检管理系统'
    const token = localStorage.getItem('token')
    if (to.path !== '/login' && !token) {
        next('/login')
    } else {
        next()
    }
})

export default router
