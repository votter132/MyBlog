<script setup>
import { ref } from 'vue'
let circleUrl = ref('https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png')
const arr = ref('这是评论啊')
</script>
<template>
  <div>
    <div style="margin-top: 30px;width: 100%; ">
      <div class="conment" style="display: flex;align-items:flex-start;">
        <span>
          <el-avatar :size="50" :src="circleUrl" />
          <span style="display: block;">用户名</span>
        </span>
        <span style="margin-left: 20px;margin-top: 20px;">2024/7/20</span>
      </div>
    </div>
    <div style="padding-left: 8px;">
      <v-md-editor style="z-index: 999;width: 100%;;margin-left: 20px;" :model-value="arr" mode="preview"></v-md-editor>
    </div>
  </div>
</template>
<style lang="less" scoped></style>