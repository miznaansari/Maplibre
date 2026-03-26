// lib/fetchQuickOrderDetails.js
let detailsPromise;

export function fetchQuickOrderDetails() {
  if (!detailsPromise) {
    detailsPromise = fetch("/api/shop-detail", {
      credentials: "include",
    }).then((res) => res.json());
  }

  return detailsPromise;
}
