<script setup>
import { ref } from 'vue'
import { useUserStore } from '@/stores'
import { putUser } from '@/api/user'
import { ElMessage } from 'element-plus'
const userStore = useUserStore()
const formRef = ref(null)
let circleUrl = ref('https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png')
const form = ref({
  _id: '',
  headImgUrl: '',
  nickname: '',
  username: ''
})
// 规则校验
const rules = {
  username: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { pattern: /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/, message: '邮箱格式不正确', trigger: ['blur', 'change'] },
  ],
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
    { min: 2, max: 16, message: '昵称长度为2-16个字符', trigger: 'blur' },
  ],
  // password: [
  //   { required: true, message: '请输入密码', trigger: 'blur' },
  //   { pattern: /^\S{6,15}$/, message: '密码必须是6-15位的非空字符', trigger: 'blur' }
  // ]
}
const getUser = () => {
  form.value._id = userStore.userInfo._id
  form.value.nickname = userStore.userInfo.nickname
  form.value.username = userStore.userInfo.username
  form.value.headImgUrl = userStore.userInfo.headImgUrl
}
getUser()
const uploadUrl = 'http://localhost:3000/api/upload'; // 对应后端路由的路径
// 上传请求头，添加token等认证信息（如果需要）
const headers = {
  'Authorization': 'Bearer ' + userStore.token, // 如果需要认证
};
// 上传成功回调
const handleSuccess = (response, file, fileList) => {
  if (response.code === 1) {
    // 后端返回的图片URL
    form.value.headImgUrl = response.data;
    // ElMessage.success('图片上传成功');
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
  form.value.headImgUrl = '';
};
const edit = async () => {
  try {
    // 验证表单
    await formRef.value.validate();
    // 提交数据
    const res = await putUser(form.value);
    userStore.setUserInfo({
      username: res.data.username,
      nickname: res.data.nickname,
      power: res.data.power,
      _id: res.data._id,
      headImgUrl: res.data.headImgUrl
    })
    // 处理成功
    ElMessage.success('修改成功')
  } catch (error) {
    // 处理失败
    ElMessage.error('表单验证失败')
  }
}
</script>
<template>
  <div style="height: 100vh; overflow: hidden;">
    <h2 style="text-align: center;color: #fff;margin-top: 120px;">个人资料</h2>
    <div style="height: 100vh;background-color: #f0f0f0;padding-top: 20px;margin-top: 20px;">
      <el-card max-width="500" style="margin:0 auto;">
        <el-form :rules="rules" :model="form" ref="formRef">
          <div style="display: flex; justify-content: center;margin-bottom: 10px;">
            <el-avatar :size="100" :src="'http://localhost:3000' + form.headImgUrl || circleUrl"
              style="display: block;" />
          </div>
          <el-form-item style="display: flex;justify-content: center;">
            <div>
              <el-upload class="upload-demo" :action="uploadUrl" :headers="headers" :on-success="handleSuccess"
                :on-error="handleError" :before-upload="beforeUpload" :show-file-list="false" name="file">
                <el-button size="small" type="primary">点击上传</el-button>
                <template #tip>
                  <div class="el-upload__tip">只能上传jpg/png文件，且不超过2MB</div>
                </template>
              </el-upload>
              <!-- 显示已上传的图片 -->
              <div v-if="form.headImgUrl" style="width: 100px;">
                <el-avatar max-scale="1" :src="'http://localhost:3000' + form.headImgUrl"
                  :preview-src-list="['http://localhost:3000' + form.headImgUrl]" />
                <el-button size="small" type="danger" @click="removeImage">删除图片</el-button>
              </div>
            </div>
          </el-form-item>
          <el-form-item label="昵称" prop="nickname">
            <el-input v-model="form.nickname"></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="username">
            <el-input v-model="form.username"></el-input>
          </el-form-item>
          <!-- <el-form-item label="密码">
            <el-input v-model="form.password"></el-input>
          </el-form-item> -->
          <el-form-item style="margin-top: 20px;">
            <el-button type="primary" @click="edit">修改</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>
  </div>
</template>
<style lang="less" scoped>
* {
  margin: 0 auto;
}

.el-form-item {
  margin: 20px 100px 10px;
}

:deep(.el-form-item__content) {
  text-align: center;
}
</style>