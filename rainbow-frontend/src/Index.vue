<script setup>
import BackgroundRandomRectangles from './components/BackgroundRandomRectangles.vue'
import Markdown from './components/Markdown.vue'
import axios from 'axios'
import { ref } from 'vue'

let articles = ref([])
let about = ref('')

axios.get("manifests/index.json").then(function (response) {
  console.log(response)
  document.title = response.data.title
  articles.value = response.data.articles
  about.value = response.data.about
}).catch(function (error) {
  console.log(error)
  alert("index.json 获取失败")
})

</script>

<template>
  <div id="index">
    <Markdown :raw="about"></Markdown>
    <div>
      <div class="article-item" v-for="art in articles">
        <a :href="'article.html?' + art.manifest">{{ art.title }}</a>
        <div>{{ (new Date(art.pub_time * 1000)).toLocaleString() }}</div>
      </div>
    </div>
  </div>
  <BackgroundRandomRectangles></BackgroundRandomRectangles>
</template>

<style scoped>
#index>* {
  width: 82ch;
  padding: 1ch;
  margin: auto;
  margin-bottom: 2ch;
  background-color: #FFFFFFD0;
}

.article-item {
  border-bottom: solid;
  border-color: gray;
  border-width: 2px;
  width: 100%;
  display: flex;
  margin-top: 0.5ch;
  margin-bottom: 0.5ch;
}

.article-item a {
  text-decoration: none;
  font-size: large;
}

.article-item>*:last-child {
  margin-right: 0;
  margin-left: auto;
  color: darkgray;
}
</style>
