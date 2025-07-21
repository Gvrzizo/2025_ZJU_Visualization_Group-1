<template>
<div v-if="sharedState.vis">
  <div v-if = "$route.meta.showNav !== false">
  <router-link to ="/studio"><h1>（仮）根据工作室分析</h1></router-link>
  </div>
  <router-view />
</div>
  <div>
    <button @click="changevisible" v-if="sharedState.vis">排行</button>
    <rankingpage v-if="!sharedState.vis"></rankingpage>
  </div>
</template>

<script setup>
  import {ref} from 'vue'
    import rankingpage from './components/rankingpage.vue'
    import {sharedState} from './components/sharedvis.js'
    function changevisible(){
        sharedState.vis=!sharedState.vis
    }
</script>

<style scoped>
</style>
