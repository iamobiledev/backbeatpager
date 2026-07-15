# Prometheus Alertmanager

Backbeat Pager accepts Alertmanager's standard webhook payload at:

```text
POST https://<api-domain>/api/v1/integrations/alertmanager
```

Create or rotate a routing key for the target Backbeat Pager service, then add a
receiver to `alertmanager.yml`:

```yaml
route:
  receiver: backbeat-pager
  group_by: [alertname, service]

receivers:
  - name: backbeat-pager
    webhook_configs:
      - url: https://pager-api.example.com/api/v1/integrations/alertmanager
        send_resolved: true
        http_config:
          authorization:
            type: Bearer
            credentials: bbp_REPLACE_WITH_ROUTING_KEY
```

For file-based secrets, replace `credentials` with `credentials_file`.

## Mapping

Each Alertmanager alert becomes one logical Backbeat Pager alert:

- `fingerprint` is the preferred deduplication key.
- `status: firing` triggers or updates an incident.
- `status: resolved` resolves the matching incident.
- `labels.severity` maps `critical`, `warning`/`warn`, and `info`; unknown
  severities become `info`.
- `annotations.summary`, `annotations.description`, then `labels.alertname`
  provide the summary.
- Labels, annotations, and `valueString` are retained as JSON custom details.
- `generatorURL` becomes the incident source link.

Keep `send_resolved: true`; otherwise Alertmanager cannot automatically resolve
incidents.

## Test

```bash
curl -X POST https://pager-api.example.com/api/v1/integrations/alertmanager \
  -H 'content-type: application/json' \
  -H 'authorization: Bearer bbp_REPLACE_WITH_ROUTING_KEY' \
  --data '{
    "status": "firing",
    "commonLabels": {},
    "commonAnnotations": {},
    "alerts": [{
      "status": "firing",
      "fingerprint": "alertmanager-demo",
      "labels": {
        "alertname": "DemoDown",
        "instance": "demo-1",
        "severity": "critical"
      },
      "annotations": { "summary": "Demo target is down" },
      "generatorURL": "https://prometheus.example.com/graph"
    }]
  }'
```

Send the same payload with both status fields changed to `resolved` to close
the incident.
