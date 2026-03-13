const IP = "wss://ws.digiworks-studio.com/ws"
const socket = new WebSocket(IP)


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
