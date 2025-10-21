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
- **Drizzle ORM** - Type-safe database queries with UUID v7 primary keys
- **PostgreSQL** - Relational database with optimized UUID indexing
- **Redis** - Caching and rate limiting storage
- **AWS S3** - File storage for avatars
- **Dual Rate Limiting** - IP-based (global) + User-based (authenticated, CGNAT-friendly)
- **Job Queue** - Background processing with BullMQ for reliable email delivery
- **Pino Logger** - Structured logging
- **Biome** - Fast linter and formatter
- **Modular Architecture** - Clean separation of concerns with layered design

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
│   ├── queues/
│   │   └── email.queue.ts              → Email queue (BullMQ) with retry logic
│   └── workers/
│       ├── email.worker.ts             → Email worker (processes jobs)
│       └── index.ts                    → Worker lifecycle management
│
├── shared/                             → Shared resources
│   ├── middlewares/
│   │   ├── better-auth.middleware.ts   → Better Auth session validator
│   │   ├── role.middleware.ts          → Role-based access control
│   │   ├── error.middleware.ts         → Global error handler
│   │   ├── content-type.middleware.ts  → Content-type validation
│   │   ├── rate-limit.middleware.ts    → IP-based rate limiting (global)
│   │   └── user-rate-limit.middleware.ts → User-based rate limiting (authenticated)
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
    ├── schema.ts                       → Database schema (Better Auth + custom tables)
    ├── redis.ts                        → Redis connection
    ├── s3.ts                           → AWS S3 client
    ├── queue.ts                        → BullMQ setup
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
pnpm db:generate      # Generate migrations from schema
pnpm db:migrate       # Apply migrations to database (drizzle-kit CLI)
pnpm db:push          # Push schema directly without migrations (dev only)
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

**Option A: Quick Push (Development)**
```bash
# Push schema directly to database (no migration files)
pnpm db:push
```

**Option B: Versioned Migrations (Production)**
```bash
# Generate migration files from schema
pnpm db:generate

# Review generated SQL in drizzle/ folder

# Apply migrations to database
pnpm db:migrate
```

**Note:** All tables use UUID v7 for primary keys - automatically generated on insert.

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

### User Management

```bash
GET    /api/users/profile             # Get current user profile
POST   /api/users/avatar              # Upload avatar (multipart/form-data)
DELETE /api/users/avatar              # Delete avatar

# Admin only
GET    /api/users                     # Get all users (paginated)
GET    /api/users/:id                 # Get user by ID (UUID)
PATCH  /api/users/:id                 # Update user (UUID)
DELETE /api/users/:id                 # Delete user (UUID)
```

### Blog Management (Example Feature)

```bash
# Public endpoints
GET    /api/blogs                     # Get all published blogs (paginated)
GET    /api/blogs/:id                 # Get blog by ID (UUID)
GET    /api/blogs/slug/:slug          # Get blog by slug

# Authenticated endpoints
POST   /api/blogs                     # Create blog (requires auth)
GET    /api/blogs/my/blogs            # Get current user's blogs
PATCH  /api/blogs/:id                 # Update blog (UUID, author only)
DELETE /api/blogs/:id                 # Delete blog (UUID, author only)
```

**Note:** All IDs in the API are UUIDs (v7 format), not integers.

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

## 🗄️ Database Architecture

### Schema Design

This project uses **PostgreSQL** with **Drizzle ORM** and follows these conventions:

#### Primary Keys: UUID v7
All tables use **UUID v7** as primary keys for:
- ✅ **Time-ordered sortability** - UUIDs are chronologically sortable
- ✅ **Global uniqueness** - No collision risk across distributed systems
- ✅ **Security** - Non-predictable IDs (vs auto-increment)
- ✅ **Better Auth compatibility** - Library expects string IDs
- ✅ **Better indexing** - Time-ordered insertion improves B-tree performance

```typescript
import { uuid } from "drizzle-orm/pg-core";
import { v7 as uuidv7 } from "uuid";

id: uuid("id").primaryKey().$defaultFn(() => uuidv7())
```

**Why UUID v7 over other options?**
- vs **Auto-increment (serial)**: No collision in distributed systems, better security
- vs **UUID v4**: Sortable by creation time, better index performance
- vs **CUID/nanoid**: Native PostgreSQL UUID type, 16 bytes vs 25+ chars

### Database Tables

#### Better Auth Tables
Required tables for authentication (managed by Better Auth):

```sql
user
  - id: uuid (PK)
  - name: text
  - email: text (unique)
  - emailVerified: boolean
  - image: text
  - role: text (default: 'user')
  - createdAt: timestamp
  - updatedAt: timestamp

session
  - id: uuid (PK)
  - userId: uuid (FK -> user.id)
  - expiresAt: timestamp
  - token: text (unique)
  - ipAddress: text
  - userAgent: text
  - createdAt: timestamp
  - updatedAt: timestamp

account
  - id: uuid (PK)
  - userId: uuid (FK -> user.id)
  - accountId: text
  - providerId: text (google, facebook, discord)
  - accessToken: text
  - refreshToken: text
  - idToken: text
  - accessTokenExpiresAt: timestamp
  - refreshTokenExpiresAt: timestamp
  - scope: text
  - password: text (for email/password auth)
  - createdAt: timestamp
  - updatedAt: timestamp

verification
  - id: uuid (PK)
  - identifier: text (email)
  - value: text (token)
  - expiresAt: timestamp
  - createdAt: timestamp
  - updatedAt: timestamp
```

#### Custom Application Tables

```sql
blogs (example custom table)
  - id: uuid (PK)
  - authorId: uuid (FK -> user.id)
  - title: text
  - slug: text (unique)
  - content: text
  - excerpt: text
  - coverImage: text
  - published: boolean
  - publishedAt: timestamp
  - createdAt: timestamp
  - updatedAt: timestamp
```

### Migration Workflow

This project uses **Drizzle Kit CLI** for migrations (no custom migrate.ts script):

```bash
# 1. Make schema changes in src/infrastructure/schema.ts

# 2. Generate migration files
pnpm db:generate

# 3. Review generated SQL in drizzle/ folder

# 4. Apply migrations to database
pnpm db:migrate

# Alternative: Push schema directly (dev only, no migration files)
pnpm db:push
```

**Development vs Production:**
- **Development**: Use `pnpm db:push` for quick prototyping (no migration history)
- **Production**: Always use `pnpm db:generate` + `pnpm db:migrate` for versioned migrations

### Database Configuration

Located in `src/infrastructure/db.ts`:

```typescript
// Connection pool with full configuration
const poolConfig: PoolConfig = {
  connectionString: env.DATABASE_URL,
  min: env.DATABASE_POOL_MIN,           // Minimum connections
  max: env.DATABASE_POOL_MAX,           // Maximum connections
  idleTimeoutMillis: env.DATABASE_IDLE_TIMEOUT,
  connectionTimeoutMillis: env.DATABASE_CONNECTION_TIMEOUT,
  statement_timeout: env.DATABASE_STATEMENT_TIMEOUT,
  allowExitOnIdle: env.DATABASE_ALLOW_EXIT_ON_IDLE,
};

// Drizzle instance with schema
export const db = drizzle(pool, { schema });

// Health check utility
export const checkDbConnection = async () => { /* ... */ }

// Pool statistics
export const getDbPoolStats = () => { /* ... */ }

// Graceful shutdown
export const closeDbPool = async () => { /* ... */ }
```

**Environment variables for database:**
```env
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10
DATABASE_IDLE_TIMEOUT=30000
DATABASE_CONNECTION_TIMEOUT=5000
DATABASE_STATEMENT_TIMEOUT=30000
DATABASE_ALLOW_EXIT_ON_IDLE=false
DATABASE_ENABLE_LOGGING=false
```

### Drizzle Studio

Visual database browser built-in:

```bash
pnpm db:studio
```

Opens at `https://local.drizzle.studio` - browse tables, run queries, inspect data.

## 📧 Email Queue System

All emails are sent through a **reliable queue-based system** to ensure delivery and prevent blocking.

### Architecture

```
Application → Email Queue (BullMQ) → Email Worker → SMTP Server → Recipient
                    ↓
                Redis (Queue Storage)
```

**Benefits:**
- ✅ **Non-blocking** - API responses instant, emails sent async
- ✅ **Reliable** - 3 retries with exponential backoff
- ✅ **Scalable** - Worker concurrency (5 emails at once)
- ✅ **Observable** - Job tracking with unique IDs
- ✅ **Persistent** - Failed jobs kept for debugging

### Email Flow

```typescript
// In application code (e.g., Better Auth callback)
import { sendVerificationEmail } from "./libs/email.js";

// This queues the email and returns immediately
await sendVerificationEmail(user.email, verificationUrl);
// → Returns: { success: true, jobId: "job_123xyz" }

// Worker processes job asynchronously
// → Retries on failure (3 attempts)
// → Logs success/failure
```

### Queue Configuration

Located in `src/jobs/queues/email.queue.ts`:

```typescript
defaultJobOptions: {
  attempts: 3,                        // Retry 3 times
  backoff: {
    type: "exponential",              // 2s, 4s, 8s delays
    delay: 2000,
  },
  priority: 2,                        // Higher for verification/reset
  removeOnComplete: { count: 100 },   // Keep last 100 successful
  removeOnFail: { count: 500 },       // Keep last 500 failed
}
```

### Worker Configuration

Located in `src/jobs/workers/email.worker.ts`:

```typescript
{
  connection: getRedis(),             // Redis connection
  concurrency: 5,                     // Process 5 jobs simultaneously
  removeOnComplete: { count: 100 },
  removeOnFail: { count: 500 },
}
```

### Email Types

**1. Generic Email**
```typescript
await sendEmail({
  to: "user@example.com",
  subject: "Welcome",
  html: "<h1>Welcome!</h1>",
  text: "Welcome!",
});
```

**2. Verification Email (Priority)**
```typescript
await sendVerificationEmail(
  "user@example.com",
  "https://yourapp.com/verify?token=abc123"
);
```

**3. Password Reset Email (Priority)**
```typescript
await sendPasswordResetEmail(
  "user@example.com",
  "https://yourapp.com/reset?token=xyz789"
);
```

### Email Templates

All HTML templates centralized in `src/libs/email.ts`:
- `generateVerificationEmailHtml(url)` - Beautiful responsive verification email
- `generatePasswordResetEmailHtml(url)` - Responsive reset email with security tips

**No duplication** - Worker imports and uses these templates.

### Monitoring

Check queue status via BullMQ Board or Redis:

```bash
# Redis CLI - check queue length
redis-cli LLEN bull:email:waiting
redis-cli LLEN bull:email:active
redis-cli LLEN bull:email:failed

# Application logs (Pino)
# → "Email queued successfully" (when job added)
# → "Email job processed successfully" (when sent)
# → "Email job failed" (on failure after retries)
```

### Troubleshooting

**Emails not being sent:**
1. Check Redis is running: `pnpm dev` (worker starts with app)
2. Check SMTP credentials in `.env`
3. Check worker logs for errors
4. Inspect failed jobs in Redis

**Worker not starting:**
- Worker automatically starts with `pnpm dev`
- Check logs: "Starting all workers..." → "Email worker started"
- Verify Redis connection in health check endpoint

**Too many retries:**
- Adjust `attempts` in `email.queue.ts`
- Check SMTP timeout settings
- Consider using a queue monitoring tool

## 🛡️ Rate Limiting Strategy

This boilerplate implements **dual rate limiting** to handle both anonymous and authenticated traffic:

### Why User-Based Rate Limiting?

In regions like **Indonesia**, IPv4 exhaustion causes carrier-grade NAT (CGNAT), meaning:
- ❌ Thousands of users share the same public IP
- ❌ IP-based rate limiting blocks legitimate users
- ✅ **Solution**: Rate limit per authenticated user ID

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     REQUEST                              │
└───────────────────┬─────────────────────────────────────┘
                    │
         ┌──────────▼──────────┐
         │  Authenticated?     │
         └──────┬──────┬───────┘
                │      │
        YES ────┘      └──── NO
         │                    │
         │                    │
    ┌────▼─────────┐    ┌────▼──────────┐
    │ User-Based   │    │  IP-Based     │
    │ Rate Limit   │    │  Rate Limit   │
    │ (per user.id)│    │  (per IP)     │
    └──────────────┘    └───────────────┘
         │                    │
         └──────────┬─────────┘
                    │
              ┌─────▼──────┐
              │   Redis    │
              │   Store    │
              └────────────┘
```

### Implementation

**1. Global IP-Based Rate Limit** (applied to all routes in app.ts):
```typescript
app.use("*", rateLimit({ windowMs: 60 * 1000, limit: 100 }));
// → 100 requests per minute per IP
// → For unauthenticated traffic
```

**2. User-Based Rate Limit** (applied to authenticated routes):

**Strict** (5 req/min) - Sensitive operations:
```typescript
// Avatar upload/delete, password reset
strictUserRateLimit()
```

**Standard** (30 req/min) - Normal operations:
```typescript
// CRUD operations, admin actions
standardUserRateLimit()
```

**Relaxed** (60 req/min) - Read-heavy operations:
```typescript
// Profile viewing, listing data
relaxedUserRateLimit()
```

### Usage Examples

```typescript
// User router
userRouter.get("/profile",
  betterAuthMiddleware,
  relaxedUserRateLimit(),     // 60 req/min per user
  getUserProfile
);

userRouter.post("/avatar",
  betterAuthMiddleware,
  strictUserRateLimit(),      // 5 req/min per user
  uploadAvatar
);

// Blog router
blogRouter.post("/",
  betterAuthMiddleware,
  strictUserRateLimit(),      // Prevent spam
  createBlog
);

blogRouter.get("/my/blogs",
  betterAuthMiddleware,
  relaxedUserRateLimit(),     // Read-heavy
  getMyBlogs
);
```

### Configuration

Located in `src/shared/middlewares/user-rate-limit.middleware.ts`:

```typescript
export const strictUserRateLimit = () =>
  userRateLimit({
    windowMs: 60 * 1000,  // 1 minute
    limit: 5,              // 5 requests per minute
  });

export const standardUserRateLimit = () =>
  userRateLimit({
    windowMs: 60 * 1000,  // 1 minute
    limit: 30,             // 30 requests per minute
  });

export const relaxedUserRateLimit = () =>
  userRateLimit({
    windowMs: 60 * 1000,  // 1 minute
    limit: 60,             // 60 requests per minute
  });
```

### How It Works

1. **Middleware checks authentication**:
   - If user is authenticated → uses `user:${userId}` as Redis key
   - If not authenticated → falls back to `ip:${ipAddress}` as key

2. **Redis stores rate limit counters**:
   - Key: `user:uuid-123` or `ip:192.168.1.1`
   - Value: Request count
   - TTL: windowMs (60 seconds)

3. **Response headers** (draft-6 standard):
   ```
   X-RateLimit-Limit: 30
   X-RateLimit-Remaining: 25
   X-RateLimit-Reset: 1672531200
   ```

### Benefits

✅ **Fair limits per user** - Not affected by shared IPs
✅ **Prevents abuse** - User can't bypass by reconnecting
✅ **Flexible tiers** - Different limits for different operations
✅ **Observable** - Track per-user usage in Redis
✅ **Production-ready** - Handles CGNAT, proxy, VPN scenarios

### Monitoring

```bash
# Check rate limit keys in Redis
redis-cli KEYS "user:*"
redis-cli KEYS "ip:*"

# Check specific user's limit
redis-cli GET "user:550e8400-e29b-41d4-a716-446655440000"

# Monitor rate limit hits
redis-cli MONITOR | grep "user:"
```

### Customization

**Add custom rate limit tiers:**
```typescript
export const premiumUserRateLimit = () =>
  userRateLimit({
    windowMs: 60 * 1000,
    limit: 200,  // Premium users get higher limit
  });
```

**Per-endpoint custom limits:**
```typescript
blogRouter.post("/import",
  betterAuthMiddleware,
  userRateLimit({ windowMs: 60000, limit: 1 }),  // Once per minute
  importBlogs
);
```

## 🔐 Security Features

- ✅ **Better Auth** - Complete authentication with session management
- ✅ **Email Verification** - Required for email/password sign up
- ✅ **Password Hashing** - Secure bcrypt hashing (handled by Better Auth)
- ✅ **JWT Tokens** - 15-minute access tokens
- ✅ **OAuth 2.0** - Google, Facebook, Discord
- ✅ **Dual Rate Limiting** - IP-based (global) + User-based (authenticated)
- ✅ **User Rate Limiting** - Per-user limits (crucial for shared IPs/carrier-grade NAT)
- ✅ **Role-Based Access** - Admin middleware for protected routes
- ✅ **CORS** - Cross-origin resource sharing enabled
- ✅ **Content-Type Validation** - API endpoints require JSON
- ✅ **File Upload Validation** - Type and size checks (5MB max)

## 📧 Email Features

- ✅ **Queue-Based Email Delivery** - All emails sent via BullMQ queue with retry logic
- ✅ **Email Verification** - Beautiful HTML emails with one-click verification
- ✅ **Password Reset** - Secure reset flow with expiring tokens
- ✅ **SMTP Support** - Works with Gmail, SendGrid, AWS SES, etc.
- ✅ **Email Templates** - Professional responsive HTML emails (centralized in email.ts)
- ✅ **Retry Mechanism** - 3 automatic retries with exponential backoff (2s delay)
- ✅ **Priority Queuing** - Verification/reset emails get higher priority
- ✅ **Worker Concurrency** - Process up to 5 emails simultaneously
- ✅ **Job Persistence** - Failed jobs kept for debugging (500 most recent)

## 📦 Tech Stack

### Core
- **Runtime**: Node.js
- **Framework**: Hono.js (fast, lightweight)
- **Language**: TypeScript

### Authentication & Security
- **Better Auth** - Complete auth solution
- **Nodemailer** - Email delivery

### Database & Storage
- **PostgreSQL** - Relational database with UUID v7 primary keys
- **Drizzle ORM** - Type-safe queries with full schema definition
- **uuid** - UUID v7 generation for primary keys
- **Redis** - Caching and rate limiting
- **AWS S3** - File storage (avatars)

### Background Jobs
- **BullMQ** - Job queue processing
- **Redis** - Queue backend

### Development Tools
- **Biome** - Fast linter and formatter
- **Pino** - Structured logging
- **tsx** - TypeScript execution
- **Drizzle Kit** - Database migrations and Studio GUI

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
- ✅ Use production database with SSL and connection pooling
- ✅ Run migrations with `pnpm db:migrate` (not `db:push`)
- ✅ Enable PostgreSQL UUID extension if not already enabled
- ✅ Optimize database indexes for UUID columns (already configured in schema)
- ✅ Enable Redis password authentication
- ✅ Configure CORS for your frontend domain
- ✅ Set up HTTPS/SSL certificates
- ✅ Configure OAuth redirect URIs for production
- ✅ Set up S3 bucket with proper permissions
- ✅ Enable database backups with point-in-time recovery
- ✅ Set up monitoring (logs, errors, performance, database metrics)
- ✅ Configure rate limiting for your traffic
- ✅ Test UUID generation performance under load

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
