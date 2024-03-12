# Next.js Prisma Mysql
How to Setup Prisma ORM in Next.js App Directory

## Installation
###  Setup the Next.js Project
    
    npx create-next-app@latest

![image](https://github.com/ohm29/NextJS-Prisma-MySQL/assets/42561667/170d82c3-885b-4cdb-be3b-df9e4c58e77a)

###  Setup Prisma ORM
#### Install package 
    npm i @prisma/client
    npm i -D prisma
#### Initialize Prisma
    npx prisma init --datasource-provider mysql
#### Config database
##### .env
    DATABASE_URL="mysql://root:@localhost:3306/mydb"

#### Defind Model
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
## Running the tests
    npm run dev

