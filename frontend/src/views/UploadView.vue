<template>
  <div class="upload-page">
    <div class="minimal-card">
      <!-- Vùng chọn ảnh -->
      <div 
        class="upload-area" 
        @click="$refs.fileInput.click()"
        :class="{ 'has-image': previewUrl }"
      >
        <input type="file" ref="fileInput" @change="handleImageUpload" accept="image/*" hidden />
        
        <div v-if="!previewUrl" class="prompt">
          <span class="icon">＋</span>
          <p>Thêm ảnh</p>
        </div>
        
        <img v-else :src="previewUrl" class="preview-img" />
      </div>

      <!-- Form nhập nội dung (Chỉ hiện khi có ảnh) -->
      <div v-if="previewUrl" class="caption-area">
        <textarea 
          v-model="caption" 
          placeholder="Bạn đang nghĩ gì?..."
        ></textarea>
        
        <div class="actions">
          <button @click="previewUrl = null" class="btn-text">Hủy</button>
          <button 
            @click="submitPost" 
            :disabled="isUploading || !caption" 
            class="btn-share"
          >
            {{ isUploading ? '...' : 'Chia sẻ' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { usePostStore } from '@/stores/postStore'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const postStore = usePostStore()
const authStore = useAuthStore()

const caption = ref('')
const previewUrl = ref(null)
const isUploading = ref(false)

const handleImageUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      previewUrl.value = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

const submitPost = async () => {
  isUploading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 600))
    postStore.addPost({
      id: Date.now(),
      imageUrl: previewUrl.value,
      caption: caption.value,
      user: {
        username: authStore.user.username,
        avatar: authStore.user.avatar
      },
      likes: 0,
      createdAt: new Date().toISOString()
    })
    router.push('/feed')
  } catch (err) {
    console.error(err)
  } finally {
    isUploading.value = false
  }
}
</script>

<style scoped>
/* Layout chính */
.upload-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 20px;
  gap: 20px;
}

.minimal-card { width: 100%; max-width: 400px; }

/* Vùng Upload & Preview */
.upload-area {
  width: 100%;
  aspect-ratio: 1;
  background: #f8f9fa;
  border-radius: 24px;
  display: grid;
  place-items: center; /* Căn giữa icon/ảnh cực nhanh */
  cursor: pointer;
  overflow: hidden;
}

.upload-area img { width: 100%; height: 100%; object-fit: cover; }

.prompt { text-align: center; color: #adb5bd; font-size: 15px; }
.prompt span { display: block; font-size: 40px; font-weight: 200; }

/* Nhập liệu & Nút bấm */
textarea {
  width: 100%;
  height: 100px;
  border: none;
  outline: none;
  padding: 15px 0;
  font: inherit;
  resize: none;
}

.actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* Nút bấm dùng chung */
button { border: none; cursor: pointer; font-weight: 600; transition: 0.2s; }

.btn-text { background: none; color: #8e8e8e; font-size: 14px; }

.btn-share {
  background: #000;
  color: #fff;
  padding: 10px 28px;
  border-radius: 30px;
}

.upload-area {
  /* ... giữ các dòng cũ ... */
  border: 1px solid #efefef; /* Thêm viền cực mảnh */
  box-shadow: 0 4px 12px rgba(0,0,0,0.03); /* Đổ bóng nhẹ như mây */
}

.btn-share:disabled { background: #eee; color: #ccc; cursor: not-allowed; }
</style>