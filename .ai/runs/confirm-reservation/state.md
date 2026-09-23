# state

```yaml
task_id: confirm-reservation
current: PLAN_READY
previous: SPEC_READY
agent: principal-engineer
expected_output: POST confirm + GET ticket
validation: tsc + vitest + e2e
failure:
next: programmer
```
