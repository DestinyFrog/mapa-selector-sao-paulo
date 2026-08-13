window.queueMicrotask = queueMicrotask.bind(window)

const { createClient } = await import("@libsql/client/web")

const turso = createClient({
    url: 'http://localhost:8080'
})

async function get_full_map() {
    let features = [] as any[]

    const { total } = (await turso.execute(`SELECT COUNT(*) AS total FROM municipio`)).rows[0] as any
    const per_page = 10

    for (let page = 0; page )
    const query = `
        SELECT
            municipio.codigo,
            municipio.nome,
            geometria.tipo,
            geometria.coordenadas
        FROM municipio
        LEFT JOIN geometria
            ON geometria.id = municipio.geometria_id
        LIMIT 10`

    const { rows } = await turso.execute(query)
    features = [
        ... features,
        rows.map(row => ({
            type: "Feature",
            properties: {
                CD_MUN: (row.codigo as number).toString(),
                NM_MUN: row.nome,
            },
            geometry: {
                type: row.tipo,
                coordinates: JSON.parse(row.coordenadas as string),
            }
        }))
    ]

    return {
        type: "FeatureCollection",
        name: "sp.geo",
        crs: {
            type: "name",
            properties: {
                name: "urn:ogc:def:crs:EPSG::4674"
            }
        },
        features
    }
}

var map = L.map('map').setView([-23.5489, -46.6388], 13)
var layer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 10
})
layer.addTo(map)

const background_map_style = {
    color: '#ffffff',
    weight: 2,
    fillOpacity: 0,
    opacity: 0.1
}

get_full_map().then(data => {
    console.log(data)

    const geojson = L.geoJSON(data, {
        style: background_map_style,
        onEachFeature: (feature, layer) => {
            layer.bindTooltip(feature.properties.NM_MUN, { sticky: true })
        },
    })

    geojson.addTo(map)
})