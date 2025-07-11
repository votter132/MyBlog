import { createRouter, createWebHistory } from 'vue-router';
import { useUserStore } from '@/stores';
// 常量路由（所有用户可访问）
const constantRoutes = [
  {
    path: '/',
    component: () => import('@/views/LayoutPage.vue'),
    redirect: '/index',
    meta: { title: '背景' },
    children: [
      {
        path: '/index',
        component: () => import('@/views/IndexPage.vue'),
        meta: { title: '登录' }
      },
      {
        path: '/danmubg',
        component: () => import('@/views/danmu/DanmakuIndex.vue'),
        meta: { title: '弹幕留言板' }
      },
      {
        path: '/article',
        component: () => import('@/views/article/ArticlePage.vue'),
        meta: { title: '文章' }
      },
      {
        path: '/photo',
        component: () => import('@/views/photo/PhotoPage.vue'),
        meta: { title: '相册' }
      },
      {
        path: '/selfinfo',
        component: () => import('@/views/self/SelfInfo.vue'),
        meta: { title: '个人信息' }
      },
    ]
  }
];

// 动态路由（需要权限）
const asyncRoutes = [
  {
    path: '/htmanage',
    name: 'htmanage',
    component: () => import('@/views/htmanage/HtManage.vue'),
    redirect: '/htmanage/article',
    meta: {
      title: '后台管理',
      requiresAuth: true,
      role: 'admin'
    },
    children: [
      {
        path: '/htmanage/article',
        name: 'article-manage',
        component: () => import('@/views/htmanage/manage/ArticleManage.vue'),
        meta: { title: '文章管理', role: 'admin' }
      },
      {
        path: '/htmanage/sort',
        name: 'sort-manage',
        component: () => import('@/views/htmanage/manage/SortManage.vue'),
        meta: { title: '分类管理', role: 'admin' }
      },
      {
        path: '/htmanage/user',
        name: 'user-manage',
        component: () => import('@/views/htmanage/manage/UserManage.vue'),
        meta: { title: '用户管理', role: 'admin' }
      }
    ]
  }
];

// 创建路由实例（初始只加载常量路由）
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: constantRoutes
});

// 权限检查方法 - 修改：允许未登录用户访问不需要权限的路由
const hasPermission = (userRole, route) => {
  if (!route.meta?.role) return true;
  // 未登录用户没有任何角色，返回false
  if (!userRole) return false;
  return userRole === route.meta.role;
}

// 重置路由方法
export const resetRouter = () => {
  const newRouter = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: constantRoutes
  })
  router.matcher = newRouter.matcher
}

// 动态添加路由 - 修改：只在用户已登录时添加动态路由
export const addDynamicRoutes = () => {
  try {
    const userStore = useUserStore();
    const userRole = userStore.userInfo?.power || '';

    // 如果用户未登录，不添加动态路由
    if (!userRole) {
      Elmessage.error('请先登录')
      return
    }

    // 重置路由避免重复添加
    resetRouter();

    // 添加符合条件的路由
    asyncRoutes.forEach(route => {
      if (hasPermission(userRole, route)) {
        router.addRoute(route);
      }
    });

    console.log('动态路由添加完成');
  } catch (error) {
    console.error('添加动态路由失败:', error);
  }
};

// 记录是否已添加过动态路由
let isDynamicRoutesAdded = false;

// 路由守卫 - 修改：优化未登录状态的处理
router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore();
  const userRole = userStore.userInfo?.power || '';
  // 未登录用户访问动态路由路径（如/htmanage）：直接拦截跳转
  if (!userRole && to.path.startsWith('/htmanage')) {
    ElMessage.error('请先登录');
    return next('/index'); // 立即跳转登录页，避免空白
  }
  // 如果用户已登录但动态路由尚未添加，添加动态路由
  if (userRole && !isDynamicRoutesAdded) {
    try {
      await addDynamicRoutes();
      isDynamicRoutesAdded = true;
      return next({ ...to, replace: true }); // 重新加载以应用新路由
    } catch (error) {
      console.error('重加载路由失败:', error);
      return next('/');
    }
  }

  // 处理刷新时路由丢失的问题 - 修改：只在用户已登录时重新加载路由
  if (userRole && to.matched.length === 0) {
    // 检查是否是动态路由路径
    if (to.path.startsWith('/htmanage')) {
      try {
        await addDynamicRoutes();
        return next({ ...to, replace: true });
      } catch (error) {
        console.error('重加载路由失败:', error);
        return next('/');
      }
    }
  }

  // 权限检查
  if (to.matched.some(record => record.meta.requiresAuth)) {
    // 如果用户已登录但权限不足
    if (!hasPermission(userRole, to)) {
      Elmessage.error('权限不足')
      return next('/');
    }
  }
  next();
});

export default router;