
const datalist_search_city = document.getElementById('datalist-search-city')

const but_add_city = document.getElementById('but-add-city')
but_add_city.style.display = 'none'
but_add_city.addEventListener('click', add_city)

const inp_search_city = document.getElementById('inp-search-city')
inp_search_city.addEventListener('input', search_cities)

const ul_cities_list = document.getElementById('list-cities')

var map = L.map('map').setView([-23.5489, -46.6388], 13)
var layer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 20
})
layer.addTo(map)

let cities = undefined // {"NM_RGINT":"São Paulo","CD_MUN":"3513009","NM_MUN":"Cotia"}
let selected_city = undefined
let selected_cities = []

function set_cities(data) {
    cities = data

    datalist_search_city.innerHTML = ''
    cities.forEach((city, index) => {
        const option = document.createElement('option')
        option.setAttribute('value', city.NM_MUN)
        datalist_search_city.appendChild(option)
    })
}

function search_cities(ev) {
    const value = inp_search_city.value
    const selected = cities.find(city => city.NM_MUN == value)
    if (!selected) {
        but_add_city.style.display = 'none'
        return
    }

    but_add_city.style.display = 'block'

    fetch(`./data/${selected.NM_MUN}.json`)
        .then(text => text.json())
        .then(data => selected_city = data)
        .catch(err => console.error)
}

function add_city(ev) {
    if (!selected_city) return

    const geojson = L.geoJSON(selected_city, {
        onEachFeature: function (feature, layer) {
            layer.on({
                mouseover: (e) => {
                    const layer = e.target

                    layer.setStyle({
                        weight: 4,
                        color: '#ff7800',
                        fillOpacity: 0.5
                    })

                    // Bring to front so the highlighted border isn't covered by neighbors
                    layer.bringToFront()
                },
                mouseout: (e) => {
                    // Reset to the original style set on the geojson layer
                    geojson.resetStyle(e.target)
                }
            })

            layer.bindTooltip(feature.properties.NM_MUN, {
                sticky: true // tooltip follows the mouse
            })
        }
    })
    geojson.addTo(map)

    const index = selected_cities.push(geojson) - 1

    const li = document.createElement('li')
    ul_cities_list.appendChild(li)

    const title = document.createElement('p')
    p.textContent = `${index + 1}. ${selected_city.properties.NM_MUN}`
    title.addEventListener('click', () =>
        map.fitBounds(geojson.getBounds(), {
            animate: true,
            duration: 2,
            padding: [20, 20]
        }))
    li.appendChild(title)

    const img_delete = document.createElement('img')
    img_delete.alt = 'delete'
    img_delete.src = '/delete.svg'
    img_delete.addEventListener('click', () => remove_city(index, li))
    li.appendChild(img_delete)

    selected_city = undefined
    inp_search_city.value = ''
}

function remove_city(index, element) {
    selected_cities[index].removeFrom(map)
    selected_cities.splice(index, 1)
    element.remove()
}

fetch('./data/index.json')
    .then(text => text.json())
    .then(set_cities)
    .catch(err => console.error)

fetch('./sp.geo.json')
    .then(text => text.json())
    .then(data =>
        L.geoJSON(data, {
            style: {
                color: '#ffffff',
                weight: 2,
                fillOpacity: 0,
                opacity: 0.1
            },

            onEachFeature: function (feature, layer) {
                layer.bindTooltip(feature.properties.NM_MUN, { sticky: true })
                layer.on({
                    click: function (_) {
                        fetch(`./data/${feature.properties.NM_MUN}.json`)
                            .then(text => text.json())
                            .then(data => {
                                selected_city = data
                                add_city()
                            })
                            .catch(err => console.error)
                    }
                })
            },
        }).addTo(map))
    .catch(err => console.error)
