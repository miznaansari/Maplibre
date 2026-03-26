import ViewProductPrice from "./ViewProductPrice";
import { prisma } from "@/lib/prisma";

export const metadata = {
    title: "Product Pricing | Admin",
};

export default async function Page() {
    // ✅ Fetch active customer groups
    const customerGroups = await prisma.customer_groups.findMany({
        where: {
            is_active: true,
        },
        select: {
            id: true,
            group_name: true,
        },
        orderBy: {
            group_name: "asc",
        },
    });
    //   console.log('customerGroups',customerGroups)

    // ✅ Fetch products with pricing per customer group
    const products = await prisma.product_list.findMany({
        where: {
            is_deleted: false,
        },
        select: {
            id: true,
            name: true,
            sku: true,
            regular_price: true,
            pricing: {
                select: {
                    id: true,
                    price: true,
                    customer_group_id: true,
                    group: {
                        select: {
                            id: true,
                            group_name: true,
                        },
                    },
                },
            },
        },
        orderBy: {
            name: "asc",
        },
    });
    //   console.log('products',products)

    // ✅ Pass data to client component
    return (
        <ViewProductPrice
            customerGroups={customerGroups}
            products={products}
        />
    );
}
