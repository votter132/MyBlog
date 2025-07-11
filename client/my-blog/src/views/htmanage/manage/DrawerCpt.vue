<script setup>
import { ref } from 'vue'
import { getSort } from '@/api/sort'
import { addArt, editArt } from '@/api/article'
import { useUserStore } from '@/stores'
const status = ref('add')
const visible = ref(false)
const form = ref({
  title: '', // 标题
  content: '',// 内容
  imgUrl: '', // 图片地址
  // 686248a88d5f7425a0026ef0 科技
  // 686248c38d5f7425a0026f0d 生活
  // 文章表 作者id 关联了 用户表中的id
  // 文章表 关联了 分类表的 id
  sort: '',
})
// 上传图片实现
// 上传URL，根据实际情况修改
const userStore = useUserStore()

const uploadUrl = 'http://47.122.85.193:3000/api/upload'; // 对应后端路由的路径
// 上传请求头，添加token等认证信息（如果需要）
const headers = {
  'Authorization': 'Bearer ' + userStore.token, // 如果需要认证
};
// 上传成功回调
const handleSuccess = (response, file, fileList) => {
  if (response.code === 1) {
    // 后端返回的图片URL
    form.value.imgUrl = response.data;
    ElMessage.success('图片上传成功');
  } else {
    ElMessage.error(response.msg || '上传失败');
  }
};
// 上传错误回调
const handleError = (error, file, fileList) => {
  ElMessage.error('上传失败，请重试');
  console.error('上传错误:', error);
}
// 上传前验证
const beforeUpload = (file) => {
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
  const isLt2M = file.size / 1024 / 1024 < 2;

  if (!isJpgOrPng) {
    ElMessage.error('只能上传JPG/PNG格式的图片');
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过2MB');
  }
  return isJpgOrPng && isLt2M;
};
// 删除已上传的图片
const removeImage = () => {
  form.value.imgUrl = '';
};

// 获取分类方法
const sortdata = ref([])
const getsortdata = async () => {
  const res = await getSort()
  sortdata.value = res.data
}
getsortdata()
// 添加和编辑方法
const addeditArticle = async () => {
  let res
  if (status.value === 'add') {
    res = await addArt(form.value)
  } else if (status.value === 'edit') {
    res = await editArt(form.value)
  }
  if (res.code == 1) {
    ElMessage.success(res.msg)
    success()
    visible.value = false
    reset()
  } else {
    ElMessage.error('添加失败')
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
    title: '', // 标题
    content: '',// 内容
    // 文章表 作者id 关联了 用户表中的id
    // 文章表 关联了 分类表的 id
    imgUrl: '',
    sort: '',
  }
}
// 开关抽屉方法
const open = (data) => {
  if (data) {
    form.value = {
      title: data.title, // 标题
      content: data.content,// 内容
      imgUrl: data.imgUrl, // 图片地址
      // 686248a88d5f7425a0026ef0 科技
      // 686248c38d5f7425a0026f0d 生活
      // 文章表 作者id 关联了 用户表中的id
      // 文章表 关联了 分类表的 id
      sort: data.sort._id,
      _id: data._id
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
  <el-drawer v-model="visible" :show-close="false" size="80%">
    <template #header="{ close, titleId, titleClass }">
      <h4 :id="titleId" :class="titleClass">{{ status === 'add' ? '添加文章' : '编辑文章' }}</h4>
      <el-button @click="close">
        <el-icon class="el-icon--left">
          <CircleCloseFilled />
        </el-icon>
        关闭
      </el-button>
    </template>
    <el-form style="padding: 30px;" label-position="top" size="large">
      <el-form-item label="文章名称">
        <el-input v-model="form.title"></el-input>
      </el-form-item>
      <el-form-item label="文章分类">
        <el-select v-model="form.sort" placeholder="请选择文章分类">
          <el-option v-for="item in sortdata" :value="item._id" :key="item._id" :label="item.sort" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-upload class="upload-demo" :action="uploadUrl" :headers="headers" :on-success="handleSuccess"
          :on-error="handleError" :before-upload="beforeUpload" :show-file-list="false" name="file">
          <el-button size="small" type="primary">点击上传</el-button>
          <template #tip>
            <div class="el-upload__tip">只能上传jpg/png文件，且不超过2MB</div>
          </template>
        </el-upload>

        <!-- 显示已上传的图片 -->
        <div v-if="form.imgUrl" style="width: 100px;">
          <el-image max-scale="1" :src="'http://47.122.85.193:3000' + form.imgUrl"
            :preview-src-list="['http://47.122.85.193:3000' + form.imgUrl]" />
          <el-button size="small" type="danger" @click="removeImage">删除图片</el-button>
        </div>
      </el-form-item>
      <el-form-item>
        <v-md-editor v-model="form.content" height="400px"></v-md-editor>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="addeditArticle">{{ status === 'add' ? '添加文章' : '编辑完成' }}</el-button>
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