import type { Feature, Geometry } from 'geojson'
import L from 'leaflet'

type MyFeature = Feature<Geometry, { CD_MUN: string, NM_MUN: string }>

const inp_search_city = document.getElementById('inp-search-city') as HTMLInputElement
const ul_searched_cities = document.getElementById('ul-searched-cities') as HTMLDivElement
const ul_cities = document.getElementById('ul-cities') as HTMLDivElement

const cities = {
    _data: {} as { [key: string]: L.GeoJSON<MyFeature, Geometry> },
    _selected: new Set(),

    select(feature: MyFeature) {
        if (this._selected.has(feature.properties.CD_MUN))
            return

        this._data[feature.properties.CD_MUN]?.setStyle({
            color: 'rgba(255, 165, 0, 1)',
            fillColor: 'rgba(255, 165, 0, 0.5)'
        })

        const li = document.createElement('li') as HTMLLIElement
        ul_cities.appendChild(li)

        const p = document.createElement('p')!
        li.appendChild(p)
        p.textContent = feature.properties.NM_MUN
        p.addEventListener('click', () => {
            map.fitBounds(this._data[feature.properties.CD_MUN]!.getBounds(), {
                padding: [ 10, 10 ]
            })
        })

        const del_button = document.createElement('button')
        li.appendChild(del_button)
        del_button.textContent = 'X'
        del_button.addEventListener('click', () => {
            li.remove()
            this.remove(feature.properties.CD_MUN)
        })

        this._selected.add(feature.properties.CD_MUN)
    },

    push(data: MyFeature) {
        this._data[data.properties.CD_MUN] = L.geoJSON(data, {
            style: {
                color: 'rgba(200, 200, 200, 0.2)',
                fillColor: 'transparent',
                weight: 1
            },
            onEachFeature: (feature, layer) => {
                layer.bindTooltip(feature.properties.NM_MUN, { sticky: true })
                layer.addEventListener('click', () => {
                    this.select(feature)
                })
            },
        }).addTo(map)
    },

    remove(code: string) {
        this._data[code]?.resetStyle()
        this._selected.delete(code)
    }
}

var map = L.map('map').setView([-23.5489, -46.6388], 13)
var layer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 10
})
layer.addTo(map)

function start() {
    inp_search_city.addEventListener('input', _ => search_city())
    get_all_cities()
}

let timer = null as NodeJS.Timeout | null
function debounce(fn: Function) {
    if (timer)
        clearTimeout(timer)
    timer = setTimeout(() => fn(), 500)
}

async function search_city() {
    const term = inp_search_city.value
    if (term == "") {
        ul_searched_cities.innerText = ''
        inp_search_city.value = ''
        return
    }

    debounce(() =>
        fetch(`/city/search/${term}`)
        .then(res => res.json() as Promise<MyFeature[]>)
        .then(data => {
                ul_searched_cities.innerText = ''

                data.map(city => {
                    const li = document.createElement('li')
                    li.textContent = city.properties.NM_MUN
                    li.addEventListener('click', () => {
                        cities.select(city)
                        inp_search_city.value = ''
                        search_city()
                    })
                    return li
                })
                .forEach(li => ul_searched_cities.appendChild(li))
        })
        .catch(err => console.error(err.message))
        .finally(() => timer = null))
}

async function get_all_cities() {
    const per_page = 100
    let page = 0
    let total = null as number | null

    try {
        while (!total || page * per_page < total) {
            const res = await fetch(`/city?page=${page}&per_page=${per_page}`)
            const payload = await res.json() as { data: MyFeature[], total: number }

            if (!total) total = payload.total
            payload.data.forEach(city => cities.push(city))
            page++
        }
    }
    catch (err) {
        console.error(err)
    }
}

start()