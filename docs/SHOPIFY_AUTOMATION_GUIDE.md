# Shopify -> WhatsApp automations (order confirmation + abandoned cart)

Built into your existing server (src/server/server.js). No separate project, NO Redis, NO BullMQ.
Delayed messages are stored in MongoDB (collection scheduledjobs) and a timer inside the server sends them.

## What is installed / needed
Already needed by your project:
  - Node.js 18 or newer
  - MongoDB running (Compass connects to it)
Run once (node_modules are not inside the zip):
  cd Wati_Clone_Ansoz            && npm install
  cd src\server                  && npm install
NEW tool: cloudflared (public https link so Shopify can reach your PC)
  winget install --id Cloudflare.cloudflared      (then reopen PowerShell)
NOT needed: Redis, BullMQ, axios, ngrok.

## Start (3 terminals)
1) cd src\server        then  npm start        -> must print "MongoDB connected"
2) (project root)             npm run dev       -> frontend
3) cloudflared tunnel --url http://localhost:5000   -> copy the https://xxxx.trycloudflare.com link

## Meta templates to create (Your Templates page > Submit to Meta)
order_confirmation   Utility, English (US)
  Hi {{1}}, thanks for your order #{{2}}! Total: {{3}}.
  Examples: Rahul, 1001, 499 INR
abandoned_cart       Marketing, English (US)
  Hi {{1}}, you left items in your cart. Complete your order here: {{2}} We will keep them saved for you.
  Examples: Rahul, https://yourstore.com/cart/abc
(Meta rejects a template whose body ends with a variable, so keep text after {{2}}.)
Wait until both show Approved.

## .env (src/server/.env)
SHOPIFY_WEBHOOK_SECRET=   <- signing secret from Shopify webhook page (step below)
SHOPIFY_FLOW_SECRET=      <- already filled with a random value; used for the test commands
SHOPIFY_ORDER_TEMPLATE=order_confirmation
SHOPIFY_ABANDONED_TEMPLATE=abandoned_cart
SHOPIFY_TEMPLATE_LANGUAGE=en_US
SHOPIFY_ABANDONED_DELAY_MIN=45
SHOPIFY_REQUIRE_MARKETING_CONSENT=false   (true = abandoned-cart message only if customer accepted marketing)
Restart the server after any .env change.

## Connect Shopify
Shopify Admin > Settings > Notifications > Webhooks > Create webhook (format JSON), URL:
  https://YOUR-LINK/webhooks/shopify
Create:  Order creation,  Checkout creation,  Checkout update (if listed)
Copy the signing secret shown at the bottom of that Webhooks page into SHOPIFY_WEBHOOK_SECRET.
(Why "Checkout update": the phone number usually arrives after the checkout is created.)

## Test WITHOUT Shopify (PowerShell)
$h = @{"x-flow-secret"="VALUE_OF_SHOPIFY_FLOW_SECRET"}
$u = "http://localhost:5000/api/integrations/shopify/simulate"

Order confirmation:
Invoke-RestMethod -Method Post -Uri $u -Headers $h -ContentType "application/json" -Body '{"topic":"orders/create","data":{"id":9001,"order_number":1001,"total_price":"499.00","currency":"INR","customer":{"first_name":"Rahul","phone":"9876543210"}}}'

Abandoned cart (sent immediately because delayMinutes is 0):
Invoke-RestMethod -Method Post -Uri $u -Headers $h -ContentType "application/json" -Body '{"topic":"checkouts/update","delayMinutes":0,"data":{"token":"abc123","abandoned_checkout_url":"https://yourstore.com/cart/abc","customer":{"first_name":"Rahul","phone":"9876543210"}}}'

Job list:
Invoke-RestMethod -Uri "http://localhost:5000/api/integrations/shopify/jobs" -Headers $h

## Where you see the output
1. Customer's WhatsApp: the template message.
2. Server terminal: "Shopify webhook orders/create: {...}" and "Shopify job order:123: sent".
3. Dashboard: Messages Sent goes up; failures appear under "Recent failed messages" with the reason.
4. Compass (database wati_clone): messages, scheduledjobs (pending/done/skipped/failed), shopifyevents.

## Behaviour
- Order placed -> confirmation sent immediately (retries 3 times if Meta/network is down).
- Checkout with phone -> abandoned-cart message after SHOPIFY_ABANDONED_DELAY_MIN minutes.
- If the customer completes the order first, the abandoned-cart message is cancelled.
- Same Shopify webhook sent twice -> only one message.
- No phone on the order/checkout -> skipped (see terminal log).
- Server restarted while a message was waiting -> it is still sent (stored in MongoDB).
Note: Shopify hides customer details (phone, name) for apps without "protected customer data" access;
webhooks created from Settings > Notifications include them.
Note: send marketing messages (abandoned cart) only to customers who agreed to receive them.
