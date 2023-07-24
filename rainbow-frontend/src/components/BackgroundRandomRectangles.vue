<script setup>
import { ref, onMounted } from 'vue'

const colors = []

let max = (a, b) => (a > b ? a : b)
let min = (a, b) => (a < b ? a : b)

const canvas = ref(null)
let ctx = null

function init() {
    canvas.value.setAttribute('width', window.innerWidth)
    canvas.value.setAttribute('height', window.innerHeight)
}

function play() {
    setInterval(() => {
        ctx.fillStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.5)`;
        let x = Math.random() * window.innerWidth
        let y = Math.random() * window.innerHeight
        let w = Math.random() * min(window.innerWidth / 10, window.innerWidth - x)
        let h = Math.random() * min(window.innerHeight / 10, window.innerHeight - y)
        ctx.fillRect(x, y, w, h)
    }, 1000.0 / 20)
}

onMounted(() => {
    ctx = canvas.value.getContext('2d')
    init()
    play()
})

</script>
  
<template>
    <Teleport to="body">
        <canvas class="bg" ref="canvas"></canvas>
    </Teleport>
</template>

<style scoped>
.bg {
    position: fixed;
    top: 0;
    left: 0;
    z-index: -9999;
}
</style>
  