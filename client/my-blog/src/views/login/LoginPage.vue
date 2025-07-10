<script setup>
import { ref } from 'vue';
import { Lock, Message, User } from '@element-plus/icons-vue'
import { loginUser, addUser } from '@/api/user';
import { useUserStore } from '@/stores';
import { addDynamicRoutes, resetRouter } from '@/router';
import { async } from '@kangc/v-md-editor';
const dialogVisible = ref(false);
// 状态控制
const states = ref('login')
const form = ref()
// 表单数据
const loginForm = ref({
  username: '',
  password: '',
  nickname: '',
  passwords: '',
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
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { pattern: /^\S{6,15}$/, message: '密码必须是6-15位的非空字符', trigger: 'blur' }
  ],
  passwords: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (!value) {
          callback(new Error('请再次输入密码'));
        } else if (value !== loginForm.value.password) {
          callback(new Error('两次输入的密码不一致'));
        } else {
          callback();
        }
      },
      trigger: 'blur'
    }
  ],
}
// 登录方法
const userStore = useUserStore();
const login = async () => {
  // 校验表单
  form.value = loginForm.value;
  if (!form.value.username || !form.value.password) {
    return ElMessage.error('请输入邮箱和密码');
  }
  const res = await loginUser(form.value)
  if (res.code == 0) {
    return ElMessage.error(res.msg || '登录失败，请稍后再试');
  }

  // 登录成功后，存储用户信息
  userStore.setToken(res.token);
  userStore.setUserInfo({
    username: form.value.username,
    nickname: res.nickname,
    power: res.power,
    _id: res._id,
    headImgUrl: res.headImgUrl || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'
  })
  await addDynamicRoutes()
  // 登录成功
  ElMessage.success('登录成功');
  dialogVisible.value = false;
  loginForm.value = {
    username: '', password: '', nickname: '', passwords: '',
  }
}

// 注册方法
const rigester = async () => {
  // 校验表单
  // await form.value.validate()
  form.value = loginForm.value;
  if (!form.value.username || !form.value.nickname || !form.value.password || !form.value.passwords) {
    return ElMessage.error('请填写完整信息');
  }
  if (form.password !== form.passwords) {
    return ElMessage.error('两次输入的密码不一致');
  }
  const res = await addUser(form.value);
  console.log(res)

  if (res.code == 0) {
    return ElMessage.error(res.msg || '注册失败，请稍后再试');
  }
  ElMessage.success('注册成功');
  dialogVisible.value = false;

}
// 注销方法
const loginout = async () => {
  userStore.setToken('')
  userStore.setUserInfo({})
  await resetRouter()
}

// 表单显示
const openDialog = () => {
  dialogVisible.value = true;
}

defineExpose({
  openDialog
})
</script>
<template>
  <el-dialog v-model="dialogVisible" width="450">
    <div class="logo">
      <img style="width: 80px" src="@/assets/my-blog-logo.svg" alt="blog logo" />
    </div>
    <div v-if="userStore.token == ''">
      <div class="login-options">
        <a href="#" :class="{ active: states == 'login' ? true : false }" @click="states = 'login', loginForm = {
          username: '', password: '', nickname: '', passwords: '',
        }"><span>登 录</span></a>
        <a href="#" :class="{ active: states == 'register' ? true : false }" @click="states = 'register', loginForm = {
          username: '', password: '', nickname: '', passwords: '',
        }"><span>注册</span></a>
      </div>
      <el-form v-if="states == 'login'" :model="loginForm" label-width="auto">
        <el-form-item prop="username">
          <el-input v-model="loginForm.username" placeholder="请输入邮箱" :prefix-icon="Message"></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input type="password" v-model="loginForm.password" placeholder="请输入密码" :prefix-icon="Lock"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="login">登 录</el-button>
        </el-form-item>
      </el-form>

      <el-form ref="form" v-else="states == 'register'" :model="loginForm" label-width="auto" :rules="rules">
        <el-form-item prop="username">
          <el-input v-model="loginForm.username" placeholder="请输入邮箱" :prefix-icon="Message"></el-input>
        </el-form-item>
        <el-form-item prop="nickname">
          <el-input v-model="loginForm.nickname" placeholder="请输入昵称" :prefix-icon="User"></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input type="password" v-model="loginForm.password" placeholder="请输入密码，至少六位"
            :prefix-icon="Lock"></el-input>
        </el-form-item>
        <el-form-item prop="passwords">
          <el-input type="password" v-model="loginForm.passwords" placeholder="请再次输入密码" :prefix-icon="Lock"></el-input>
        </el-form-item>
        <el-form-item prop="confirmPassword">
          <el-button type="primary" @click="rigester">注册</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div v-else>
      <div class="loginout">
        <h1 style="display: block;">你已经登录过了!!!</h1>
        <h2>欢迎您 {{ userStore.userInfo.nickname }}</h2>
      </div>
      <el-form style="max-width: 600px" :model="loginForm" label-width="auto">
        <el-form-item>
          <el-button type="warning" @click="loginout">注 销</el-button>
        </el-form-item>
      </el-form>
    </div>
  </el-dialog>
</template>
<style lang="less" scoped>
.loginout {
  text-align: center;

  h1,
  h2 {
    margin-bottom: 30px;
  }
}

.logo {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 0px;
}

.logo img {
  width: 50px;
}

.login-options {
  display: flex;
  justify-content: space-around;
  align-items: center;
  margin-bottom: 20px;

  a {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 50%;
    text-decoration: none;
    color: #333;
    // font-weight: bold;
    font-size: 20px;
    padding: 0 0 10px;
    margin: 0 40px;

  }

  .active {
    color: #2b6ad7;
    border-bottom: 2px solid #2b6ad7;
  }
}

.el-form-item {
  margin: 0 30px;
  margin-bottom: 20px;
}

.el-input {
  width: 100%;
  height: 40px;

}

.el-button {
  width: 100%;
  height: 40px;
}
</style>