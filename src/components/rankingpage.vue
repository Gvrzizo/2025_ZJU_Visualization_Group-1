<template>
    <div v-if="!visi" class="lists">
        <h1>动画列表</h1>
        <div class="pageschange">
            <button @click="pagesdown" :disabled="pages==1">上一页</button>
            当前页码：<input type="number" v-model="npages" placeholder="请输入页码">
            <button @click="gotopage(npages)">跳转</button>
            <button @click="pagesup" :disabled="pages==577">下一页</button>
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
            <tr v-for="(data,index) in animeData.slice((pages-1)*50,pages*50-1)">
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
    import localData from '@/anime_data.json'
    import {ref,computed} from 'vue'
    let animeData=ref(localData)
    let pages=ref(1)
    let npages=ref(1)
    let visi=ref(false)
    let number=ref(0)
    function pagesdown(){
        pages.value--;
        npages.value--;
    }
    function pagesup(){
        npages.value++;
        pages.value++;
    }
    function gotopage(targetpage){
        if (targetpage<1){
            pages.value=1;npages.value=1;
        }
        else if (targetpage>577){
            pages.value=577;npages.value=577;
        }
        else pages.value=targetpage;
    }
    function sortbyscore(){
        animeData.value.sort((a,b) => b.score-a.score)
        pages.value=1;
    }
    function sortbytime(){
        animeData.value.sort((a,b) => b.aired_from.localeCompare(a.aired_from))
        pages.value=1;
    }
    function sortbypopularity(){
        animeData.value.sort((a,b) => b.scored_by-a.scored_by)
        pages.value=1;
    }
    function check(index){
        visi.value=true;
        number.value=index;
    }
    function backtorank(){
        visi.value=false;
    }
</script>
<style>
    button.goback{
        position: fixed;
        left: 2%;
    }
    div.pageschange{
        text-align: center;
    }
    div.sortchange{
        position: relative;
        left: 74%;
    }
    h1{
        text-align: center;
        font-size: 300%;
        font-family: 仿宋;
    }
    table{
        width: 70%;
        margin:auto;
        margin-bottom: 5%;
        border-collapse: collapse;
    }
    table,th,td{
        border: 1px solid gray;
    }
    th{
        background-color: darkgray;
    }
    th:nth-child(1){ width: 5%;}
    th:nth-child(2){ width: 5%;}
    th:nth-child(3){ width:70%;}
    th:nth-child(4){ width:8%;}
    th:nth-child(5){ width:6%;}
    td{
        background-color: azure;
    }
    div.container{
        position: absolute;
        width:80%;
        display: flex;
        flex-direction: column;
        top:10%;
        left:10%;
    }
    .row{
        display: flex;
        gap:20px;
        margin-bottom: 20px;
    }
    .details{
        width:60%;
        border: 2px solid gray;
        padding: 2%;
        text-align: left;
    }
    .synposis{
        flex:1;
        width:90%;
        padding: 2%;
        border: 1px solid gray;
        border-radius: 15px;
    }
    img{
        width:300px;
        height: auto;
        float:left;
        padding: 20px;
    }
</style>
