import { Suspense } from "react";
import ProductCategory from "./ProductCategory";

export default async function Page({ params }) {
    const p = await params;
  const slugPath = p.slug.join("/");

  return (
      <ProductCategory slugPath={slugPath} />
  );
}
