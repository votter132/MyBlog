<script setup>
import { ref } from 'vue'
import { addSort } from '@/api/sort'
import { useUserStore } from '@/stores'
const status = ref('add')
const visible = ref(false)
const form = ref({
  sort: ''
})

const userStore = useUserStore()


// 添加和编辑方法
const add = async () => {
  const res = await addSort(form.value)
  if (res.code === 1) {
    success()
    visible.value = false
    form.value.sort = ''
    ElMessage.success(res.msg)
  }
  else {
    ElMessage.console.error(res.msg)
  }
}
// 声明要触发的事件
const emit = defineEmits(['success']);
// 子组件方法，点击按钮时触发父组件的事件
const success = () => {
  // 触发 child-click 事件，并传递参数
  emit('success', 'success');
};
// 重置方法
const reset = () => {
  form.value = {
    sort: ''
  }
}
// 开关抽屉方法
const open = (data) => {
  if (data) {
    form.value = {
      sort: ''
    }
    status.value = 'edit'
  } else {
    status.value = 'add'
  }
  visible.value = true
}

defineExpose({
  open
})
</script>
<template>
  <el-drawer v-model="visible" :show-close="false" size="30%">
    <template #header="{ close }">
      <h4>添加分类</h4>
      <el-button @click="close">
        <el-icon class="el-icon--left">
          <CircleCloseFilled />
        </el-icon>
        关闭
      </el-button>
    </template>
    <el-form style="padding: 30px;" label-position="top" size="large">
      <el-form-item label="分类名称">
        <el-input v-model="form.sort"></el-input>
      </el-form-item>
      <el-form-item style="margin-top: 30px;">
        <el-button type="primary" @click="add">添加分类</el-button>
        <el-button type="danger" @click="reset">重置</el-button>
      </el-form-item>

    </el-form>
  </el-drawer>
</template>
<style lang="less" scoped>
.upload-container {
  margin: 20px;
}

.preview-container {
  margin-top: 20px;
}
</style>