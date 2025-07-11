<script setup>
import ShineCard from './components/ShineCard.vue';
import ShineButton from './components/ShineButton.vue';
import HandCpt from './components/HandCpt.vue';
import SearchCpt from './components/SearchCpt.vue';
import dayjs from 'dayjs';
import { useRouter } from 'vue-router';
import { getCutPage } from '@/api/article';
import { useUserStore } from '@/stores';
import { ref, onMounted, onActivated } from 'vue'
import { getSort } from '@/api/sort';
const router = useRouter();
// 响应式数据 分页数据
const currentPage = ref(1);
const pageSize = ref(4); // 每页4条
const total = ref(0);
const arrdata = ref([]); // 存储当前页数据
const sortdata = ref([])
const currentSortId = ref('');
// 分页切换处理方法
const handleCurrentChange = (newPage) => {
  currentPage.value = newPage;  // 更新当前页码
  fetchPageData(currentSortId.value);  // 使用当前分类重新加载数据
};
// 获取分页数据（明确参数语义为分类ID）
const fetchPageData = async (sortId) => {
  currentSortId.value = sortId;  // 记录当前分类ID
  try {
    const res = await getCutPage(currentPage.value, pageSize.value, sortId);
    arrdata.value = res.data.list;
    total.value = res.data.total;
  } catch (error) {
    // console.error('获取分页数据失败：', error);
  }
};
// 获取分类
const getallSort = async () => {
  const res2 = await getSort()
  sortdata.value = res2.data
}
getallSort()

// 查看文章跳转页面
const checkArticle = (item) => {
  const userStore = useUserStore()
  userStore.setArticle(item._id)
  router.push('/article')
}
const scrollDown = () => {
  const windowHeight = window.innerHeight; // 当前视口高度
  const currentScrollY = window.scrollY || window.pageYOffset; // 当前滚动位置
  window.scrollTo({
    top: currentScrollY + windowHeight, // 目标位置：当前位置 + 视口高度
    behavior: 'smooth' // 使用平滑滚动效果
  });
};
const toManage = () => {
  router.push('/htmanage')
}

onMounted(() => {
  fetchPageData(''); // 初始化加载第一页
})
onActivated(() => {
  fetchPageData(''); // 初始化加载第一页
})
</script>
<template>
  <!-- 首页特效文字 -->
  <div class="index_foot">
    <div class="center_text">
      <div class="text">
        <h1 style="scale: 0.7;display: block;">this is my blog</h1>
        <h1 style="scale: 0.6;display: block;text-align: center;">welcome</h1>
      </div>
    </div>
    <div class="container" @click="scrollDown">
      <div class="loader">
        <div class="crystal"></div>
        <div class="crystal"></div>
        <div class="crystal"></div>
        <div class="crystal"></div>
        <div class="crystal"></div>
        <div class="crystal"></div>
      </div>
    </div>
  </div>
  <div class="search">
    <search-cpt />
  </div>
  <!-- 文章部分 -->
  <div class="main">
    <!-- 搜索栏 -->
    <!-- 卡片顶部 -->
    <div style="display: flex;justify-content: flex-end;align-items: center;margin-bottom: 30px;">
      <hand-cpt />
    </div>
    <div class="atc_card">
      <shine-card @click="checkArticle({ _id: '6869bb705c653ff874fbd29c' })">
        <template #title>
          关于我的博客
        </template>
        <template #content>
          对于博客更详细的介绍
        </template>
      </shine-card>
      <shine-card @click="toManage">
        <template #title>
          进入博客后台
        </template>
        <template #content>
          在后台进程操作控制
        </template>
      </shine-card>
    </div>
    <!-- 分类 -->
    <p
      style="width: 100%; text-align: center; font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif; font-size: 34px;color: aqua;font-weight: 700;margin-top: 60px;">
      SORT artice
    </p>
    <div style="display: flex;justify-content: center;align-items: center;margin: 40px 0;flex-wrap: wrap;gap: 40px;">
      <shine-button @click="fetchPageData('')">全部</shine-button>
      <shine-button v-for="item in sortdata" :key="item._id" @click="fetchPageData(item._id)">{{ item.sort
      }}</shine-button>
    </div>
    <div class="article">
      <el-card class="card" v-for="item in arrdata" :key="item._id" @click="checkArticle(item)">
        <div class="imgbox">
          <img :src="`http://47.122.85.193:3000${item.imgUrl}`" alt="图片" />
        </div>
        <div style="height: 100px; display: flex;align-items: center;">
          <div style="padding: 0 30px;">
            <h1 style="font-size: 24px;">{{ item.title }}</h1>
            <div style="display: flex;align-items: center;margin-top: 12px;">
              <span>
                <el-icon size="24px" color="#67C23A">
                  <Document />
                </el-icon>
                {{ item.sort.sort }}
              </span>
              <span>
                <el-icon size="24px" color="rgb(121.3, 187.1, 255)">
                  <View />
                </el-icon>
                {{ item.views }}
              </span>
              <span>
                <el-icon size="24px">
                  <Odometer />
                </el-icon>
                {{ dayjs(item.createdAt).format('YYYY/M/D') }}
              </span>
            </div>
          </div>
        </div>
      </el-card>
    </div>
    <div style="width: 100%;height: 200px;">
      <el-pagination background style="display: flex;justify-content: center;" layout="prev, pager, next" :total="total"
        :current-page="currentPage" :page-size="pageSize" @current-change="handleCurrentChange" />
    </div>
  </div>
</template>
<style lang="less" scoped>
@media (max-width: 799px) {
  * {
    margin: 0 0 20px !important;
  }
}

.article {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;

  .card {
    cursor: pointer;
    width: 620px;
    height: 400px;
    margin: 0 0 30px 0;
    padding: 0;
    --el-card-padding: .5px;

    span {
      display: flex;
      align-items: center;
      margin-right: 14px;
    }

    .el-icon {
      margin-right: 4px;
    }

    h1 {
      transition: all 1s;
    }

    .imgbox {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 300px;
      overflow: hidden;
    }

    img {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      transition: all 1s;
      overflow: hidden;
    }
  }
}



.card:hover {
  h1 {
    color: rgb(76, 53, 159);
  }

  img {
    scale: 1.1;
  }
}

.firstbox {
  margin-left: 25px
}

.search {
  margin-top: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.main {
  flex: 1;
  height: 100vh;
  margin: 0 160px;
  padding: 30px;

  // background-color: #eaa7a7;
  // overflow: hidden;
  .atc_card {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-around;
    align-items: center;
    gap: 50px;
    // align-items: center;

  }


}

.index_foot {
  position: relative;

  .center_text {
    width: 100%;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;

    .text {
      h1 {
        cursor: default;
        position: relative;
        text-transform: uppercase;
        letter-spacing: 6px;
        font-size: 10vw;
        font-weight: 900;
        text-decoration: none;
        color: white;
        display: inline-block;
        background-size: 120% 100%;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        -moz-background-clip: text;
        -moz-text-fill-color: transparent;
        -ms-background-clip: text;
        -ms-text-fill-color: transparent;
        background-clip: text;
        background-image: linear-gradient(45deg,
            #7794ff,
            #44107A,
            #FF1361,
            #FFF800);
        animation: .8s shake infinite alternate;
      }

      @keyframes shake {
        0% {
          transform: skewX(-15deg);
        }

        5% {
          transform: skewX(15deg);
        }

        10% {
          transform: skewX(-15deg);
        }

        15% {
          transform: skewX(15deg);
        }

        20% {
          transform: skewX(0deg);
        }

        100% {
          transform: skewX(0deg);
        }
      }

    }
  }



  /* From Uiverse.io by Z4drus */
  .container {
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translate(-50%, 30%);
    ;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }

  .loader {
    position: relative;
    width: 200px;
    height: 200px;
    perspective: 800px;
  }

  .crystal {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 60px;
    height: 60px;
    opacity: 0;
    transform-origin: bottom center;
    transform: translate(-50%, -50%) rotateX(45deg) rotateZ(0deg);
    animation: spin 4s linear infinite, emerge 2s ease-in-out infinite alternate,
      fadeIn 0.3s ease-out forwards;
    border-radius: 10px;
    visibility: hidden;
  }

  @keyframes spin {
    from {
      transform: translate(-50%, -50%) rotateX(45deg) rotateZ(0deg);
    }

    to {
      transform: translate(-50%, -50%) rotateX(45deg) rotateZ(360deg);
    }
  }

  @keyframes emerge {

    0%,
    100% {
      transform: translate(-50%, -50%) scale(0.5);
      opacity: 0;
    }

    50% {
      transform: translate(-50%, -50%) scale(1);
      opacity: 1;
    }
  }

  @keyframes fadeIn {
    to {
      visibility: visible;
      opacity: 0.8;
    }
  }

  .crystal:nth-child(1) {
    background: linear-gradient(45deg, #003366, #336699);
    animation-delay: 0s;
  }

  .crystal:nth-child(2) {
    background: linear-gradient(45deg, #003399, #3366cc);
    animation-delay: 0.3s;
  }

  .crystal:nth-child(3) {
    background: linear-gradient(45deg, #0066cc, #3399ff);
    animation-delay: 0.6s;
  }

  .crystal:nth-child(4) {
    background: linear-gradient(45deg, #0099ff, #66ccff);
    animation-delay: 0.9s;
  }

  .crystal:nth-child(5) {
    background: linear-gradient(45deg, #33ccff, #99ccff);
    animation-delay: 1.2s;
  }

  .crystal:nth-child(6) {
    background: linear-gradient(45deg, #66ffff, #ccffff);
    animation-delay: 1.5s;
  }

}
</style>