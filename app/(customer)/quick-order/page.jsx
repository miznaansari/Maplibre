import { serverFetch } from "@/lib/serverFetch";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import { requireUser } from "@/lib/requireUser";
import { redirect } from "next/navigation";
export const metadata = {
  title: "Quick Order",
  description: "Quickly place bulk Items and fast checkout.",
};
import { headers } from "next/navigation";
import QuickOrderClient from "../UI/quick-order/QuickOrderClient";
export default async function Page() {
  const c = await cookies();
  const token = c.get("authToken")?.value;
  let user = null;
  if (token) {
    user = await requireUser();

    if (!user) {
      redirect("/api/auth/logout?redirect=/quick-order");
    }

  }



  const res = await serverFetch("/api/quick-order?minimal=true");

  const products = await res.json();


  /* ---------------- FETCH DATA ---------------- */
  const cat = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/categories`, {
    cache: "no-store", // or 'force-cache' / revalidate
  });

  if (!cat.ok) {
    console.error("Failed to fetch categories");
    return <Navbar menuData={[]} />;
  }

  const filteredCategories = await cat.json();
  const categories = filteredCategories.filter(
    (cat) => cat.name.toLowerCase() !== "uncategorized"
  );


  /* ---------------- BUILD MENU ---------------- */
  function buildMenuData(categories) {
    const map = {};
    const tree = [];

    // 1️⃣ Category map
    categories.forEach((cat) => {
      map[cat.id] = {
        title: cat.name,
        path: `${cat.path}`,
        children: [],
      };
    });

    // 2️⃣ Attach products
    categories.forEach((cat) => {
      if (Array.isArray(cat.products)) {
        cat.products.forEach((product) => {
          map[cat.id].children.push({
            title: product.name,
            path: `/product/${product.slug}`,
            isProduct: true,
          });
        });
      }
    });

    // 3️⃣ Category hierarchy
    categories.forEach((cat) => {
      if (cat.parent_id) {
        map[cat.parent_id]?.children.push(map[cat.id]);
      } else {
        tree.push(map[cat.id]);
      }
    });

    // 4️⃣ Clean
    const clean = (items) =>
      items.map((item) => ({
        title: item.title,
        path: item.path,
        ...(item.children?.length > 0 && {
          children: clean(item.children),
        }),
        ...(item.isProduct && { isProduct: true }),
      }));

    return clean(tree);
  }

  const BUCKETS = [1, 2, 3, 4, 8, 12];

  function getTargetSize(count) {
    for (const size of BUCKETS) {
      if (count <= size) return size;
    }
    return 12; // fallback safety
  }

  function padWithDummies(items, level) {
    const count = items.length;
    const target = getTargetSize(count);

    if (count === target) return items;

    const dummiesNeeded = target - count;

    const dummies = Array.from({ length: dummiesNeeded }, (_, i) => ({
      title: "",
      path: "#",
      isDummy: true,
      level,
    }));

    return [...items, ...dummies];
  }
  function normalizeMenu(menu, level = 1) {
    return menu.map((item) => {
      if (!item.children) return item;

      let children = item.children;

      // ✅ Normalize LEVEL-2 (children of level-1)
      if (level === 1) {
        children = padWithDummies(children, level + 1);
      }

      return {
        ...item,
        children: normalizeMenu(children, level + 1),
      };
    });
  }


  const menuData = buildMenuData(categories);
  const normalizedMenuData = normalizeMenu(menuData);


  return (
      <QuickOrderClient products={products} customerId={user?.id} menuData={menuData} isLoggedIn={!!user} />
    
  )
}
