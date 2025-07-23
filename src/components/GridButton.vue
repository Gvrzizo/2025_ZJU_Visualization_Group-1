<script setup>
defineProps({
  to: { type: String, required: true },
  imageUrl: { type: String, required: true },
  words: { type: String, required: true },
  comm: { type: String, required: true }
})
</script>

<template>
  <router-link :to="to" class="grid-button">
    <div 
      class="background-image"
      :style="{ backgroundImage: `url(${imageUrl})` }"
    />
    <div class="content">
      <div class="title">{{ words }}</div>
      <div class="descri">{{ comm }}</div>
    </div>
  </router-link>
</template>

<style scoped>
.grid-button {
  position: relative;
  overflow: hidden;
}

/* 正方形保证 */
.grid-button:before {
  content: "";
  display: block;
  padding-top: 100%; /* 1:1宽高比 */
}

.background-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  transition: all 0.5s ease;
  
  /* 默认毛玻璃+黑白效果 */
  filter: grayscale(100%) blur(5px);
  opacity: 0.8;
}

/* 悬停效果 */
.grid-button:hover .background-image {
  filter: grayscale(0%) blur(0);
  opacity: 1;
  transform: scale(1.05); /* 轻微放大增强交互感 */
}

.content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 2;
  color: whitesmoke;
  text-shadow: 0 2px 4px rgba(0,0,0,0.5);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.title {
  font-size: 2.5rem;
  font-weight: 700;
  color: white;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
  letter-spacing: 0.5px;
  margin-bottom: 8px;
}

.descri {
  font-size: 1.5rem;
  font-style: italic;
  color: rgba(255,255,255,0.85);
  line-height: 1.4;
  max-width: 100%;
}
</style>