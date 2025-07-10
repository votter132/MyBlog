<script setup>
import { onMounted } from 'vue'
import { useUserStore } from '@/stores';
import BackGround from './BackGround.vue';
import { getIdArt } from '@/api/article';
import { addComment } from '@/api/comment';
import { ref } from 'vue'
import dayjs from 'dayjs';
import { ElMessage } from 'element-plus';
// 控制头像URL
let circleUrl = ref('https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png')
const userStore = useUserStore()
const arrdata = ref({
  title: '',
  sort: { sort: '' },
  views: 0,
  createdAt: '',
  content: '',
  coms: [] // 关键：初始化评论数组
})
// 获取文章信息
const getArt = async () => {
  try {
    const res = await getIdArt(userStore.article)
    arrdata.value = res.data
    // console.log(res.data)
    arrdata.value.createdAt = dayjs(arrdata.value.createdAt).format('YYYY/M/D');
  }
  catch (err) {
    console.log(err)
  }
}
getArt()
// 页面加载后滚动到顶部
const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'instant'
  });
};
// 评论内容
const form = ref({
  content: '',
  article_id: userStore.article
})
// 发布评论
const add = async () => {
  if (form.value.content === '') {
    ElMessage.error('评论不能为空')
    return
  } else {
    const res = await addComment(form.value)
    ElMessage.success(res.msg)
    getArt()
  }
}
onMounted(() => {
  scrollToTop();
});

</script>
<template>
  <div class="title">
    <h1>{{ arrdata.title }}</h1>
    <div style="display: flex; justify-content: center; align-items: center;margin-top: 12px;">
      <span>
        <el-icon size="24px" color="#67C23A">
          <Document />
        </el-icon>
        {{ arrdata.sort.sort }}
      </span>
      <span>
        <el-icon size="24px" color="rgb(121.3, 187.1, 255)">
          <View />
        </el-icon>
        {{ arrdata.views }}
      </span>
      <span>
        <el-icon size="24px" color="#fff">
          <Odometer />
        </el-icon>
        {{ arrdata.createdAt }}
      </span>
    </div>
  </div>
  <div class="content_bg">
    <div class="c1"></div>
    <el-card class="content">
      <!-- 调整顺序和 z-index -->
      <v-md-editor style="z-index: 999;" :model-value="arrdata.content" mode="preview"></v-md-editor>
      <back-ground style="position: absolute;top: 0;left: 0;z-index: -1;"></back-ground>
      <hr style="border:1px dashed #000;margin-top: 100px; z-index: 999;">
      <h2 style="margin: 40px 0 20px;">发布评论</h2>
      <v-md-editor v-model="form.content"></v-md-editor>
      <div style="display: flex;justify-content: center;margin-top: 20px;">
        <el-button type="primary" @click="add">发布评论(需要登录)</el-button>
      </div>
      <h2 style="margin-top: 60px;">共{{ arrdata.coms.length }}条评论</h2>
      <div v-for="item in arrdata.coms" :key="item._id" style="margin: 30px 0 20px;width: 100%; ">
        <div>
          <div class="conment" style="display: flex;align-items:flex-start;">
            <span>
              <el-avatar :size="50" :src="'http://localhost:3000' + item.reply_id.headImgUrl || circleUrl" />
              <span style="display: block;">{{ item.reply_id.nickname }}</span>
            </span>
            <span style="margin-left: 20px;margin-top: 20px;">{{ dayjs(item.createdAt).format('YYYY/M/D') }}</span>
          </div>
        </div>
        <div style="padding-left: 30px;">
          <v-md-editor style="z-index: 999;width: 100%;" :model-value="item.content" mode="preview"></v-md-editor>
        </div>
      </div>
    </el-card>
    <div class="c1"></div>
  </div>
</template>

<style lang="less" scoped>
:deep(.v-md-editor) {
  background-color: transparent;

  * {
    background-color: transparent;

  }
}

.content_bg {
  margin-top: 30px;
  width: 100%;
  height: 100%;
  background-color: #F0F0F0;
  display: flex;
}

@media (max-width:800px) {
  .c1 {
    flex: 0 !important;
  }
}

.content {
  position: relative;
  margin: 0 auto;
  padding: 30px;
  height: 100%;
  z-index: 0;
  flex: 2;
  gap: 500px;
}

.c1 {
  flex: 1;
}

.el-icon {
  margin-right: 4px;
}

.title {
  margin-top: 140px;
  width: 100%;
  height: 100px;

  h1 {
    color: #fff;
    text-align: center;
  }

  span {
    display: flex;
    align-items: center;
    margin-right: 14px;
    color: #fff;
  }
}
</style>