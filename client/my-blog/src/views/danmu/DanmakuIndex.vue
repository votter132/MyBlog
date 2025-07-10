<script setup>
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue'
import { getDanmu, addDanmu } from '@/api/danmaku'
import { ElMessage } from 'element-plus'

// 弹幕容器引用
const screenRef = ref(null)
// 输入的新弹幕
const newDanmaku = ref('')
// 所有活跃的弹幕
const activeDanmakus = ref([])
// 屏幕高度和宽度
const screenHeight = ref(0)
const screenWidth = ref(0)
// 弹幕速度和轨道数
const DANMAKU_SPEED = 0.5
const TRACKS = 10
// 轨道占用状态
const trackOccupancy = reactive(Array(TRACKS).fill(false))
// 最近显示的弹幕内容记录（用于去重）
const recentDanmakuContents = ref(new Set())
// 定时器引用
let animationFrameId = null
let fetchTimer = null
let sendTimer = null

// 获取数据库数据
const getDm = async () => {
  try {
    const res = await getDanmu()
    if (res.code === 1) {
      return res.data
    } else {
      ElMessage.error('获取弹幕失败')
      return []
    }
  } catch (error) {
    console.error('获取弹幕API调用失败:', error)
    ElMessage.error('网络错误，获取弹幕失败')
    return []
  }
}

// 初始化屏幕尺寸
const initScreenSize = () => {
  if (screenRef.value) {
    screenWidth.value = screenRef.value.clientWidth
    screenHeight.value = screenRef.value.clientHeight
  }
}

// 获取可用轨道
const getAvailableTrack = () => {
  const availableTracks = []
  for (let i = 0; i < TRACKS; i++) {
    if (!trackOccupancy[i]) {
      availableTracks.push(i)
    }
  }
  return availableTracks.length > 0
    ? availableTracks[Math.floor(Math.random() * availableTracks.length)]
    : Math.floor(Math.random() * TRACKS)
}

// 检查是否为重复内容
const isDuplicateContent = (content) => {
  return recentDanmakuContents.value.has(content)
}

// 记录内容已显示
const recordContentDisplayed = (content) => {
  recentDanmakuContents.value.add(content)
  // 30秒后自动清除记录，避免内存泄漏
  setTimeout(() => {
    recentDanmakuContents.value.delete(content)
  }, 10000)
}

// 添加弹幕（带内容去重）
const addDanmaku = (content, createTime, isNew = false) => {
  // 内容去重逻辑：相同内容30秒内不重复显示
  if (isDuplicateContent(content)) {
    return false
  }

  const track = getAvailableTrack()
  trackOccupancy[track] = true

  const id = createTime ? new Date(createTime).getTime() : Date.now() + Math.floor(Math.random() * 1000)
  const danmaku = {
    _id: id,
    content,
    createdAt: createTime || new Date(),
    left: screenWidth.value,
    top: (screenHeight.value / TRACKS) * track,
    speed: DANMAKU_SPEED + Math.random() * 1,
    paused: false,
    showInfo: false,
    track,
    isNew,
    style: {
      position: 'absolute',
      left: `${screenWidth.value}px`,
      top: `${(screenHeight.value / TRACKS) * track}px`,
      whiteSpace: 'nowrap',
      userSelect: 'none',
      transition: 'all 0.3s',
      zIndex: 100,
      color: isNew ? '#ff4500' : '#ffffff',
      fontSize: '18px',
      textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)'
    }
  }

  activeDanmakus.value.push(danmaku)
  recordContentDisplayed(content) // 记录内容已显示

  // 弹幕离开屏幕后释放轨道
  setTimeout(() => {
    trackOccupancy[track] = false
    activeDanmakus.value = activeDanmakus.value.filter(d => d._id !== id)
  }, (screenWidth.value * 1.5) / danmaku.speed * 1000)

  return true
}

// 更新弹幕位置
const updateDanmakus = () => {
  activeDanmakus.value.forEach(danmaku => {
    if (!danmaku.paused) {
      danmaku.left -= danmaku.speed
      danmaku.style.left = `${danmaku.left}px`
    }
  })

  animationFrameId = requestAnimationFrame(updateDanmakus)
}

// 暂停弹幕
const pauseDanmaku = (danmaku) => {
  danmaku.paused = true
  danmaku.showInfo = true
  danmaku.style.filter = 'brightness(1.5)'
  danmaku.style.fontSize = '20px'
}

// 恢复弹幕
const resumeDanmaku = (danmaku) => {
  danmaku.paused = false
  danmaku.showInfo = false
  danmaku.style.filter = 'brightness(1)'
  danmaku.style.fontSize = '18px'
}

// 显示弹幕信息
const showDanmakuInfo = (danmaku) => {
  danmaku.showInfo = !danmaku.showInfo
}

// 格式化时间
const formatTime = (time) => {
  const date = new Date(time)
  return `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`
}

// 发送弹幕到数据库
const sendDanmakuToDB = async (content) => {
  try {
    const res = await addDanmu({ content })
    if (res.code === 1) {
      ElMessage.success('弹幕发送成功')
      return res.data
    } else {
      ElMessage.error(res.message || '弹幕发送失败')
      return null
    }
  } catch (error) {
    console.error('发送弹幕API调用失败:', error)
    ElMessage.error('网络错误，弹幕发送失败')
    return null
  }
}

// 发送弹幕（带频率控制）
const sendDanmaku = async () => {
  const content = newDanmaku.value.trim()
  if (!content) return

  // 发送频率控制：10秒内同一用户不能发送相同内容
  if (isDuplicateContent(content)) {
    ElMessage.warning('请勿发送重复弹幕')
    return
  }

  // 先添加到界面
  if (addDanmaku(content, new Date(), true)) {
    // 发送到数据库
    const dbDanmaku = await sendDanmakuToDB(content)
    if (dbDanmaku) {
      const localDanmaku = activeDanmakus.value.find(d => d.isNew && d.content === content)
      if (localDanmaku) {
        localDanmaku._id = dbDanmaku._id
        localDanmaku.createdAt = dbDanmaku.createdAt
        localDanmaku.isNew = false
      }
    }
    newDanmaku.value = ''
  }
}

// 从数据库获取弹幕（增强去重）
const fetchDanmakus = async () => {
  try {
    const danmakus = await getDm()
    if (danmakus.length > 0) {
      // 过滤掉内容重复的弹幕
      const filteredDanmakus = danmakus.filter(danmaku => {
        return !isDuplicateContent(danmaku.content)
      })

      // 随机延迟添加弹幕
      filteredDanmakus.forEach((danmaku, index) => {
        setTimeout(() => {
          addDanmaku(danmaku.content, danmaku.createdAt)
        }, index * 1000) // 增加间隔时间
      })
    }
  } catch (error) {
    console.error('处理弹幕数据失败:', error)
  }
}

// 定期获取新弹幕（优化频率）
const startFetchingDanmakus = () => {
  fetchTimer = setInterval(async () => {
    try {
      const danmakus = await getDm()
      if (danmakus.length > 0) {
        // 1. 去重：过滤已显示的ID
        const idFiltered = danmakus.filter(danmaku => {
          return !activeDanmakus.value.some(existing => existing._id === danmaku._id)
        })
        // 2. 去重：过滤重复内容
        const contentFiltered = idFiltered.filter(danmaku => {
          return !isDuplicateContent(danmaku.content)
        })

        contentFiltered.forEach(danmaku => {
          addDanmaku(danmaku.content, danmaku.createdAt)
        })
      }
    } catch (error) {
      console.error('定期获取弹幕失败:', error)
    }
  }, 6000) // 延长获取间隔到8秒
}

// 窗口大小变化时重新计算
const handleResize = () => {
  initScreenSize()
  activeDanmakus.value.forEach(danmaku => {
    danmaku.style.top = `${(screenHeight.value / TRACKS) * danmaku.track}px`
  })
}

onMounted(() => {
  initScreenSize()
  updateDanmakus()
  fetchDanmakus()
  startFetchingDanmakus()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  if (animationFrameId) cancelAnimationFrame(animationFrameId)
  if (fetchTimer) clearInterval(fetchTimer)
  window.removeEventListener('resize', handleResize)
})
</script>
<template>
  <div class="danmaku-container">
    <div class="danmaku-screen" ref="screenRef">
      <div v-for="danmaku in activeDanmakus" :key="danmaku._id" :style="danmaku.style" class="danmaku-item"
        @mouseenter="pauseDanmaku(danmaku)" @mouseleave="resumeDanmaku(danmaku)" @click="showDanmakuInfo(danmaku)">
        {{ danmaku.content }}
        <div v-show="danmaku.showInfo" class="danmaku-info">
          {{ formatTime(danmaku.createdAt) }}
        </div>
      </div>
    </div>
    <div class="form-control" style="scale: 1.5;z-index: 9999;">
      <input v-model="newDanmaku" type="text" required="" @keyup.enter="sendDanmaku">
      <label>
        <span style="transition-delay:0ms">按</span><span style="transition-delay:50ms">下</span><span
          style="transition-delay:100ms">回</span><span style="transition-delay:150ms">车</span><span
          style="transition-delay:200ms">发</span><span style="transition-delay:250ms">送</span><span
          style="transition-delay:300ms">.</span><span style="transition-delay:350ms">.</span><span
          style="transition-delay:400ms">.</span>
      </label>
    </div>
  </div>
</template>
<style scoped>
.danmaku-container {
  box-sizing: border-box;
  padding-top: 120px;
  position: relative;
  width: 100%;
  height: 100vh;
  margin: 0 auto;
  background-color: #000;
  overflow: hidden;
  border-radius: 8px;
}

.danmaku-screen {
  position: relative;
  width: 100%;
  height: calc(100% - 50px);
}

.danmaku-item {
  padding: 6px 10px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
}

.danmaku-item:hover {
  filter: brightness(1.5);
}

.danmaku-info {
  position: absolute;
  bottom: -28px;
  left: 0;
  font-size: 14px;
  background-color: rgba(0, 0, 0, 0.8);
  color: #fff;
  padding: 3px 8px;
  border-radius: 4px;
  white-space: nowrap;
  opacity: 0;
  transition: opacity 0.3s;
}

.danmaku-item:hover .danmaku-info {
  opacity: 1;
}

.form-control {
  position: absolute;
  top: 50%;
  left: 53%;
  transform: translateX(-50%) translateY(-50%);
  width: 200px;
}

.form-control input {
  background-color: transparent;
  border: 0;
  border-bottom: 2px lightseagreen solid;
  display: block;
  width: 100%;
  padding: 15px 0;
  font-size: 18px;
  color: #fff;
}

.form-control input:focus,
.form-control input:valid {
  outline: 0;
  border-bottom-color: lightblue;
}

.form-control label {
  position: absolute;
  top: 15px;
  left: 0;
  pointer-events: none;
}

.form-control label span {
  display: inline-block;
  font-size: 18px;
  min-width: 5px;
  color: #fff;
  transition: 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.form-control input:focus+label span,
.form-control input:valid+label span {
  color: lightblue;
  transform: translateY(-30px);
}
</style>