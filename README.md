# GEO Tracker Frontend

Modern Next.js 14 dashboard for the GEO Tracker SaaS application.

![GEO Tracker Dashboard](https://via.placeholder.com/800x400?text=GEO+Tracker+Dashboard)

## Features

- 🎨 **Modern Dark UI** — Sleek SaaS-style design with Tailwind CSS
- 📊 **Real-time Progress** — Live updates during analysis runs
- 📈 **Results Dashboard** — Visibility scores, sentiment, competitor analysis
- ⚡ **Fast & Responsive** — Built with Next.js 14 and React 18
- 🔗 **API Integration** — Connects to your FastAPI backend

## Quick Start

### Prerequisites

- Node.js 18+ 
- GEO Tracker API running on port 8000

### Installation

```bash
# Navigate to frontend directory
cd geo-tracker-frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Before You Start

Make sure the GEO Tracker API is running:

```bash
# In the geo_tracker_full directory
cd geo_tracker_full
source .venv/bin/activate
uvicorn api.main:app --reload --port 8000
```

---

## Project Structure

```
geo-tracker-frontend/
├── app/
│   ├── layout.tsx      # Root layout
│   ├── page.tsx        # Main dashboard (single-page app)
│   └── globals.css     # Global styles
├── lib/
│   ├── api.ts          # API client functions
│   ├── types.ts        # TypeScript type definitions
│   └── utils.ts        # Utility functions
├── components/         # Reusable components (future)
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── next.config.js
```

---

## User Flow

### 1. Brand Setup
Enter your brand name and select your industry.

### 2. Configure Queries
Add questions to test across AI models. You can:
- Type questions manually (one per line)
- Load sample questions for your industry
- Generate questions with AI (coming soon)

### 3. Select Providers
Choose which AI providers to test:
- **OpenAI** — GPT-4.1, GPT-4.1-mini
- **Google Gemini** — Gemini 2.5 Flash, Pro

Select mode:
- **Web Search** — Uses live web data (recommended)
- **Internal** — Model knowledge only

### 4. View Results
After analysis completes, see:
- **Overall Visibility Score** — % of responses mentioning your brand
- **Provider Breakdown** — Visibility per AI model
- **Competitor Visibility** — Who else is being mentioned
- **Query-level Results** — Detailed table with sentiment, sources, etc.

---

## API Integration

The frontend communicates with the FastAPI backend via these endpoints:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Check API connection |
| `/api/runs` | POST | Start a new analysis run |
| `/api/runs/{id}/status` | GET | Get run progress |
| `/api/runs/{id}/results` | GET | Get completed results |

### Configuration

Set the API URL in `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

For production:
```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

---

## Customization

### Theme Colors

Edit `tailwind.config.js` to change the color scheme:

```js
colors: {
  primary: {
    DEFAULT: "#3B82F6",  // Electric blue
    // ... shades
  },
  success: {
    DEFAULT: "#10B981",  // Green
  },
  danger: {
    DEFAULT: "#EF4444",  // Red
  },
}
```

### Sample Queries

Edit `lib/utils.ts` to add industry-specific sample queries:

```typescript
export const sampleQueries: Record<string, string[]> = {
  supplements: [
    "What are the best vitamin D supplements?",
    // Add more...
  ],
  // Add more industries...
};
```

---

## Development

### Available Scripts

```bash
# Development server with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

### Adding New Features

1. **New Components** — Add to `components/` directory
2. **API Endpoints** — Add to `lib/api.ts`
3. **Types** — Add to `lib/types.ts`
4. **Pages** — Add to `app/` directory (Next.js App Router)

---

## Production Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Set environment variables in Vercel dashboard:
- `NEXT_PUBLIC_API_URL` — Your production API URL

### Docker

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

---

## Next Steps

- [ ] Add user authentication (Supabase Auth)
- [ ] Add company management (CRUD)
- [ ] Add historical results view
- [ ] Add scheduled runs
- [ ] Add email reports
- [ ] Add export to PDF/CSV

---

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Charts**: Recharts (ready to add)
- **Icons**: Lucide React

---

## License

MIT
