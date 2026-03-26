import { prisma } from "@/lib/prisma";
import ViewContact from "./ViewContact";

export const dynamic = "force-dynamic";

export default async function Page({ searchParams }) {
  const s = await searchParams;
  const page = Number(s.page) || 1;
  const limit = Number(s.limit) || 10;
  const search = s.search || "";

  const skip = (page - 1) * limit;

  const where = search
    ? {
        OR: [
          { fullName: { contains: search } },
          { email: { contains: search } },
          { subject: { contains: search } },
        ],
      }
    : {};

  const [contacts, totalCount] = await Promise.all([
    prisma.contact_form.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.contact_form.count({ where }),
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <ViewContact
      contacts={contacts}
      page={page}
      totalPages={totalPages}
      searchParams={searchParams}
    />
  );
}
