<script setup>
import LoginPage from '../login/LoginPage.vue';
import OtherButton from './OtherButton.vue';
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useUserStore } from '@/stores';
import LoginLogo from '../login/LoginLogo.vue';
const userStore = useUserStore()
const loginDialog = ref(null);
const navRef = ref(null); // 导航栏引用
const lastScrollTop = ref(0); // 上次滚动位置
const isScrollingUp = ref(true); // 是否向上滚动
const navVisible = ref(true); // 导航栏是否可见
const scrollOffset = ref(50); // 滚动多少像素后触发效果

// 打开登录弹窗
const openLoginDialog = () => {
  if (loginDialog.value) {
    loginDialog.value.openDialog();
  }
};

// 处理滚动事件
const handleScroll = () => {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

  // 判断滚动方向
  isScrollingUp.value = scrollTop < lastScrollTop.value;
  lastScrollTop.value = scrollTop;

  // 控制导航栏显示隐藏
  if (scrollTop > scrollOffset.value) {
    if (isScrollingUp.value) {
      // 向上滚动，显示导航栏
      navVisible.value = true;
    } else {
      // 向下滚动，隐藏导航栏
      navVisible.value = false;
    }
  } else {
    // 回到顶部，显示导航栏
    navVisible.value = true;
  }
};

// 优化滚动事件处理，使用 requestAnimationFrame
let scrollRequestId = null;
const debounceScroll = () => {
  if (scrollRequestId) {
    cancelAnimationFrame(scrollRequestId);
  }
  scrollRequestId = requestAnimationFrame(handleScroll);
};

// 生命周期钩子
onMounted(() => {
  window.addEventListener('scroll', debounceScroll);
});

onUnmounted(() => {
  window.removeEventListener('scroll', debounceScroll);
  if (scrollRequestId) {
    cancelAnimationFrame(scrollRequestId);
  }
});

// 监听导航可见性变化，添加动画类
const navClass = computed(() => {
  return navVisible.value ? 'nav-visible' : 'nav-hidden';
});
</script>

<template>
  <div ref="navRef" :class="navClass" class="nav-container">
    <el-menu class="menu1" mode="horizontal" :ellipsis="false" background-color="rgba(0,0,0,0)" text-color="#000"
      active-text-color="#5fe3c4" router>
      <div>
        <el-menu-item index="/" class="image">
          <img style="width: 100px" src="../../assets/my-blog-logo.svg" alt="blog logo" />
        </el-menu-item>
      </div>
      <div style="z-index: 1;">
        <el-menu-item index="/selfinfo" class="image">
          <other-button class="loader">
            个人中心
          </other-button>
        </el-menu-item>
        <el-menu-item index="/danmubg" class="image">
          <other-button class="loader">
            树洞
          </other-button>
        </el-menu-item>
        <el-menu-item index="/photo" class="image">
          <other-button class="loader">
            相册
          </other-button>
        </el-menu-item>
      </div>
      <div class="nav user">
        <a href="#" style="cursor: pointer !important;display: flex;justify-content: center;align-items: center;">
          <div style="width: 70px;height: 70px;" v-if="userStore.token === ''" class="loader" @click="openLoginDialog">
            <login-logo></login-logo>
          </div>
          <el-avatar v-else :size="50" :src="'http://localhost:3000' + userStore.userInfo.headImgUrl"
            @click="openLoginDialog" />
        </a>
      </div>
    </el-menu>

    <el-menu class="menu2" mode="horizontal" :ellipsis="false" background-color="rgba(0,0,0,0)" text-color="#000"
      active-text-color="#5fe3c4" router>
      <div>
        <el-menu-item index="/" class="image">
          <img style="width: 100px" src="../../assets/my-blog-logo.svg" alt="blog logo" />
        </el-menu-item>
      </div>
      <div style="font-size: 16px;gap: 10px;">
        <router-link to="/selfinfo">
          个人中心
        </router-link>
        <router-link to="/danmubg">
          树洞
        </router-link>
        <router-link to="/photo">
          相册
        </router-link>
      </div>
      <div class="nav user">
        <a href="#" style="cursor: pointer !important;display: flex;justify-content: center;align-items: center;">
          <div v-if="userStore.token === ''" class="loader" @click="openLoginDialog">
            <login-logo></login-logo>
          </div>
          <el-avatar v-else :size="50" :src="'http://localhost:3000' + userStore.userInfo.headImgUrl"
            @click="openLoginDialog" />
        </a>
      </div>
    </el-menu>
  </div>
  <login-page ref="loginDialog"></login-page>

</template>

<style lang="less" scoped>
@media (max-width: 799px) {
  .menu1 {
    display: none;
  }
}

@media (min-width: 800px) {
  .menu2 {
    display: none;
  }
}

a {
  color: #fff;
  text-decoration: none;
  /* 去掉所有链接的下划线 */
}

/* 导航容器样式 */
.el-menu {
  div {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
  }
}

.nav-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
  transition: transform 0.3s ease-in-out;
  will-change: transform;

  &.nav-hidden {
    transform: translateY(-100%);
    /* 隐藏到上方 */
  }

  &.nav-visible {
    transform: translateY(0);
    /* 显示在顶部 */
  }
}

.image {
  position: relative;
}

.image::after {
  position: absolute;
  top: 0;
  left: 0;
  width: 100px;
  height: 100px;
  background-color: #fff;
}

.user {
  .loader {
    scale: 0.8;
  }
}

.el-menu {
  --el-menu-hover-text-color: #1890ff;
  font-size: 100px;
  height: 100px;
  width: 100%;
  position: relative;
  border-bottom: 0px solid #000 !important;

  .el-menu-item {
    font-size: 24px;
    color: #fff;
  }
}

.el-menu--horizontal.el-menu {
  border-bottom: 0px solid var(--el-menu-border-color);
}

a,
.loader,
.el-menu-item,
.el-menu-item * {
  cursor: pointer !important;
  z-index: 9999;
}
</style>