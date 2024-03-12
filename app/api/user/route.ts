import { prisma } from "@/lib/db";

export async function GET() {
    const users = await prisma.User.findMany();
    return Response.json({
        data: users,
        error: 0,
        message: "read data successfully"
    })
}