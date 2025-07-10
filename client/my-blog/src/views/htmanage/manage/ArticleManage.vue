<script setup>
import { ref, onMounted } from 'vue'
// import DrawerCpt from '../components/DrawerCpt';
import DrawerCpt from './DrawerCpt.vue'
import { getallArt } from '@/api/article'
import dayjs from 'dayjs'
import { deleteArt } from '@/api/article';
import { getSort } from '@/api/sort';
const sortdata = ref([])
const getallSort = async () => {
  const res = await getSort()
  sortdata.value = res.data
}
getallSort()
// 父组件方法，用于处理子组件触发的事件
// 删除方法
const handleDelete = async (index, row) => {
  ElMessageBox.confirm(
    '你确定要删除这篇文章吗？',
    '删除文章',
    {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(async () => {
      const res = await deleteArt(row._id)
      if (res.code == 1) {
        ElMessage.success(res.msg)
        getArticle()
      } else {
        ElMessage.error(res.msg)
      }
    })
}
// 接受子组件消息
const success = (message) => {
  if (message == 'success') {
    getArticle()
  }
  console.log(`子组件消息: ${message}`);
};
// 文章数据
let tableData = ref()
const getArticle = async () => {
  const res = await getallArt()
  tableData.value = res.data
  for (let index = 0; index < tableData.value.length; index++) {
    tableData.value[index].createdAt = dayjs(tableData.value.createdAt).format('YYYY/M/D');
    tableData.value[index].updatedAt = dayjs(tableData.value.updatedAt).format('YYYY/M/D');
  }

  // console.log(tableData.value);
}
const handleEdit = (index, row) => {
  drawerRef.value.open(row)
}

const drawerRef = ref(null)
const openDrawer = () => {
  drawerRef.value.open()
}
onMounted(() => {
  getArticle()
})
</script>
<template>
  <el-card style="width: 95%;height: 90%;">
    <template #header>
      <div class="card-header" style="display: flex;justify-content: space-between;align-items: center;">
        <span>文章管理</span>
        <el-button type="primary" style="width: 6%;" @click="openDrawer">添加文章</el-button>
      </div>
    </template>
    <el-table :data="tableData" stripe style="width: 100%">
      <el-table-column prop="title" label="文章名称" width="180" />
      <el-table-column prop="author.nickname" label="作者" width="180" />
      <!-- <el-table-column prop="content" label="文章内容" /> -->
      <el-table-column prop="createdAt" label="创建时间" />
      <el-table-column prop="updatedAt" label="修改时间" />
      <el-table-column prop="views" label="浏览量" />
      <el-table-column label="操作">
        <template #default="scope">
          <el-button type="primary" @click="handleEdit(scope.$index, scope.row)">
            编辑
          </el-button>
          <el-button type="danger" @click="handleDelete(scope.$index, scope.row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </el-card>
  <!-- 抽屉组件 -->
  <DrawerCpt ref="drawerRef" @success="success"></DrawerCpt>
</template>
<style lang="less" scoped>
.el-button {
  width: 40%;
}
</style>