import { prisma } from "@/lib/db";
import { type NextRequest } from 'next/server'
// Get all tasks
export async function GET() {
    try {
        const tasks = await prisma.tasks.findMany({
            include: { User: true }, // Include related user data
        });
        return Response.json({
            data: tasks,
            error: 0,
            message: "Tasks retrieved successfully",
        });
    } catch (error:any) {
        return Response.json({
            data: null,
            error: 1,
            message: error.message,
        });
    }
}
// curl -X GET http://localhost:3000/api/tasks


// Create a new task
export async function POST(request:NextRequest) {
    try {
        const { description, status, user_id } = await request.json();
        const task = await prisma.tasks.create({
            data: {
                description,
                status,
                user_id,
            },
        });
        return Response.json({
            data: task,
            error: 0,
            message: "Task created successfully",
        });
    } catch (error:any) {
        return Response.json({
            data: null,
            error: 1,
            message: error.message,
        });
    }
}
// curl -X POST http://localhost:3000/api/tasks \
// -H "Content-Type: application/json" \
// -d '{
//     "description": "Complete the project documentation",
//     "status": "IN_PROGRESS",
//     "user_id": 1
// }'

// Update a task
export async function PUT(request:NextRequest) {
    try {
        const { task_id, description, status, user_id } = await request.json();
        const task = await prisma.tasks.update({
            where: { task_id },
            data: { description, status, user_id },
        });
        return Response.json({
            data: task,
            error: 0,
            message: "Task updated successfully",
        });
    } catch (error:any) {
        return Response.json({
            data: null,
            error: 1,
            message: error.message,
        });
    }
}
// curl -X PUT http://localhost:3000/api/tasks \
// -H "Content-Type: application/json" \
// -d '{
//     "task_id": 1,
//     "description": "Review the project code",
//     "status": "COMPLETED",
//     "user_id": 2
// }'

// Delete a task
export async function DELETE(request:NextRequest) {
    try {
        const { task_id } = await request.json();
        await prisma.tasks.delete({
            where: { task_id },
        });
        return Response.json({
            data: null,
            error: 0,
            message: "Task deleted successfully",
        });
    } catch (error:any) {
        return Response.json({
            data: null,
            error: 1,
            message: error.message,
        });
    }
}
// curl -X DELETE http://localhost:3000/api/tasks \
// -H "Content-Type: application/json" \
// -d '{
//     "task_id": 1
// }'