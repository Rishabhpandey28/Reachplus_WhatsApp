# Shopify Flow -> Wati project

## 1. Server side (once)
1. Replace src/server/server.js and src/server/models/Message.js with the patched ones.
2. Add to src/server/.env:
   SHOPIFY_FLOW_SECRET=<long random text, e.g. 40 characters>
   DEFAULT_COUNTRY_CODE=91
3. Restart the backend.

## 2. Public URL (Shopify cannot reach localhost)
Local testing:  ngrok http 5000   (or cloudflared tunnel --url http://localhost:5000)
You get https://xxxx.ngrok-free.app  -> endpoint:
  https://xxxx.ngrok-free.app/api/integrations/shopify-flow/send
For real use, host the backend on a server with a fixed https domain.

## 3. Test from your computer (no message is sent with dryRun)
curl -X POST https://YOUR-URL/api/integrations/shopify-flow/send \
  -H "Content-Type: application/json" \
  -H "x-flow-secret: YOUR_SECRET" \
  -d '{"phone":"9876543210","template":"order_confirmation","language":"en_US","parameters":["Rahul","#1001","499"],"dryRun":true}'

Remove "dryRun" to send a real message.

## 4. Shopify Flow
Trigger: Order created (or Order paid / Order fulfilled ...)
Action:  Send HTTP request
  HTTP method: POST
  URL:         https://YOUR-URL/api/integrations/shopify-flow/send
  Headers:     Content-Type = application/json
               x-flow-secret = YOUR_SECRET
  Body:
{
  "phone": "{{order.shippingAddress.phone}}",
  "name": "{{order.customer.firstName}}",
  "template": "order_confirmation",
  "language": "en_US",
  "parameters": ["{{order.customer.firstName}}", "{{order.name}}", "{{order.totalPriceSet.shopMoney.amount}}"],
  "reference": "{{order.id}}",
  "flowName": "Order confirmation"
}
Use Flow's "+ Add variable" picker to insert the fields, so the names match your trigger.

parameters[0] = {{1}} in the template, parameters[1] = {{2}} and so on.
Image/video/document header template: also send "headerMediaUrl": "https://public-link-to-file".
"reference" stops duplicate messages when Flow retries.

## Response codes (Flow reads these)
200 ok / duplicate       -> success
400 / 401 / 422          -> failed, Flow does not retry (bad phone, template not approved, wrong secret, Meta rejected)
503                      -> temporary problem, Flow retries automatically
