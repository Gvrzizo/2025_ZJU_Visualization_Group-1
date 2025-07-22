<template>
  <div>
    <div v-if="$route.meta.showNav !== false" class="page-container">
      <h1 class="main-title">动漫数据分析</h1>
      <div class="nav-links">
        <router-link to="/studio"><h2>（仮）根据工作室分析</h2></router-link>
        <router-link to="/rank"><h2>动画列表</h2></router-link>
        <router-link to="/line_chart"><h2>同上，好看的折线图是也</h2></router-link>
      </div>
    </div>
    <router-view />
  </div>
</template>

<style scoped>
  .page-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-height: 100vh;
    padding: 2rem;
  }
  .main-title {
    font-size: 3rem;
    margin-bottom: 3rem;
    color: #333;
    text-align: center;
    padding-top: 2rem;
  }
  .nav-links {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 3rem;
    flex-wrap: wrap;
  }
  .nav-links a {
    text-decoration: none;
    color: inherit;
    background: #f0f0f0;
    padding: 3rem 4rem;
    border-radius: 12px;
    transition: all 0.3s ease;
    text-align: center;
    min-width: 280px;
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  }
  .nav-links a:hover {
    background: #e0e0e0;
    transform: translateY(-5px);
    box-shadow: 0 8px 16px rgba(0,0,0,0.2);
  }
  .nav-links a.router-link-exact-active {
    background: #b9428b;
    color: white;
    transform: scale(1.05);
  }   
  .nav-links h2 {
    margin: 0;
    font-size: 1.8rem;
    font-weight: 600;
  }
</style>
