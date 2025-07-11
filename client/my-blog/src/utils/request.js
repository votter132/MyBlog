import { useUserStore } from '@/stores'
import axios from 'axios'
import router from '@/router'
import { ElMessage } from 'element-plus'

// 创建axios实例
const service = axios.create({
  baseURL: 'http://47.122.85.193:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json;charset=utf-8'
  }
})

// 错误码与提示信息映射表
const errorMap = {
  400: '错误的请求参数',
  401: '认证失败，请重新登录',
  403: '权限不足，无法访问',
  404: '请求资源不存在',
  405: '请求方法不允许',
  408: '请求超时',
  500: '服务器内部错误',
  501: '功能未实现',
  502: '网关错误',
  503: '服务不可用',
  504: '网关超时',
  505: 'HTTP版本不受支持'
}

// 请求拦截器
service.interceptors.request.use(
  config => {
    const userStore = useUserStore()

    // 自动添加JWT Token
    if (userStore.token) {
      config.headers['Authorization'] = `Bearer ${userStore.token}`
    }

    // 可以添加请求loading状态
    return config
  },
  error => {
    console.error('请求拦截器错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  response => {
    // 这里可以根据后端返回的特定状态码进行业务处理
    const res = response.data

    // 示例：假设后端使用code字段作为业务状态码
    if (res.code !== 1) {
      ElMessage.error(res.message || '请求失败')
      return Promise.reject(new Error(res.message || '请求失败'))
    }

    return res
  },
  error => {
    console.error('响应拦截器错误:', error)

    const { response } = error

    if (response) {
      // 处理HTTP状态码错误
      const status = response.status
      const errorMsg = errorMap[status] || `未知错误 (${status})`

      ElMessage.error(errorMsg)

      // 针对不同状态码的特殊处理
      switch (status) {
        case 401:
          const userStore = useUserStore()
          userStore.removeUserInfo()
          router.push('/index')
          setTimeout(() => {
            ElMessage.error('您的登录信息已过期')
          }, 2000)
          break

        case 403:
          // 可以跳转到权限不足页面
          break

        case 500:
          // 可以跳转到错误页面
          break
      }

      return Promise.reject(new Error(errorMsg))
    } else if (error.message.includes('timeout')) {
      // 处理超时错误
      ElMessage.error('请求超时，请稍后重试')
      return Promise.reject(new Error('请求超时'))
    } else {
      // 处理网络错误
      ElMessage.error('网络连接失败，请检查网络设置')
      return Promise.reject(new Error('网络错误'))
    }
  }
)


export default service