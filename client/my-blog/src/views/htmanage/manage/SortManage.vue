<script setup>
import { ref, onMounted } from 'vue'
// import DrawerCpt from '../components/DrawerCpt';
import SortDrawer from './SortDrawer.vue';
import { getSort, delSort } from '@/api/sort';
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
    '你确定要删除该分类吗？',
    '删除分类',
    {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(async () => {
      const res = await delSort(row._id)
      if (res.code == 1) {
        getallSort()
        ElMessage.success(res.msg)
      } else {
        ElMessage.error(res.msg)
      }
    })
}
const success = (message) => {
  if (message == 'success') {
    getallSort()
  }
  console.log(`子组件消息: ${message}`);
};
const drawerRef = ref(null)
const openDrawer = () => {
  drawerRef.value.open()
}
onMounted(() => {
  getallSort()
})
</script>
<template>
  <el-card style="width: 95%;height: 90%;">
    <template #header>
      <div class="card-header" style="display: flex;justify-content: space-between;align-items: center;">
        <span>分类管理</span>
        <el-button type="primary" style="width: 6%;" @click="openDrawer">添加分类</el-button>
      </div>
    </template>
    <el-table :data="sortdata" stripe style="width: 100%">
      <el-table-column prop="sort" label="文章名称" />
      <el-table-column label="操作" width="200">
        <template #default="scope">
          <el-button type="danger" @click="handleDelete(scope.$index, scope.row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </el-card>
  <!-- 抽屉组件 -->
  <sort-drawer ref="drawerRef" @success="success"></sort-drawer>
</template>
<style lang="less" scoped>
.el-button {
  width: 40%;
}
</style>