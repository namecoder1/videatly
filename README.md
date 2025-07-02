# 🎬 Videatly.ai

A comprehensive AI-powered platform for YouTube content creators to generate video ideas, scripts, and manage their content production workflow.

## 📖 Overview

Videatly.ai is a Next.js application that helps YouTube creators streamline their content creation process using AI. The platform provides tools for idea generation, script creation, production management, and analytics with multi-language support and subscription-based access tiers.

## 🚀 Features

### Core Features

- **🤖 AI-Powered Content Generation**

  - Video idea generation with detailed specifications
  - Script creation with customizable tone, style, and structure
  - Real-time chat interface for content refinement

- **📋 Content Management**

  - Organized idea and script storage
  - Production workflow management
  - Calendar integration for content planning
  - Todo/task management system

- **💳 Subscription System**

  - Multi-tier subscription plans (Free, Pro, Ultra)
  - One-time token purchases for additional features
  - Stripe integration for secure payments
  - Comprehensive billing management

- **🌐 Internationalization**

  - Support for 4 languages: English, Italian, Spanish, French
  - User language preferences
  - Localized content and interface

- **🔐 Authentication & Security**
  - Google OAuth integration via Supabase Auth
  - Row-level security (RLS) policies
  - Secure middleware with session management

### Advanced Features

- **📊 Analytics Dashboard**

  - User engagement metrics
  - Content performance tracking
  - Subscription analytics

- **🎨 Rich Text Editing**

  - TipTap editor for content creation
  - Drag-and-drop interface components
  - Real-time content preview

- **📧 Email System**
  - Resend integration for transactional emails
  - React Email templates
  - Subscription notifications

## 🛠️ Tech Stack

### Frontend

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety and developer experience
- **TailwindCSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Framer Motion** - Animation library
- **Zustand** - State management

### Backend & Database

- **Supabase** - PostgreSQL database with real-time features
- **Supabase Auth** - Authentication and user management
- **Row Level Security (RLS)** - Database security policies

### AI & APIs

- **OpenAI API** - GPT models for content generation
- **@ai-sdk/openai** - AI SDK integration
- **Vercel AI SDK** - Streaming AI responses

### Payments & Email

- **Stripe** - Payment processing and subscription management
- **Resend** - Email delivery service
- **React Email** - Email template system

### Development Tools

- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Sharp** - Image optimization

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account and project
- Stripe account (with test/live keys)
- OpenAI API account
- Resend account
- Google OAuth app (for authentication)

### Development Setup

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd videatly
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env.local` file in the root directory:

   ```bash
   # Application
   NODE_ENV=development
   NEXT_PUBLIC_BASE_URL=http://localhost:3000

   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

   # OpenAI
   OPENAI_API_KEY=your_openai_api_key

   # Stripe (Development)
   STRIPE_SECRET_KEY_TEST=sk_test_...
   STRIPE_WEBHOOK_SECRET_TEST=whsec_...

   # Resend
   RESEND_API_KEY=your_resend_api_key

   # Google OAuth (configured in Supabase)
   # No additional env vars needed - handled by Supabase
   ```

4. **Database Setup**

   - Create a new Supabase project
   - Set up the database schema (see Database Schema section)
   - Configure RLS policies
   - Enable Google OAuth in Supabase Auth settings

5. **Stripe Setup**

   - Create webhook endpoint: `http://localhost:3000/api/stripe/webhook`
   - Configure webhook events: `customer.subscription.*`, `invoice.*`, `checkout.session.completed`
   - Run Stripe CLI for local webhook testing:
     ```bash
     npm run stripe
     ```

6. **Start development server**

   ```bash
   npm run dev
   ```

7. **Verify Stripe Configuration**
   ```bash
   node scripts/debug-stripe-config.js
   ```

## 🌐 Production Deployment

### Environment Variables (Production)

```bash
# Application
NODE_ENV=production
NEXT_PUBLIC_BASE_URL=https://your-domain.com

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Stripe (Production)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Production Price IDs
STRIPE_PRO_PLAN_PRICE_ID=price_...
STRIPE_ULTRA_PLAN_PRICE_ID=price_...
STRIPE_BASIC_IDEA_BUCKET_LINK=https://buy.stripe.com/...
STRIPE_BASIC_IDEA_BUCKET_PRICE_ID=price_...
STRIPE_STANDARD_IDEA_BUCKET_LINK=https://buy.stripe.com/...
STRIPE_STANDARD_IDEA_BUCKET_PRICE_ID=price_...
STRIPE_PREMIUM_IDEA_BUCKET_LINK=https://buy.stripe.com/...
STRIPE_PREMIUM_IDEA_BUCKET_PRICE_ID=price_...
STRIPE_BASIC_SCRIPT_BUCKET_LINK=https://buy.stripe.com/...
STRIPE_BASIC_SCRIPT_BUCKET_PRICE_ID=price_...
STRIPE_STANDARD_SCRIPT_BUCKET_LINK=https://buy.stripe.com/...
STRIPE_STANDARD_SCRIPT_BUCKET_PRICE_ID=price_...
STRIPE_PREMIUM_SCRIPT_BUCKET_LINK=https://buy.stripe.com/...
STRIPE_PREMIUM_SCRIPT_BUCKET_PRICE_ID=price_...

# Resend
RESEND_API_KEY=your_resend_api_key
```

### Deployment Steps

1. **Build the application**

   ```bash
   npm run build
   ```

2. **Deploy to your platform** (Vercel, Netlify, etc.)

   - Configure environment variables
   - Set up custom domain
   - Configure webhook endpoints

3. **Stripe Production Setup**

   - Update webhook endpoint: `https://your-domain.com/api/stripe/webhook`
   - Switch to live mode
   - Update price IDs in environment variables

4. **Database Migration**
   - Ensure all migrations are applied
   - Verify RLS policies are in place
   - Test authentication flow

## 📦 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run stripe` - Start Stripe CLI webhook forwarding
- `npm run email` - Start email development server

## 🗂️ Project Structure

```
videatly/
├── app/                          # Next.js App Router
│   ├── [lang]/                   # Internationalized routes
│   │   ├── (protected)/          # Auth-required pages
│   │   │   ├── dashboard/        # Main dashboard
│   │   │   ├── ideas/            # Idea management
│   │   │   ├── scripts/          # Script creation
│   │   │   ├── production/       # Production workflow
│   │   │   ├── calendar/         # Content calendar
│   │   │   ├── analytics/        # Analytics dashboard
│   │   │   ├── billing/          # Subscription management
│   │   │   └── settings/         # User settings
│   │   ├── (public)/             # Public pages
│   │   └── (docs)/               # Documentation
│   ├── api/                      # API routes
│   │   ├── openai/               # AI integration
│   │   ├── stripe/               # Payment webhooks
│   │   └── cron/                 # Scheduled tasks
│   └── (authentication)/         # Auth pages
├── components/                   # Reusable components
│   ├── ui/                       # Base UI components
│   ├── blocks/                   # Feature-specific components
│   └── calendar/                 # Calendar components
├── utils/                        # Utility functions
│   ├── supabase/                 # Database client
│   ├── stripe/                   # Payment processing
│   └── resend/                   # Email service
├── types/                        # TypeScript definitions
├── hooks/                        # Custom React hooks
├── dictionaries/                 # Internationalization
├── emails/                       # Email templates
└── assets/                       # Static assets
```

## 🔐 Authentication Flow

1. **Google OAuth Setup**

   - Configure OAuth app in Google Console
   - Add redirect URLs to Supabase Auth settings
   - Enable Google provider in Supabase

2. **User Registration Process**

   - Google OAuth authentication
   - Automatic user profile creation
   - Language preference detection
   - Redirect to profile setup

3. **Session Management**
   - Server-side session handling
   - Middleware-based route protection
   - Automatic session refresh

## 💾 Database Schema

### Core Tables

- `users` - User profiles and subscription data
- `ideas` - Generated video ideas
- `scripts` - Created scripts linked to ideas
- `production` - Production workflow management
- `tokens` - Token balance tracking
- `invoices` - Payment history
- `todos` - Task management

### Key Features

- Row Level Security (RLS) enabled
- Foreign key relationships
- Indexed queries for performance
- Real-time subscriptions

## 🎨 UI/UX Features

- **Responsive Design** - Mobile-first approach
- **Dark/Light Mode** - System preference detection
- **Accessible Components** - WCAG compliant UI
- **Modern Interface** - Clean, intuitive design
- **Real-time Updates** - Live data synchronization
- **Interactive Elements** - Smooth animations and transitions

## 📊 Subscription Tiers

### Free Tier

- Basic idea generation
- Limited AI interactions
- Basic script templates

### Pro Tier ($X/month)

- Advanced idea generation
- Unlimited script creation
- Production workflow tools
- Priority support

### Ultra Tier ($X/month)

- All Pro features
- Advanced analytics
- Custom AI personas
- White-label options

## 🔧 Configuration

### Security Headers

- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Referrer-Policy: strict-origin-when-cross-origin
- X-XSS-Protection: 1; mode=block

### Performance Optimizations

- Image optimization with Next.js Image
- Gzip compression enabled
- Powered-by header removed
- ESLint errors ignored during builds (configurable)

## 🐛 Troubleshooting

### Common Issues

1. **Stripe Webhook Errors**

   - Verify webhook endpoint is accessible
   - Check webhook secret configuration
   - Ensure raw body is preserved

2. **Authentication Issues**

   - Verify Google OAuth configuration
   - Check Supabase URL and keys
   - Ensure redirect URLs match

3. **Database Connection**

   - Verify Supabase credentials
   - Check RLS policies
   - Ensure service role key has proper permissions

4. **AI Integration**
   - Verify OpenAI API key
   - Check rate limits and quotas
   - Monitor token usage

### Development Tools

- **Stripe Configuration Checker**: `node scripts/debug-stripe-config.js`
- **Environment Verification**: Built-in verification in `utils/stripe/verify-config.ts`

## 📈 Monitoring & Analytics

- **User Metrics**: Registration, engagement, retention
- **Payment Analytics**: Revenue, subscription changes
- **Content Metrics**: Ideas generated, scripts created
- **Performance Monitoring**: API response times, error rates

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

[License information to be added]

## 📞 Support

For technical support or questions, please [contact information to be added].

---

**Note**: This application is currently in active development. Features and documentation may change frequently.
