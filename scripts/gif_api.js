const KEY = "icOv4bntNc4dxCU6GfdHmRUiUfZwXJmt" /*Niet stelen aub :(*/

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
