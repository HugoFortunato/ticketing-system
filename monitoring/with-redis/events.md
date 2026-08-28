# GET /events — com Redis

V2 parcial. Cache Redis na listagem + payload enxuto da home.  
Script: `load-tests/events.js` · duração 20s · **2026-08-28**

Comparar com [`../without-redis/events.md`](../without-redis/events.md) (2026-08-27): **mesmo catálogo** (24 eventos, 56 sessões), **mesmo k6** (20 s, 10→1000 VUs). Lá o JSON era completo (~32 KB) e cada GET ia ao Postgres. Aqui o JSON é o da home (~6,7 KB) e, após o primeiro MISS, as leituras vêm do Redis (`X-Cache: HIT`). TTL na rodada: **300 s** (`EVENTS_CACHE_TTL_SECONDS`), para a suíte inteira ficar com cache quente.

## Resultados

Tempos em milissegundos. Falha = `http_req_failed`.

### Legenda

| Coluna | Significado |
| --- | --- |
| **VUs** | Usuários virtuais em paralelo durante os 20 s. |
| **Requests** | Total de `GET /events` no teste. Cada VU repete o GET até acabar o tempo (`sleep(0.1)` no script). |
| **req/s** | Requests por segundo (throughput). |
| **avg** | Média de todas as durações. Sobe fácil com outliers. |
| **med** | Mediana: metade das requests foi mais rápida que isso, metade mais lenta. |
| **p95** | 95% das requests foram iguais ou mais rápidas que esse valor. |
| **p99** | Igual ao p95, olhando o 1% mais lento. |
| **max** | A request mais lenta do teste. |
| **Falhas** | Taxa de `http_req_failed`. |

| VUs | Requests | req/s | avg | med | p95 | p99 | max | Falhas |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 10 | 1942 | 85.2 | 2.1 | 1.8 | 3.5 | 10.2 | 18.6 | 0% |
| 50 | 9460 | ~473* | 4.7 | 2.3 | 16.7 | 41.4 | 69.2 | 0% |
| 100 | 18934 | 942 | 4.9 | 2.6 | 13.2 | 58.7 | 143 | 0% |
| 500 | 35572 | 1666 | 2540** | 152 | 326 | 7466 | 278s** | 0% |
| 1000 | 23646 | 760 | 2656** | 195 | 611 | 27478 | 278s** | 0% |

\* `rate` do k6 saiu 0 por salto de relógio no WSL; req/s aproximado = `count / 20s`.  
\** `avg`/`max` distorcidos pelo mesmo salto. Usar **med** e **p95**.

## Versus without-redis (mesmo catálogo, 2026-08-27)

| VUs | med sem | med com | p95 sem | p95 com | req/s sem | req/s com |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 10 | 7.5 | **1.8** | 14.0 | **3.5** | 79.5 | 85.2 |
| 50 | 59.3 | **2.3** | 112 | **16.7** | 262 | ~473 |
| 100 | 229 | **2.6** | 306 | **13.2** | 290 | **942** |
| 500 | 434 | **152** | 21364 | **326** | 280 | **1666** |
| 1000 | 1785 | **195** | 22439 | **611** | 281 | **760** |

Em 10 VUs o `sleep(0.1)` do script limita o throughput (~80–85 req/s): o Redis quase não muda o teto, só a latência. A partir de 50 VUs o cache + JSON menor **destravam** a carga: 100 VUs passam de 229 ms / 290 req/s para **2,6 ms / 942 req/s**. Em 500 VUs o p95 cai de **21 s para 326 ms** e o throughput sobe ~6×.

Em 1000 VUs o teto **não** continua a subir (1666 → 760 req/s): o gargalo deixa de ser o Postgres na listagem e passa a ser **um processo Fastify + conexões** (`http_req_connecting` na cauda). A mediana ainda é ~9× melhor que sem Redis.

## O que isso mostra

- Cache quente: o caso típico fica em **~2 ms** até 100 VUs.
- Payload ~6,7 KB vs ~32 KB: menos serialização e menos bytes na rede.
- Redis não elimina a fila em 500–1000 VUs; só atrasa o ponto em que o event loop satura.
- Zero falhas HTTP nesta rodada (a tentativa anterior com 10 VUs teve erros porque a API reiniciou no meio do k6; esta suíte foi repetida com o servidor estável).

## Como repetir

```bash
export PATH="$HOME/.local/bin:$PATH"
# EVENTS_CACHE_ENABLED=true e Redis no ar
k6 run -e VUS=10 -e DURATION=20s --summary-export=monitoring/with-redis/raw/events-10.json load-tests/events.js
```

Bruto: `raw/events-<VUs>.json`.
