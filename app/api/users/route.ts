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
// curl -X GET http://localhost:3000/api/users

// Create a new user
export async function POST(request:NextRequest) {
    try {
        const { name, email, role } = await request.json();
        const user = await prisma.user.create({
            data: {
                name,
                email,
                role,
            },
        });
        return Response.json({
            data: user,
            error: 0,
            message: "User created successfully",
        });
    } catch (error:any) {
        return Response.json({
            data: null,
            error: 1,
            message: error.message,
        });
    }
}
// curl -X POST http://localhost:3000/api/users \
// -H "Content-Type: application/json" \
// -d '{
//     "name": "John Doe",
//     "email": "john.doe@example.com",
//     "role": "Admin"
// }'



// Update a user
export async function PUT(request:NextRequest) {
    try {
        const { user_id, name, email, role } = await request.json();
        const user = await prisma.user.update({
            where: { user_id },
            data: { name, email, role },
        });
        return Response.json({
            data: user,
            error: 0,
            message: "User updated successfully",
        });
    } catch (error:any) {
        return Response.json({
            data: null,
            error: 1,
            message: error.message,
        });
    }
}
// curl -X PUT http://localhost:3000/api/users \
// -H "Content-Type: application/json" \
// -d '{
//     "user_id": 1,
//     "name": "John Updated",
//     "email": "john.updated@example.com",
//     "role": "User"
// }'

// Delete a user
export async function DELETE(request:NextRequest) {
    try {
        const { user_id } = await request.json();
        await prisma.user.delete({
            where: { user_id },
        });
        return Response.json({
            data: null,
            error: 0,
            message: "User deleted successfully",
        });
    } catch (error:any) {
        return Response.json({
            data: null,
            error: 1,
            message: error.message,
        });
    }
}
// curl -X DELETE http://localhost:3000/api/users \
// -H "Content-Type: application/json" \
// -d '{
//     "user_id": 1
// }'
