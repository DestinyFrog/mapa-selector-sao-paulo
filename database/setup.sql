
CREATE TABLE regiao (
    `codigo` INTEGER PRIMARY KEY,
    `nome` TEXT NOT NULL,
    `sigla` TEXT NOT NULL
);

CREATE TABLE uf (
    `codigo` INTEGER PRIMARY KEY,
    `nome` TEXT NOT NULL,
    `sigla` TEXT NOT NULL,
    `regiao_codigo` INTEGER REFERENCES regiao(`codigo`)
);

CREATE TABLE rgint (
    `codigo` INTEGER PRIMARY KEY,
    `nome` TEXT NOT NULL,
    `uf_codigo` INTEGER REFERENCES uf(`codigo`)
);

CREATE TABLE rgi (
    `codigo` INTEGER PRIMARY KEY,
    `nome` TEXT NOT NULL,
    `rgint_codigo` INTEGER REFERENCES rgint(`codigo`)
);

CREATE TABLE geometria (
    `id` INTEGER PRIMARY KEY,
    `tipo` TEXT NOT NULL CHECK (`tipo` IN ('Polygon', 'MultiPolygon')),
    `coordenadas` JSON NOT NULL
);

CREATE TABLE municipio (
    `codigo` INTEGER PRIMARY KEY,
    `nome` TEXT NOT NULL,
    `area_km2` REAL DEFAULT NULL,

    `rgi_codigo` INTEGER REFERENCES rgi(`codigo`),
    `concentracao_urbana_especifica_codigo` INTEGER DEFAULT NULL REFERENCES municipio(`codigo`),
    `geometria_id` INTEGER REFERENCES geometria(`id`)
);

CREATE VIEW full_municipio AS
    SELECT
        municipio.codigo,
        municipio.nome,
        municipio.area_km2,
        geometria.tipo AS geometria_tipo,
        geometria.coordenadas AS geometria_coordenadas,
        rgi.codigo AS rgi_codigo,
        rgi.nome AS rgi_nome,
        rgint.codigo AS rgint_codigo,
        rgint.nome AS rgint_nome,
        uf.codigo AS uf_codigo,
        uf.nome AS uf_nome,
        uf.sigla AS uf_sigla,
        regiao.codigo AS regiao_codigo,
        regiao.nome AS regiao_nome,
        regiao.sigla AS regiao_sigla,
        municipio_central.codigo AS municipio_central_codigo,
        municipio_central.nome AS municipio_central_nome
    FROM municipio
    LEFT JOIN geometria ON geometria.id = municipio.geometria_id
    LEFT JOIN rgi ON rgi.codigo = municipio.rgi_codigo
    LEFT JOIN rgint ON rgint.codigo = rgi.rgint_codigo
    LEFT JOIN uf ON uf.codigo = rgint.uf_codigo
    LEFT JOIN regiao ON regiao.codigo = uf.regiao_codigo
    LEFT JOIN municipio AS municipio_central ON municipio_central.codigo = municipio.concentracao_urbana_especifica_codigo;
