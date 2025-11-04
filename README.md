# Receipt - AI-Powered Receipt Scanning & Expense Management

Receipt is an intelligent SaaS platform that revolutionizes how you manage receipts and track expenses. Using advanced AI and OCR technology, Receipt automatically scans, categorizes, and analyzes your receipts to provide actionable insights.

## 🚀 Features

- **AI-Powered Scanning**: Instantly digitize receipts with advanced OCR technology
- **Smart Categorization**: Automatically categorize expenses with machine learning
- **Intelligent Analytics**: Get AI-generated summaries and spending insights
- **Instant Export**: Export data in multiple formats for accounting and taxes
- **Smart Search**: Find any receipt instantly with powerful AI search
- **Real-time Processing**: Lightning-fast cloud processing with immediate results

## 🛠️ Tech Stack

This project is built with modern technologies:

- **[Convex](https://convex.dev/)** - Backend database and server logic
- **[React](https://react.dev/)** & **[Next.js 15](https://nextjs.org/)** - Frontend framework with App Router
- **[Tailwind CSS](https://tailwindcss.com/)** - Styling and UI components
- **[Clerk](https://clerk.com/)** - Authentication and user management
- **[Framer Motion](https://www.framer.com/motion/)** - Smooth animations
- **[Schematic](https://schematichq.com/)** - Usage tracking and billing
- **[dnd-kit](https://dndkit.com/)** - Drag and drop functionality

## 📦 Get Started

### Installation

```bash
npm install
# or
pnpm install
```

### Environment Setup

Copy `.env.example` to `.env.local` and add your keys:

```bash
cp .env.example .env.local
```

Required environment variables:

- `NEXT_PUBLIC_CONVEX_URL` - Your Convex deployment URL
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk public key
- `CLERK_SECRET_KEY` - Clerk secret key
- `SCHEMATIC_API_KEY` - Schematic API key for usage tracking
- `NEXT_PUBLIC_SCHEMATIC_CUSTOMER_ID` - Schematic customer component ID

### Development

Run the development server:

```bash
npm run dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see your app.

### Inngest (Background jobs) – Local Dev

This project uses Inngest for background jobs and AI agent workflows.

- API endpoint is exposed at `GET/POST/PUT /api/inngest` via `inngest/next`.
- Functions are registered from `inngest/agent.ts`.

To run locally with the Dev Server:

```bash
# in another terminal
pnpm dlx inngest-cli@latest dev
```

Then visit http://localhost:8288 to view functions and runs.

Optional environment variables for production:

- `INNGEST_SIGNING_KEY` – required in production to sync/serve functions
- `INNGEST_EVENT_KEY` – required in production to send events from your app

Where events are sent from:

- `actions/uploadPdf.ts` sends `extract_data_from_pdf_and_save_to_database` after upload

Primary function:

- `extract-and-save-pdf` in `inngest/agent.ts` runs an agent workflow to parse the PDF and save data.

### Deployment

Deploy to Vercel with one click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

## 📱 Features Overview

### For Individuals

- Personal expense tracking
- Receipt organization
- Tax preparation assistance
- Budget monitoring

### For Businesses

- Team expense management
- Automated categorization
- Accounting software integration
- Expense report generation

## 🔒 Security

- Bank-level encryption (AES-256)
- GDPR & SOC 2 compliant
- Secure data storage
- Regular security audits

## 📄 License

MIT License - feel free to use this project for your own purposes.

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## 📞 Support

Need help? Contact us at support@receipt.app or visit our [documentation](https://docs.receipt.app).

---

Built with ❤️ by the Receipt team 3. Follow step 3 in the [Convex Clerk onboarding guide](https://docs.convex.dev/auth/clerk#get-started) to create a Convex JWT template. 4. Uncomment the Clerk provider in `convex/auth.config.ts` 5. Paste the Issuer URL as `CLERK_JWT_ISSUER_DOMAIN` to your dev deployment environment variable settings on the Convex dashboard (see [docs](https://docs.convex.dev/auth/clerk#configuring-dev-and-prod-instances))

If you want to sync Clerk user data via webhooks, check out this [example repo](https://github.com/thomasballinger/convex-clerk-users-table/).

## Learn more

To learn more about developing your project with Convex, check out:

- The [Tour of Convex](https://docs.convex.dev/get-started) for a thorough introduction to Convex principles.
- The rest of [Convex docs](https://docs.convex.dev/) to learn about all Convex features.
- [Stack](https://stack.convex.dev/) for in-depth articles on advanced topics.

## Join the community

Join thousands of developers building full-stack apps with Convex:

- Join the [Convex Discord community](https://convex.dev/community) to get help in real-time.
- Follow [Convex on GitHub](https://github.com/get-convex/), star and contribute to the open-source implementation of Convex.
