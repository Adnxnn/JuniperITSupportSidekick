# Juniper IT Support Side Kick

A support workspace with Home, topic notes, AI Assistant, and Quick Links for answering agent questions from reviewed training transcripts. The first dataset is based on five partial training excerpts shared in the project conversation. Sameena Fathima is the trainer. No company platform, private credentials, or training transcript upload is required to browse the app.

## Run

Node.js 22.13+ is required.

```bash
npm ci
npm run dev
```

Open http://127.0.0.1:3000. The development server serves the React app and the API together. For production:

```bash
npm run build
npm run start
```

The production server serves the build, all page and topic deep links, and `/api/assistant`. Set `PORT`, `HOST` and `APP_ORIGIN` if needed for your deployment. Serve over HTTPS in production. No deployment platform is assumed.

## How answers stay grounded

`data/training.json` contains reviewed, structured procedure records and evidence. The backend stores them in SQLite (`runtime/sidekick.sqlite`) and reads them at request time. It detects the intended topic, asks for clarification when needed, and returns only fields from a reviewed record. Unknown questions receive the defined not-covered response. Transcript references and supporting excerpts appear in expandable source details in topic notes and answer cards. The UI never generates operational steps.

Without `OPENAI_API_KEY`, intent selection uses local transcript-grounded matching. With a server-side key in `.env`, the OpenAI Responses API may select one approved procedure ID from the reviewed records. The server constructs the final answer from the reviewed record, never from generated text. `OPENAI_MODEL` can override the model. Keep the key and the database path server-side. The API selects intent only; there is no automatic extraction of new procedures into live answers. No live model test was possible without a key.

To ingest a future raw transcript for review:

```bash
npm run ingest -- /path/to/recording.txt
```

It is stored in the SQLite `transcript_chunks` table and produces an unreviewed receipt in `runtime/`. A reviewer should extract each procedure into `data/training.json`, verify the platform, exact steps, prerequisite, failure handling, and supporting excerpt, then restart the server. New records are loaded into the database without rebuilding the frontend; add a corresponding topic to `data/topics.json` only if a new Home card is wanted. Existing records remain in SQLite; update reviewed records directly in the database or delete the old record before re-seeding from JSON. Never expose unreviewed chunks as a live answer.

Quick Links are in `data/links.json` and are served only from this configuration. The three included destinations are official Microsoft portals named in the supplied excerpts: Teams, Intune, Azure Portal. Company-specific ServiceNow, My Groups, AD Manager and Zscaler links are withheld until their URLs are verified. No AI response creates a link. If a verified organization-specific URL becomes available, add it to the configuration and restart the server.

## Known boundaries

The provided excerpts skip large sections of five recordings. The exact AD Manager reset walkthrough, BitLocker retrieval clicks, ticket portal URL and full incident fields, My Groups URL and exact role spellings, and approved recovery-key delivery channel are absent or unclear. The answer cards explicitly acknowledge these gaps rather than inventing instructions. The supplied material is organization-specific; confirm sensitive workflows with your TL before operational use.

This project is a prototype without app authentication; deploy only behind an organization-approved sign-in/reverse proxy, and review storage and access controls before putting real employee information in chat. Conversations are held on the server and cleared by the Clear button. The current session ownership is process-local, so a server restart invalidates conversation IDs.

## Checks

```bash
npm test
npm run build
```

The separate Playwright acceptance script `node tests/acceptance.mjs` can run against a local server on port 3077 when Chromium is available.


## Topic notes and navigation

Home filters training topics and opens `/topics/:id`, without starting an assistant conversation. Each topic shows reviewed notes, checks, troubleshooting steps, gaps, and source excerpts. Its compact question box passes `topicId` to the server, which limits both deterministic and model-assisted answers to that topic’s procedure IDs. The separate AI Assistant searches all reviewed procedures. The sidebar can be collapsed or expanded on desktop and mobile; desktop preference persists locally.

The header uses the HPE / Juniper logo supplied in the visual reference. The aqua theme follows that reference. No support instructions are sourced from the mockup.

For browser acceptance, start the app with `PORT=3077 npm run dev`, then run `node tests/acceptance.mjs`. Set `CHROMIUM_PATH` if using a custom Chromium executable.
