# AI auto-reply (Automation tab)

## Setup
1. `backend/.env` (copy from `.env.example`): set `MONGODB_URI` and `ANTHROPIC_API_KEY`.
2. `npm run dev` in `backend` and `frontend`. Open **Automation** in the sidebar.
3. Add knowledge entries, write instructions, try the "Test the bot" box, then switch the bot on.

## How it behaves
- Only inbound `text`, `button` and `interactive` messages get an AI reply. Images, audio etc. are left to your team.
- The bot answers only from the knowledge base. If it is unsure, or the customer asks for a person,
  it sends the "hand over" message and pauses itself for that chat.
- Replying manually from the Inbox also pauses the bot for that chat. Use **Resume bot** in the chat header.
- Meta webhook retries do not cause duplicate replies. If a customer sends several messages quickly,
  only the newest one is answered.
- AI messages are saved with `sentBy: "bot"` and show an "AI" label in the Inbox.

## API (all under `/api/automation`)
`GET/PUT /config`, `GET/POST /knowledge`, `PUT/DELETE /knowledge/:id`, `POST /test`,
`GET /state/:waId`, `POST /state/:waId/resume`.
