import { rm } from "node:fs/promises"

await rm("../data", { recursive: true, force: true })

const file = Bun.file("../sp.geo.json")
const data = await file.json()

const features = data.features as any[]

const regioes = Object.values(features.reduce((acc, feature) => {
    if (acc[feature.properties.CD_REGIA])
        return acc
    
    return { ... acc,
        [feature.properties.CD_REGIA]: {
            codigo: feature.properties.CD_REGIA,
            nome: feature.properties.NM_REGIA,
            sigla: feature.properties.SIGLA_RG,
        }
    }
}, {}))

const ufs = Object.values(features.reduce((acc, feature) => {
    if (acc[feature.properties.CD_UF])
        return acc
    
    return { ... acc,
        [feature.properties.CD_UF]: {
            codigo: feature.properties.CD_UF,
            nome: feature.properties.NM_UF,
            sigla: feature.properties.SIGLA_UF,
            regiao_codigo: feature.properties.CD_REGIA,
        }
    }
}, {}))

const rgints = Object.values(features.reduce((acc, feature) => {
    if (acc[feature.properties.CD_RGINT])
        return acc
    
    return { ... acc,
        [feature.properties.CD_RGINT]: {
            codigo: feature.properties.CD_RGINT,
            nome: feature.properties.NM_RGINT,
            uf_codigo: feature.properties.CD_UF,
        }
    }
}, {}))

const rgis = Object.values(features.reduce((acc, feature) => {
    if (acc[feature.properties.CD_RGI])
        return acc
    
    return { ... acc,
        [feature.properties.CD_RGI]: {
            codigo: feature.properties.CD_RGI,
            nome: feature.properties.NM_RGI,
            rgint_codigo: feature.properties.CD_RGINT,
        }
    }
}, {}))

const geometrias = features.map(feature => ({
    type: feature.geometry.type,
    coordinates: JSON.stringify(feature.geometry.coordinates),
}))

const municipios = features.map((feature, idx) => ({
    codigo: feature.properties.CD_MUN,
    nome: feature.properties.NM_MUN,
    area_km2: feature.properties.AREA_KM2,
    rgi_codigo: feature.properties.CD_RGI,
    concentracao_urbana_especifica_codigo: feature.properties.CD_CONCU,
    geometria_id: idx+1
}))

let sql_regiao_values = regioes.map(regiao => `(${regiao.codigo},'${regiao.nome}','${regiao.sigla}')`).join(',\n\t')
let sql_regiao = `INSERT INTO regiao (codigo, nome, sigla) VALUES\n\t${sql_regiao_values};`

let sql_uf_values = ufs.map(uf => `(${uf.codigo},'${uf.nome}','${uf.sigla}',${uf.regiao_codigo})`).join(',\n\t')
let sql_uf = `INSERT INTO uf (codigo, nome, sigla, regiao_codigo) VALUES\n\t${sql_uf_values};`

let sql_rgint_values = rgints.map(rgint => `(${rgint.codigo},'${rgint.nome}',${rgint.uf_codigo})`).join(',\n\t')
let sql_rgint = `INSERT INTO rgint (codigo, nome, uf_codigo) VALUES\n\t${sql_rgint_values};`

let sql_rgi_values = rgis.map(rgi => `(${rgi.codigo},'${rgi.nome}',${rgi.rgint_codigo})`).join(',\n\t')
let sql_rgi = `INSERT INTO rgi (codigo, nome, rgint_codigo) VALUES\n\t${sql_rgi_values};`

let sql_geometria_values = geometrias.map(geometria => `('${geometria.type}','${geometria.coordinates}')`).join(',\n\t')
let sql_geometria = `INSERT INTO geometria (type, coordinates) VALUES\n\t${sql_geometria_values};`

let sql_municipio_values = municipios.map(municipio => `(${municipio.codigo},'${municipio.nome.replace("'", "''")}',${municipio.area_km2}, ${municipio.rgi_codigo}, ${municipio.concentracao_urbana_especifica_codigo || 'NULL'}, ${municipio.geometria_id})`).join(',\n\t')
let sql_municipio = `INSERT INTO municipio (codigo, nome, area_km2, rgi_codigo, concentracao_urbana_especifica_codigo, geometria_id) VALUES\n\t${sql_municipio_values};`

let sql = `\n${sql_regiao}\n\n${sql_uf}\n\n${sql_rgint}\n\n${sql_rgi}\n\n${sql_geometria}\n\n${sql_municipio}`
await Bun.write("../database/seed.sql", sql)

// const ufs = features.reduce((acc, feature) => {

// }, {})

// for (const feature of features) {
//     const { NM_RGINT, CD_MUN, NM_MUN } = feature.properties
//     console.log( NM_RGINT, CD_MUN, NM_MUN )
//     index.push({ NM_RGINT, CD_MUN, NM_MUN })

//     // await Bun.write(`../data/${NM_MUN}.geo.json`, JSON.stringify(feature))
// }

// await Bun.write("../data/index.json", JSON.stringify(index))
