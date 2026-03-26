import Navbar from "./Navbar";

/* =========================
   SERVER NAVBAR
========================= */

export default async function BNavbar() {
  const isLoggedIn = await requireUser();
  /* ---------------- FETCH DATA ---------------- */
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/categories`, {
    cache: "no-store", // or 'force-cache' / revalidate
  });

  if (!res.ok) {
    console.error("Failed to fetch categories");
    return <Navbar menuData={[]} />;
  }

  const categories = await res.json();

  /* ---------------- BUILD MENU ---------------- */
  function buildMenuData(categories) {
    const map = {};
    const tree = [];

    // 1️⃣ Category map
    categories.forEach((cat) => {
      map[cat.id] = {
        title: cat.name,
        path: `/product-category/${cat.path}`,
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

  const menuData = buildMenuData(categories);

  return <Navbar menuData={menuData} />;
}
