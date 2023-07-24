<script setup>
import BackgroundRandomRectangles from './components/BackgroundRandomRectangles.vue'
import Markdown from './components/Markdown.vue'
import axios from 'axios'
import { ref } from 'vue'
import FaceCursor from './components/FaceCursor.vue'

let manifest = ref({
  about: '',
  articles: []
})

axios.get("manifests/index.json").then(function (response) {
  console.log(response)
  manifest.value = response.data
  document.title = manifest.value.title
}).catch(function (error) {
  console.log(error)
  alert("index.json 获取失败")
})
</script>

<template>
  <div id="index">
    <FaceCursor>
      <Markdown :raw="manifest.about"></Markdown>
    </FaceCursor>
    <FaceCursor>
      <div class="article-item" v-for="art in manifest.articles">
        <a :href="'article.html?' + art.manifest">{{ art.title }}</a>
        <div>{{ (new Date(art.pub_time * 1000)).toLocaleString() }}</div>
      </div>
    </FaceCursor>
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
