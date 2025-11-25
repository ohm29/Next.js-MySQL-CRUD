# Next.js + Prisma + MySQL + NextAuth.js

A comprehensive guide for setting up a Next.js application with Prisma ORM, MySQL database, and NextAuth.js authentication using Google provider.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Prisma Setup](#prisma-setup)
- [NextAuth.js Setup](#nextauthjs-setup)
- [Usage](#usage)
- [API Reference](#api-reference)

## Prerequisites

- Node.js 18+ installed
- MySQL database (local or remote)
- Google Cloud Console account (for OAuth)

## Installation

### 1. Setup the Next.js Project

```bash
npx create-next-app@latest
```

When prompted, select the following options:

```
√ What is your project named? ... my-app
√ Would you like to use TypeScript? ... Yes
√ Would you like to use ESLint? ... Yes
√ Would you like to use Tailwind CSS? ... Yes
√ Would you like to use `src/` directory? ... No 
√ Would you like to use App Router? (recommended) ... Yes
√ Would you like to customize the default import alias (@/*)? ... No
```

### 2. Install Required Packages

```bash
npm install prisma --save-dev
npm install @prisma/client next-auth
```

## Prisma Setup

### 1. Initialize Prisma

```bash
npx prisma init --datasource-provider mysql
```

### 2. Configure Database Connection

Create or update `.env` file in the root directory:

```env
DATABASE_URL="mysql://root:password@localhost:3306/mydb"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-generate-with-openssl"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

> **Generate NEXTAUTH_SECRET:**
> ```bash
> openssl rand -base64 32
> ```

### 3. Define Prisma Schema

Update `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

// User model for your application
model User {
  user_id    Int      @id @default(autoincrement())
  name       String?
  email      String   @unique
  role       String   @default("user")
  created_at DateTime @default(now())
  updated_at DateTime @updatedAt

  // NextAuth relations
  accounts   Account[]
  sessions   Session[]
}

// NextAuth.js Models
model Account {
  id                String  @id @default(cuid())
  userId            Int
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [user_id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@index([userId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       Int
  expires      DateTime
  user         User     @relation(fields: [userId], references: [user_id], onDelete: Cascade)

  @@index([userId])
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}
```

### 4. Run Migration

```bash
npx prisma migrate dev --name init
```

### 5. Create Prisma Client Instance

Create `lib/prisma.ts`:

```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
```

## NextAuth.js Setup

### 1. Configure Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to **Credentials** → **Create Credentials** → **OAuth client ID**
5. Configure OAuth consent screen
6. Add authorized redirect URIs:
   - Development: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://yourdomain.com/api/auth/callback/google`
7. Copy **Client ID** and **Client Secret** to your `.env` file

### 2. Create NextAuth Configuration

Create `lib/auth.ts`:

```typescript
import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
  },
  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};
```

### 3. Install Prisma Adapter

```bash
npm install @next-auth/prisma-adapter
```

### 4. Create NextAuth API Route

Create `app/api/auth/[...nextauth]/route.ts`:

```typescript
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
```

### 5. Create Sign In Page (Optional)

Create `app/auth/signin/page.tsx`:

```typescript
"use client";

import { signIn } from "next-auth/react";

export default function SignIn() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="rounded-lg bg-white p-8 shadow-lg">
        <h1 className="mb-6 text-2xl font-bold">Sign In</h1>
        <button
          onClick={() => signIn("google", { callbackUrl: "/" })}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Sign in with Google
        </button>
      </div>
    </div>
  );
}
```

### 6. Wrap App with Session Provider

Update `app/layout.tsx`:

```typescript
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import SessionProvider from "@/components/SessionProvider";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <body>
        <SessionProvider session={session}>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
```

Create `components/SessionProvider.tsx`:

```typescript
"use client";

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";

export default function SessionProvider({
  children,
  session,
}: {
  children: React.ReactNode;
  session: any;
}) {
  return (
    <NextAuthSessionProvider session={session}>
      {children}
    </NextAuthSessionProvider>
  );
}
```

## Usage

### Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`

### Using Authentication in Components

#### Client Component

```typescript
"use client";

import { useSession, signIn, signOut } from "next-auth/react";

export default function Component() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (session) {
    return (
      <>
        <p>Signed in as {session.user?.email}</p>
        <button onClick={() => signOut()}>Sign out</button>
      </>
    );
  }

  return (
    <>
      <p>Not signed in</p>
      <button onClick={() => signIn()}>Sign in</button>
    </>
  );
}
```

#### Server Component

```typescript
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function Page() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return <div>Please sign in</div>;
  }

  return <div>Welcome {session.user?.name}</div>;
}
```

### Creating User API Routes

Create `app/api/users/route.ts`:

```typescript
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest } from "next-server";

// Get all users
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return Response.json({
        data: null,
        error: 1,
        message: "Unauthorized",
      }, { status: 401 });
    }

    const users = await prisma.user.findMany({
      select: {
        user_id: true,
        name: true,
        email: true,
        role: true,
        created_at: true,
        updated_at: true,
      },
    });

    return Response.json({
      data: users,
      error: 0,
      message: "Read data successfully",
    });
  } catch (error: any) {
    return Response.json({
      data: null,
      error: 1,
      message: error.message,
    }, { status: 500 });
  }
}

// Create new user
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return Response.json({
        data: null,
        error: 1,
        message: "Unauthorized",
      }, { status: 401 });
    }

    const body = await request.json();
    const { name, email, role } = body;

    if (!name || !email || !role) {
      return Response.json({
        data: null,
        error: 1,
        message: "Missing required fields",
      }, { status: 400 });
    }

    const user = await prisma.user.create({
      data: { name, email, role },
    });

    return Response.json({
      data: user,
      error: 0,
      message: "User created successfully",
    }, { status: 201 });
  } catch (error: any) {
    return Response.json({
      data: null,
      error: 1,
      message: error.message,
    }, { status: 500 });
  }
}

// Update user
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return Response.json({
        data: null,
        error: 1,
        message: "Unauthorized",
      }, { status: 401 });
    }

    const body = await request.json();
    const { user_id, name, email, role } = body;

    if (!user_id) {
      return Response.json({
        data: null,
        error: 1,
        message: "User ID is required",
      }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { user_id: parseInt(user_id) },
      data: { name, email, role },
    });

    return Response.json({
      data: user,
      error: 0,
      message: "User updated successfully",
    });
  } catch (error: any) {
    return Response.json({
      data: null,
      error: 1,
      message: error.message,
    }, { status: 500 });
  }
}

// Delete user
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return Response.json({
        data: null,
        error: 1,
        message: "Unauthorized",
      }, { status: 401 });
    }

    const body = await request.json();
    const { user_id } = body;

    if (!user_id) {
      return Response.json({
        data: null,
        error: 1,
        message: "User ID is required",
      }, { status: 400 });
    }

    await prisma.user.delete({
      where: { user_id: parseInt(user_id) },
    });

    return Response.json({
      data: null,
      error: 0,
      message: "User deleted successfully",
    });
  } catch (error: any) {
    return Response.json({
      data: null,
      error: 1,
      message: error.message,
    }, { status: 500 });
  }
}
```

## API Reference

### Authentication Endpoints

#### Sign In
```http
GET /api/auth/signin
```

#### Sign Out
```http
GET /api/auth/signout
```

#### Get Session
```http
GET /api/auth/session
```

#### OAuth Callback
```http
GET /api/auth/callback/google
```

### User Management Endpoints

All user endpoints require authentication.

#### Get All Users

```http
GET /api/users
```

**Response:**
```json
{
  "data": [
    {
      "user_id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  ],
  "error": 0,
  "message": "Read data successfully"
}
```

#### Create User

```http
POST /api/users
```

**Body Parameters:**

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `name`    | `string` | **Required**. User's name  |
| `email`   | `string` | **Required**. User's email |
| `role`    | `string` | **Required**. User's role  |

**Example:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "role": "user"
}
```

#### Update User

```http
PUT /api/users
```

**Body Parameters:**

| Parameter | Type      | Description                    |
| :-------- | :-------- | :----------------------------- |
| `user_id` | `integer` | **Required**. User ID          |
| `name`    | `string`  | **Optional**. User's name      |
| `email`   | `string`  | **Optional**. User's email     |
| `role`    | `string`  | **Optional**. User's role      |

**Example:**
```json
{
  "user_id": 1,
  "name": "Jane Doe",
  "email": "jane@example.com",
  "role": "admin"
}
```

#### Delete User

```http
DELETE /api/users
```

**Body Parameters:**

| Parameter | Type      | Description            |
| :-------- | :-------- | :--------------------- |
| `user_id` | `integer` | **Required**. User ID  |

**Example:**
```json
{
  "user_id": 1
}
```

## Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="mysql://root:password@localhost:3306/mydb"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id-from-console"
GOOGLE_CLIENT_SECRET="your-google-client-secret-from-console"
```

## Useful Commands

```bash
# Generate Prisma Client
npx prisma generate

# Create migration
npx prisma migrate dev --name migration_name

# Open Prisma Studio (GUI)
npx prisma studio

# Reset database
npx prisma migrate reset

# Push schema changes without migration
npx prisma db push
```

## Troubleshooting

### Common Issues

1. **"PrismaClient is unable to run in the browser"**
   - Make sure you're using `prisma` only in server-side code (API routes, Server Components)

2. **"Invalid `prisma.user.findMany()` invocation"**
   - Run `npx prisma generate` after schema changes

3. **NextAuth session is null**
   - Check if `NEXTAUTH_SECRET` is set in `.env`
   - Verify Google OAuth credentials
   - Ensure callback URLs are correct in Google Console

4. **Database connection errors**
   - Verify MySQL is running
   - Check `DATABASE_URL` in `.env`
   - Ensure database exists

## License

MIT

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.
