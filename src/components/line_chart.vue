<template>
  <div class="dashboard">
    <h1>2000-2025年动漫题材数据分析</h1>
    
    <div class="controls">
      <div class="control-group">
        <h3>选择题材</h3>
        <div class="genre-selector">
          <div 
            v-for="genre in genres" 
            :key="genre"
            class="genre-chip"
            :class="{ active: selectedGenres.includes(genre) }"
            :style="{ backgroundColor: genreColors[genre] }"
            @click="toggleGenre(genre)"
          >
            {{ genre }}
          </div>
        </div>
      </div>
      
      <div class="control-group">
        <h3>年份范围</h3>
        <div class="year-range">
          <div class="slider-container">
            <input 
              type="range" 
              v-model.number="startYear" 
              min="2000" 
              max="2025" 
              class="slider"
              @input="updateCharts"
            >
            <span>{{ startYear }}</span>
          </div>
          <div class="slider-container">
            <input 
              type="range" 
              v-model.number="endYear" 
              min="2000" 
              max="2025" 
              class="slider"
              @input="updateCharts"
            >
            <span>{{ endYear }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <div class="charts-container">
      <div class="chart-card">
        <h2>平均评分变化 ({{ startYear }} - {{ endYear }})</h2>
        <div ref="avgChart" class="chart"></div>
      </div>
      
      <div class="chart-card">
        <h2>评分人数变化 ({{ startYear }} - {{ endYear }})</h2>
        <div ref="countChart" class="chart"></div>
      </div>
    </div>
    
    <div class="stats">
      <div class="stat-card">
        <h3>最高平均分</h3>
        <div class="stat-value">
          {{ highestScore.value.toFixed(2) }}
          <span class="stat-detail">({{ highestScore.genre }}, {{ highestScore.year }})</span>
        </div>
      </div>
      <div class="stat-card">
        <h3>最高评分人数</h3>
        <div class="stat-value">
          {{ (highestCount.value / 1000000).toFixed(1) }}M
          <span class="stat-detail">({{ highestCount.genre }}, {{ highestCount.year }})</span>
        </div>
      </div>
      <div class="stat-card">
        <h3>最受欢迎题材</h3>
        <div class="stat-value">
          {{ popularGenre.genre }}
          <span class="stat-detail">({{ (popularGenre.count / 1000000).toFixed(1) }}M)</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue';
import * as echarts from 'echarts';
import animeDataJson from '@/assets/data_line_2020+.json';

export default {
  setup() {
    const genres = [
      'Supernatural', 'Fantasy', 'Drama', 
      'Adventure', 'Action', 'Romance', 'Comedy'
    ];
    
    const genreColors = {
      Supernatural: '#5470C6',
      Fantasy: '#91CC75',
      Drama: '#FAC858',
      Adventure: '#EE6666',
      Action: '#73C0DE',
      Romance: '#3BA272',
      Comedy: '#FC8452'
    };
    
    const selectedGenres = ref([...genres]);
    const startYear = ref(2000);
    const endYear = ref(2025);
    
    const avgChart = ref(null);
    const countChart = ref(null);
    let avgChartInstance = null;
    let countChartInstance = null;
    
    // 统计数据
    const highestScore = ref({ value: 0, genre: '', year: 0 });
    const highestCount = ref({ value: 0, genre: '', year: 0 });
    const popularGenre = ref({ genre: '', count: 0 });
    
    const animeData = ref(animeDataJson);
    
    // 计算统计数据
    const calculateStats = () => {
      let maxScore = 0;
      let maxScoreItem = null;
      let maxCount = 0;
      let maxCountItem = null;
      const genreCounts = {};

      animeData.value.forEach(item => {
        // 使用 years 和 genres
        if (item.average_score > maxScore) {
          maxScore = item.average_score;
          maxScoreItem = item;
        }

        if (item.total_scored_by > maxCount) {
          maxCount = item.total_scored_by;
          maxCountItem = item;
        }

        // 处理 genres 可能是数组的情况
        const itemGenres = Array.isArray(item.genres) ? item.genres : [item.genres];
        
        itemGenres.forEach(g => {
          if (!genreCounts[g]) genreCounts[g] = 0;
          genreCounts[g] += item.total_scored_by;
        });
      });

      // 设置统计数据
      if (maxScoreItem) {
        highestScore.value = {
          value: maxScoreItem.average_score,
          // 取第一个题材作为代表
          genre: Array.isArray(maxScoreItem.genres) 
                  ? maxScoreItem.genres[0] 
                  : maxScoreItem.genres,
          year: maxScoreItem.years
        };
      }

      if (maxCountItem) {
        highestCount.value = {
          value: maxCountItem.total_scored_by,
          genre: Array.isArray(maxCountItem.genres) 
                  ? maxCountItem.genres[0] 
                  : maxCountItem.genres,
          year: maxCountItem.years
        };
      }

      // 查找最受欢迎题材
      let maxGenreCount = 0;
      let popular = '';
      for (const genre in genreCounts) {
        if (genreCounts[genre] > maxGenreCount) {
          maxGenreCount = genreCounts[genre];
          popular = genre;
        }
      }
      popularGenre.value = { genre: popular, count: maxGenreCount };
    };

    watch(selectedGenres, () => {
      renderCharts();
    }, { deep: true });

    // 修改2: 处理数据聚合
    const processData = () => {
      const filteredData = animeData.value.filter(item => 
        item.years >= startYear.value && 
        item.years <= endYear.value &&
        // 检查是否包含任一选中的题材
        selectedGenres.value.some(genre => 
          Array.isArray(item.genres) 
            ? item.genres.includes(genre)
            : item.genres === genre
        )
      );

      // 按年份和题材分组
      const grouped = {};
      filteredData.forEach(item => {
        const year = item.years;
        const itemGenres = Array.isArray(item.genres) ? item.genres : [item.genres];
        
        itemGenres.forEach(genre => {
          if (!selectedGenres.value.includes(genre)) return;
          
          if (!grouped[year]) grouped[year] = {};
          if (!grouped[year][genre]) {
            grouped[year][genre] = {
              totalScore: 0,
              totalCount: 0,
              dataPoints: 0
            };
          }
          
          grouped[year][genre].totalScore += item.average_score;
          grouped[year][genre].totalCount += item.total_scored_by;
          grouped[year][genre].dataPoints += 1;
        });
      });

      // 计算平均值
      for (const year in grouped) {
        for (const genre in grouped[year]) {
          const data = grouped[year][genre];
          grouped[year][genre] = {
            average: data.totalScore / data.dataPoints,
            count: data.totalCount
          };
        }
      }

      // 生成图表数据
      const years = Array.from(
        { length: endYear.value - startYear.value + 1 },
        (_, i) => startYear.value + i
      );

      const avgSeries = [];
      const countSeries = [];
      
      selectedGenres.value.forEach(genre => {
        const avgData = [];
        const countData = [];
        
        years.forEach(year => {
          if (grouped[year] && grouped[year][genre]) {
            avgData.push(grouped[year][genre].average);
            countData.push(grouped[year][genre].count);
          } else {
            avgData.push(null);
            countData.push(null);
          }
        });
        
        avgSeries.push({
          name: genre,
          type: 'line',
          data: avgData,
          symbol: 'circle',
          symbolSize: 8,
          lineStyle: { width: 3 },
          itemStyle: { color: genreColors[genre] }
        });
        
        countSeries.push({
          name: genre,
          type: 'line',
          data: countData,
          symbol: 'circle',
          symbolSize: 8,
          lineStyle: { width: 3 },
          itemStyle: { color: genreColors[genre] }
        });
      });
      
      return { years, avgSeries, countSeries };
    };
    
    // 渲染图表
    const renderCharts = () => {
      if (!animeData.value.length || !avgChart.value || !countChart.value) return;
      // 销毁旧实例
      if (avgChartInstance) {
        avgChartInstance.dispose();
        avgChartInstance = null;
      }
      if (countChartInstance) {
        countChartInstance.dispose();
        countChartInstance = null;
      }
      
      // 创建新实例
      avgChartInstance = echarts.init(avgChart.value);
      countChartInstance = echarts.init(countChart.value);

      const { years, avgSeries, countSeries } = processData();
      
      // 平均评分图表配置
      const avgOption = {
        tooltip: {
          trigger: 'axis',
          formatter: params => {
            let html = `${params[0].name}年<br>`;
            params.forEach(param => {
              html += `<span style="display:inline-block;margin-right:5px;border-radius:50%;width:10px;height:10px;background-color:${param.color}"></span>
                       ${param.seriesName}: ${param.value?.toFixed(3) || 'N/A'}<br>`;
            });
            return html;
          }
        },
        legend: {
          data: selectedGenres.value,
          bottom: 0
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '15%',
          top: '10%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: years,
          axisLine: {
            lineStyle: { color: '#6c757d' }
          }
        },
        yAxis: {
          type: 'value',
          name: '平均评分',
          min: 6.5,
          max: 8.5,
          axisLine: {
            lineStyle: { color: '#6c757d' }
          },
          splitLine: {
            lineStyle: { color: '#f1f1f1' }
          }
        },
        series: avgSeries
      };
      
      // 评分人数图表配置
      const countOption = {
        tooltip: {
          trigger: 'axis',
          formatter: params => {
            let html = `${params[0].name}年<br>`;
            params.forEach(param => {
              const value = param.value ? (param.value / 10000).toFixed(1) + '万' : 'N/A';
              html += `<span style="display:inline-block;margin-right:5px;border-radius:50%;width:10px;height:10px;background-color:${param.color}"></span>
                       ${param.seriesName}: ${value}<br>`;
            });
            return html;
          }
        },
        legend: {
          data: selectedGenres.value,
          bottom: 0
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '15%',
          top: '10%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: years,
          axisLine: {
            lineStyle: { color: '#6c757d' }
          }
        },
        yAxis: {
          type: 'log',
          name: '评分人数（对数尺度）',
          axisLine: {
            lineStyle: { color: '#6c757d' }
          },
          splitLine: {
            lineStyle: { color: '#f1f1f1' }
          }
        },
        series: countSeries
      };
      
      // 初始化图表
      if (!avgChartInstance) {
        avgChartInstance = echarts.init(avgChart.value);
        countChartInstance = echarts.init(countChart.value);
      }
      
      avgChartInstance.setOption(avgOption);
      countChartInstance.setOption(countOption);
    };
    
    // 切换题材选择
    const toggleGenre = (genre) => {
      const index = selectedGenres.value.indexOf(genre);
      if (index >= 0) {
        selectedGenres.value.splice(index, 1);
      } else {
        selectedGenres.value.push(genre);
      }
      renderCharts();
    };
    
    // 更新图表
    const updateCharts = () => {
      if (startYear.value > endYear.value) {
        [startYear.value, endYear.value] = [endYear.value, startYear.value];
      }
      renderCharts();
    };
    
    onMounted(() => {
      calculateStats(); // 初始化时直接计算统计
      renderCharts(); 
      window.addEventListener('resize', () => {
        avgChartInstance?.resize();
        countChartInstance?.resize();
      });
    });
    
    

    return {
      genres,
      genreColors,
      selectedGenres,
      startYear,
      endYear,
      avgChart,
      countChart,
      highestScore,
      highestCount,
      popularGenre,
      toggleGenre,
      updateCharts
    };
  }
};
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}



@keyframes gradientBG {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
}

.dashboard {
  max-width: 1600px;
  margin: 0 auto;
  padding: 20px;
  background: linear-gradient(135deg, #8A2387, #E94057, #4d16ac);
  color: #fff;
  line-height: 1.6;
  min-height: 100vh;
  padding: 20px;
  background-size: 400% 400%;
  animation: gradientBG 15s ease infinite;
}

h1 {
  font-size: 2.8rem;
  margin-bottom: 30px;
  font-weight: 700;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  position: relative;
  display: inline-block;
  padding: 0 20px;
}

h1:after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 50%;
    transform: translateX(-50%);
    width: 100px;
    height: 4px;
    background: linear-gradient(90deg, #ff416c, #00c6ff);
    border-radius: 2px;
}

.stat {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border-radius: 15px;
    padding: 20px 30px;
    min-width: 200px;
    box-shadow: 0 8px 32px rgba(31, 38, 135, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.18);
    transition: all 0.4s ease;
}

.stat:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 40px rgba(31, 38, 135, 0.3);
}

.stat i {
    font-size: 2.5rem;
    margin-bottom: 15px;
    background: linear-gradient(45deg, #ff416c, #00c6ff);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

.stat span {
    display: block;
    font-size: 2.2rem;
    font-weight: 700;
    margin-bottom: 5px;
}

.stat p {
    font-size: 1rem;
    opacity: 0.9;
}

.controls {
  background: white;
  border-radius: 10px;
  padding: 25px;
  margin-bottom: 30px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.control-group {
  margin-bottom: 25px;
}

.control-group:last-child {
  margin-bottom: 0;
}

.control-group h3 {
  margin-bottom: 15px;
  color: #495057;
  font-size: 1.1rem;
}

.genre-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.genre-chip {
  padding: 10px 18px;
  border-radius: 20px;
  cursor: pointer;
  font-weight: 500;
  color: white;
  transition: all 0.3s ease;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.genre-chip:hover {
  opacity: 0.9;
  transform: translateY(-2px);
}

.genre-chip.active {
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.8), 0 0 0 5px currentColor;
}

.year-range {
  display: flex;
  gap: 30px;
  align-items: center;
}

.slider-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.slider-container span {
  font-weight: 500;
  text-align: center;
  color: #495057;
}

.slider {
  width: 100%;
  height: 8px;
  border-radius: 4px;
  background: #e9ecef;
  outline: none;
  
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #5470C6;
  cursor: pointer;
  transition: all 0.2s;
}

.slider::-webkit-slider-thumb:hover {
  transform: scale(1.2);
  box-shadow: 0 0 0 4px rgba(84, 112, 198, 0.2);
}

.charts-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(700px, 1fr));
  gap: 25px;
  margin-bottom: 30px;
}

.chart-card {
  background: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  height: 500px;
  display: flex;
  flex-direction: column;
}

.chart-card h2 {
  margin-bottom: 15px;
  color: #2c3e50;
  font-size: 1.2rem;
  text-align: center;
}

.chart {
  flex: 1;
  width: 100%;
}

.stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 30px;
    margin: 40px 0;
}

.stat-card {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border-radius: 20px;
    padding: 30px;
    box-shadow: 0 8px 32px rgba(31, 38, 135, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.18);
    text-align: center;
    transition: all 0.4s ease;
    position: relative;
    overflow: hidden;
}

.stat-card:hover {
    transform: translateY(-10px);
    box-shadow: 0 15px 35px rgba(31, 38, 135, 0.3);
}

.stat-card i {
    font-size: 2.5rem;
    margin-bottom: 20px;
    background: linear-gradient(45deg, #ff416c, #00c6ff);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

.stat-card h3 {
    color: rgba(255, 255, 255, 0.9);
    font-size: 1.2rem;
    margin-bottom: 20px;
    font-weight: 600;
}

.stat-value {
    font-size: 2.8rem;
    font-weight: 800;
    color: white;
    margin-bottom: 10px;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.stat-detail {
    font-size: 1.1rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.8);
    display: block;
    margin-top: 10px;
}


@media (max-width: 1200px) {
  .charts-container {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .controls {
    padding: 15px;
  }
  
  .genre-selector {
    gap: 8px;
  }
  
  .genre-chip {
    padding: 8px 14px;
    font-size: 0.9rem;
  }
  
  .year-range {
    flex-direction: column;
    gap: 20px;
  }
  
  .stat-value {
    font-size: 1.8rem;
  }

  .header-stats {
      gap: 20px;
  }

  .stat {
      min-width: 150px;
      padding: 15px;
  }

  .stat span {
      font-size: 1.8rem;
  }

}
</style>