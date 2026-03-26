let productDetailsPromise;

export function getProductDetails() {
  if (!productDetailsPromise) {
    productDetailsPromise = fetch("/api/shop-detail", {
      credentials: "include",
    }).then((res) => res.json());
  }
  return productDetailsPromise;
}
