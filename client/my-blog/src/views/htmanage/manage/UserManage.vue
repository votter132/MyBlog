<script setup>
import { ref, onMounted } from 'vue'
import UserDrawer from './UserDrawer.vue';
import { allUser, delUser } from '@/api/user';
const userdata = ref([])
const getallUser = async () => {
  const res = await allUser()
  userdata.value = res.data
}
getallUser()
// 编辑方法
const handleEdit = (index, row) => {
  drawerRef.value.open(row)
}
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
      const res = await delUser(row._id)
      if (res.code == 1) {
        getallUser()
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
  getallUser()
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
    <el-table :data="userdata" stripe style="width: 100%">
      <el-table-column prop="nickname" label="名称" />
      <el-table-column prop="username" label="邮箱" />
      <el-table-column prop="power" label="权限" />
      <el-table-column prop="createdAt" label="创建时间" />
      <!-- <el-table-column prop="sort" label="文章名称" /> -->
      <el-table-column label="操作" width="200">
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
  <user-drawer ref="drawerRef" @success="success"></user-drawer>
</template>
<style lang="less" scoped>
.el-button {
  width: 40%;
}
</style>