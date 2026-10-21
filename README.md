# AI Exam Notes Generator

AI Exam Notes Generator is a full-stack study app that creates structured, exam-focused notes from a topic. Students can choose an AI provider, generate revision material with optional diagrams and charts, save and revisit notes, and download notes as a PDF.

**GitHub repository:** [PrajapatiSandeep2005/AiExamNotesGenerator-1.0-](https://github.com/PrajapatiSandeep2005/AiExamNotesGenerator-1.0-)

## Features

- **Exam-focused notes:** Enter a topic, class level, and exam type. Choose detailed notes or concise revision mode.
- **Multiple AI providers:** Generate with Gemini, Groq, or Cloudflare AI. `Auto` tries providers in that order and moves to the next provider if generation fails.
- **Structured output:** Notes include subtopics grouped by importance, detailed notes, revision points, and short and long questions. Optional Mermaid diagrams and Recharts visualizations are available.
- **Saved history:** Generated notes are saved to the signed-in user's history and can be reopened in a separately scrollable reading panel.
- **PDF export:** Download generated notes as a PDF.
- **Authentication:** Register and sign in with email/password or Google sign-in. Sessions use an HTTP-only JWT cookie.
- **Daily free usage:** The app provides 50 free AI chats per user per UTC day, shared across the supported providers. The app tracks its own usage; it does not read provider account quotas.
- **Purchased credits:** After the daily free chats are used, each generated chat costs 10 purchased credits. Credit packs are available through Stripe Checkout.
- **Light and dark themes:** Switch themes from the navigation bar; the selection is saved in local storage.
- **Responsive, animated UI:** Includes animated feature cards and charts, loading states, and skeleton placeholders.

Provider free tiers and model availability are controlled by the AI providers and can change. Any provider limit information displayed in the app is informational; it is not a live balance or guaranteed quota. Provider usage limits use different units and should not be added together.

## Technology

| Area | Stack |
|---|---|
| Frontend | React 19, Vite 8, React Router, Redux Toolkit |
| UI | Tailwind CSS 4, Framer Motion (`motion`), Recharts, Mermaid, React Markdown |
| Backend | Node.js, Express 5 |
| Database | MongoDB with Mongoose |
| Authentication | Firebase Google sign-in, bcrypt password hashing, JWT cookies |
| Payments | Stripe Checkout and signed webhook processing |
| Documents | PDFKit |

## Repository layout

```text
client/
  src/
    components/       Shared UI, note forms/results, navigation and charts
    pages/            Home, Auth, Notes, History, Pricing and payment pages
    services/         Axios API client and request configuration
    utils/            Theme, credit and note-formatting helpers
server/
  controllers/        Authentication, notes, PDF and credit handlers
  middleware/         JWT authentication middleware
  models/             Mongoose user, notes and payment models
  routes/             Express API route definitions
  services/           Gemini and multi-provider AI generation
  utils/              Database, prompt and credit helpers
```

## Requirements

- Node.js 20.19+ or 22.12+
- npm
- MongoDB (local or hosted)
- At least one supported AI provider API key
- Stripe credentials if you want to test credit purchases

## Local setup

### 1. Install dependencies

From the repository root:

```bash
cd server
npm install
cd ../client
npm install
```

### 2. Configure the backend

Create `server/.env` with the values for the services you intend to use:

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGO_URI=mongodb://127.0.0.1:27017/ai-exam-notes
JWT_SECRET=replace-with-a-long-random-secret

# Configure one or more AI providers
GEMINI_API_KEY=your-gemini-api-key
GROQ_API_KEY=your-groq-api-key
CLOUDFLARE_ACCOUNT_ID=your-cloudflare-account-id
CLOUDFLARE_AUTH_TOKEN=your-cloudflare-api-token

# Required only for Stripe credit purchases and webhook handling
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-signing-secret
```

The Cloudflare token may also be supplied as `CLOUDFLARE_API_TOKEN`. For local development, the backend allows `http://localhost:5173` and `http://localhost:3000`, plus the exact origin configured in `CLIENT_URL`. Keep secrets in the backend environment; do not put AI or Stripe secret keys in frontend variables or commit `.env` files.

The frontend Firebase app configuration currently lives in `client/src/utils/firebase.js`. Configure the Firebase project and enable Google authentication there if you use Google sign-in.

### 3. Configure the frontend

The frontend defaults to `http://localhost:5000` while running under Vite development mode. To use another backend, create `client/.env`:

```env
VITE_API_URL=http://localhost:5000
```

`VITE_API_URL` should be the backend base URL only, without an API path suffix.

### 4. Start the application

Open two terminals from the repository root:

```bash
cd server
npm run dev
```

```bash
cd client
npm run dev
```

Open the Vite URL shown in the client terminal (normally `http://localhost:5173`). The backend listens on port `5000` by default and connects to MongoDB during startup.

## AI providers and generation

The model selector supports:

| Selection | Provider/model | Required backend setting |
|---|---|---|
| Auto | Gemini, then Groq, then Cloudflare AI | Configure one or more provider credentials |
| Gemini | Gemini Flash (`gemini-flash-latest`) | `GEMINI_API_KEY` |
| Groq | `openai/gpt-oss-120b` | `GROQ_API_KEY` |
| Cloudflare | `@cf/meta/llama-3.1-8b-instruct` | `CLOUDFLARE_ACCOUNT_ID` and a Cloudflare token |

Selecting a specific provider sends the generation request only to that provider. `Auto` falls back sequentially when a provider fails or returns notes in an invalid format. A provider must be configured and its account must have available capacity for requests to succeed. The successful provider is included in the generation result and saved with the note.

The Notes page also shows these provider-limit estimates:

| Provider | Model shown | Displayed free-tier estimate |
|---|---|---|
| Gemini Flash | `gemini-flash-latest` | Up to 1,500 requests/day |
| Groq | GPT-OSS 120B | 1,000+ requests/day |
| Cloudflare AI | Llama 3.1 8B | 10,000 neurons/day |

These are informational estimates, not limits fetched from the user's provider account. They may change, and Cloudflare's neuron unit is not directly comparable to requests or chats.

The generated response is expected to be JSON with notes, importance-grouped subtopics, revision points, questions, and optional chart/diagram data. Structured subtopic and question values are rendered in the UI and PDF as readable text.

## Chat and credit limits

- The free allowance is **50 generated chats per user per UTC day**, shared across Gemini, Groq and Cloudflare.
- Free chats are counted by this app, not by the AI providers. The selected provider’s own request/token limits remain separate.
- Once the free daily allowance is exhausted, a generation costs **10 purchased credits**.
- Credit packs currently offered are **₹100 for 50 credits**, **₹200 for 120 credits**, and **₹500 for 350 credits**. This corresponds to 5, 12, and 35 paid chats respectively when using 10 credits per chat.
- Daily provider counts shown in the app are app-tracked successful usage, not provider-reported quota consumption. The free daily allowance resets by UTC date.

Stripe adds purchased credits only after the backend verifies a completed checkout webhook. For local payment testing, configure Stripe test credentials and forward Stripe events to:

```text
POST /api/credits/webhook
```

## API overview

All paths below are relative to the backend origin. Routes marked **Authenticated** require the JWT cookie.

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/` | Backend health message |
| `POST` | `/api/auth/google` | Create/sign in a Google-authenticated account |
| `POST` | `/api/auth/register` | Register with email and password |
| `POST` | `/api/auth/login` | Sign in with email and password |
| `POST` | `/api/auth/logout` | Clear the session cookie |
| `GET` | `/api/user/currentuser` | Get the current user and usage snapshot |
| `POST` | `/api/notes/generate-notes` | **Authenticated** Generate and save notes |
| `GET` | `/api/notes/getnotes` | **Authenticated** List the user's saved notes |
| `GET` | `/api/notes/:id` | **Authenticated** Get a saved note |
| `POST` | `/api/pdf/generate-pdf` | **Authenticated** Generate a PDF from supplied notes |
| `POST` | `/api/credit/order` | **Authenticated** Create a Stripe Checkout session |
| `GET` | `/api/credit/history` | **Authenticated** List the user's purchases |
| `POST` | `/api/credits/webhook` | Verify Stripe events and apply paid credits |

The note-generation request accepts topic/class/exam details, revision and visual options, and an `aiModel` selection (`auto`, `gemini`, `groq`, or `cloudflare`). The exact response and validation behavior are defined in the corresponding backend route and controller.

## Scripts

### Client (`client/`)

| Command | Purpose |
|---|---|
| `npm run dev` | Start the Vite development server |
| `npm run build` | Create a production frontend build |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |

### Server (`server/`)

| Command | Purpose |
|---|---|
| `npm run dev` | Start the backend with the development watcher |
| `npm start` | Start the backend |

## Deployment notes

- Set `CLIENT_URL` on the backend to the exact deployed frontend origin (scheme and hostname, no trailing path). It is used for CORS and Stripe return URLs.
- Set `VITE_API_URL` in the frontend deployment to the deployed backend origin, then rebuild the frontend.
- Configure `MONGO_URI`, `JWT_SECRET`, and at least one AI provider credential on the backend host.
- For Stripe payments, configure `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET`, then register the backend webhook endpoint `/api/credits/webhook`.
- Cross-site production auth cookies require HTTPS; the backend marks cookies `Secure` and `SameSite=None` in production.
- After changing CORS origins or environment variables on a hosting platform, redeploy/restart the backend so the new configuration takes effect.

## Troubleshooting

### CORS error in local development

Confirm the frontend origin is exactly `http://localhost:5173` (or `http://localhost:3000`) and that the frontend is calling the intended backend. For a custom frontend origin, set the backend's `CLIENT_URL` to that exact origin and restart the backend.

### Authentication appears signed out

Check that the frontend and backend URLs are correct and that requests include credentials. For deployed frontend/backend domains, use HTTPS and configure `CLIENT_URL` to match the frontend origin exactly.

### AI generation fails

Confirm the selected provider's environment values are configured on the backend and that the API key/account is active. Use `Auto` to try the configured providers in sequence; check backend logs for the provider-specific failure. The frontend does not need provider API keys.

### Stripe credits do not appear

Confirm that the Stripe webhook points to `/api/credits/webhook`, the webhook signing secret matches `STRIPE_WEBHOOK_SECRET`, and the checkout payment completed. Credits are applied from the verified webhook event rather than the browser success redirect.
