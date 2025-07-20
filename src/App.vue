<script>
</script>

<template>
<div>
  <div v-if = "$route.meta.showNav !== false">
  <router-link to ="/studio"><h1>（仮）根据工作室分析</h1></router-link>
  </div>
  <router-view />
</div>
</template>

<style scoped>
</style>