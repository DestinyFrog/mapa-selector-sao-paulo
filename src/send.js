window.queueMicrotask = queueMicrotask.bind(window)

const { createClient } = await import("@libsql/client/web")

const turso = createClient({
    url: 'http://localhost:8080'
})

turso.execute("SELECT * FROM municipio")
    .then(data => console.log(data.rows))

var map = L.map('map').setView([-23.5489, -46.6388], 13)
var layer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 10
})
layer.addTo(map)

async function get_full_map() {
    const { rows } = await turso.execute("SELECT * FROM municipio")
}

// fetch('./sp.geo.json')
// .then(text => text.json())
//     .then(data =>
//         L.geoJSON(data, {
//             style: {
//                 color: '#ffffff',
//                 weight: 2,
//                 fillOpacity: 0,
//                 opacity: 0.1
//             },

//             onEachFeature: function (feature, layer) {
//                 layer.bindTooltip(feature.properties.NM_MUN, { sticky: true })
//                 layer.on({
//                     click: async (_) => {
//                         await search_cities(feature.properties.NM_MUN)
//                         add_city()
//                     }
//                 })
//             },
//         }).addTo(map))
//     .catch(console.error)


// const datalist_search_city = document.getElementById('datalist-search-city')

// const but_add_city = document.getElementById('but-add-city')
// but_add_city.style.display = 'none'
// but_add_city.addEventListener('click', add_city)

// const inp_search_city = document.getElementById('inp-search-city')
// inp_search_city.addEventListener('input', ev => search_cities(ev.target.value))

// const ul_cities_list = document.getElementById('list-cities')

// let cities = undefined
// let selected_city = undefined
// let selected_cities = {}

// function set_cities(data) {
//     cities = data

//     datalist_search_city.innerHTML = ''
//     cities.forEach(city => {
//         const option = document.createElement('option')
//         option.setAttribute('value', city.NM_MUN)
//         datalist_search_city.appendChild(option)
//     })
// }

// async function search_cities(value) {
//     if (!cities)
//         return

//     const selected = cities.find(city => city.NM_MUN == value)
//     if (!selected) {
//         but_add_city.style.display = 'none'
//         return
//     }

//     but_add_city.style.display = 'block'

//     const res = await fetch(`./data/${selected.NM_MUN}.geo.json`)
//     selected_city = await res.json()
// }

// function add_city() {
//     if (!selected_city) return

//     const geojson = L.geoJSON(selected_city, {
//         onEachFeature: function (feature, layer) {
//             layer.on({
//                 mouseover: (e) => {
//                     const layer = e.target

//                     layer.setStyle({
//                         weight: 4,
//                         color: '#ff7800',
//                         fillOpacity: 0.5
//                     })

//                     // Bring to front so the highlighted border isn't covered by neighbors
//                     layer.bringToFront()
//                 },
//                 mouseout: (e) => {
//                     // Reset to the original style set on the geojson layer
//                     geojson.resetStyle(e.target)
//                 }
//             })

//             layer.bindTooltip(feature.properties.NM_MUN, {
//                 sticky: true // tooltip follows the mouse
//             })
//         }
//     })
//     geojson.addTo(map)

//     const { NM_MUN } = selected_city.properties
//     selected_cities[NM_MUN]  = geojson

//     const li = document.createElement('li')
//     ul_cities_list.appendChild(li)

//     const title = document.createElement('p')
//     title.textContent = NM_MUN
//     title.addEventListener('click', () =>
//         map.fitBounds(geojson.getBounds(), {
//             animate: true,
//             duration: 2,
//             padding: [20, 20]
//         }))
//     li.appendChild(title)

//     const img_delete = document.createElement('img')
//     img_delete.alt = 'delete'
//     img_delete.src = './delete.svg'
//     img_delete.addEventListener('click', () => remove_city(NM_MUN, li))
//     li.appendChild(img_delete)

//     selected_city = undefined
//     inp_search_city.value = ''
// }

// function remove_city(NM_MUN, element) {
//     selected_cities[NM_MUN].removeFrom(map)
//     delete(selected_cities[NM_MUN])
//     element.remove()
// }

// fetch('./data/index.json')
//     .then(text => text.json())
//     .then(set_cities)
//     .catch(console.error)

// fetch('./sp.geo.json')
// .then(text => text.json())
//     .then(data =>
//         L.geoJSON(data, {
//             style: {
//                 color: '#ffffff',
//                 weight: 2,
//                 fillOpacity: 0,
//                 opacity: 0.1
//             },

//             onEachFeature: function (feature, layer) {
//                 layer.bindTooltip(feature.properties.NM_MUN, { sticky: true })
//                 layer.on({
//                     click: async (_) => {
//                         await search_cities(feature.properties.NM_MUN)
//                         add_city()
//                     }
//                 })
//             },
//         }).addTo(map))
//     .catch(console.error)
