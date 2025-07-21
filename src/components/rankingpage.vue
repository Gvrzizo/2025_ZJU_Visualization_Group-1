<template>
    <div v-if="!visi" class="lists">
        <h1>动画列表</h1>
        <div class="pageschange">
            <button @click="pagesdown" :disabled="pages==1">上一页</button>
            当前页码：<input type="number" v-model="npages" placeholder="请输入页码">
            <button @click="gotopage(npages)">跳转</button>
            <button @click="pagesup" :disabled="pages==552">下一页</button>
        </div>
        <div class="sortchange">
            <button @click="sortbyscore">评分最高</button>
            <button @click="sortbytime">最新</button>
            <button @click="sortbypopularity">人气最高</button>
        </div>
        <table>
            <tr>
                <th>位次</th>
                <th>id</th>
                <th>name</th>
                <th>type</th>
                <th>score</th>
                <th></th>
            </tr>
            <tr v-for="(data,index) in animeData.slice((pages-1)*50,pages*50)">
                <td>{{ index+(pages-1)*50+1 }}</td>
                <td>{{ data.id }}</td>
                <td>{{ data.name }}</td>
                <td>{{ data.type }}</td>
                <td>{{ data.score }}</td>
                <button @click="check(index+(pages-1)*50)">查看详情</button>
            </tr>
        </table>
    </div>
    <div v-if="visi">
        <button @click="backtorank" class="goback">返回</button><br>
        <div class="container">
            <div class="row">
                <img :src="animeData[number].image">
                <div class="details">
                    <h2>{{ animeData[number].name }}</h2>
                    <p><b>genres: </b>{{ animeData[number].genres }}</p>
                    <p><b>type: </b>{{ animeData[number].type }}</p>
                    <p><b>studios: </b>{{ animeData[number].studios }}</p>
                    <p><b>episodes: </b>{{ animeData[number].episodes }}</p>
                    <p><b>status: </b>{{ animeData[number].status }}</p>
                    <p><b>score: </b>{{ animeData[number].score }}</p>
                    <p><b>scored by </b>{{ animeData[number].scored_by }} <b>people</b></p>
                    <p><b>trailer: </b><a :href="animeData[number].trailer">{{ animeData[number].trailer }}</a></p>
                </div>
            </div>
            <div class="synposis">
                <p><b>synopsis: </b>{{ animeData[number].synopsis }}</p>
            </div>
        </div>
    </div>
</template>
<script setup>
    import localData from '@/assets/anime_data.json'
    import {ref,computed} from 'vue'
    let animeData=ref(localData)
    let pages=ref(1)
    let npages=ref(1)
    let visi=ref(false)
    let number=ref(0)
    function pagesdown(){
        pages.value--;
        npages.value=pages.value;
    }
    function pagesup(){
        pages.value++;
        npages.value=pages.value;
    }
    function gotopage(targetpage){
        if (targetpage<1){
            pages.value=1;npages.value=1;
        }
        else if (targetpage>552){
            pages.value=552;npages.value=552;
        }
        else {
            pages.value=targetpage;
            npages.value=targetpage;
        }
    }
    function sortbyscore(){
        animeData.value.sort((a,b) => b.score-a.score)
        pages.value=1;
        npages.value=1;
    }
    function sortbytime(){
        animeData.value.sort((a,b) => b.aired_from.localeCompare(a.aired_from))
        pages.value=1;
        npages.value=1;
    }
    function sortbypopularity(){
        animeData.value.sort((a,b) => b.scored_by-a.scored_by)
        pages.value=1;
        npages.value=1;
    }
    function check(index){
        visi.value=true;
        number.value=index;
    }
    function backtorank(){
        visi.value=false;
    }
</script>
<style scoped>
    .lists, .container {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        max-width: 1200px;
        margin: 0 auto;
        padding: 20px;
        color: #333333;
    }
    h1 {
        text-align: center;
        color: #2c3e50;
        margin-bottom: 25px;
        font-size: 2.2rem;
        position: relative;
    }
    h1::after {
        content: "";
        display: block;
        width: 100px;
        height: 4px;
        background: linear-gradient(90deg, #42b883, #35495e);
        margin: 10px auto;
        border-radius: 2px;
    }
    .pageschange {
        display: flex;
        justify-content: center;
        align-items: center;
        flex-wrap: wrap;
        gap: 10px;
        margin: 20px 0;
        padding: 15px;
        background-color: #f8f9fa;
        border-radius: 8px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.05);
    }
    .pageschange input {
        width: 80px;
        padding: 8px 12px;
        border: 1px solid #ddd;
        border-radius: 4px;
        text-align: center;
        font-size: 1rem;
        transition: border-color 0.3s;
    }
    .pageschange input:focus {
        border-color: #42b883;
        outline: none;
        box-shadow: 0 0 0 2px rgba(66, 184, 131, 0.2);
    }
    .sortchange {
        display: flex;
        justify-content: center;
        gap: 15px;
        margin: 25px 0;
        flex-wrap: wrap;
    }
    button {
        padding: 10px 20px;
        background-color: #42b883;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 1rem;
        font-weight: 500;
        transition: all 0.3s ease;
        box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    }
    button:hover:not(:disabled) {
        background-color: #359268;
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0,0,0,0.15);
    }
    button:active:not(:disabled) {
        transform: translateY(0);
    }
    button:disabled {
        background-color: #a0a0a0;
        cursor: not-allowed;
        opacity: 0.7;
    }
    .sortchange button {
        background-color: #35495e;
    }
    .sortchange button:hover {
        background-color: #2c3e50;
    }
    table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 20px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.05);
        border-radius: 8px;
        overflow: hidden;
    }
    th, td {
        padding: 15px 10px;
        text-align: left;
        border-bottom: 1px solid #eee;
    }
    th {
        background-color: #35495e;
        color: white;
        font-weight: 600;
        text-transform: uppercase;
        font-size: 0.9rem;
        letter-spacing: 0.5px;
    }
    tr:nth-child(even) {
        background-color: #f8f9fa;
    }
    tr:hover {
        background-color: #edf7f2;
        transition: background-color 0.2s;
    }
    .goback {
        margin: 20px;
        background-color: #e74c3c;
    }
    .goback:hover {
        background-color: #c0392b;
    }
    .container {
        background: white;
        border-radius: 10px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        padding: 30px;
        margin-top: 20px;
    }
    .row {
        display: flex;
        flex-wrap: wrap;
        gap: 30px;
        margin-bottom: 30px;
    }
    img {
        flex: 1;
        min-width: 300px;
        max-height: 450px;
        object-fit: cover;
        border-radius: 8px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    }
    .details {
        flex: 2;
        min-width: 300px;
    }
    .details h2 {
        color: #2c3e50;
        margin-top: 0;
        font-size: 1.8rem;
        border-bottom: 2px solid #42b883;
        padding-bottom: 10px;
        margin-bottom: 20px;
    }
    .details p {
        margin: 12px 0;
        line-height: 1.6;
    } 
    .details b {
        color: #35495e;
        width: 100px;
        display: inline-block;
    }
    .synposis {
        background-color: #f8f9fa;
        padding: 20px;
        border-radius: 8px;
        border-left: 4px solid #42b883;
    }
    .synposis b {
        color: #35495e;
    }
    .synposis p {
        line-height: 1.7;
        margin: 0;
    }
    @media (max-width: 768px) {
        .pageschange {
            flex-direction: column;
            align-items: stretch;
        }
        .pageschange input {
            width: 100%;
            margin: 10px 0;
        }
        table {
            font-size: 0.85rem;
        }
        th, td {
            padding: 10px 8px;
        }
        .row {
            flex-direction: column;
        }
        img {
            width: 100%;
            max-height: 400px;
        }
    }
    @media (max-width: 480px) {
        .sortchange {
            flex-direction: column;
            align-items: stretch;
        }
        .sortchange button {
            width: 100%;
        }
        th, td {
            padding: 8px 5px;
            font-size: 0.8rem;
        }
    }
</style>
