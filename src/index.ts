import { Elysia, status, t } from 'elysia'
import { cors } from '@elysia/cors'
import { staticPlugin } from '@elysia/static'
import { createClient } from '@libsql/client';

const db = createClient({
    url: process.env.TURSO_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!
})

function municipio_to_geojson(municipio: any) {
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

new Elysia()
    .use(cors({
        origin: 'http://localhost:3000'
    }))
    .use(staticPlugin({
        assets: "dist",
        prefix: "/"
    }))
    .get('/city/search/:term', async ({ params: { term } }) => {
        try {
            if (!term)
                return status(400, { message: "term is required" })

            const q = "SELECT * FROM full_municipio WHERE nome LIKE ?"
            const stmt = await db.prepare(q)
            const municipios = await stmt.all([ `%${term}%` ])
            return municipios.map(municipio_to_geojson)
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
                geometria_coordenadas: JSON.parse(municipio['geometria_coordenadas'])
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

            return municipio_to_geojson(municipio)
        }
        catch (err) {
            console.error(err)
            return status(500, { message: 'internal server error' })
        }
    })
    .get('/city', async ({ query: { page, per_page } }) => {
        try {
            const q1 = `SELECT COUNT(*) AS total FROM municipio`
            const stmt1 = await db.prepare(q1)
            const total = (await stmt1.get()).total

            const q = `SELECT * FROM full_municipio LIMIT ${per_page} OFFSET ${page * per_page}`
            const stmt = await db.prepare(q)
            const municipios = await stmt.all()

            return {
                data: municipios.map(municipio_to_geojson),
                total
            }
        }
        catch (err) {
            console.error(err)
            return status(500, { message: 'internal server error' })
        }
    }, {
        query: t.Object({
            page: t.Number(),
            per_page: t.Number(),
        })
    })
    .listen(process.env.PORT!)

console.log(`Running on :${process.env.PORT!}`)