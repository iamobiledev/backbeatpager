const apiBaseUrl = process.env.API_BASE_URL ?? "http://localhost:3001";
const routingKey = process.env.DEMO_ROUTING_KEY;

if (!routingKey) {
  throw new Error(
    "DEMO_ROUTING_KEY is required. Copy the one-time key printed by pnpm db:seed."
  );
}

const response = await fetch(`${apiBaseUrl}/api/v1/alerts`, {
  body: JSON.stringify({
    dedup_key: `demo-${Date.now()}`,
    event_action: "trigger",
    payload: {
      custom_details: {
        fired_by: "pnpm demo:alert"
      },
      severity: "critical",
      source: "backbeatpager-demo",
      summary: "Demo payment authorization failures"
    },
    routing_key: routingKey
  }),
  headers: {
    "content-type": "application/json"
  },
  method: "POST"
});

const body: unknown = await response.json();
console.log(JSON.stringify(body, null, 2));

if (!response.ok) {
  process.exitCode = 1;
}
