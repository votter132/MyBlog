import request from '@/utils/request'
// 获取弹幕
export const getDanmu = () => request.get('/danmu')
// 发送弹幕
export const addDanmu = (content) => request.post('/danmu', content)