import request from '@/utils/request'
// 上传图片
export const imgUpload = (fd) => request.post('/upload', fd)