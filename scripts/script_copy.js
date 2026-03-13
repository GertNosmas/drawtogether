const KEY = "icOv4bntNc4dxCU6GfdHmRUiUfZwXJmt"

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

const IP = "wss://ws.digiworks-studio.com/ws"
const socket = new WebSocket(IP)


async function searchGifs(search) {
    const params = new URLSearchParams({
        api_key: KEY,
        q: search,
        limit: 50,
    })

    const url = `https://api.giphy.com/v1/gifs/search?${params}`
    try {
        const response = await fetch(url)
        const data = await response.json()

        showGifs(data)

    } catch (err) {
        console.error(err)
    }
}

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

resizeCanvas();

function getResetTime() {
    const now = new Date
    const next = new Date(now)

    if (now.getMinutes() < 30) {
        next.setMinutes(30, 0 ,0)
    }
    else {
        next.setHours(now.getHours() + 1, 0, 0, 0)
    }

    return formatTime(next - now);
}

function formatTime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60;

    return String(minutes).padStart(2, "0") + ":" +
           String(seconds).padStart(2, "0");
}

function updateTimer() {
    reset_time.innerText = getResetTime()
}

window.addEventListener("resize", () => {
    resizeCanvas()
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

function send_data(data) {
    socket.send(JSON.stringify(data))
}

socket.onmessage = (data) => {
    handle_message(data)
}

function handle_message(message_string) {
    const message = JSON.parse(message_string.data)

    if (message.type == "stroke") {
        ctx.beginPath()
        ctx.strokeStyle = message.style
        ctx.lineWidth = message.width
        ctx.moveTo(message.from[0], message.from[1])
        ctx.lineTo(message.to[0], message.to[1])
        ctx.stroke()
    }

    else if (message.type == "gif") {
        place_gif_at_pos(message.url, message.left, message.top)
    }

    else if (message.type == "reset") {
        location.reload()
    }
}


window.searchGifs = searchGifs
setInterval(updateTimer, 1000)
