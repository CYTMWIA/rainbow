
<script setup>
import { ref, onMounted } from 'vue'
const FPS = 30
let max = (a, b) => (a > b ? a : b)
let min = (a, b) => (a < b ? a : b)
let slot = ref(null)
let transform = ref('unset')
let shadow = ref('unset')
onMounted(() => {
    let now_x = 0, now_y = 0
    addEventListener('mousemove', (ev) => {
        let slot_w = slot.value.clientWidth
        let slot_h = slot.value.clientHeight
        let slot_cx = slot.value.offsetLeft + (slot_w / 2.0)
        let slot_cy = slot.value.offsetTop + (slot_h / 2.0)
        now_x = ((ev.clientX - slot_cx) / slot_w) * 2.0
        now_y = ((ev.clientY - slot_cy) / slot_h) * 2.0
    })
    let inSlot = () => (1 >= Math.abs(now_x) && 1 >= Math.abs(now_y))
    let transform_x = 0, transform_y = 0
    setInterval(() => {
        let target_x = 0, target_y = 0
        if (!inSlot()) {
            target_x = now_x
            target_y = now_y
        }
        transform_x += (target_x - transform_x) * (2.2 / FPS)
        transform_y += (target_y - transform_y) * (2.2 / FPS)

        // Do transform
        let x = max(-1.5, min(transform_x, 1.5))
        let y = max(-1.5, min(transform_y, 1.5))
        transform.value = `rotate3d(1, 0, 0, ${-y * 30}deg) rotate3d(0, 1, 0, ${x * 30}deg)`
        shadow.value = `${-x * 2}ch ${-y * 2}ch #777777D0`
    }, 1000 / FPS)
})
</script>
  
<template>
    <div ref="slot" :style="{ transform: transform, 'box-shadow': shadow }">
        <slot></slot>
    </div>
</template>
  
<style></style>
  