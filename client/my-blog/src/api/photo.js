import request from '@/utils/request'
// 提交图片
export const postPhoto = (data) => request.post('/photos/add', data)
// 获取全部图片
export const getPhoto = () => request.get('/photos')