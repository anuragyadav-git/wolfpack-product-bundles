import type { Prisma } from "@prisma/client";
import db from "../../db.server";

export async function createBundleWithPublicNumber(
  data: Prisma.BundleUncheckedCreateInput,
) {
  return db.$transaction(async (transaction) => {
    const publicNumber = data.bundleType === "full_page"
      ? (await transaction.shop.update({
          where: { shopDomain: data.shopId },
          data: { lastFpbPublicNumber: { increment: 1 } },
          select: { lastFpbPublicNumber: true },
        })).lastFpbPublicNumber
      : null;

    return transaction.bundle.create({
      data: {
        ...data,
        publicNumber,
      },
    });
  });
}
