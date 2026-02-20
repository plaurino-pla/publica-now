# Publica Lite

A lightweight platform for independent creators to publish and sell articles, books, and audio content. Powered by [Publica.la](https://publica.la) for catalog, checkout, access control, and reading.

## Features

- **Multi-tenant Creator Spaces**: Each creator manages their own content and branding
- **Content Publishing**: Upload PDFs, EPUBs, and audio files with flexible pricing
- **Subscription Plans**: Create recurring or prepaid plans for content collections
- **Seamless Checkout**: Integrated payment flow via Publica.la
- **Reader SSO**: Instant access to purchased content through Publica Reader
- **Analytics**: Basic sales and reading insights

## Tech Stack

- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Backend**: Next.js API Routes + Prisma ORM + PostgreSQL
- **Authentication**: NextAuth.js with email/password + magic link
- **Background Jobs**: BullMQ + Redis
- **Storage**: External file URLs (creators provide their own)
- **Infrastructure**: Docker Compose (dev) + Terraform + Fly.io (prod)

## Quick Start

### Prerequisites

- Node.js 18+
- Docker and Docker Compose
- PostgreSQL database
- Redis instance

### Development Setup

1. **Clone and install dependencies**
   ```bash
   git clone <repository-url>
   cd publica-lite
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start infrastructure services**
   ```bash
   docker-compose up -d
   ```

4. **Set up database**
   ```bash
   npm run db:generate
   npm run db:push
   npm run db:seed
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Demo Account

After seeding the database, you can sign in with:
- **Email**: `demo@example.com`
- **Password**: `password123`

## Publica.la Integration

This platform integrates with Publica.la for:

- **Content Management**: Create and update content via Content API v1
- **Catalog Discovery**: List content via Content API v3 with caching
- **Order Processing**: Handle payments via Orders API
- **User Management**: Pre-create users or auto-create on first purchase
- **Webhooks**: Receive sales notifications and subscription events
- **Reader Access**: Seamless SSO into Publica Reader

### API Endpoints

- `GET /api/creators/[slug]/catalog` - Browse creator content
- `POST /api/checkout/single` - Purchase single content
- `POST /api/checkout/subscription` - Subscribe to plans
- `POST /api/sso/reader` - Generate reader access tokens
- `POST /api/webhooks/publica` - Handle Publica webhooks

## Project Structure

```
publica-lite/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── onboarding/        # Creator setup
│   └── globals.css        # Global styles
├── components/             # Reusable UI components
│   └── ui/                # Base UI components
├── lib/                   # Utility libraries
├── prisma/                # Database schema and migrations
├── types/                 # TypeScript type definitions
└── docker-compose.yml     # Local development setup
```

## Database Schema

The platform uses a multi-tenant architecture with:

- **Users**: Authentication and profile management
- **Creators**: Creator spaces with Publica integration
- **Posts**: Content items with pricing and visibility
- **Plans**: Subscription offerings
- **Orders**: Purchase and access tracking
- **Memberships**: User roles within creator spaces

## Security Features

- **Token Encryption**: Creator API tokens encrypted at rest
- **Rate Limiting**: Respect Publica's 60 RPM limit with caching
- **Webhook Verification**: JWT signature validation for webhooks
- **SSO Security**: Short-lived tokens for reader access
- **Input Validation**: Zod schemas for all API endpoints

## Deployment

### Production Environment Variables

```bash
DATABASE_URL="postgresql://..."
REDIS_URL="redis://..."
NEXTAUTH_SECRET="your-secret"
PUBLICA_SIGNING_KEY="webhook-secret"
POSTMARK_API_TOKEN="email-service-token"
```

### Infrastructure

The platform is designed to deploy on:
- **Fly.io**: Application hosting
- **Neon**: Managed PostgreSQL
- **Upstash**: Managed Redis
- **Vercel**: Alternative hosting option

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For questions and support:
- Check the [Publica.la documentation](https://docs.publica.la)
- Review the API integration examples
- Open an issue for bugs or feature requests
