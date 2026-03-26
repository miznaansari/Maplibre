"use client";

import { useState } from "react";
import { saveProductPrices } from "./action";

export default function ViewProductPrice({ customerGroups, products }) {
    const [expandedProductId, setExpandedProductId] = useState(null);
    const [loadingProductId, setLoadingProductId] = useState(null);

    const [priceState, setPriceState] = useState(() => {
        const map = {};
        products.forEach((product) => {
            map[product.id] = {};
            product.pricing.forEach((p) => {
                map[product.id][p.customer_group_id] = p.price;
            });
        });
        return map;
    });

    const handleChange = (productId, groupId, value) => {
        setPriceState((prev) => ({
            ...prev,
            [productId]: {
                ...prev[productId],
                [groupId]: value,
            },
        }));
    };

    const toggleExpand = (productId) => {
        setExpandedProductId((prev) =>
            prev === productId ? null : productId
        );
    };


    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-4 flex items-center justify-between">
                <div className="text-xl font-semibold text-gray-900">
                    Product Pricing
                </div>
                <span className="text-sm text-gray-500">
                    Home <span className="mx-1">›</span> Product Pricing
                </span>
            </div>

            <div className="overflow-hidden rounded border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-200 px-6 py-4">
                    <h2 className="text-base font-semibold text-gray-900">
                        Products
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                        Click a product to manage customer group pricing
                    </p>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full border-collapse">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="border-b px-4 py-3 text-left text-sm font-medium text-gray-600">
                                    Product
                                </th>
                                <th className="border-b px-4 py-3 text-left text-sm font-medium text-gray-600">
                                    SKU
                                </th>
                                <th className="border-b px-4 py-3 text-left text-sm font-medium text-gray-600">
                                    Regular Price
                                </th>
                                <th className="border-b px-4 py-3 text-right text-sm font-medium text-gray-600">
                                    Action
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100">
                            {products.map((product) => {
                                const isExpanded =
                                    expandedProductId === product.id;

                                return (
                                    <>
                                        {/* Main Row */}
                                        <tr
                                            key={product.id}
                                            className="cursor-pointer hover:bg-gray-50"
                                            onClick={() => toggleExpand(product.id)}
                                        >
                                            <td className="px-4 py-3 text-sm text-gray-900">
                                                {product.name}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600">
                                                {product.sku}
                                            </td>
                                            <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                                {product.regular_price}
                                            </td>
                                            <td className="px-4 py-3 text-right text-sm text-blue-600">
                                                {isExpanded ? "Hide Prices" : "Edit Prices"}
                                            </td>
                                        </tr>

                                        {/* Expanded Row */}
                                        {isExpanded && (

                                            <tr>
                                                <td colSpan={4} className="bg-gray-50 px-6 py-4">
                                                    <form action={saveProductPrices}>
                                                        {/* Hidden product id */}
                                                        <input type="hidden" name="product_id" value={product.id} />

                                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                                                            {customerGroups.map((group) => (
                                                                <div
                                                                    key={group.id}
                                                                    className="flex items-center justify-between gap-3 rounded border border-gray-200 bg-white px-4 py-3"
                                                                >
                                                                    <span className="text-sm font-medium text-gray-700">
                                                                        {group.group_name}
                                                                    </span>

                                                                    <input
                                                                        type="number"
                                                                        step="0.01"
                                                                        name={`price_${group.id}`} // 🔥 IMPORTANT
                                                                        defaultValue={
                                                                            priceState[product.id]?.[group.id] ?? ""
                                                                        }
                                                                        className="w-24 rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                                    />
                                                                </div>
                                                            ))}
                                                        </div>

                                                        {/* Save Button */}
                                                        <div className="mt-6 flex justify-end">
                                                            <button
                                                                type="submit"
                                                                className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                                                            >
                                                                Save Prices
                                                            </button>
                                                        </div>
                                                    </form>
                                                </td>
                                            </tr>

                                        )}
                                    </>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
