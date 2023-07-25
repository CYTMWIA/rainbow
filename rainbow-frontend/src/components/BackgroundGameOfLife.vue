<script setup>
// 康威生命游戏
// https://zh.wikipedia.org/zh-hans/%E5%BA%B7%E5%A8%81%E7%94%9F%E5%91%BD%E6%B8%B8%E6%88%8F

import { ref, onMounted } from 'vue'

let max = (a, b) => (a > b ? a : b)
let min = (a, b) => (a < b ? a : b)
function createArray(w, h, typed_array) {
    let res = []
    for (let i = 0; i < h; i += 1) {
        res.push(new typed_array(w))
    }
    return res
}

const canvas = ref(null)
let canvas_ctx = null

let canvas_width = 0, canvas_height = 0
function init() {
    canvas_ctx = canvas.value.getContext('2d')
    canvas_width = window.innerWidth
    canvas_height = 2 * window.innerHeight
    canvas.value.setAttribute('width', canvas_width)
    canvas.value.setAttribute('height', canvas_height)
}

function play() {
    let cell_size
    let cells_cols, cells_rows
    let cells, cells_shadow
    function initGame() {
        cells_cols = 100
        cell_size = canvas_width / cells_cols
        cells_rows = Math.floor(canvas_height / cell_size)
        cells = createArray(cells_cols, cells_rows, Uint8Array)
        cells_shadow = createArray(cells_cols, cells_rows, Uint8Array)
        // 开局随机摆放活细胞
        for (let r = 0; r < cells_rows; r += 1)
            for (let c = 0; c < cells_cols; c += 1) {
                if (Math.random() < 0.15)
                    cells[r][c] = 1
            }
    }
    let zeroWhenFalsy = (n) => (n ? n : 0)
    function next() {
        // cells_shadow 表示格子周围有几个活细胞
        for (let r = 0; r < cells_rows; r += 1)
            for (let c = 0; c < cells_cols; c += 1) {
                cells_shadow[r][c] = (
                    zeroWhenFalsy(cells[r + 1]?.[c + 1]) +
                    zeroWhenFalsy(cells[r + 1]?.[c + 0]) +
                    zeroWhenFalsy(cells[r + 1]?.[c - 1]) +
                    zeroWhenFalsy(cells[r + 0]?.[c + 1]) +
                    zeroWhenFalsy(cells[r + 0]?.[c - 1]) +
                    zeroWhenFalsy(cells[r - 1]?.[c + 1]) +
                    zeroWhenFalsy(cells[r - 1]?.[c + 0]) +
                    zeroWhenFalsy(cells[r - 1]?.[c - 1])
                )
            }
        // 计算新的细胞分布（规则如下）
        // 每个细胞有两种状态 - 存活或死亡，每个细胞与以自身为中心的周围八格细胞产生互动（如图，黑色为存活，白色为死亡）
        // 当前细胞为存活状态时，当周围的存活细胞低于2个时（不包含2个），该细胞变成死亡状态。（模拟生命数量稀少）
        // 当前细胞为存活状态时，当周围有2个或3个存活细胞时，该细胞保持原样。
        // 当前细胞为存活状态时，当周围有超过3个存活细胞时，该细胞变成死亡状态。（模拟生命数量过多）
        // 当前细胞为死亡状态时，当周围有3个存活细胞时，该细胞变成存活状态。（模拟繁殖）
        for (let r = 0; r < cells_rows; r += 1)
            for (let c = 0; c < cells_cols; c += 1) {
                if (cells_shadow[r][c] < 2) {
                    cells[r][c] = 0
                } else if (cells_shadow[r][c] <= 3) {
                    cells[r][c] = cells[r][c]
                    if (cells_shadow[r][c] === 3)
                        cells[r][c] = 1
                } else {
                    cells[r][c] = 0
                }
            }
    }
    function paint() {
        for (let r = 0; r < cells_rows; r += 1)
            for (let c = 0; c < cells_cols; c += 1) {
                canvas_ctx.fillStyle = cells[r][c] ? 'rgb(255, 255, 255)' : 'rgb(0, 0, 0)';
                canvas_ctx.fillRect(c * cell_size, r * cell_size, cell_size, cell_size)
            }
    }

    initGame()
    setInterval(() => {
        next()
        paint()
    }, 1000.0 / 10)
}

onMounted(() => {
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
    position: absolute;
    top: 0;
    left: 0;
    z-index: -9999;
}
</style>
  