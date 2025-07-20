<script>
import studiosData from "@/assets/studioData.json"
import L from "leaflet"
import "vue"
export default {
      data() { return {
          map: null,
          markers: [],
          studios: studiosData,
          selectedStudio: null,
          regions: ["全部", "亚洲", "美洲", "欧洲"],
          activeRegion: "全部",
          searchQuery: ""
        }
      },
      computed: {
        // 计算总动画数量
        totalAnimeCount() {
          return this.studios.reduce((sum, studio) => sum + studio.cnt, 0);
        },
        // 计算最高平均分
        highestAvgScore() {
          const maxScore = Math.max(...this.studios.map(studio => studio.avgScore));
          return maxScore.toFixed(1);
        },
        distinctRegions() {
          const regions = new Set(this.studios.map(studio => studio.region));
          return regions.size;
        },
        // 过滤工作室
        filteredStudios() {
          let result = [...this.studios];
          
          // 地区过滤
          if (this.activeRegion !== "全部") {
            result = result.filter(studio => studio.region === this.activeRegion);
          }
          
          // 搜索过滤
          if (this.searchQuery) {
            const query = this.searchQuery.toLowerCase();
            result = result.filter(studio => 
              studio.studio.toLowerCase().includes(query) ||
              (studio.location && studio.location.toLowerCase().includes(query) || (studio.description && studio.description.toLowerCase().includes(query)))
            );
          }
          
          return result;
        }
      },
      watch: {
        // 当过滤条件变化时更新地图标记
        filteredStudios() {
          this.map.remove();
          this.initMap();
          this.updateMapMarkers();
        }
      },
      beforeDestroy() {
        if (this.map) {
          this.map.remove();
        }
      },
      mounted() {
        this.initMap();
        this.addMarkers();
      },
      methods: {
        initMap() {
          // 初始化地图，设置视图到世界范围
          this.map = L.map('map').setView([30, 0], 2);
          
          // 添加地图图层
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          }).addTo(this.map);
        },
        setupResizeObserver() {
          this.resizeObserver = new ResizeObserver(() => {
            if (this.map) {
              this.$nextTick(() => {
                this.map.invalidateSize();
              });
            }
          });
          this.resizeObserver.observe(this.$refs.mapContainer);
        },
        addMarkers() {
          // 清除现有标记
          this.markers.forEach(marker => this.map.removeLayer(marker));
          this.markers = [];
          
          // 添加标记
          this.filteredStudios.forEach(studio => {
            const marker = L.marker(studio.coordinates).addTo(this.map);
            
            // 添加点击事件
            marker.on('click', () => {
              this.selectedStudio = studio;
              // 平滑滚动到详情区域
              document.querySelector('.studio-info').scrollTop = 0;
            });
            
            // 添加悬停效果
            marker.on('mouseover', () => {
              marker.openPopup();
            });
            
            marker.on('mouseout', () => {
              marker.closePopup();
            });
            
            // 添加弹出窗口
            marker.bindPopup(`
              <div style="font-weight:bold;font-size:16px;margin-bottom:5px">
                <i class="fas fa-film" style="color:#4361ee"></i> ${studio.studio}
              </div>
              <div>${studio.location || '位置信息'}</div>
              <div style="margin-top:5px">
                <span style="background:#4361ee;color:white;padding:2px 8px;border-radius:10px">
                  ${studio.avgScore.toFixed(1)}/10
                </span>
              </div>
            `);
            
            this.markers.push(marker);
          });
          
          // 如果只有一个工作室，自动聚焦到该工作室
          if (this.filteredStudios.length === 1) {
            this.map.setView(this.filteredStudios[0].coordinates, 6);
            this.selectedStudio = this.filteredStudios[0];
          }
        },
        updateMapMarkers() {
          this.addMarkers();
          
          // 如果有多个标记点，调整地图视图以包含所有标记
          if (this.markers.length > 0) {
            const group = new L.featureGroup(this.markers);
            this.map.fitBounds(group.getBounds().pad(0.1));
          }
        },
        filterByRegion(region) {
          this.activeRegion = region;
          this.selectedStudio = null;
        }
      }
    };
</script>

<template>
  <div id="studioBody">
    <div class="container">
      <header>
        <h1>热门<span class="highlight">动画工作室</span>地图</h1>
        <p class="subtitle">探索中国和日本动画工作室的位置、代表作和评分信息。点击地图上的标记点查看详细信息。</p>
      </header>
      
      <div class="app-container">
        <section class="controls-section">
          <div class="stats-bar">
            <div class="stat-card">
              <div class="stat-value">{{ studios.length }}</div>
              <div class="stat-label">工作室数量</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">{{ totalAnimeCount }}</div>
              <div class="stat-label">动画总数（重复计数）</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">{{ highestAvgScore }}</div>
              <div class="stat-label">最高平均分</div>
            </div>
          </div>
          
          
          <div class="search-box">
            <input type="text" v-model="searchQuery" placeholder="搜索工作室...">
            <i class="fas fa-search"></i>
          </div>
        </section>
        
        <section class="map-section">
          <div id="map"></div>
          <div class="studio-info">
            <div class="info-placeholder" v-if="!selectedStudio">
              <i class="fas fa-map-marker-alt"></i>
              <h3>选择工作室查看详情</h3>
              <p>点击地图上的标记点查看工作室的详细信息</p>
            </div>
            
            <div class="studio-card" v-if="selectedStudio">
              <div class="studio-header">
                <div class="studio-logo">{{ selectedStudio.studio.substring(0, 1) }}</div>
                <div>
                  <div class="studio-name">{{ selectedStudio.studio }}</div>
                  <div class="studio-location">
                    <i class="fas fa-map-marker-alt"></i>
                    {{ selectedStudio.location || '位置信息' }}
                  </div>
                </div>
              </div>
              
              <div class="info-section">
                <div class="info-title">
                  <i class="fas fa-info-circle"></i>
                  工作室简介
                </div>
                <div class="info-content">{{ selectedStudio.description }}</div>
              </div>
              
              <div class="info-section">
                <div class="info-title">
                  <i class="fas fa-film"></i>
                  代表作品
                </div>
                <div class="works-list">
                  <div class="work-item" v-for="(work, index) in selectedStudio.repre.slice(0, 3)" :key="index">
                    {{ work }}
                  </div>
                </div>
              </div>
              
              <div class="info-section">
                <div class="info-title">
                  <i class="fas fa-star"></i>
                  评分信息
                </div>
                <div class="info-content">
                  平均作品评分: <span class="rating">{{ selectedStudio.avgScore.toFixed(1) }}/10</span>
                </div>
                
                <div class="stats">
                  <div class="stat-item">
                    <div class="stat-value">{{ selectedStudio.cnt }}</div>
                    <div class="stat-label">作品总数</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
      
      <footer>
        <p>动画工作室地图可视化 | 使用Vue.js和Leaflet构建 | 数据来源: Kaggle</p>
      </footer>
    </div>
  </div>
</template>

<style>

#studioBody {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(135deg, #1a2a6c, #b21f1f, #1a2a6c);
  color: #333;
  min-height: 100vh;
  padding: 20px;
  overflow-x: hidden;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
}

header {
  text-align: center;
  padding: 30px 20px;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

h1 {
  font-size: 2.8rem;
  margin-bottom: 10px;
}

.subtitle {
  font-size: 1.2rem;
  max-width: 700px;
  margin: 0 auto 20px;
  opacity: 0.9;
  line-height: 1.6;
}

.app-container {
  display: flex;
  flex-direction: column;
  gap: 25px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.25);
  overflow: hidden;
}

.controls-section {
  padding: 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #eee;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.stats-bar {
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
  gap: 15px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 15px 20px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  min-width: 180px;
}

.stat-value {
  font-size: 1.8rem;
  font-weight: 700;
  color: #4361ee;
}

.stat-label {
  font-size: 0.9rem;
  color: #6c757d;
}

.filter-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  justify-content: center;
  align-items: center;
}

.filter-btn {
  padding: 10px 20px;
  border: none;
  background: #e9ecef;
  border-radius: 30px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-btn:hover {
  background: #dee2e6;
}

.filter-btn.active {
  background: #4361ee;
  color: white;
  box-shadow: 0 4px 12px rgba(67, 97, 238, 0.3);
}

.search-box {
  max-width: 2000px;
  margin: 0 auto;
  position: relative;
}

.search-box input {
  width: 100%;
  padding: 12px 40px 12px 20px;
  border: 2px solid #ddd;
  border-radius: 30px;
  font-size: 1rem;
  transition: all 0.3s;
}

.search-box input:focus {
  border-color: #4361ee;
  box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.2);
  outline: none;
}

.search-box i {
  position: absolute;
  right: -50px;
  top: 50%;
  transform: translateY(-50%);
  color: #777;
}

.map-section {
  display: flex;
  min-height: 70vh;
}

#map {
  flex: 3;
  min-height: 500px;
  z-index: 1;
}

.studio-info {
  flex: 1;
  min-width: 320px;
  padding: 25px;
  background: white;
  border-left: 1px solid #eee;
  overflow-y: auto;
  max-height: 70vh;
  transition: all 0.3s ease;
}

.info-placeholder {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  text-align: center;
  color: #6c757d;
}

.info-placeholder i {
  font-size: 5rem;
  margin-bottom: 20px;
  color: #dee2e6;
}

.info-placeholder h3 {
  font-size: 1.8rem;
  margin-bottom: 10px;
}

.studio-card {
  background: white;
  border-radius: 15px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
  padding: 25px;
  margin-bottom: 20px;
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.studio-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.studio-logo {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  color: #4361ee;
  font-weight: bold;
}

.studio-name {
  font-size: 1.8rem;
  font-weight: 700;
}

.studio-location {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #6c757d;
  margin-top: 5px;
}

.info-section {
  margin-bottom: 20px;
}

.info-title {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 12px;
  color: #4361ee;
  display: flex;
  align-items: center;
  gap: 10px;
}

.info-content {
  white-space: pre-line;
  line-height: 1.6;
  color: #495057;
}

.works-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 12px;
  margin-top: 10px;
}

.work-item {
  background: #f8f9fa;
  padding: 10px;
  border-radius: 8px;
  text-align: center;
  font-weight: 500;
  transition: transform 0.2s;
}

.work-item:hover {
  transform: translateY(-3px);
  background: #e9ecef;
}

.rating {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 12px;
  background: #4361ee;
  color: white;
  border-radius: 20px;
  font-weight: 600;
}

.stats {
  display: flex;
  gap: 15px;
  margin-top: 15px;
}

.stat-item {
  flex: 1;
  text-align: center;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 10px;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #4361ee;
}

.stat-label {
  font-size: 0.9rem;
  color: #6c757d;
}

footer {
  text-align: center;
  padding: 20px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
}

.highlight {
  background: linear-gradient(120deg, #4361ee, #3a0ca3);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  font-weight: 700;
}

@media (max-width: 992px) {
  .map-section {
    flex-direction: column;
  }

  .studio-info {
    border-left: none;
    border-top: 1px solid #eee;
    max-height: 40vh;
  }

  .studio-card {
    padding: 20px;
  }
}

@media (max-width: 576px) {
  h1 {
    font-size: 2.2rem;
  }

  .subtitle {
    font-size: 1rem;
  }

  .filter-btn {
    padding: 8px 15px;
    font-size: 0.9rem;
  }

  .studio-name {
    font-size: 1.5rem;
  }

  .stat-card {
    min-width: 130px;
    padding: 10px 15px;
  }

  .stat-value {
    font-size: 1.5rem;
  }
}
</style>