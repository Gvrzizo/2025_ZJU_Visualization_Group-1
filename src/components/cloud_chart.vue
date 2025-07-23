<template>
    <div class = "root">
        <header>
            <h1>Studio <span class = "highlight">词云可视化</span></h1>
            <p class="subtitle"> 输入工作室名称即可查看对应作品词云</p>
        </header>

        <div class="app-container">

        </div>

        <div class="search-container">
            <div class = "search-box">
                <input type = "text" v-model = "rawInput" placeholder="输入 studio 名称"
                    @focus="showHint = true" 
                    @blur="closeHint"
                    @keydown.enter="handleEnter"
                    @input="showHint = true">
                <i class="fas fa-search"></i>
            </div>
            <ul v-if="showHint && hintList.length" class="hint-list">
                <li
                v-for="name in hintList"
                :key="name"
                @mousedown.prevent
                @click="selectHint(name)"
                >
                {{ name }}
                </li>
            </ul>
        </div>

        <div class="cloud-container"
        :key="currentStudio?.name"
        ref="cloudRef">
        </div>
    </div>
</template>

<script setup>
    import { ref, computed, watchEffect, nextTick, onMounted, onUnmounted, 
        watch} from 'vue';
    import * as d3 from 'd3';
    import  cloud  from 'd3-cloud'; 
    import cloudData from "@/assets/cloud_data.json"

    const layoutId = ref(0);
    const minword = ref(30);
    const maxword = ref(50);
    const sizeWeight = 80;
    const rawInput = ref(''); // 存储实时输入值
    const search = ref('');
    const showHint = ref(false);
    const cloudRef = ref(null);

    const groupData = computed(() => {
        const group = {};
        cloudData.forEach(item => {
            const key = item.studios;
            if (!key) return;
            if (!group[key]) group[key] = [];
            if (item.rank <= maxword.value) {
            group[key].push({
                text: item.name,
                rank: item.rank,
                rankScore: item.rank_score
            });
            }
        });
        return group;
    });

    function handleEnter() {
        // 如果有匹配项，使用第一个匹配项
        if (hintList.value.length > 0) {
            selectHint(hintList.value[0]);
        } 
        // 否则使用当前输入值
        else {
            search.value = rawInput.value.trim();
            showHint.value = false;
        }
    };

    const studios = computed(() =>{
        return Object.keys(groupData.value).map(studio=>{
            let words = groupData.value[studio];
            if (!words.length) return null; // 跳过空工作室

            if (words.length < minword.value){
                const need = minword.value - words.length;
                for(let i = 0; i < need; i++){
                    words.push({...words[i % words.length]});
                }
            }

            // 防止空数组错误
            const maxLength = words.length ? Math.max(...words.map(w => w.text.length)) : 0;

            words = words.map(word=>{
                // 添加零除保护
                const scoreRatio = word.rankScore/10;
                const lengthfactor = 0.2 + (word.text.length)/maxLength * 0.8;
                const weight = (sizeWeight/100) * scoreRatio + (1-sizeWeight/100)*lengthfactor;
                const size = 10 + weight * 50;
                return {
                    ...word,
                    size:size,
                    color:getColor(scoreRatio),
                    weight: 100 + scoreRatio * 1000,
                    opacity: 0.5+scoreRatio*0.5,
                    rotate:0,
                };
            });
            return{
                name : studio,
                words : words,
            };
        }).filter(Boolean); 
    });
    
    // 当前工作室匹配逻辑
    const currentStudio = computed(() => {
        const kw = search.value.trim();
        return studios.value.find(s => s.name === kw) || null;
    });

    // 添加resize监听
    onMounted(() => {window.addEventListener('resize', handleResize);
        nextTick(() => {
            if (currentStudio.value) {
                drawCloud(currentStudio.value);
            }
        });}
    );

    onUnmounted(() => window.removeEventListener('resize', handleResize));

    function handleResize() {
        if (currentStudio.value) {
            drawCloud(currentStudio.value);
        }
    }

    function drawCloud(studio){
        // 清空旧 svg
        if (!cloudRef.value || !cloudRef.value.clientWidth) {
            console.warn("容器未准备好，跳过渲染");
            return;
        }
        
        d3.select(cloudRef.value).selectAll('*').remove();
        
        // 应该统一尺寸
        const container = { 
            width: cloudRef.value.clientWidth, 
            height: cloudRef.value.clientHeight 
        };
        const svg = d3
            .select(cloudRef.value)
            .append('svg')
            .attr('width', container.width)
            .attr('height', container.height);
        
            // 空状态处理
        if (!studio || !studio.words?.length) {
            svg.append("text")
            .attr("x", container.width/2)
            .attr("y", container.height/2)
            .attr("text-anchor", "middle")
            .style("fill", "rgba(255,255,255,0.7)")
            .text(studio ? "无可用数据" : "请输入工作室名称");
            return;
        }

        // 更新布局ID
        const currentId = ++layoutId.value;
        
        cloud()
            .size([container.width, container.height])
            .words(studio.words)
            .padding(1)
            .rotate(0)
            .font("Impact")
            .fontSize(d => d.size)
            .on("end", words => {
                // 只处理最新请求
                if (currentId !== layoutId.value) return;
                
                const g = svg
                    .append('g')
                    .attr('transform', `translate(${container.width / 2},${container.height / 2})`)
                    .selectAll('text')
                    .data(words)
                    .enter()
                    .append('text')
                    .style('font-size', d => `${d.size}px`)
                    .style('font-family', 'Impact')
                    .style('fill', (d, i) => studio.words[i].color)
                    .style('font-weight', (d, i) => studio.words[i].weight)   // 已经是数字，可直接用
                    .style('opacity', (d, i) => studio.words[i].opacity)
                    .style('cursor', 'pointer')
                    .attr('text-anchor', 'middle')
                    .attr('transform', d => `translate(${d.x},${d.y}) rotate(${d.rotate})`)
                    .text(d => d.text)
                    .on('mouseover', function() {
                        d3.select(this).style('opacity', 1);
                    })
                    .on('mouseout', function() {
                        d3.select(this).style('opacity', d => d.opacity);
                    });
            })
            .start();
    }

    // 模糊匹配提示
    const hintList = computed(() => {
        const kw = rawInput.value.trim().toLowerCase();
        if (!kw) return [];
        return studios.value
            .map(s => s.name)
            .filter(name => name.toLowerCase().includes(kw))
            .slice(0, 5);
    });

    // 点击提示项填入输入框并关闭列表
    function selectHint(name) {
        search.value = name;
        rawInput.value = name;
        showHint.value = false;
        
    }
    // 延迟关闭，让点击事件先触发
    function closeHint() {
        setTimeout(() => (showHint.value = false), 150);
    }

    const totalWorks = computed(() => cloudData.length);

    function getColor(ratio){
        const colors = [
            '#4cc9f0', // 青色
            '#4361ee', // 蓝色
            '#3a0ca3', // 深蓝
            '#7209b7', // 紫色
            '#f72585'  // 粉色
        ];
        
        const index = Math.floor(Math.random()*5%5);
        return colors[index];
    };


    // 当 currentStudio 改变时重新渲染
    watchEffect(() => {
        nextTick(() => {
            handleResize();
        });
    });

    watch(search, () => {
        nextTick(() => {
            drawCloud(currentStudio.value);
        });      
    });
</script>

<style scoped>
.root {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #b71c1c 0%, #0d47a1 100%);
  color: #fff;
  padding: 40px 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.highlight {
  background: linear-gradient(120deg, #4361ee, #3a0ca3);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  font-weight: 700;
}

/* 标题 */
header {
  text-align: center;
  margin-bottom: 40px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}
header h1 {
  font-size: 2.8rem;
  margin: 0;
}
.subtitle {
  margin: 8px 0 0;
  font-size: 20px;
  opacity: 0.8;
}

/* 搜索框 */
.search-container {
  position: relative;
  width: 100%;
  max-width: 400px;
  margin-bottom: 40px;
}
.search-box {
  max-width: 2000px;
  margin: 0 auto;
  display: flex;
  background: white;
  border-radius: 8px;
  justify-content: center;
  align-items: center;
  position: relative;
}
.search-box input {
  width: 100%;
  padding: 12px 40px 12px 16px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  color: black;
  border: 1px solid rgba(255, 255, 255, 0.3);
  font-size: 16px;
}
.search-box input:focus {
  border-color: #4cc9f0;
  box-shadow: 0 0 0 2px rgba(76, 201, 240, 0.3);
}
.search-box i {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #888;
}

/* 搜索提示列表 */
.hint-list {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 8px;
  list-style: none;
  margin: 0;
  padding: 0;
  z-index: 999;
  color: #333;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
}
.hint-list li {
  padding: 8px 16px;
  cursor: pointer;
}
.hint-list li:hover {
  background: #e0e0e0;
}

/* 词云容器 */
.cloud-container {
  width: 60%;
  height: 800px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.815);
  backdrop-filter: blur(5px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}
@media (max-width: 900px) {
  .cloud-container {
    width: 95% !important;
    height: 400px !important;
  }
}
</style>