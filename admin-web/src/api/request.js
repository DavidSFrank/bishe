import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'

const request = axios.create({
    baseURL: '/api',
    timeout: 10000
})

function pickErrorMessage(payload, fallback = '请求失败') {
    if (!payload) {
        return fallback
    }
    if (typeof payload.message === 'string' && payload.message) {
        return payload.message
    }
    if (typeof payload.detail === 'string' && payload.detail) {
        return payload.detail
    }
    if (typeof payload === 'object') {
        const firstKey = Object.keys(payload)[0]
        const firstVal = firstKey ? payload[firstKey] : ''
        if (Array.isArray(firstVal) && firstVal.length) {
            return String(firstVal[0])
        }
        if (typeof firstVal === 'string' && firstVal) {
            return firstVal
        }
    }
    return fallback
}

function shouldRelogin(status, payload) {
    if (status === 401) {
        return true
    }
    if (status !== 403) {
        return false
    }
    const text = `${payload?.message || ''} ${payload?.detail || ''}`
    return /token|过期|无效|认证|未提供认证|not authenticated|invalid/i.test(text)
}

// 请求拦截器
request.interceptors.request.use(
    config => {
        const token = localStorage.getItem('token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    error => Promise.reject(error)
)

// 响应拦截器
request.interceptors.response.use(
    response => {
        const { data } = response
        if (data.code === 200) {
            return data.data
        }
        ElMessage.error(pickErrorMessage(data))
        return Promise.reject(data)
    },
    error => {
        const status = error.response?.status
        const payload = error.response?.data

        if (shouldRelogin(status, payload)) {
            localStorage.removeItem('token')
            if (router.currentRoute.value.path !== '/login') {
                router.push('/login')
            }
            ElMessage.error('登录已过期，请重新登录')
        } else {
            ElMessage.error(pickErrorMessage(payload, error.message || '网络错误'))
        }
        return Promise.reject(error)
    }
)

export default request
