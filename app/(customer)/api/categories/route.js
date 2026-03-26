import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// export async function GET() {
//   try {
//     const categories = await prisma.product_category.findMany({
//       where: {
//         is_active: true,
//         // children: { none: {} }, // ✅ deepest only
//       },
//       orderBy: { path: "asc" },
//       select: {
//         id: true,
//         name: true,
//         path: true,
//         created_at: true,   // ✅ add this
//         seo: {                 // ✅ include SEO
//           select: {
//             meta_title: true,
//             meta_description: true,
//             focus_keyword: true,
//           },
//         },
//       },
//     });

//     return NextResponse.json(categories);
//   } catch (error) {
//     console.error(error);
//     return NextResponse.json(
//       { message: "Failed to fetch categories" },
//       { status: 500 }
//     );
//   }
// }
export async function GET() {
  try {
    const categories = await prisma.product_category.findMany({
      where: {
        is_active: true,
        is_deleted: false,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        path: true,
        parent_id: true,
      },
      orderBy: {
        path: "asc", // keep only if required
      },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}


export async function POST(req) {
  try {
    const body = await req.json();
    const {
      name,
      slug,
      parent_id,
      description,
      meta_title,
      meta_description,
      focus_keyword,
    } = body;

    let path = slug;

    // 👉 If child category, build path
    if (parent_id) {
      const parent = await prisma.product_category.findUnique({
        where: { id: Number(parent_id) },
        select: { path: true },
      });

      if (!parent) {
        return NextResponse.json(
          { message: "Parent category not found" },
          { status: 400 }
        );
      }

      path = `${parent.path}/${slug}`;
    }

    const category = await prisma.product_category.create({
      data: {
        name,
        slug,
        path,
        description,

        parent_id: parent_id ? Number(parent_id) : null,

        seo:
          meta_title || meta_description || focus_keyword
            ? {
              create: {
                meta_title,
                meta_description,
                focus_keyword,
              },
            }
            : undefined,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Category creation failed" },
      { status: 500 }
    );
  }
}