"use client";

import { ShareIcon } from "@heroicons/react/24/outline";

export default function ShareWishlistLink({ wishlist }) {
  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/shop?wishlist=${wishlist.slug}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "My Wishlist",
          text: "Check out my wishlist",
          url: shareUrl,
        });
      } catch (err) {
        console.log("Share cancelled", err);
      }
    } else {
      // fallback for unsupported browsers
      window.location.href = shareUrl;
    }
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      className="p-1"
      aria-label="Share wishlist"
    >
      <ShareIcon className="h-5 w-5 text-gray-600 hover:text-blue-600" />
    </button>
  );
}
