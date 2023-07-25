<script setup>
import BackgroundGameOfLife from './components/BackgroundGameOfLife.vue'
import Markdown from './components/Markdown.vue'
import axios from 'axios'
import { ref } from 'vue'
import { parseQuery } from './common/parseQuery'
import { decryptString } from './common/decryptString'
import { formatTimeFromTimestamp } from './common/formatTime'

let manifest = ref({
  "title": "Loading",
  "content": "Loading"
})

let query = parseQuery()
let manifest_file = (query[""] !== undefined) ? query[""] : query["manifest"];

axios.get(`manifests/${manifest_file}`).then(async function (response) {
  console.log(response)
  if (response.data.encrypted === true) {
    let res = await decryptString(response.data.data, response.data.iv, query["password"]);
    manifest.value = JSON.parse(res);
  } else {
    manifest.value = response.data
  }
  document.title = manifest.value.title
}).catch(function (error) {
  console.log(error)
  alert("文章获取失败")
})

</script>

<template>
  <div class="main-container">
    <div class="metadata">
      <h1>{{ manifest.title }}</h1>
      <table>
        <tbody>
          <tr v-if="manifest.pub_time">
            <td>Published</td>
            <td>{{ formatTimeFromTimestamp(manifest.pub_time) }}</td>
          </tr>
          <tr v-if="manifest.mod_time">
            <td>Modified</td>
            <td>{{ formatTimeFromTimestamp(manifest.mod_time) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <Markdown :raw="manifest.content"></Markdown>
  </div>
  <BackgroundGameOfLife></BackgroundGameOfLife>
</template>

<style scoped>
.metadata {
  display: flex;
  flex-direction: column;
}

.metadata>* {
  margin: auto;
}
</style>
