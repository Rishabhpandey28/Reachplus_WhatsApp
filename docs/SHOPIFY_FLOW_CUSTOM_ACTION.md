# Shopify Flow custom action: "Send WhatsApp message" (via Dev Dashboard app)

## IMPORTANT first check
Shopify docs: custom apps' Flow actions/triggers are available only on Shopify Plus stores
and on dev stores that use the Plus plan. On a normal (non-Plus) live store the action will NOT
show in Flow. In that case use the "Send HTTP request" method (SHOPIFY_FLOW_SETUP.md).

## 1. Backend
1. Copy patched src/server/server.js, add to src/server/.env:
   SHOPIFY_CLIENT_SECRET=<Dev Dashboard > ReachPulse > Settings > Credentials > Client secret>
2. Restart backend, keep a public HTTPS URL running (cloudflared / hosted server).
   Check: https://YOUR-URL/api/health  ->  "ok": true

## 2. Shopify app project (one time)
  npm install -g @shopify/cli@latest
  mkdir reachpulse-shopify && cd reachpulse-shopify
  shopify app init            (choose your existing app "ReachPulse" when asked to link)
  shopify app generate extension      (type: Flow Action, name: Send WhatsApp message)

Replace the generated shopify.extension.toml (inside extensions/<name>/) with
shopify-extension/send-whatsapp-message/shopify.extension.toml and change
YOUR-PUBLIC-URL to your real HTTPS address.

## 3. Test / release
  shopify app dev        (pick your dev store; app gets installed there)
  shopify app deploy     (creates a released version)

IMPORTANT: runtime_url is saved when you deploy. If your tunnel URL changes, edit the toml and
run  shopify app deploy  again. A fixed hosted domain avoids this.

## 4. In the store: Flow
Apps > Flow > Create workflow > Trigger (e.g. Order created) > Action > search "Send WhatsApp message".
Fill fields:
  Customer phone   {{order.shippingAddress.phone}}
  Template name    order_confirmation
  Variable 1       {{order.customer.firstName}}
  Variable 2       {{order.name}}
  Reference        {{order.id}}
Turn on the workflow and place a test order.
