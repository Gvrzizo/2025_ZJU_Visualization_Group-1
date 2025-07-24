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
            :style="getGenreStyle(genre)"
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
    <div class="controls">
        <div class="control-group">
          <h3>年份范围</h3>
          <div class="year-range">
            <div class="slider-container">
              <input 
                type="range" 
                v-model.number="choseYear" 
                min="2000" 
                max="2025" 
                class="slider"
                @input="updatePieCharts"
              >
              <span>{{ choseYear }}</span>
            </div>
          </div>
        </div>
    </div>

    <div class = "charts-container">
      <div class="chart-card">
        <h2> ({{choseYear}})年份各类型占比饼图</h2>
        <div ref="pieChart" class="chart"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import * as echarts from 'echarts';
import animeDataJson from '@/assets/data_line_2020+.json';
import pieData from '@/assets/pie_data.json';
const genres = [
  'Supernatural', 'Fantasy', 'Drama', 
  'Adventure', 'Action', 'Romance', 'Comedy'
];

const genreColors = {
  "Supernatural": '#5470C6',    // 深蓝
  "Fantasy": '#91CC75',         // 草木绿
  "Drama": '#FAC858',           // 金黄
  "Adventure": '#EE6666',       // 暖红
  "Action": '#73C0DE',          // 天蓝
  "Romance": '#3BA272',         // 深绿
  "Comedy": '#FC8452',          // 橙黄
  // 新增颜色 (兼顾色系平衡和视觉区分度)
  "Slice of Life": '#9A7FD1',   // 薰衣草紫
  "Other": '#CCCCCC',           // 中性灰
  "Mystery": '#6A5ACD',         // 石板蓝
  "Hentai": '#D45087',          // 莓果红
  "Sports": '#20B2AA',          // 海蓝
  "Horror": '#8B0000',          // 暗血红
  "Gourmet": '#D2691E',         // 巧克力棕
  "Avant Garde": '#00CED1',   // 凫青
  "Suspense": '#9370DB',        // 中紫
  "Ecchi": '#FF69B4',           // 亮粉
  "Award Winning": '#FFD700', // 荣耀金
  "Boys Love": '#BA55D3'      // 梅紫
};

const selectedGenres = ref([...genres]);
const activeGenre = ref({});
const startYear = ref(2000);
const endYear = ref(2025);
const choseYear = ref(2000);

const avgChart = ref(null);
const countChart = ref(null);
const pieChart = ref(null);
let avgChartInstance = null;
let countChartInstance = null;
let pieChartInstance = null;

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

    if(!genreCounts[item.genres]) genreCounts[item.genres] = 0;
    genreCounts[item.genres] += item.total_scored_by;
  });

  // 设置统计数据
  if (maxScoreItem) {
    highestScore.value = {
      value: maxScoreItem.average_score,
      genre: maxScoreItem.genres,
      year: maxScoreItem.years
    };
    console.log(highestScore);
  }

  if (maxCountItem) {
    highestCount.value = {
      value: maxCountItem.total_scored_by,
      genre: maxCountItem.genres,
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
    item.years <= endYear.value
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

  avgChartInstance.resize();
  countChartInstance.resize();
};

//pie chart part
const process_pie_data = ()=>{
  const pieData_group = {};
  pieData.forEach(item =>{
    if(!pieData_group[item.year]) pieData_group[item.year] = [];
    pieData_group[item.year].push({name: item.type, value: item.number, percent : item.percent}); 
  })
  return pieData_group;
}

// 渲染图表
const renderPieChart = () =>{
    // 在renderPieChart中添加
  const pieData_group = process_pie_data();
  const pieData_chose = pieData_group[choseYear.value];
  
  if (pieData_chose.length === 0) {
    pieChartInstance.setOption({
      title: {
        text: `${choseYear.value}年无数据`,
        left: 'center',
        top: 'center'
      }
    });
    return;
  }

  if(!pieData.length || !pieChart.value) return;
  if(pieChartInstance) {
    pieChartInstance.dispose();
    pieChartInstance = null;
  }
  pieChartInstance = echarts.init(pieChart.value);


  const pieOption = {
    tooltip: {
      trigger: 'item',
      formatter: ({name, value, percent}) => 
        `${name}: ${value} (${percent}%)`,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      borderColor: 'rgba(255, 255, 255, 0.2)',
      textStyle: {
        color: '#fff',
        fontSize: 14
      }
    },
    legend: {
      orient: 'vertical',
      right: 20,
      top: 'center',
      data: pieData_chose.map(item => item.name),
      textStyle: {
        color: '#000'
      },
      formatter: (name) => {
        const item = pieData_chose.find(d => d.name === name);
        return `${name}:  ${item.value}, ${item.percent}% `;
      }
    },
    series: [
      {
        name: '动画类型占比',
        type: 'pie',
        radius: ['0%', '100%'],
        center: ['40%', '60%'],
        roseType: 'area',
        itemStyle: {
          borderRadius: 8,
          borderColor: '#1a2a6c',
          borderWidth: 2
        },
        label: {
          show: false
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '18',
            fontWeight: 'bold',
            color: 'rgba(255, 255, 255, 0.9)'
          },
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        labelLine: {
          show: false
        },
        data: pieData_chose.map(item => {
        // 动态计算外半径
        const k = 0.6; // 比例系数
        const b = 40; // 偏移量
        const innerRadius = 0; // 内半径固定为 0
        const outerRadius = k * item.percent*100 + b; // 外半径根据公式计算

        return {
          value: item.value,
          name: item.name,
          itemStyle: {
            color: genreColors[item.name],
          },
          //radius: [`${innerRadius}%`, `${outerRadius}%`] // 设置内外半径
        };
      })
      }
    ],
    animation: true,
    animationDuration: 1500,
    animationEasing: 'cubicOut'
  };
  pieChartInstance.setOption(pieOption);
}

genres.forEach(genre=>{
  activeGenre.value[genre] = false;
})

// 切换题材选择
const toggleGenre = (genre) => {
  const index = selectedGenres.value.indexOf(genre);
  if (index >= 0) {
    selectedGenres.value.splice(index, 1);
  } else {
    selectedGenres.value.push(genre);
  }
  activeGenre.value[genre] = !activeGenre.value[genre];
  renderCharts();
};

const getGenreStyle = (genre) => {
  if (activeGenre.value[genre]) {
    // 如果当前题材被激活
    return {
      backgroundColor: 'white', // 背景颜色为白色
      color: genreColors[genre] // 字体颜色为对应的 genreColors[genre]
    };
  } else {
    // 默认样式
    return {
      backgroundColor: genreColors[genre], // 背景颜色为对应的 genreColors[genre]
      color: 'white' // 字体颜色为白色
    };
  }
}

// 更新图表
const updateCharts = () => {
  if (startYear.value > endYear.value) {
    [startYear.value, endYear.value] = [endYear.value, startYear.value];
  }
  renderCharts();
};

// 正确 - 监听selectedGenres变化
watch(selectedGenres, () => {
  renderCharts();
}, { deep: true });

const updatePieCharts = () =>{
  renderPieChart();
}

// 需要添加对choseYear的监听
watch(choseYear, () => {
  renderPieChart();
});

onMounted(() => {
  calculateStats(); // 初始化时直接计算统计
  renderCharts(); 
  renderPieChart();
  window.addEventListener('resize', () => {
    avgChartInstance?.resize();
    countChartInstance?.resize();
    pieChartInstance?.resize();
  });
});

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
  max-width: 100%;
  margin: 0 auto;
  /* 修改为百分比 */
  padding: 2vw; /* 20px -> 1.25% */
  background: linear-gradient(135deg, #8A2387, #E94057, #8b00c7, #b20157);
  color: #fff;
  line-height: 1.6;
  min-height: 100vh;
  border-radius: 1.25%; 
  background-size: 800% 800%;
  animation: gradientBG 8s ease infinite;
}

h1 {
  font-size: 2.8rem;
  /* 修改为百分比 */
  margin-bottom: 1.875%; /* 30px -> 1.875% */
  font-weight: 700;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  position: relative;
  display: inline-block;
  /* 修改为百分比 */
  padding: 0 1.25%; /* 0 20px -> 0 1.25% */
}

h1:after {
    content: '';
    position: absolute;
    /* 修改为百分比 */
    bottom: -0.625%; /* -10px -> -0.625% */
    left: 50%;
    transform: translateX(-50%);
    /* 修改为百分比 */
    width: 6.25%; /* 100px -> 6.25% */
    height: 0.25%; /* 4px -> 0.25% */
    background: linear-gradient(90deg, #ff416c, #00c6ff);
    border-radius: 2px;
}

.stat {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    /* 修改为百分比 */
    border-radius: 0.9375%; /* 15px -> 0.9375% */
    /* 修改为百分比 */
    padding: 1.25% 1.875%; /* 20px 30px -> 1.25% 1.875% */
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
    /* 修改为百分比 */
    margin-bottom: 0.9375%; /* 15px -> 0.9375% */
    background: linear-gradient(45deg, #ff416c, #00c6ff);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

.stat span {
    display: block;
    font-size: 2.2rem;
    font-weight: 700;
    /* 修改为百分比 */
    margin-bottom: 0.3125%; /* 5px -> 0.3125% */
}

.stat p {
    font-size: 1rem;
    opacity: 0.9;
}

.controls {
  background: rgba(255, 255, 255, 0.928);
  /* 修改为百分比 */
  border-radius: 15px;  /* 10px -> 0.625% */
  /* 修改为百分比 */
  padding: 1.5625%; /* 25px -> 1.5625% */
  /* 修改为百分比 */
  margin-bottom: 1.875%; /* 30px -> 1.875% */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.control-group {
  /* 修改为百分比 */
  margin-bottom: 1.5625%; /* 25px -> 1.5625% */
}

.control-group:last-child {
  margin-bottom: 0;
}

.control-group h3 {
  /* 修改为百分比 */
  margin-bottom: 0.9375%; /* 15px -> 0.9375% */
  color: #495057;
  font-size: 1.1rem;
}

.genre-selector {
  display: flex;
  flex-wrap: wrap;
  /* 修改为百分比 */
  gap: 0.75%; /* 12px -> 0.75% */
}

.genre-chip {
  /* 修改为百分比 */
  padding: 0.625% 1.125%; /* 10px 18px -> 0.625% 1.125% */
  border-radius: 20px;
  cursor: pointer;
  font-weight: 500;
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
  /* 修改为百分比 */
  gap: 1.875%; /* 30px -> 1.875% */
  align-items: center;
}

.slider-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  /* 修改为百分比 */
  gap: 0.625%; /* 10px -> 0.625% */
}

.slider-container span {
  font-weight: 500;
  text-align: center;
  color: #495057;
}

.slider {
  width: 100%;
  /* 修改为百分比 */
  height: 0.5%; /* 8px -> 0.5% */
  border-radius: 4px;
  background: #e9ecef;
  outline: none;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  /* 修改为百分比 */
  width: 1.25%; /* 20px -> 1.25% */
  /* 修改为百分比 */
  height: 1.25%; /* 20px -> 1.25% */
  border-radius: 50%;
  background: #5470C6;
  cursor: pointer;
  transition: all 0.2s;
}

.slider::-webkit-slider-thumb:hover {
  transform: scale(1.2);
  /* 修改为百分比 */
  box-shadow: 0 0 0 0.25% rgba(84, 112, 198, 0.2); /* 4px -> 0.25% */
}

.charts-container {
  display: grid;
  /* 修改为百分比 */
  grid-template-columns: repeat(auto-fit, minmax(43.75%, 1fr)); /* 700px -> 43.75% */
  /* 修改为百分比 */
  gap: 1.5625%; /* 25px -> 1.5625% */
  /* 修改为百分比 */
  margin-bottom: 1.875%; /* 30px -> 1.875% */
}

.chart-card {
  background: white;
  /* 修改为百分比 */
  border-radius: 15px; /* 10px -> 0.625% */
  /* 修改为百分比 */
  padding: 1.25%; /* 20px -> 1.25% */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  /* 修改为视口单位 */
  height: 50vh; /* 改为视口高度 */
  display: flex;
  flex-direction: column;
}

.chart-card h2 {
  /* 修改为百分比 */
  margin-bottom: 0.9375%; /* 15px -> 0.9375% */
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
    /* 修改为百分比 */
    grid-template-columns: repeat(auto-fit, minmax(18.75%, 1fr)); /* 300px -> 18.75% */
    /* 修改为百分比 */
    gap: 1.875%; /* 30px -> 1.875% */
    /* 修改为百分比 */
    margin: 2.5% 0; /* 40px 0 -> 2.5% 0 */
}

.stat-card {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    /* 修改为百分比 */
    border-radius: 15px; /* 20px -> 1.25% */
    /* 修改为百分比 */
    padding: 1.875%; /* 30px -> 1.875% */
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
    /* 修改为百分比 */
    margin-bottom: 1.25%; /* 20px -> 1.25% */
    background: linear-gradient(45deg, #ff416c, #00c6ff);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

.stat-card h3 {
    color: rgba(255, 255, 255, 0.9);
    font-size: 1.2rem;
    /* 修改为百分比 */
    margin-bottom: 1.25%; /* 20px -> 1.25% */
    font-weight: 600;
}

.stat-value {
    font-size: 2.8rem;
    font-weight: 800;
    color: white;
    /* 修改为百分比 */
    margin-bottom: 0.625%; /* 10px -> 0.625% */
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.stat-detail {
    font-size: 1.1rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.8);
    display: block;
    /* 修改为百分比 */
    margin-top: 0.625%; /* 10px -> 0.625% */
}


@media (max-width: 1200px) {
  .charts-container {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .controls {
    /* 修改为百分比 */
    padding: 0.9375%; /* 15px -> 0.9375% */
  }
  
  .genre-selector {
    /* 修改为百分比 */
    gap: 0.5%; /* 8px -> 0.5% */
  }
  
  .genre-chip {
    /* 修改为百分比 */
    padding: 0.5% 0.875%; /* 8px 14px -> 0.5% 0.875% */
    font-size: 0.9rem;
  }
  
  .year-range {
    flex-direction: column;
    /* 修改为百分比 */
    gap: 1.25%; /* 20px -> 1.25% */
  }
  
  .stat-value {
    font-size: 1.8rem;
  }

  .header-stats {
      /* 修改为百分比 */
      gap: 1.25%; /* 20px -> 1.25% */
  }

  .stat {
      min-width: 150px;
      /* 修改为百分比 */
      padding: 0.9375%; /* 15px -> 0.9375% */
  }

  .stat span {
      font-size: 1.8rem;
  }
  
  /* 图表高度在小屏幕上使用固定高度 */
  .chart-card {
      height: 400px;
  }
}

/* 针对小屏幕的额外调整 */
@media (max-width: 480px) {
  .chart-card {
      height: 300px;
  }
  
  .stat-card {
      padding: 5%;
  }
  
  .stat-value {
      font-size: 1.5rem;
  }
}
</style>