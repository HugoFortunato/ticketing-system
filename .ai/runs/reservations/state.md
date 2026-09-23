# state

```yaml
task_id: reservations
current: READY_TO_MERGE
previous: QA
agent: reviewer
expected_output: POST+GET hold
validation: tsc + vitest + e2e PASS
failure:
next: humano (commit/push se quiser)
```
