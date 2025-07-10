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

// 权限检查方法
const hasPermission = (userRole, route) => {
  if (!route.meta?.role) return true;
  return userRole === route.meta.role;
};

// 重置路由方法
export const resetRouter = () => {
  const newRouter = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: constantRoutes
  });
  router.matcher = newRouter.matcher;
};

// 动态添加路由
export const addDynamicRoutes = () => {
  try {
    const userStore = useUserStore();
    const userRole = userStore.userInfo?.power || '';

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

// 路由守卫
router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore();
  const userRole = userStore.userInfo?.power || '';

  // 处理刷新时路由丢失的问题
  if (to.matched.length === 0) {
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
    return next('/');
  }

  // 权限检查
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!hasPermission(userRole, to)) {
      console.error('权限不足，访问被拒绝:', to.path);
      return next('/');
    }
  }

  next();
});

export default router;