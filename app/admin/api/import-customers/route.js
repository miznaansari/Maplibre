import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

/*
  Universal string normalizer
  Prevents Prisma type errors during import
*/
const str = (v, fallback = null) =>
  v !== undefined && v !== null && v !== ""
    ? String(v)
    : fallback;

export async function POST(req) {
  try {
    const users = await req.json();

    if (!Array.isArray(users)) {
      return NextResponse.json(
        { error: "Invalid JSON format" },
        { status: 400 }
      );
    }

    for (const row of users) {
      if (!row.user_email) continue;

      let groupId = null;
      const role = row.roles?.trim();

      /*
        CREATE GROUP FROM ROLE
      */
      if (role && role !== "customer" && role !== "administrator") {
        let group = await prisma.customer_groups.findFirst({
          where: { group_name: role },
        });

        if (!group) {
          group = await prisma.customer_groups.create({
            data: { group_name: role },
          });
        }

        groupId = group.id;
      }

      /*
        CREATE CUSTOMER
      */
      const customer = await prisma.customer_list.upsert({
        where: { email: row.user_email },
        update: {},
        create: {
          email: row.user_email,
          first_name: str(row.first_name, "User"),
          last_name: str(row.last_name, ""),
          user_name: str(row.user_login),
          phone: str(row.billing_phone),
          company_name: str(row.billing_company),
          password: "imported_user",
          customer_group_id: groupId,
        },
      });

      /*
        CREATE ADDRESS
      */
      if (row.billing_address_1) {
        await prisma.customer_address.create({
          data: {
            customer_list_id: customer.id,
            first_name: str(row.billing_first_name, "User"),
            last_name: str(row.billing_last_name),
            company: str(row.billing_company),
            address_1: str(row.billing_address_1, ""),
            address_2: str(row.billing_address_2),
            city: str(row.billing_city, ""),
            state: str(row.billing_state, ""),
            country: str(row.billing_country, ""),
            postal_code: str(row.billing_postcode, ""),
            phone: str(row.billing_phone),
            email: row.billing_email || row.user_email,
            is_default: true,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Customers imported successfully",
    });
  } catch (error) {
    console.error("IMPORT ERROR:", error);

    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
