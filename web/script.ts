import type { Feature, Geometry } from 'geojson'
import L from 'leaflet'

const BASE_URL = 'http://localhost:8040'

interface CitySearchObject { codigo: string, nome: string }
type MyFeature = Feature<Geometry, { CD_MUN: string, NM_MUN: string }>

const inp_search_city = document.getElementById('inp-search-city') as HTMLInputElement
const but_search_city = document.getElementById('but-search-city') as HTMLButtonElement
const ul_searched_cities = document.getElementById('ul-searched-cities') as HTMLDivElement
const ul_cities = document.getElementById('ul-cities') as HTMLDivElement

const cities = {
    _data: {} as { [key: string]: L.GeoJSON<MyFeature, Geometry> },

    push(data: MyFeature) {
        this._data[data.properties.CD_MUN] = L.geoJSON(data, {
            onEachFeature: (feature, layer) => {
                layer.bindTooltip(feature.properties.NM_MUN, { sticky: true })
            },
        }).addTo(map)

        const li = document.createElement('li') as HTMLLIElement
        li.textContent = data.properties.NM_MUN
        li.addEventListener('click', () => {
            li.remove()
            this._data[data.properties.CD_MUN]?.removeFrom(map)
            delete(this._data[data.properties.CD_MUN])
        })
        ul_cities.appendChild(li)
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
    but_search_city.style.opacity = '0'
    but_search_city.addEventListener('click', _ => get_city(inp_search_city.value))

    inp_search_city.addEventListener('input', _ => search_city())
}

async function search_city() {
    const term = inp_search_city.value

    fetch(`${BASE_URL}/city/search/${term}`)
        .then(res => res.json() as Promise<CitySearchObject[]>)
        .then(data => {
                ul_searched_cities.innerText = ''

                data.map(city => {
                    const li = document.createElement('li')
                    li.textContent = city.nome
                    li.addEventListener('click', () => get_city(city.codigo))
                    return li
                })
                .forEach(li => ul_searched_cities.appendChild(li))
        })
        .catch(err => console.error(err.message))
}

function get_city(codigo: string) {
    fetch(`${BASE_URL}/city/${codigo}/geojson`)
        .then(res => res.json() as Promise<MyFeature>)
        .then(data => cities.push(data))
        .catch(err => console.error(err.message))
}

start()