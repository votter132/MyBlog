import request from '@/utils/request'
// 添加文章评论
// data => {  content.article_id,reply_id}
export const addComment = (data) => request.post('/comments', data)
