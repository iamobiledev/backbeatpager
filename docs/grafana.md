# Grafana Alerting

Backbeat Pager accepts Grafana's webhook contact-point payload at:

```text
POST https://<api-domain>/api/v1/integrations/grafana
```

## Grafana UI

1. Open **Alerts & IRM → Alerting → Contact points**.
2. Add a **Webhook** integration.
3. Set the URL to the endpoint above and HTTP method to `POST`.
4. Under authorization, choose scheme `Bearer` and use the target service's
   Backbeat Pager routing key as the credential.
5. Leave resolved-message delivery enabled.
6. Test, save, and attach the contact point to a notification policy.

## Provisioning file

```yaml
apiVersion: 1

contactPoints:
  - orgId: 1
    name: backbeat-pager
    receivers:
      - uid: backbeat-pager-webhook
        type: webhook
        disableResolveMessage: false
        settings:
          url: https://pager-api.example.com/api/v1/integrations/grafana
          httpMethod: POST
          authorization_scheme: Bearer
          authorization_credentials: bbp_REPLACE_WITH_ROUTING_KEY
          maxAlerts: "0"
```

Treat the provisioning file as a secret because Grafana stores the routing key
in `authorization_credentials`.

## Mapping

- Alert `fingerprint` is the preferred deduplication key.
- Firing notifications trigger or update incidents; resolved notifications
  resolve them.
- Error/high severity maps to `critical`; warn/medium maps to `warning`;
  everything else maps to `info`.
- Alert labels, annotations, and `valueString` are preserved in JSON.
- `generatorURL` is shown as the source link.
- The first available alert annotation, Grafana title/message, or alert name
  becomes the incident summary.

Multiple alerts in one contact-point delivery are processed independently and
returned in the response's `results` array.
