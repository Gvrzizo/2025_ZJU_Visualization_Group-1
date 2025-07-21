<template>
  <div>
    <div v-if="$route.meta.showNav !== false">
      <router-link to="/studio"><h1>（仮）根据工作室分析</h1></router-link>
      <router-link to="/rank"><h1>动画列表</h1></router-link>
      <router-link to ="/line_chart"><h1>同上，好看的折线图是也</h1></router-link>
    </div>
    
    <router-view />
  </div>
</template>
