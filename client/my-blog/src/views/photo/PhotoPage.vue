<template>
  <div class="album-page">
    <h1 style="margin-top: 80px;text-align: center;padding: 0">我的珍藏相册</h1>
    <div class="controls">
      <button @click="showAddDialog = true">
        <i class="fas fa-plus"></i> 添加新照片
      </button>
      <button @click="resetLayout">
        <i class="fas fa-sync-alt"></i> 重置布局
      </button>
    </div>

    <!-- 添加照片对话框 -->
    <div v-if="showAddDialog" class="dialog-overlay">
      <div class="add-dialog">
        <h3>添加新照片</h3>
        <el-form>
          <el-form-item label="输入照片描述">
            <el-input v-model="newPhoto.content"></el-input>
          </el-form-item>
        </el-form>
        <el-form-item>
          <el-upload class="upload-demo" drag :action="uploadUrl" :headers="headers" :on-success="handleSuccess"
            :on-error="handleError" :before-upload="beforeUpload" :show-file-list="false" name="file">
            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
            <div class="el-upload__text">
              Drop file here or <em>click to upload</em>
            </div>
            <template #tip>
              <div class="el-upload__tip">
                jpg/png files with a size less than 500kb
              </div>
            </template>
          </el-upload>
          <div v-if="newPhoto.imgUrl" style="width: 100px;">
            <el-image max-scale="1" :src="'http://localhost:3000' + newPhoto.imgUrl"
              :preview-src-list="['http://localhost:3000' + newPhoto.imgUrl]" />
            <el-button size="small" type="danger" @click="removeImage">删除图片</el-button>
          </div>
        </el-form-item>
        <el-form-item style="margin: 0 auto;">
          <el-button type="primary" @click="addPhotoToDB">添加</el-button>
          <el-button type="primary" @click="showAddDialog = false">取消</el-button>
        </el-form-item>
      </div>
    </div>

    <div class="album-container" ref="container">
      <div v-for="(frame, index) in photoFrames" :key="frame._id" class="photo-frame" :style="{
        left: frame.x + 'px',
        top: frame.y + 'px',
        transform: `rotate(${frame.rotate}deg)`,
        zIndex: frame.zIndex
      }" :class="{ dragging: frame._id === draggingFrameId }" @mousedown="startDrag($event, frame)">
        <div class="photo-content" :style="{ backgroundImage: `url(${'http://localhost:3000' + frame.imgUrl})` }">
          <div class="photo-label">{{ frame.content }}</div>
        </div>
        <div class="frame-corner corner-tl"></div>
        <div class="frame-corner corner-tr"></div>
        <div class="frame-corner corner-bl"></div>
        <div class="frame-corner corner-br"></div>
      </div>

      <div class="instructions">
        <p><i class="fas fa-mouse-pointer"></i> 点击并拖动相框移动位置</p>
        <p><i class="fas fa-hand-pointer"></i> 悬停查看照片描述</p>
        <p><i class="fas fa-plus-circle"></i> 添加更多照片</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useUserStore } from '@/stores';
import { getPhoto, postPhoto } from '@/api/photo';
const userStore = useUserStore()
// 相框数据（从数据库获取）
const photoFrames = ref([]);

// 添加照片对话框状态
const showAddDialog = ref(false);
const newPhoto = ref({
  content: '',
  imgUrl: ''
});
// 上传路由
const uploadUrl = 'http://localhost:3000/api/upload';
// 上传请求头，添加token等认证信息（如果需要）
const headers = {
  'Authorization': 'Bearer ' + userStore.token, // 如果需要认证
};
// 上传成功回调
const handleSuccess = (response, file, fileList) => {
  if (response.code === 1) {
    // 后端返回的图片URL
    newPhoto.value.imgUrl = response.data;
    ElMessage.success('图片上传成功');
  } else {
    ElMessage.error(response.msg || '上传失败');
  }
};
// 上传错误回调
const handleError = (error, file, fileList) => {
  ElMessage.error('上传失败，请重试');
  console.error('上传错误:', error);
}
// 上传前验证
const beforeUpload = (file) => {
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
  const isLt2M = file.size / 1024 / 1024 < 2;

  if (!isJpgOrPng) {
    ElMessage.error('只能上传JPG/PNG格式的图片');
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过2MB');
  }
  return isJpgOrPng && isLt2M;
};
// 删除已上传的图片
const removeImage = () => {
  newPhoto.value.imgUrl = '';
};

// 拖拽相关状态
const container = ref(null);
const draggingFrameId = ref(null);
const dragStartX = ref(0);
const dragStartY = ref(0);
const frameStartX = ref(0);
const frameStartY = ref(0);


// 从数据库获取照片数据
async function fetchPhotos() {
  try {
    const response = await getPhoto();
    // console.log(response.data)

    const data = response.data

    // 添加位置和旋转信息
    const containerRect = container.value?.getBoundingClientRect() || { width: 800, height: 600 };
    photoFrames.value = data.map(photo => ({
      ...photo,
      x: Math.random() * (containerRect.width - 200),
      y: Math.random() * (containerRect.height - 260),
      rotate: (Math.random() * 10) - 5,
      zIndex: Math.floor(Math.random() * 10) + 1
    }));
  } catch (error) {
    // console.error('获取照片数据失败:', error);
    // 使用模拟数据作为后备
    photoFrames.value = [
      {
        _id: '1',
        content: "山间日出",
        imgUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=240&w=180",
        x: 100,
        y: 80,
        rotate: -2,
        zIndex: 1
      },
      {
        _id: '2',
        content: "海边日落",
        imgUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=240&w=180",
        x: 300,
        y: 150,
        rotate: 1,
        zIndex: 2
      }
    ];
  }
}

// 添加新照片到数据库
const addPhotoToDB = async () => {
  if (!newPhoto.value.content || !newPhoto.value.imgUrl) {
    alert('请填写照片描述和图片URL');
    return;
  }

  try {
    const response = await postPhoto(newPhoto.value)

    if (response.code === 1) {
      const addedPhoto = response.data
      // 添加位置信息
      const containerRect = container.value.getBoundingClientRect();
      const newFrame = {
        ...addedPhoto,
        x: Math.random() * (containerRect.width - 200),
        y: Math.random() * (containerRect.height - 260),
        rotate: (Math.random() * 10) - 5,
        zIndex: photoFrames.value.length + 1
      };

      photoFrames.value.push(newFrame);
      showAddDialog.value = false;
      newPhoto.value = { content: '', imgUrl: '' };
    } else {
      throw new Error('添加照片失败');
    }
  } catch (error) {
    console.error('添加照片失败:', error);
    alert('添加照片失败，请稍后再试');
  }
}

// 重置布局
function resetLayout() {
  const containerRect = container.value.getBoundingClientRect();

  photoFrames.value = photoFrames.value.map((frame, index) => ({
    ...frame,
    x: Math.random() * (containerRect.width - 200),
    y: Math.random() * (containerRect.height - 260),
    rotate: (Math.random() * 10) - 5,
    zIndex: index + 1
  }));
}

// 开始拖拽
function startDrag(event, frame) {
  draggingFrameId.value = frame._id;
  dragStartX.value = event.clientX;
  dragStartY.value = event.clientY;
  frameStartX.value = frame.x;
  frameStartY.value = frame.y;

  // 提升当前相框层级
  const maxZIndex = Math.max(...photoFrames.value.map(f => f.zIndex));
  frame.zIndex = maxZIndex + 1;

  document.addEventListener('mousemove', onDrag);
  document.addEventListener('mouseup', stopDrag);
}

// 拖拽中
function onDrag(event) {
  if (!draggingFrameId.value) return;

  const frame = photoFrames.value.find(f => f._id === draggingFrameId.value);
  if (!frame) return;

  const dx = event.clientX - dragStartX.value;
  const dy = event.clientY - dragStartY.value;

  frame.x = frameStartX.value + dx;
  frame.y = frameStartY.value + dy;
}

// 停止拖拽
function stopDrag() {
  draggingFrameId.value = null;
  document.removeEventListener('mousemove', onDrag);
  document.removeEventListener('mouseup', stopDrag);
}

onMounted(() => {
  fetchPhotos();
});
</script>

<style scoped>
.album-page {
  overflow: hidden;
  height: 100vh;
  box-sizing: border-box;
  /* background: linear-gradient(135deg, #1a2a6c, #b21f1f, #1a2a6c); */
  background-size: 400% 400%;
  animation: gradientBG 15s ease infinite;
  color: #fff;
  padding: 20px;
  display: flex;
  flex-direction: column;

  @keyframes gradientBG {
    0% {
      background-position: 0% 50%;
    }

    50% {
      background-position: 100% 50%;
    }

    100% {
      background-position: 0% 50%;
    }
  }
}

h1 {
  color: #fff;
  text-align: center;
  margin-top: 40px;
  font-size: 2.8rem;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  letter-spacing: 2px;
  background: linear-gradient(to right, #ffecd2, #fcb69f);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  position: relative;
  display: inline-block;
  width: 100%;
}

h1::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 100px;
  height: 4px;
  background: linear-gradient(to right, #ffecd2, #fcb69f);
  border-radius: 2px;
}

.controls {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin: 30px 0;
  z-index: 10;
}

.controls button {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  padding: 12px 25px;
  border-radius: 50px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.controls button:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.album-container {
  background-color: rgba(240, 240, 240, 0.15);
  margin-top: 20px;
  height: calc(100vh - 200px);
  width: 100%;
  border-radius: 20px;
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  position: relative;
}

.photo-frame {
  position: absolute;
  width: 180px;
  height: 240px;
  background-color: #fff;
  border: 10px solid #f5f5f5;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  cursor: grab;
  transition: transform 0.2s ease, box-shadow 0.3s ease, z-index 0s;
  overflow: hidden;
}

.photo-frame:hover {
  transform: scale(1.03);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
  z-index: 10;
}

.photo-frame.dragging {
  cursor: grabbing;
  transform: scale(1.05);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4);
}

.photo-frame::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 15px;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.1), transparent);
  z-index: 2;
}

.photo-frame::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 15px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.1), transparent);
  z-index: 2;
}

.photo-content {
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.photo-label {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 8px;
  font-size: 0.9rem;
  text-align: center;
  font-weight: 500;
  transform: translateY(100%);
  transition: transform 0.3s ease;
}

.photo-frame:hover .photo-label {
  transform: translateY(0);
}

.frame-corner {
  position: absolute;
  width: 25px;
  height: 25px;
  border: 3px solid #e0e0e0;
}

.corner-tl {
  top: -5px;
  left: -5px;
  border-right: none;
  border-bottom: none;
}

.corner-tr {
  top: -5px;
  right: -5px;
  border-left: none;
  border-bottom: none;
}

.corner-bl {
  bottom: -5px;
  left: -5px;
  border-right: none;
  border-top: none;
}

.corner-br {
  bottom: -5px;
  right: -5px;
  border-left: none;
  border-top: none;
}

.instructions {
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.3);
  padding: 15px;
  border-radius: 10px;
  max-width: 250px;
  font-size: 0.9rem;
  line-height: 1.5;
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.instructions i {
  margin-right: 8px;
  color: #ffd700;
}

.dialog-overlay {
  text-align: center;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
}

.add-dialog {
  text-align: center;
  background: white;
  padding: 25px;
  border-radius: 15px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  color: #333;
}

.add-dialog h3 {
  margin-top: 0;
  color: #1a2a6c;
  text-align: center;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
}

.dialog-buttons {
  display: flex;
  gap: 15px;
  margin-top: 20px;
}

.dialog-buttons button {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.dialog-buttons button:first-child {
  background: #1a2a6c;
  color: white;
}

.dialog-buttons button:first-child:hover {
  background: #0d1a4a;
}

.dialog-buttons button:last-child {
  background: #e0e0e0;
  color: #333;
}

.dialog-buttons button:last-child:hover {
  background: #c0c0c0;
}
</style>