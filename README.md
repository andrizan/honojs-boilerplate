# Hono.js Boilerplate

A production-ready boilerplate for building APIs with Hono.js, featuring modular architecture, Better Auth authentication, email verification, avatar upload, and more.

## 🚀 Features

- **Hono.js** - Fast, lightweight web framework
- **TypeScript** - Type-safe development
- **Better Auth** - Complete authentication solution with OAuth
- **Email/Password Auth** - With email verification required
- **OAuth Providers** - Google, Facebook, Discord
- **Avatar Upload** - AWS S3 integration with validation
- **Email System** - Beautiful HTML emails with Nodemailer
- **Drizzle ORM** - Type-safe database queries
- **PostgreSQL** - Relational database
- **Redis** - Caching and rate limiting
- **AWS S3** - File storage for avatars
- **Rate Limiting** - Redis-backed protection
- **Job Queue** - Background processing with BullMQ
- **Pino Logger** - Structured logging
- **Biome** - Fast linter and formatter

## 📁 Project Structure

```
src/
├── app.ts                              → Main application entry point
│
├── modules/                            → Feature modules
│   ├── user/
│   │   ├── user.router.ts              → Route definitions
│   │   ├── user.controller.ts          → HTTP handlers (profile, CRUD)
│   │   ├── avatar.controller.ts        → Avatar upload/delete handlers
│   │   ├── user.service.ts             → Business logic
│   │   ├── user.repository.ts          → Database queries
│   │   └── user.model.ts               → Type definitions
│   │
│   ├── auth/
│   │   └── auth-better.router.ts       → Better Auth handler
│   │
│   └── index.ts                        → Module exports
│
├── jobs/                               → Background jobs
│   ├── queues/                         → Job queue definitions
│   └── workers/                        → Job processors
│
├── shared/                             → Shared resources
│   ├── middlewares/
│   │   ├── better-auth.middleware.ts   → Better Auth session validator
│   │   ├── role.middleware.ts          → Role-based access control
│   │   ├── error.middleware.ts         → Global error handler
│   │   ├── content-type.middleware.ts  → Content-type validation
│   │   └── rate-limit.middleware.ts    → Rate limiting
│   │
│   ├── logger.ts                       → Pino logger setup
│   └── response.ts                     → Standardized API responses
│
├── libs/                               → Utility libraries
│   ├── auth.ts                         → Better Auth configuration
│   └── email.ts                        → Email service (verification, reset)
│
└── infrastructure/                     → Infrastructure setup
    ├── env.ts                          → Environment variables
    ├── db.ts                           → Database connection (Drizzle)
    ├── redis.ts                        → Redis connection
    ├── s3.ts                           → AWS S3 client
    ├── queue.ts                        → BullMQ setup
    ├── auth-schema.ts                  → Better Auth database schema
    └── index.ts                        → Infrastructure exports
```

## 🛠️ Installation

```bash
# Using pnpm (recommended)
pnpm install

# Using npm
npm install

# Using yarn
yarn install
```

## 🔧 Environment Variables

Create a `.env` file in the root directory (see `.env.example`):

```env
# Application
NODE_ENV=development
APP_URL=http://localhost
APP_PORT=3000

# Better Auth (generate: openssl rand -base64 32)
BETTER_AUTH_SECRET=your-32-char-secret-change-in-production

# Database (PostgreSQL)
DATABASE_URL=postgresql://postgres:password@localhost:5432/dbname

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Email (SMTP) - Required for email verification
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@example.com

# OAuth Providers (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

FACEBOOK_CLIENT_ID=your-facebook-app-id
FACEBOOK_CLIENT_SECRET=your-facebook-app-secret

DISCORD_CLIENT_ID=your-discord-client-id
DISCORD_CLIENT_SECRET=your-discord-client-secret

# AWS S3 (Required for avatar upload)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET=your-bucket-name
AWS_S3_ENDPOINT=                      # Optional for MinIO/LocalStack
AWS_S3_FORCE_PATH_STYLE=false         # Set true for MinIO
```

### Generate BETTER_AUTH_SECRET

```bash
openssl rand -base64 32
```

## 📜 Scripts

```bash
# Development
pnpm dev              # Start dev server with hot-reload

# Build
pnpm build            # Compile TypeScript to JavaScript
pnpm start            # Run production build

# Database
pnpm db:generate      # Generate migrations
pnpm db:migrate       # Run migrations
pnpm db:studio        # Open Drizzle Studio (DB GUI)

# Code Quality
pnpm lint             # Lint with Biome
pnpm lint:check       # Check linting without fixing
pnpm format           # Format code
pnpm format:check     # Check formatting
pnpm check            # Lint + format combined
pnpm check:ci         # CI check (no auto-fix)
```

## 🚦 Quick Start

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Setup Environment Variables

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

**Required:**
- `BETTER_AUTH_SECRET` - Generate with `openssl rand -base64 32`
- `DATABASE_URL` - PostgreSQL connection string
- `SMTP_*` - Email credentials (for verification emails)
- `AWS_*` - S3 credentials (for avatar upload)

**Optional:**
- OAuth credentials (Google, Facebook, Discord)

### 3. Setup Database

```bash
# Push schema to database
pnpm db:push

# Or generate and run migrations
pnpm db:generate
pnpm db:migrate
```

### 4. Start Development Server

```bash
pnpm dev
```

Server will start at `http://localhost:3000`

### 5. Test the API

**Health Check:**
```bash
curl http://localhost:3000/api/health
```

**Sign Up:**
```bash
curl -X POST http://localhost:3000/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "name": "John Doe"
  }'
```

Check your email for verification link!

See [FINAL_AUTH.md](./FINAL_AUTH.md) for complete authentication flow.

## 📚 API Endpoints

### Health Check
```
GET /api/health
```

### Authentication (Better Auth)

All auth endpoints are prefixed with `/api/auth/`

**Email/Password:**
```bash
POST /api/auth/sign-up/email          # Sign up with email
POST /api/auth/sign-in/email          # Sign in with email
POST /api/auth/verify-email           # Verify email
POST /api/auth/send-verification      # Resend verification email
POST /api/auth/forget-password        # Request password reset
POST /api/auth/reset-password         # Reset password with token
```

**OAuth:**
```bash
GET  /api/auth/sign-in/social/google      # Google OAuth
GET  /api/auth/sign-in/social/facebook    # Facebook OAuth
GET  /api/auth/sign-in/social/discord     # Discord OAuth
```

**Session Management:**
```bash
GET  /api/auth/get-session            # Get current session
POST /api/auth/sign-out               # Sign out
```

**See [BETTER_AUTH_ENDPOINTS.md](./BETTER_AUTH_ENDPOINTS.md) for detailed documentation**

### User Management

```bash
GET    /api/users/profile             # Get current user profile
POST   /api/users/avatar              # Upload avatar (multipart/form-data)
DELETE /api/users/avatar              # Delete avatar

# Admin only
GET    /api/users                     # Get all users (paginated)
GET    /api/users/:id                 # Get user by ID
PATCH  /api/users/:id                 # Update user
DELETE /api/users/:id                 # Delete user
```

**See [AVATAR_UPLOAD.md](./AVATAR_UPLOAD.md) for avatar upload documentation**

## 🏗️ Architecture

This boilerplate follows a **modular layered architecture**:

### Layers

1. **Router Layer** - Route definitions and middleware application
2. **Controller Layer** - HTTP request/response handling
3. **Service Layer** - Business logic and data validation
4. **Repository Layer** - Database operations (Drizzle ORM)
5. **Model Layer** - Type definitions and schemas

### Modules

Each feature is organized as a **module** with its own:
- Routes (`*.router.ts`)
- Controllers (`*.controller.ts`)
- Services (`*.service.ts`)
- Repositories (`*.repository.ts`)
- Models (`*.model.ts`)

Example: `user` module handles user profile, avatar, and admin operations.

## 🔐 Security Features

- ✅ **Better Auth** - Complete authentication with session management
- ✅ **Email Verification** - Required for email/password sign up
- ✅ **Password Hashing** - Secure bcrypt hashing (handled by Better Auth)
- ✅ **JWT Tokens** - 15-minute access tokens
- ✅ **OAuth 2.0** - Google, Facebook, Discord
- ✅ **Rate Limiting** - Redis-backed protection (100 req/min default)
- ✅ **Role-Based Access** - Admin middleware for protected routes
- ✅ **CORS** - Cross-origin resource sharing enabled
- ✅ **Content-Type Validation** - API endpoints require JSON
- ✅ **File Upload Validation** - Type and size checks (5MB max)

## 📧 Email Features

- ✅ **Email Verification** - Beautiful HTML emails with one-click verification
- ✅ **Password Reset** - Secure reset flow with expiring tokens
- ✅ **SMTP Support** - Works with Gmail, SendGrid, AWS SES, etc.
- ✅ **Email Templates** - Professional responsive HTML emails
- ✅ **Error Handling** - Graceful degradation if SMTP fails

## 📦 Tech Stack

### Core
- **Runtime**: Node.js
- **Framework**: Hono.js (fast, lightweight)
- **Language**: TypeScript

### Authentication & Security
- **Better Auth** - Complete auth solution
- **Nodemailer** - Email delivery

### Database & Storage
- **PostgreSQL** - Relational database
- **Drizzle ORM** - Type-safe queries
- **Redis** - Caching and rate limiting
- **AWS S3** - File storage (avatars)

### Background Jobs
- **BullMQ** - Job queue processing
- **Redis** - Queue backend

### Development Tools
- **Biome** - Fast linter and formatter
- **Pino** - Structured logging
- **tsx** - TypeScript execution

## 📖 Documentation

- [FINAL_AUTH.md](./FINAL_AUTH.md) - Complete authentication guide
- [BETTER_AUTH_ENDPOINTS.md](./BETTER_AUTH_ENDPOINTS.md) - API endpoint reference
- [AVATAR_UPLOAD.md](./AVATAR_UPLOAD.md) - Avatar upload documentation
- [STORAGE.md](./STORAGE.md) - S3 storage configuration

## 🧪 Testing

```bash
# Test authentication flow
curl -X POST http://localhost:3000/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!","name":"Test User"}'

# Check verification email in your inbox
# Click verification link or use token

# Sign in
curl -X POST http://localhost:3000/api/auth/sign-in/email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}'

# Get session (use token from sign-in)
curl http://localhost:3000/api/auth/get-session \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🔧 Configuration

### OAuth Setup

1. **Google OAuth:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create OAuth 2.0 credentials
   - Add redirect URI: `http://localhost:3000/api/auth/callback/google`

2. **Facebook OAuth:**
   - Go to [Facebook Developers](https://developers.facebook.com/)
   - Create app and get credentials
   - Add redirect URI

3. **Discord OAuth:**
   - Go to [Discord Developer Portal](https://discord.com/developers)
   - Create application
   - Add redirect URI: `http://localhost:3000/api/auth/callback/discord`

### SMTP Setup (Gmail Example)

1. Enable 2-factor authentication on your Google account
2. Generate an App Password: [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
3. Use in `.env`:
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-16-char-app-password
   ```

### AWS S3 Setup

1. Create S3 bucket in AWS Console
2. Create IAM user with S3 permissions
3. Get Access Key ID and Secret
4. Add to `.env`

Or use **MinIO** for local development:
```bash
docker run -p 9000:9000 -p 9001:9001 \
  -e MINIO_ROOT_USER=minioadmin \
  -e MINIO_ROOT_PASSWORD=minioadmin \
  minio/minio server /data --console-address ":9001"
```

## 🚀 Production Deployment

### Environment

```env
NODE_ENV=production
APP_URL=https://yourdomain.com
BETTER_AUTH_SECRET=<strong-32-char-secret>
DATABASE_URL=<production-postgres-url>
REDIS_PASSWORD=<strong-redis-password>
```

### Checklist

- ✅ Set strong `BETTER_AUTH_SECRET` (32+ characters)
- ✅ Use production database with SSL
- ✅ Enable Redis password authentication
- ✅ Configure CORS for your frontend domain
- ✅ Set up HTTPS/SSL certificates
- ✅ Configure OAuth redirect URIs for production
- ✅ Set up S3 bucket with proper permissions
- ✅ Enable database backups
- ✅ Set up monitoring (logs, errors, performance)
- ✅ Configure rate limiting for your traffic

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 🐛 Troubleshooting

### Email verification not working
- Check SMTP credentials in `.env`
- Test connection: `curl http://localhost:3000/api/health` (check SMTP status)
- Check spam folder
- Enable "Less secure app access" for Gmail (or use App Password)

### Avatar upload fails
- Check AWS credentials
- Verify S3 bucket exists and has proper permissions
- Check file size (max 5MB) and type (JPEG, PNG, GIF, WebP)

### OAuth not working
- Verify redirect URIs match exactly
- Check OAuth credentials
- Ensure `APP_URL` is correct in `.env`

### Database connection fails
- Check `DATABASE_URL` format
- Verify PostgreSQL is running
- Check firewall/network settings

## 📄 License

This project is licensed under the MIT License.
