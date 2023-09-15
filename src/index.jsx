import { createRoot } from 'react-dom/client';

function random_background_color() {
    let h = (Math.random() * 360).toString() + 'deg'
    let s = (Math.random() * 100) + '%'
    let l = (80 + Math.random() * 15) + '%'
    document.body.style.backgroundColor = `hsl(${h}, ${s}, ${l})`
}

random_background_color()
const root = createRoot(document.getElementById('content'))
root.render(
    <h1>Hello World</h1>
)
