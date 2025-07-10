<script setup>

</script>
<template>
  <el-container style="height: 100vh;overflow: hidden;">
    <el-header style="height: 100px;">
      <el-menu :default-active="activeIndex" mode="horizontal" :ellipsis="false" style="height: 100px;" router>
        <el-menu-item index="/index" style="margin-left: 30px;">
          <img style="width: 100px" src="../../assets/my-blog-logo.svg" alt="logo" />
        </el-menu-item>
      </el-menu>
    </el-header>
    <el-container>
      <el-aside width="200px">
        <el-menu default-active="/htmanage/article" class="el-menu-vertical-demo" style="height: 100vh;" router>
          <el-menu-item index="/htmanage/article">
            <el-icon>
              <setting />
            </el-icon>
            <span>文章管理</span>
          </el-menu-item>
          <el-menu-item index="/htmanage/sort">
            <el-icon>
              <Document />
            </el-icon>
            <span>分类管理</span>
          </el-menu-item>
          <el-menu-item index="/htmanage/user">
            <el-icon>
              <User />
            </el-icon>
            <span>用户管理</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-main style="display: flex;justify-content: center;align-items: center;background-color: #f0f0f0;">
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>
<style lang="less" scoped>
*,
html {
  margin: 0;
  padding: 0;
  overflow: hidden !important;
}
</style>