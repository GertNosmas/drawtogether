const main = document.getElementById("main")
const canvas = document.getElementById("canvas")
const ctx = canvas.getContext("2d")
const gifs_container = document.getElementById("gifs-container")
const reset_time = document.getElementById("reset-time")
let painting = false
let color = "black"
let thickness = 4

let prev_pos_x = -1
let prev_pos_y = -1


function showGifs(data) {
    gifs_container.innerHTML = ""

    const gifUrls = data.data.map(gif => gif.images.fixed_height.url)
    showGifContainer()
    for (const url of gifUrls) {
        const anchor = document.createElement("a")
        const img = document.createElement("img")
        img.src = url
        anchor.addEventListener("click", (e) => {
            e.preventDefault()
            enterGifPlaceState(url)
        })

        anchor.appendChild(img)
        gifs_container.appendChild(anchor)
    }
}

function showGifContainer() {
    gifs_container.style.display = "flex"
}

function enterGifPlaceState(url) {
    gifs_container.style.display = "none"
    
    canvas.addEventListener("click", (e) => {
        const rect = canvas.getBoundingClientRect()
        const local_pos_x = e.clientX - rect.left
        const local_pos_y = e.clientY - rect.top

        place_gif_at_pos(url, local_pos_x, local_pos_y)

        const gif_info = {
            type:"gif",
            url:url,
            top:local_pos_y,
            left:local_pos_x
        }
        send_data(gif_info)

        if (e.shiftKey) {
            enterGifPlaceState(url)
        }
    }, {once: "true"})
}

function place_gif_at_pos(url, left, top) {
        const img = document.createElement("img")
        main.appendChild(img)
        img.style.position = "absolute"
        img.src = url

        img.style.left = `${left}px`
        img.style.top = `${top}px`
        
}

function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    ctx.setTransform(1, 0, 0, 1, 0, 0)
    canvas.width = Math.round(rect.width * dpr)
    canvas.height = Math.round(rect.height * dpr);

    ctx.scale(dpr, dpr)
}

window.addEventListener("resize", () => {
    location.reload()
})

canvas.addEventListener("pointerdown", (e) => {
    painting = true
})

window.addEventListener("pointerup", (e) => {
    painting = false

    prev_pos_x = -1
    prev_pos_y = -1
})

canvas.addEventListener("pointermove", (e) => {
    if (!painting) {
        return
    }

    const rect = canvas.getBoundingClientRect()
    const local_pos_x = e.clientX - rect.left
    const local_pos_y = e.clientY - rect.top

    if (prev_pos_x == -1 || prev_pos_y == -1) {
        prev_pos_x = local_pos_x
        prev_pos_y = local_pos_y
    }

    ctx.beginPath()
    ctx.strokeStyle = color
    ctx.lineWidth = thickness
    ctx.moveTo(prev_pos_x, prev_pos_y)
    ctx.lineTo(local_pos_x, local_pos_y)
    ctx.stroke()

    let stroke = {
        type:"stroke",
        width:thickness,
        style:color,
        from:[prev_pos_x, prev_pos_y],
        to:[local_pos_x, local_pos_y]
    }

    send_data(stroke)

    prev_pos_x = local_pos_x
    prev_pos_y = local_pos_y
})


function updateColor(value) {
    color = value
}

function updateThickness(value) {
    thickness = value
}

resizeCanvas();
