import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {

  try {

    const { id } = await context.params;

    const reservation =
      await prisma.reservation.findUnique({
        where: {
          id,
        },
      });

    if (!reservation) {

      return NextResponse.json(
        {
          error: "Reservation not found",
        },
        {
          status: 404,
        }
      );
    }

    if (
      reservation.status !== "PENDING"
    ) {

      return NextResponse.json(
        {
          error:
            "Reservation already processed",
        },
        {
          status: 400,
        }
      );
    }

    await prisma.$transaction(
      async (tx) => {

        await tx.inventory.updateMany({
          where: {
            productId:
              reservation.productId,
            warehouseId:
              reservation.warehouseId,
          },
          data: {
            reservedStock: {
              decrement:
                reservation.quantity,
            },
          },
        });

        await tx.reservation.update({
          where: {
            id,
          },
          data: {
            status: "RELEASED",
          },
        });
      }
    );

    return NextResponse.json({
      success: true,
    });

  } catch (error) {

    return NextResponse.json(
      {
        error: "Something went wrong",
      },
      {
        status: 500,
      }
    );
  }
}