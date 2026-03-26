// UI/shop/ProductRow.jsx
import Image from "next/image";
import { HeartIcon as HeartOutline } from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid";
import { memo } from "react";
import WishlistDropdown from "./WishlistDropdown";

const ProductRow = memo(function ProductRow({
  product,
  quantity,
  isSelected,
  isWishlistOpen,
  onQtyChange,
  onToggleSelect,
  onWishlistToggle,
}) {
  return (
    <tr className="border-b border-gray-300 odd:bg-white even:bg-[#F3F8FB]">
      <td className="border px-2 text-center">
        <input type="checkbox" checked={isSelected} onChange={onToggleSelect} />
      </td>

      <td className="border border-gray-300 px-3">{product.sku ?? "—"}</td>

      <td className="border border-gray-300 px-3 text-blue-700 font-medium">
        {product.mainImage ? (
          <Image
            src={product.mainImage}
            alt={product.name}
            width={40}
            height={40}
            className="inline-block mr-2"
          />
        ) : (
          <span className="inline-block w-10 h-10 bg-gray-200 mr-2" />
        )}
        {product.name}
      </td>

      <td className="border border-gray-300 px-2 text-center">EA</td>

      <td className="border border-gray-300 px-2 text-center">
        {product.price ? `$${product.price}` : "—"}
      </td>

      <td className="border  border-gray-300 px-2">
        <input
          type="number"
          min="0"
          value={quantity}
          onChange={(e) => onQtyChange(product.id, e.target.value)}
          className="w-full border border-gray-300 px-2 py-1 text-center"
        />
      </td>

      <td className="border border-gray-300 px-2 text-center">
        <button onClick={onWishlistToggle}>
          {isWishlistOpen ? (
            <HeartSolid className="w-5 h-5 text-blue-600" />
          ) : (
            <HeartOutline className="w-5 h-5 text-gray-400" />
          )}
        </button>
            {isWishlistOpen && (
    <WishlistDropdown
      wishlists={wishlists}
      onSelect={(wishlist) => onWishlistSelect(wishlist, product.id)}
      onCreate={(name) => createWishlist(customerId, name)}
    />
  )}
      </td>
    </tr>
  );
});

export default ProductRow;
