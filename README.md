# Next.js Prisma Mysql
How to Setup Prisma ORM in Next.js App Directory

## Installation
###  Setup the Next.js Project
    
    npx create-next-app@latest

#
    √ What is your project named? ... my-app
    √ Would you like to use TypeScript? ...  Yes
    √ Would you like to use ESLint? ... Yes
    √ Would you like to use Tailwind CSS? ... Yes
    √ Would you like to use `src/` directory? ... No 
    √ Would you like to use App Router? (recommended) ...  Yes
    √ Would you like to customize the default import alias (@/*)? ... No 

###  Setup Prisma ORM
#### 1. Install package 
    npm i @prisma/client
    npm i -D prisma
#### 2. Initialize Prisma
    npx prisma init --datasource-provider mysql
#### 3. Config database
##### .env
    DATABASE_URL="mysql://root:@localhost:3306/mydb"

#### 4. Defind Model
##### prisma/schema.prisma    
    generator client {
      provider = "prisma-client-js"
    }
    
    datasource db {
      provider = "mysql"
      url      = env("DATABASE_URL")
    }
    
    model User {
      user_id    Int      @id @default(autoincrement())
      name       String
      email      String   @unique
      role       String
      created_at DateTime @default(now())
      updated_at DateTime @updatedAt
    }
#### 5. Defind Model
    npx prisma migrate dev --name init
#### 6.  create  lib folder in  directory and add  db.ts file
    import { PrismaClient } from "@prisma/client";
    
    const globalForPrisma = globalThis as unknown as {
        prisma: PrismaClient | undefined;
    };
    
    export const prisma = globalForPrisma.prisma ?? new PrismaClient();
    
    if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
## How to use
#### Create  api folder in app folder and add db.ts
##### app/api/user/route.ts
    import { prisma } from "@/lib/db";
    import { type NextRequest } from 'next/server'
    // Get all users
    export async function GET() {
        try {
            const users = await prisma.user.findMany();
            return Response.json({
                data: users,
                error: 0,
                message: "Read data successfully",
            });
        } catch (error:any) {
            return Response.json({
                data: null,
                error: 1,
                message: error.message,
            });
        }
    }
    ....
#### Test and running
    npm run dev

## API Reference

#### Get all users
```http
  GET /api/users
```

#### Create users

```http
  POST /api/users/
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `name`      | `string` | **Required**.  |
| `email`      | `string` | **Required**.  |
| `role`      | `string` | **Required**.  |


#### Update users
```http
  PUT /api/users/
```
| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `user_id`      | `integer` | **Required**.  |
| `name`      | `string` | **Required**.  |
| `email`      | `string` | **Required**. |
| `role`      | `string` | **Required**.  |

#### Delete users
```http
  DELETE /api/users/
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `user_id`      | `integer` | **Required**.  |
