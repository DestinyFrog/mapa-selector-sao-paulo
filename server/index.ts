import { Elysia, status } from 'elysia'
import { connect } from "@tursodatabase/database"
import { cors } from '@elysia/cors'

const db = await connect("./database/purple.sqlite3")

new Elysia()
    .use(cors({
        origin: 'http://localhost:3030'
    }))
    .get('/city/search/:term', async ({ params: { term } }) => {
        try {
            if (!term)
                return status(400, { message: "term is required" })

            const q = "SELECT codigo, nome FROM municipio WHERE nome LIKE ?"
            const stmt = await db.prepare(q)
            const municipios = stmt.all([ `%${term}%` ])
            return municipios
        }
        catch (err) {
            console.error(err)
            return status(500, { message: 'internal server error' })
        }
    })
    .get('/city/:code', async ({ params: { code } }) => {
        try {
            if (!code)
                return status(400, { message: "code is required" })

            const q = "SELECT * FROM full_municipio WHERE codigo = ?"
            const stmt = await db.prepare(q)
            const municipio = await stmt.get([ code ])
            if (!municipio)
                return status(404, { message: "city not found" })

            return {
                ... municipio,
                geometria_coordenadas:  JSON.parse(municipio['geometria_coordenadas'])
            }
        }
        catch (err) {
            console.error(err)
            return status(500, { message: 'internal server error' })
        }
    })
    .get('/city/:code/geojson', async ({ params: { code } }) => {
        try {
            if (!code)
                return status(400, { message: "code is required" })

            const q = "SELECT * FROM full_municipio WHERE codigo = ?"
            const stmt = await db.prepare(q)
            const municipio = await stmt.get([ code ])
            if (!municipio)
                return status(404, { message: "city not found" })

            return {
                type: "Feature",
                properties: {
                    CD_MUN: municipio.codigo,
                    NM_MUN: municipio.nome,
                    CD_RGI: municipio.rgi_codigo,
                    NM_RGI: municipio.rgi_nome,
                    CD_RGINT: municipio.rgint_codigo,
                    NM_RGINT: municipio.rgint_nome,
                    NM_UF: municipio.uf_nome,
                    CD_UF: municipio.uf_codigo,
                    SIGLA_UF: municipio.uf_sigla,
                    CD_REGIA: municipio.regiao_codigo,
                    NM_REGIA: municipio.regiao_nome,
                    SIGLA_RG: municipio.regiao_sigla,
                    CD_CONCU: municipio.municipio_central_codigo,
                    NM_CONCU: municipio.municipio_central_nome,
                    AREA_KM2: municipio.area_km2,
                },
                geometry: {
                    type: municipio.geometria_tipo,
                    coordinates: JSON.parse(municipio.geometria_coordenadas)
                }
            }
        }
        catch (err) {
            console.error(err)
            return status(500, { message: 'internal server error' })
        }
    })
    .listen(8040)