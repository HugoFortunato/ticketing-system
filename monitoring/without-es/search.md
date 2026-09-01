# GET /search — sem Elasticsearch

Baseline V3. Typeahead no PostgreSQL (`ILIKE` em nome, descrição, categoria, venue).  
Script: `load-tests/search.js` · `q=noite` · duração 20s · **2026-09-01**

`SEARCH_ENGINE=postgres`. Cada request vai ao banco (`X-Search-Engine: postgres`). Catálogo: 24 eventos.

## Resultados

Tempos em milissegundos. Falha = `http_req_failed`.

### Legenda

| Coluna | Significado |
| --- | --- |
| **VUs** | Usuários virtuais em paralelo durante os 20 s. |
| **Requests** | Total de `GET /search?q=` no teste. Cada VU repete até acabar o tempo (`sleep(0.1)`). |
| **req/s** | Requests por segundo (throughput). |
| **avg** | Média de todas as durações. Sobe fácil com outliers. |
| **med** | Mediana: metade das requests foi mais rápida que isso. |
| **p95** | 95% das requests foram iguais ou mais rápidas que esse valor. |
| **p99** | Igual ao p95, olhando o 1% mais lento. |
| **max** | A request mais lenta do teste. |
| **Falhas** | Taxa de `http_req_failed`. |

| VUs | Requests | req/s | avg | med | p95 | p99 | max | Falhas |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 10 | 1845 | 89.0 | 320** | 6.6 | 12.2 | 24.0 | 288s** | 0% |
| 50 | 8413 | 395 | 464** | 12.4 | 51.3 | 85.1 | 288s** | 0% |
| 100 | 13312 | 662 | 48.9 | 33.5 | 142 | 203 | 282 | 0% |
| 500 | 11040 | ~552* | 14913** | 327 | 817 | 310s** | 577s** | 0% |
| 1000 | 12690 | ~635* | 4234** | 300 | 511 | 289s** | 289s** | 0.8% |

\* `rate` do k6 saiu distorcido por salto de relógio no WSL; req/s aproximado = `count / 20s`.  
\** `avg`/`max`/`p99` distorcidos pelo mesmo salto. Usar **med** e **p95**. Em 100 VUs o relógio não saltou.

## O que isso mostra

- Com 10 VUs o `sleep(0.1)` limita ~90 req/s. A mediana **6,6 ms** é o custo típico de um `ILIKE` no catálogo pequeno.
- Em 100 VUs a mediana sobe para **34 ms** e o p95 para **142 ms**: o Postgres + 5 `OR` no join com Venue já pesam.
- Em 500–1000 VUs a mediana fica ~300 ms. O throughput não escala (centenas de req/s, não milhares). Aparecem falhas de transporte em 1000 VUs (~0,8%).
- Numa aba o typeahead parece instantâneo. O gargalo só aparece sob carga — o mesmo padrão da listagem sem Redis.

## Como repetir

```bash
export PATH="$HOME/.local/bin:$PATH"
# SEARCH_ENGINE=postgres
k6 run -e VUS=10 -e DURATION=20s --summary-export=monitoring/without-es/raw/search-10.json load-tests/search.js
```

Bruto: `raw/search-<VUs>.json`.
