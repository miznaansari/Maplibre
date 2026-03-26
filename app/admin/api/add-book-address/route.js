import { prisma } from "@/lib/prisma";

export async function POST(req) {
    try {
        const customerId = req.headers.get("x-customer-id");

        if (!customerId) {
            return new Response(
                JSON.stringify({ message: "Unauthorized" }),
                { status: 401 }
            );
        }

        const body = await req.json();

        const {
            first_name,
            last_name,
            company,
            address_1,
            address_2,
            city,
            country,
            postal_code,
            phone,
            email,
            is_default = false,
        } = body;

        // 🔴 Required fields
        if (!first_name || !address_1 || !city || !country || !postal_code) {
            return new Response(
                JSON.stringify({ message: "Missing required fields" }),
                { status: 400 }
            );
        }

        // ⭐ Reset default address if needed
        if (is_default) {
            await prisma.customer_address.updateMany({
                where: {
                    customer_list_id: BigInt(customerId),
                    is_default: true,
                },
                data: { is_default: false },
            });
        }

        // ✅ Create address
        const address = await prisma.customer_address.create({
            data: {
                customer_list_id: BigInt(customerId),
                first_name,
                last_name,
                company,
                address_1,
                address_2,
                city,
                country,
                postal_code,
                phone,
                email,
                is_default,
            },
        });

        return new Response(
            JSON.stringify({
                message: "Address added successfully",
                address,
            }),
            { status: 201 }
        );
    } catch (error) {
        console.error("ADD ADDRESS ERROR:", error);

        return new Response(
            JSON.stringify({ message: "Internal server error" }),
            { status: 500 }
        );
    }
}
