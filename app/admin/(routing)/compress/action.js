"use server";

import { prisma } from "@/lib/prisma";
import { generateVariants } from "@/lib/compressWithSharp";

export async function getPendingImages() {
  return prisma.product_images.findMany({
    where: { is_variant: false, is_deleted: false },
  });
}

export async function processOneImage(imageId) {
  const image = await prisma.product_images.findUnique({
    where: { id: imageId },
  });

  const res = await fetch(`${image.image_url}`);
  const buffer = Buffer.from(await res.arrayBuffer());

  const variants = await generateVariants(buffer);

  return {
    id: image.id,
    variants,
  };
}
