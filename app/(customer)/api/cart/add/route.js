import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/requireUser";

export async function POST(req) {
  try {
    /* =========================
       🔐 AUTH
    ========================= */
    const user = await requireUser();

    if (!user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    /* =========================
       📦 BODY
    ========================= */
    const body = await req.json();

    const { productId, quantity } = body;

    if (!productId || !quantity) {
      return NextResponse.json(
        { message: "Product and quantity required" },
        { status: 400 }
      );
    }

    if (quantity <= 0) {
      return NextResponse.json(
        { message: "Invalid quantity" },
        { status: 400 }
      );
    }

    /* =========================
       🛒 PRODUCT CHECK
    ========================= */
    const product = await prisma.product_list.findFirst({
      where: {
        id: productId,
        is_active: true,
        is_deleted: false,
      },
    });

    if (!product) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    /* =========================
       📏 VARIANT CHECK
    ========================= */

   

    /* =========================
       🔁 CHECK EXISTING CART
    ========================= */
    const existingCart = await prisma.customer_cart.findFirst({
      where: {
        customer_list_id: user.id,
        product_list_id: productId,
        is_deleted: false,
      },
    });

    let cartItem;

    if (existingCart) {
      const newQty = existingCart.quantity + quantity;

   

      cartItem = await prisma.customer_cart.update({
        where: { id: existingCart.id },
        data: {
          quantity: newQty,
        },
      });
    } else {
      cartItem = await prisma.customer_cart.create({
        data: {
          customer_list_id: user.id,
          product_list_id: productId,
          quantity,
        },
      });
    }

    /* =========================
       ✅ RESPONSE
    ========================= */
    return NextResponse.json({
      message: "Added to cart",
      cartItem,
    });
  } catch (error) {
    console.error("CART ADD ERROR:", error);

    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}