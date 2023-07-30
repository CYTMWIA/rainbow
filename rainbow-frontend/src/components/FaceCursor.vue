
<script setup>
import { ref, onMounted } from 'vue'
const FPS = 30
let max = (a, b) => (a > b ? a : b)
let min = (a, b) => (a < b ? a : b)
let minabs = (a, b) => (Math.abs(a) < Math.abs(b) ? a : b)
let slot = ref(null)
let transform = ref('unset')
let shadow = ref('unset')
onMounted(() => {
    let client_x = -1, client_y = 0
    addEventListener('mousemove', (ev) => {
        client_x = ev.clientX
        client_y = ev.clientY
    })
    let transform_x = 0, transform_y = 0
    setInterval(() => {
        if (client_x < 0) return;

        let window_w = window.innerWidth
        let window_h = window.innerHeight
        let slot_w = slot.value.clientWidth
        let slot_h = slot.value.clientHeight
        let slot_cx = slot.value.offsetLeft + (slot_w / 2.0)
        let slot_cy = slot.value.offsetTop + (slot_h / 2.0)
        let now_x = ((client_x - slot_cx) / window_w) * 2.0
        let now_y = ((client_y - slot_cy) / window_h) * 2.0

        let target_x = now_x, target_y = now_y
        if ((slot_w / window_w) >= Math.abs(now_x) && (slot_h / window_h) >= Math.abs(now_y)) {
            target_x = 0
            target_y = 0
        }

        let dx = target_x - transform_x // delta
        transform_x += minabs((dx >= 0 ? 1 : -1) * (1.5 / FPS), dx)
        let dy = target_y - transform_y
        transform_y += minabs((dy >= 0 ? 1 : -1) * (1.5 / FPS), dy)

        // Do transform
        let x = max(-1.5, min(transform_x, 1.5))
        let y = max(-1.5, min(transform_y, 1.5))
        transform.value = `rotate3d(1, 0, 0, ${-y * 30}deg) rotate3d(0, 1, 0, ${x * 30}deg)`
        shadow.value = `${-x * 2}ch ${-y * 2}ch #777777D0`
    }, 1000 / FPS)
})
</script>
  
<template>
    <div class="slot" ref="slot" :style="{ transform: transform, 'box-shadow': shadow }">
        <slot></slot>
    </div>
</template>
  
<style scoped>
.slot {
    width: max-content;
    height: max-content;
}
</style>
  