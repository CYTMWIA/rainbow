<script setup>
import BackgroundGameOfLife from './components/BackgroundGameOfLife.vue'
import Markdown from './components/Markdown.vue'
import FaceCursor from './components/FaceCursor.vue'
import axios from 'axios'
import { ref } from 'vue'
import { formatTimeFromTimestamp } from './common/formatTime'

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
  <div class="welcome">
    <FaceCursor style="margin: auto;">
      <h1 class="title">{{ manifest.title }}</h1>
    </FaceCursor>
    <BackgroundGameOfLife></BackgroundGameOfLife>
  </div>
  <div class="main-container">
    <Markdown :raw="manifest.about"></Markdown>
    <div>
      <div class="article-item" v-for="art in manifest.articles">
        <a :href="'article.html?' + art.manifest">{{ art.title }}</a>
        <div>{{ formatTimeFromTimestamp(art.pub_time) }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.welcome {
  position: relative;
  width: 100%;
  height: 100vh;
  display: flex;
  margin-bottom: 2em;
}

.welcome .title {
  color: white;
  margin: auto;
  padding: 0.2em 0.6em;
  font-size: 3.2em;
  background: #86868677;
  backdrop-filter: blur(0.5em);
}

.article-item {
  border-bottom: solid;
  border-color: #44444478;
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
  color: #333333;
}
</style>
