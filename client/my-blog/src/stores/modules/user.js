import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useUserStore = defineStore('my-blog', () => {
  const token = ref('');
  const setToken = (newToken) => {
    token.value = newToken;
  };
  const removeToken = () => {
    token.value = '';
  };
  const userInfo = ref({})
  const setUserInfo = (news) => {
    userInfo.value = news;
  };
  const removeUserInfo = () => {
    userInfo.value = {};
  };
  const article = ref({})
  const setArticle = (newArt) => {
    article.value = newArt
  }
  const removeArt = () => {
    article.value = {};
  };
  return {
    token,
    setToken,
    removeToken,
    userInfo,
    removeUserInfo,
    setUserInfo,
    article,
    setArticle,
    removeArt
  }
},
  {
    persist: true
  }
)
