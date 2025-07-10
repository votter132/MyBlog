import request from '../utils/request'
// 添加文章
export const addArt = (data) => request.post('/articles', {
  title: data.title, content: data.content, imgUrl: data.imgUrl, sort: data.sort
})
// 获取全部文章
export const getallArt = () => request.get('/articles/all')
// 修改文章
export const editArt = (data) => request.put(`/articles/${data._id}`, data)
// 删除文章
export const deleteArt = (_id) => request.delete(`/articles/${_id}`)
// 根据id获取文章
export const getIdArt = (_id) => request.get(`/articles/${_id}`)
// 获取分页
export const getCutPage = (currentPage, pageSize, id) => request.get('/articles/page', {
  params: {
    page: currentPage, // 当前页码
    pageSize: pageSize, // 每页数量
    id: id
  },
})
