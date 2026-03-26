import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";


export async function DELETE(req, context) {
    const cookieStore = await cookies();
    const token = cookieStore.get("adminToken")?.value;
    console.log('token', token)
    if (!token) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { params } = context;   // params is a Promise
        const { id } = await params;  // ✅ FIX
        console.log('id', id)

        // soft delete
        await prisma.product_list.update({
            where: { id: Number(id) },
            data: {
                is_deleted: true,
                deleted_at: new Date(),
            },
        });

        return NextResponse.json({
            status: true,
            message: "Product soft deleted",
        });
    } catch (error) {
        console.log(error)
        return NextResponse.json(
            { status: false, message: "Delete failed" },
            { status: 500 }
        );
    }
}