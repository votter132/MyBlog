import request from '@/utils/request'
// 获取分类信息
export const getSort = () => request.get('/sorts')
// 添加分类
export const addSort = (sort) => request.post('/sorts', sort)
// 删除分类
export const delSort = (sid) => request.delete(`/sorts/${sid}`)