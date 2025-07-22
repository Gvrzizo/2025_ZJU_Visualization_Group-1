<template>
  <div>
    <div v-if="isHomePage" class="home-layout">
      <h1 class="main-title">动漫数据分析</h1>
      <div class="nav-links">
        <router-link to="/studio"><h2>（仮）根据工作室分析</h2></router-link>
        <router-link to="/rank"><h2>动画列表</h2></router-link>
        <router-link to="/line_chart"><h2>同上，好看的折线图是也</h2></router-link>
      </div>
    </div>
    <div v-else class="nav-container">
      <nav class="navbar">
        <router-link to="/" class="nav-item">首页</router-link>
        <router-link to="/studio" class="nav-item">（仮）根据工作室分析</router-link>
        <router-link to="/rank" class="nav-item">动画列表</router-link>
        <router-link to="/line_chart" class="nav-item">同上，好看的折线图是也</router-link>
      </nav>
    </div>
    <router-view />
  </div>
</template>
<script>
  export default {
    computed: {
      isHomePage() {
        return this.$route.path === '/';
      }
    }
  }
</script>
<style scoped>
  .home-layout {
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
    background: #42b983;
    color: white;
    transform: scale(1.05);
  }
  .nav-links h2 {
    margin: 0;
    font-size: 1.8rem;
    font-weight: 600;
  }
  .nav-container {
    width: 100%;
    background-color: #f8f9fa;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    padding: 1rem 0;
    position: sticky;
    top: 0;
    z-index: 1000;
  }
  .navbar {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 2rem;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem;
  }
  .nav-item {
    text-decoration: none;
    color: #333;
    font-size: 1.2rem;
    font-weight: 500;
    padding: 0.8rem 1.5rem;
    border-radius: 6px;
    transition: all 0.3s ease;
    position: relative;
  }
  .nav-item:hover {
    background-color: #e9ecef;
    transform: translateY(-2px);
  }
  .nav-item.router-link-exact-active {
    background-color: #b94289;
    color: white;
  }
  .nav-item.router-link-exact-active::after {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 50%;
    transform: translateX(-50%);
    width: 60%;
    height: 3px;
    background-color: #b942ab;
    border-radius: 3px;
  }
  @media (max-width: 768px) {
    .navbar {
      flex-direction: column;
      gap: 1rem;
      padding: 1rem;
    }
    .nav-item {
      width: 100%;
      text-align: center;
    }
    .nav-links {
      gap: 1.5rem;
    }
    .nav-links a {
      padding: 2rem;
      min-width: 200px;
    }
    .main-title {
      font-size: 2rem;
    }
}
</style>
