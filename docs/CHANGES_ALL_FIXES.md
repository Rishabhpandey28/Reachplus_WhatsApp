# Fixes: image templates + template approval

Copy these files over the same paths in your project (merge, don't replace .env):
- src/server/server.js
- src/server/.env.example  -> add WHATSAPP_APP_ID=<Meta App ID> to your real src/server/.env
- src/pages/YourTemplate.jsx
- src/pages/DefineAudience.jsx

Then restart backend (node server.js) and frontend.

## What was broken
1. POST /api/templates always created a TEXT header. headerFormat/headerHandle were read but never used,
   and the UI blocked any media header ("text-only"). Image templates could never reach Meta.
2. Frontend called /api/media/upload but that route did not exist on the server -> every image campaign failed.
3. Campaign sent hardcoded parameters ["Customer","ORD123","Thank you"] to every template. Meta rejects
   a send when the variable count differs from the template (#132000). Server also ignored top-level parameters.
4. Synced Meta templates lost their header format, so an approved IMAGE template was treated as TEXT
   and sent without the image header (#132012).

## What changed
- New POST /api/templates/upload-sample  (Meta Resumable Upload -> header handle, needs WHATSAPP_APP_ID)
- New POST /api/media/upload             (WhatsApp media ID used when sending)
- /api/templates accepts headerFormat IMAGE|VIDEO|DOCUMENT + headerHandle
- Campaign send reads the real header/body-variable count from the approved Meta template
- Frontend uploads a sample file on "Submit to Meta" and sends the file raw

---
# Dashboard live connection (update 2)

Extra files to copy:
- src/pages/Dashboard.jsx
- src/server/models/Message.js   (new fields: templateName, campaignName, errorMessage)
- src/server/server.js           (replace the previous patched one)

## What is connected now
- GET /api/dashboard/stats?days=7|30|90 -> Sent / Read / Conversations / Failed / Queue / reply rate,
  all computed from the real messages in MongoDB (campaign page, broadcast, inbox replies all count).
- Socket events (message:new, message:status, campaign:progress, campaign:done) refresh the cards live.
- Failed sends (Meta rejects the message) are now stored, so "Failed" and "Recent failed messages" show the real reason.
- Webhook status updates never go backwards (read -> delivered) and store the failure reason.
- Launch Broadcast now sends for real: approved templates only, variable values, image/video/document upload,
  chunks of 100 contacts, progress, final summary.
- Header/status bar shows real API version, WABA ID, DB status, socket status.

## Important
Delivered / Read numbers only change if Meta webhook is set up:
Meta App > WhatsApp > Configuration > Callback URL = https://<public-url>/webhook,
Verify token = WHATSAPP_VERIFY_TOKEN from .env, subscribe to the "messages" field.
On localhost use a tunnel (ngrok / cloudflared). Without it, Sent and Failed still work.

---
# Refresh par data bacha rahe (update 3)

New file (create it): src/server/models/Audience.js
Replace: src/server/server.js, src/pages/Dashboard.jsx, src/pages/DefineAudience.jsx

- GET/PUT /api/audience stores the contact list in MongoDB (one shared list).
- Contacts page auto-saves every change (import, delete, select) and loads it again on refresh.
- Dashboard import saves to the same list; Dashboard uses its valid numbers for broadcast.
- Express JSON limit raised to 15 MB for big lists (max 50,000 contacts).
- MongoDB must be running (MONGODB_URI in .env), otherwise nothing can be saved.
