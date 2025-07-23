<template>
  <div class="grid-container">
    <GridButton 
      v-for="(item, index) in buttons" 
      :key="index"
      :to="item.to"
      :imageUrl="item.image"
      :words="item.words"
      :comm="item.comm"
    />
  </div>
</template>

<script setup>
import GridButton from './GridButton.vue'
import img1 from '@/assets/images/img1.png'
import img2 from '@/assets/images/img2.png'
import img3 from '@/assets/images/img3.png'
import img4 from '@/assets/images/img4.png'

const buttons = [
  { to: '/rank', image: img1, words: "动画列表", comm: "了解来自上千个工作室的上万部动画的详细信息" },
  { to: '/studio', image: img2, words: "工作室分析", comm: "通过地理图和题材雷达图详细了解不同动画工作室的情况" },
  { to: '/line_chart', image: img3, words: "题材分析", comm: "用图表分析大众对不同题材动画喜好的变迁" },
  { to: '/cloud_chart', image: img4, words: "词云", comm: "从词云直观感受各个工作室接手的热门IP" }
]
</script>

<style scoped>
.grid-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, 1fr);
  height: 100vh;
  gap: 1px; /* 防止边框重叠 */
}
</style>