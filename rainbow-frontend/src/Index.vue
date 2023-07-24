<script setup>
import BackgroundRandomRectangles from './components/BackgroundRandomRectangles.vue'
import Markdown from './components/Markdown.vue'
import axios from 'axios'
import { ref, onMounted } from 'vue'

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

let max = (a, b) => (a > b ? a : b)
let min = (a, b) => (a < b ? a : b)
let about = ref(null)
let transform = ref('unset')
let shadow = ref('unset')
onMounted(() => {
  addEventListener('mousemove', (ev) => {
    let about_w = about.value.$el.clientWidth
    let about_h = about.value.$el.clientHeight
    let about_cx = about.value.$el.offsetLeft + (about_w / 2.0)
    let about_cy = about.value.$el.offsetTop + (about_h / 2.0)
    let x = ((ev.clientX - about_cx) / about_w) * 2.0
    let y = ((ev.clientY - about_cy) / about_h) * 2.0
    x = max(-1, min(x, 1))
    y = max(-1, min(y, 1))
    transform.value = `rotate3d(1, 0, 0, ${-y * 30}deg) rotate3d(0, 1, 0, ${x * 30}deg)`
    shadow.value = `${-x * 2}ch ${-y * 2}ch #777777D0`
  })
})
</script>

<template>
  <div id="index">
    <Markdown ref="about" :style="{ transform: transform, 'box-shadow': shadow }" :raw="manifest.about"></Markdown>
    <div>
      <div class="article-item" v-for="art in manifest.articles">
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
