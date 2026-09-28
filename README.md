# Juniper IT Support Sidekick

A transcript-based support workspace with a notes-first Home page, 24 specific training topics, a general AI Assistant, and Quick Links. The crisp vector HPE/Juniper mark and restrained aqua layout follow the supplied visual reference.

## Run

Requires Node.js 22.13 or newer.

```bash
npm ci
npm run dev
```

Open http://127.0.0.1:3000. The app and API share one server. For the production build:

```bash
npm run build
npm start
```

Set `HOST`, `PORT`, and `APP_ORIGIN` for a self-hosted environment. `APP_ORIGIN` should be the exact HTTPS public origin behind a reverse proxy. Configure `DATABASE_PATH` on persistent storage.

## Vercel deployment

Import this GitHub repository as a Vite project, with the root directory set to the repository root. Vercel runs `npm run build` for the frontend and deploys `api/index.mjs` as the Node function for all `/api` routes through `vercel.json`. The SPA rewrite preserves direct links to topic pages. No database or AI key is required to serve reviewed notes and transcript search. Pushing `main` starts a new production deployment when the project is connected to that branch.

On Vercel, conversation turns are temporary per function instance. The browser includes the last reviewed procedure ID with follow-ups so they remain useful across instances; no unsupported procedure can be selected that way. Local development still uses SQLite. Add `OPENAI_API_KEY` only if optional model-based intent selection is wanted; the reviewed notes remain the answer source.

## Pages

- Home filters topics and notes without starting a chat.
- `/topics/:id` shows the relevant reviewed notes, checks, steps, gaps, source excerpts, copy controls, and a compact topic question box. Questions use `/api/topics/:id/ask` on the same page and do not navigate to the general assistant.
- `/assistant` answers across all reviewed procedures and supports clarification choices, follow-ups, copy, retry, and clearing the conversation.
- `/quick-links` shows tools named in training. Configured Microsoft portals open directly. Tools without supplied organization-specific URLs open their training notes instead.
- The sidebar opens and closes on desktop and mobile. Desktop preference is saved locally. Mobile navigation also closes after selection, with Escape, or by tapping the backdrop.

## Transcript knowledge

See [the transcript review](docs/transcript-review.md) for exact topic/source mappings and interpretation decisions.

`data/training.json` is authoritative reviewed knowledge. Each record includes evidence and recording timestamps. `data/topics.json` maps the records to 24 topics. Search terms are derived from those records at runtime. Restart or redeploy after editing the reviewed files; stale SQLite procedure rows are ignored.

Only the supplied transcript excerpts provide support instructions. The excerpts omit some AD password-reset, local Mac password-reset, BitLocker retrieval, incident-entry, Software Center, self-service, networking-template, iOS-enrollment, and Zoom steps. The app states those gaps instead of filling them with generic support knowledge. It distinguishes Mac recovery from BitLocker and employee VPN eligibility from contractor assignment.

Without a key, local intent routing selects reviewed records. Optionally set `OPENAI_API_KEY` and `OPENAI_MODEL` on the server for additional intent selection. The model may only choose a reviewed record ID; it does not generate operational instructions. Topic restrictions apply to both paths, and topic conversations stay separate from the general assistant. Model outages preserve local routing. Live model selection requires separately configured credentials and was not exercised during this update.

To store another transcript for review:

```bash
npm run ingest -- /path/to/recording.txt
```

This saves raw chunks in SQLite and an unreviewed receipt in `runtime/`. It does not publish new answers. Review the transcript, add evidence-backed records to `data/training.json`, map them to topics, and restart.

## Checks

```bash
npm test
npm run build
npx playwright install chromium
npm run test:acceptance
```

The acceptance runner starts and stops a local server and checks the API plus desktop/mobile browser flows. Set `CHROMIUM_PATH` for an existing Chromium binary, or `TEST_PORT` to override port 3077.

This app has session-scoped conversations but no app sign-in. Configure your deployment's access layer before using it for real employee conversations. Conversation turns are process-local on Vercel and do not provide durable chat history.
