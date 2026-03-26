// app/admin/(routing)/product/page.jsx

import { serverFetch } from "@/lib/serverFetch";
import ViewProduct from "./ViewProduct";


export const metadata = {
    title: "Products | Admin",
};

async function getProducts(searchParams) {
    // ✅ ENSURE PLAIN OBJECT
    const sp =
        searchParams instanceof Promise
            ? await searchParams
            : searchParams ?? {};

    const page = typeof sp.page === "string" ? sp.page : "1";
    const limit = typeof sp.limit === "string" ? sp.limit : "10";
    const search = typeof sp.search === "string" ? sp.search : "";
    const category = typeof sp.category === "string" ? sp.category : "";
    const stock = typeof sp.stock === "string" ? sp.stock : "";

    const params = new URLSearchParams({
        page,
        limit,
        search,
        category,
        stock,
    });

    // const res = await fetch(
    //     `${process.env.NEXT_PUBLIC_BASE_URL}/admin/api/products?${params.toString()}`,
    //     { cache: "no-store" }
    // );

    const res = await serverFetch(`/admin/api/products?${params.toString()}`);

    if (!res.ok) {
        throw new Error("Failed to fetch products");
    }

    return res.json();
}

export default async function ProductsPage({ searchParams }) {
    // ✅ ALWAYS await searchParams
    const data = await getProducts(searchParams);
    return (
        <ViewProduct
            products={data.data}
            pagination={data.pagination}
            searchParams={
                searchParams instanceof Promise
                    ? await searchParams
                    : searchParams ?? {}
            }
        />
    );
}