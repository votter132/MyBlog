import request from '@/utils/request'
// 登录
export const loginUser = (data) => request.get('/users', { params: { username: data.username, password: data.password } })
// 注册
export const addUser = (data) => request.post('/users', { username: data.username, password: data.password, nickname: data.nickname })
// 查询全部用户
export const allUser = () => request.get('/users/all')
// 更新用户信息
export const putUser = (data) => request.put(`/users/${data._id}`, data)
// 删除用户信息
export const delUser = (data) => request.delete(`/users/${data}`)