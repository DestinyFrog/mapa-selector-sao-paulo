import { rm } from "node:fs/promises"

await rm("../data", { recursive: true, force: true })

const file = Bun.file("../sp.geo.json")
const data = await file.json()

const features = data.features as any[]

const index = []

for (const feature of features) {
    const { NM_RGINT, CD_MUN, NM_MUN } = feature.properties
    console.log( NM_RGINT, CD_MUN, NM_MUN )
    index.push({ NM_RGINT, CD_MUN, NM_MUN })
    await Bun.write(`../data/${NM_MUN}.geo.json`, JSON.stringify(feature))
}

await Bun.write("../data/index.json", JSON.stringify(index))
