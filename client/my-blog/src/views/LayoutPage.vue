<script setup>
import '@/assets/index.scss'
import NavPage from '@/views/components/NavPage.vue'
// import MusicCpt from './components/MusicCpt.vue';
</script>
<template>
  <div>
    <!-- 背景星星 -->
    <div>
      <div class="star"></div>
      <div class="medium-star"></div>
      <div class="big-star"></div>
    </div>
    <!-- <music-cpt style="position: absolute;"></music-cpt> -->
    <nav-page class="nav"></nav-page>
    <router-view :key="$route.fullPath"></router-view>
  </div>

</template>
<style lang="less" scoped>
body {
  background-color: #000;
}

.nav {
  cursor: pointer;
}
</style>