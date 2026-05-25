import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {

  try {

    const body = await req.json();

    const {
      productId,
      warehouseId,
      quantity,
    } = body;

    const reservation = await prisma.$transaction(
      async (tx : Prisma.TransactionClient) => {

        const inventoryRows = await tx.$queryRaw<
          any[]
        >`
          SELECT *
          FROM "Inventory"
          WHERE "productId" = ${productId}
          AND "warehouseId" = ${warehouseId}
          FOR UPDATE
        `;

        const inventory = inventoryRows[0];

        if (!inventory) {
          throw new Error("Inventory not found");
        }

        const availableStock =
          inventory.totalStock -
          inventory.reservedStock;

        if (availableStock < quantity) {

          throw new Error("INSUFFICIENT_STOCK");
        }

        await tx.inventory.update({
          where: {
            id: inventory.id,
          },
          data: {
            reservedStock: {
              increment: quantity,
            },
          },
        });

        const expiresAt = new Date(
          Date.now() + 10 * 60 * 1000
        );

        const reservation =
          await tx.reservation.create({
            data: {
              productId,
              warehouseId,
              quantity,
              expiresAt,
            },
          });

        return reservation;
      }
    );

    return NextResponse.json(reservation);

  } catch (error: any) {

    if (
      error.message === "INSUFFICIENT_STOCK"
    ) {

      return NextResponse.json(
        {
          error: "Not enough stock available",
        },
        {
          status: 409,
        }
      );
    }

    return NextResponse.json(
      {
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}