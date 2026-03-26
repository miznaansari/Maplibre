import Navbar from "./Navbar";

/* =========================
   SERVER NAVBAR
========================= */

export default async function BNavbar() {
  /* ---------------- FETCH DATA ---------------- */
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/categories`, {
    cache: "no-store", // or 'force-cache' / revalidate
  });

  if (!res.ok) {
    console.error("Failed to fetch categories");
    return <Navbar menuData={[]} />;
  }

  const filteredCategories = await res.json();
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

return <Navbar menuData={normalizedMenuData} />;

}
